import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { RegisterDto } from './dto/dto.req/register_user.dto';
import { LoginDto } from './dto/dto.req/login_user.dto';
import { User } from '@modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshToken } from './entities/refresh_token.entity';
import { plainToInstance } from 'class-transformer';
import { LoginResponseDto } from './dto/dto.rep/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly em: EntityManager,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // đăng ký
  async register(dto: RegisterDto): Promise<User> {
    const exist = await this.em.findOne(User, { email: dto.email });
    if (exist) throw new ConflictException('Email đã tồn tại');

    const user = this.em.create(User, dto);
    user.password = await bcrypt.hash(dto.password, 10);
    await this.em.persistAndFlush(user);
    return user;
  }

  // login
  async login(
    dto: LoginDto,
    options?: { deviceInfo?: string; ipAddress?: string; userAgent?: string },
  ) {
    const user = await this.em.findOne(
      User,
      { email: dto.email },
      { populate: ['userRoles.role.rolePermissions'] },
    );
    if (!user) throw new UnauthorizedException('Email chưa đăng ký');

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException('Mật khẩu không đúng');

    // lấy role names gọn hơn
    const roles = user.userRoles.getItems().map((ur) => ur.role.name);

    return this.generateTokens(user, roles, options);
  }

  // refresh token
  async refreshToken(
    token: string,
    options?: { deviceInfo?: string; ipAddress?: string; userAgent?: string },
  ) {
    const payload = await this.jwt.verifyAsync(token, {
      secret: process.env.REFRESH_TOKEN_SECRET,
    });

    const user = await this.em.findOne(
      User,
      { id: payload.id },
      { populate: ['userRoles'] },
    );
    if (!user) throw new UnauthorizedException('User không tồn tại');

    const oldRt = await this.em.findOne(RefreshToken, { user, token });
    if (!oldRt) {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc chưa đăng nhập',
      );
    }

    // Phát hiện reuse token
    if (oldRt.revokedAt) {
      // Ghi log reuse nếu cần
      //await this.logReuseToken(user.id, token, options);
      throw new UnauthorizedException('Refresh token đã bị sử dụng lại');
    }

    // Cập nhật trạng thái token cũ
    oldRt.lastUsedAt = new Date();
    oldRt.revokedAt = new Date();
    await this.em.flush();

    const roles = user.userRoles.getItems().map((ur) => ur.role.name);
    return this.generateTokens(user, roles, options);
  }

  // generate tokens + trả profile
  private async generateTokens(
    user: User,
    roles: string[],
    options?: { deviceInfo?: string; ipAddress?: string; userAgent?: string },
  ) {
    const payload = { id: user.id, email: user.email, roles };

    // Tạo access token
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // Tạo refresh token
    const refreshToken = await this.jwt.signAsync(
      { id: user.id },
      {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
      },
    );

    // thư viện chuyển đổi chuỗi thời gian sang ms
    const ms = require('ms');
    // Lưu refresh token vào DB
    const rt = this.em.create(RefreshToken, {
      user,
      token: refreshToken,
      deviceInfo: options?.deviceInfo || 'web',
      ipAddress: options?.ipAddress || 'unknown',
      userAgent: options?.userAgent || 'unknown',
      expiresAt: new Date(
        Date.now() + ms(process.env.REFRESH_TOKEN_EXPIRES_IN),
      ),
    });

    await this.em.persistAndFlush(rt);

    // Chỉ trả tokens, không trả profile
    return {
      accessToken,
      refreshToken,
    };
  }
  async logout(
    refreshToken: string,
  ): Promise<{ success: boolean; message: string }> {
    const token = await this.em.findOne(RefreshToken, { token: refreshToken });

    if (!token) {
      throw new NotFoundException(
        'Refresh token không tồn tại hoặc đã bị revoke(logout rồi)',
      );
    }
    // đánh dấu refresh token là đã bị thu hồi( chứ ko xóa bản ghi)
    token.revokedAt = new Date();
    await this.em.flush();
    return { success: true, message: 'Logout 1 thiết bị thành công' };
  }

  async logoutAll(
    userId: number,
  ): Promise<{ success: boolean; message: string }> {
    const tokens = await this.em.find(RefreshToken, { user: { id: userId } });

    if (!tokens.length) {
      throw new NotFoundException(
        'Người dùng này không có session nào(chưa đăng nhập ở thiêt bị nào)',
      );
    }
    // đanh dấu tất cả refresh token của user là đã bị thu hồi
    tokens.forEach((token) => {
      if (!token.revokedAt) {
        token.revokedAt = new Date();
      }
    });
    await this.em.flush();

    return { success: true, message: 'Logout tất cả thiết bị thành công' };
  }

  async getSessions(userId: number) {
    const tokens = await this.em.find(RefreshToken, {
      user: userId,
      revokedAt: null, // chỉ lấy token chưa bị revoke
    });
    //
    tokens.sort((a, b) => {
      const timeA = a.lastUsedAt ? a.lastUsedAt.getTime() : 0;
      const timeB = b.lastUsedAt ? b.lastUsedAt.getTime() : 0;
      return timeB - timeA; // thiết bị dùng gần nhất lên đầu
    });

    return {
      userId,
      totalDevices: tokens.length,
      devices: tokens.map((token) => ({
        idToken: token.id,
        deviceInfo: token.deviceInfo,
        ipAddress: token.ipAddress,
        userAgent: token.userAgent,
        createdAt: token.createdAt!,
        lastUsedAt: token.lastUsedAt,
      })),
    };
  }
}
