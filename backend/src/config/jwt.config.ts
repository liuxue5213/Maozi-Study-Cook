import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'maozi-cook-secret-key-change-in-production',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'maozi-cook-refresh-secret-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '2h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));
