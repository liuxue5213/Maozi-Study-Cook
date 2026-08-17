import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './modules/common/interceptors/transform.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import helmet from 'helmet';

/**
 * 向上查找后端根目录（兼容 dist/main.js 与 dist/src/main.js 两种编译产物结构）
 */
export function findBackendRoot(startDir: string): string {
  let dir = startDir;
  for (let i = 0; i < 6; i++) {
    if (existsSync(join(dir, 'package.json'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 安全中间件（配置 CSP 允许跨域图片加载）
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'http://localhost:*', 'http://120.48.13.152:*', 'https:'],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // 静态文件服务：/uploads/ 目录下的文件可通过 HTTP 直接访问
  app.useStaticAssets(join(findBackendRoot(__dirname), 'uploads'), {
    prefix: '/uploads/',
  });

  // 全局响应包装（统一 {code, message, data, timestamp} 格式）
  app.useGlobalInterceptors(new TransformInterceptor());

  // CORS 配置
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  // 全局前缀
  app.setGlobalPrefix('api');

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger 文档
  const config = new DocumentBuilder()
    .setTitle('帽子学做饭 API')
    .setDescription('帽子学做饭 - 一站式烹饪学习社交平台接口文档')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('auth', '认证模块')
    .addTag('users', '用户模块')
    .addTag('cuisines', '菜系模块')
    .addTag('recipes', '菜谱模块')
    .addTag('ai', 'AI 服务')
    .addTag('community', '社区模块')
    .addTag('checkin', '打卡模块')
    .addTag('upload', '上传模块')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 60135;
  await app.listen(port);

  console.log(`🚀 帽子学做饭后端服务已启动`);
  console.log(`📍 服务地址: http://localhost:${port}`);
  console.log(`📚 API 文档: http://localhost:${port}/api/docs`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}\n`);
}

bootstrap();
