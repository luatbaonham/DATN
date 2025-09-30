// // src/modules/auth/token-cleanup.service.ts

// import { Injectable, Logger } from '@nestjs/common';
// import { Cron } from '@nestjs/schedule';
// import { EntityManager } from '@mikro-orm/mysql';
// import { RefreshToken } from '../entities/refresh_token.entity';

// @Injectable()
// export class TokenCleanupService {
//   private readonly logger = new Logger(TokenCleanupService.name);

//   constructor(private readonly em: EntityManager) {}

//   // Chạy mỗi 6 giờ
//   @Cron('0 */6 * * *')
//   async cleanExpiredTokens() {
//     const now = new Date();

//     // Đếm số token đã bị thu hồi
//     const revokedCount = await this.em.count(RefreshToken, {
//       revokedAt: { $ne: null },
//     });

//     // Đếm số token đã hết hạn
//     const expiredCount = await this.em.count(RefreshToken, {
//       expiresAt: { $lt: now },
//     });

//     // Xóa tất cả token bị thu hồi hoặc hết hạn
//     const deleted = await this.em.nativeDelete(RefreshToken, {
//       $or: [{ revokedAt: { $ne: null } }, { expiresAt: { $lt: now } }],
//     });

//     //$or: kết hợp điều kiện
//     // $ne: not equal (không bằng)
//     // $lt: less than (nhỏ hơn)
//     // Ghi log chi tiết
//     this.logger.log(`🧹 Dọn dẹp refresh token:
//     - Đã thu hồi: ${revokedCount}
//     - Đã hết hạn: ${expiredCount}
//     - Tổng số bản ghi đã xóa: ${deleted}`);
//   }
// }
