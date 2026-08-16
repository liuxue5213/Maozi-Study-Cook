import { registerAs } from '@nestjs/config';

export default registerAs('ai', () => ({
  apiKey: process.env.AI_API_KEY || '',
  baseUrl: process.env.AI_BASE_URL || 'https://dashscope.aliyuncs.com/api/v1',
  visionModel: process.env.AI_VISION_MODEL || 'qwen-vl-plus',
  textModel: process.env.AI_TEXT_MODEL || 'qwen-plus',
  detailModel: process.env.AI_DETAIL_MODEL || 'qwen-plus',
}));
