import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/dto.req/register_user.dto';
import { LoginDto } from './dto/dto.req/login_user.dto';
import { LoginResponseDto } from './dto/dto.rep/login-response.dto';
import { RegisterResponseDto } from './dto/dto.rep/register-response.dto';
import {
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { RefreshTokenDto } from './dto/dto.req/refresh_token.dto';
import { RefreshTokenResponseDto } from './dto/dto.rep/refresh_token_response.dto';
import { LogoutResponseDto } from './dto/dto.rep/logout_response.dto';
import { LogoutDto } from './dto/dto.req/logout.dto';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { EntityManager } from '@mikro-orm/core';
import { SessionResponseDto } from './dto/dto.rep/session-response.dto';
import { getDeviceInfo } from 'src/common/mapper/device-info.util';
import { Permission } from '@modules/identity/roles-permissions/entities/permission.entity';
import { RolePermission } from '@modules/identity/roles-permissions/entities/role-permission.entity';
import { Role } from '@modules/identity/roles-permissions/entities/role.entity';
import { UserRole } from '../users/entities/user-role.entity';
import { AuthGuard } from './guard/auth.guard';
import { PermissionGuard } from './guard/permission.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly em: EntityManager,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Đăng ký tài khoản mới',
    description:
      'Tạo một tài khoản người dùng mới. Tài khoản sẽ được tạo với quyền mặc định.',
  })
  @ApiResponse({
    status: 200,
    description:
      '✅ **Đăng ký thành công**\n\nTrả về thông tin tài khoản vừa tạo.',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      '❌ **Yêu cầu không hợp lệ**\n\n- Email đã tồn tại\n- Lỗi validate dữ liệu đầu vào',
  })
  async register(@Body() dto: RegisterDto) {
    const user = await this.auth.register(dto);
    return plainToInstance(RegisterResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  @Post('login')
  @ApiOperation({
    summary: 'Đăng nhập',
    description: 'Đăng nhập bằng email và mật khẩu, trả về token và profile.',
  })
  @ApiResponse({
    status: 200,
    description: '✅ **Đăng nhập thành công**',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description:
      '❌ **Không xác thực**\n\n- Email chưa đăng ký\n- Mật khẩu không đúng',
  })
  async login(@Req() req, @Body() dto: LoginDto) {
    const user = await this.em.findOne(
      User,
      { email: dto.email },
      { populate: ['userRoles.role'] },
    );
    if (!user) throw new UnauthorizedException('Email chưa đăng ký');

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException('Mật khẩu không đúng');

    const roles = user.userRoles.getItems().map((ur) => ur.role.name);
    // Lấy thông tin thiết bị, ipAddress, userAgent từ request
    const { deviceInfo, ipAddress, userAgent } = getDeviceInfo(req);
    const tokens = await this.auth.login(dto, {
      deviceInfo,
      ipAddress,
      userAgent,
    });

    // Build object theo LoginResponseDto
    const loginResponse = {
      ...tokens,
      profile: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        roles,
      },
    };

    // Chuyển về instance và chỉ expose những field được khai báo
    return plainToInstance(LoginResponseDto, loginResponse, {
      excludeExtraneousValues: true,
    });
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Làm mới token',
    description: 'Refresh access token bằng refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: '✅ **Refresh token thành công**',
    type: RefreshTokenResponseDto,
  })
  async refresh(
    @Req() req,
    @Body() dto: RefreshTokenDto,
  ): Promise<RefreshTokenResponseDto> {
    // cài thư viet ua-parser-js để parse user-agent
    // Import kiểu CommonJS, chứ import kiểu ESModule sẽ lỗi (const UAParser = require('ua-parser-js'); chứ ko phải import { UAParser } from 'ua-parser-js';)
    const { deviceInfo, ipAddress, userAgent } = getDeviceInfo(req);
    const tokens = await this.auth.refreshToken(dto.refreshToken, {
      deviceInfo,
      ipAddress,
      userAgent,
    });

    // Log thông tin để test
    // console.log('=== Refresh Request Info ===');
    // console.log('IP Address:', ipAddress);
    // console.log('User-Agent:', userAgent);
    // console.log('Device Info:', deviceInfo);
    // console.log('============================');

    return plainToInstance(RefreshTokenResponseDto, tokens, {
      excludeExtraneousValues: true,
    });
  }
  @Post('logout')
  @ApiOperation({
    summary: 'Logout 1 thiết bị',
    description: 'Đăng xuất 1 thiết bị bằng refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: '✅ **Logout thành công**',
    type: LogoutResponseDto,
  })
  async logout(@Body() dto: LogoutDto): Promise<LogoutResponseDto> {
    const result = await this.auth.logout(dto.refreshToken);
    return plainToInstance(LogoutResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Post('logout-all/:id')
  @ApiOperation({
    summary: 'Logout tất cả thiết bị của user',
    description: 'Đăng xuất tất cả các thiết bị đang đăng nhập của user.',
  })
  @ApiResponse({
    status: 200,
    description: '✅ **Đã logout tất cả thiết bị**',
    type: LogoutResponseDto,
  })
  async logoutAll(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<LogoutResponseDto> {
    const result = await this.auth.logoutAll(userId);
    return plainToInstance(LogoutResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get('sessions/:id')
  @ApiOperation({
    summary: 'Danh sách session của user',
    description: 'Lấy danh sách tất cả session đang hoạt động của user.',
  })
  @ApiResponse({
    status: 200,
    description: '✅ **Danh sách session**',
    type: SessionResponseDto,
  })
  async getSessions(@Param('id', ParseIntPipe) userId: number) {
    return this.auth.getSessions(userId);
  }
}
