import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// 配置
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import aiConfig from './config/ai.config';

// 模块
import { PrismaModule } from './modules/common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CuisinesModule } from './modules/cuisines/cuisines.module';
import { RecipesModule } from './modules/recipes/recipes.module';
import { AiModule } from './modules/ai/ai.module';
import { CommunityModule } from './modules/community/community.module';
import { UploadModule } from './modules/upload/upload.module';

// 守卫
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { ThrottlerBehindGuard } from './modules/common/guards/throttler-behind.guard';

@Module({
  imports: [
    // 全局配置
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, aiConfig],
      envFilePath: ['.env'],
    }),

    // 限流
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 分钟
        limit: 100, // 每分钟 100 次请求
      },
    ]),

    // 公共模块
    PrismaModule,

    // 业务模块
    AuthModule,
    UsersModule,
    CuisinesModule,
    RecipesModule,
    AiModule,
    CommunityModule,
    UploadModule,
  ],
  providers: [
    // 全局 JWT 守卫（可选，模块内单独配置更灵活）
    // { provide: APP_GUARD, useClass: JwtAuthGuard },
    // 全局限流守卫
    { provide: APP_GUARD, useClass: ThrottlerBehindGuard },
  ],
})
export class AppModule {}
