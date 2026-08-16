import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly uploadDir: string;
  private readonly maxFileSize: number;
  private readonly allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get('app.uploadDir') || './uploads';
    this.maxFileSize = this.configService.get('app.maxFileSize') || 10485760; // 10MB
    this.ensureUploadDir();
  }

  /**
   * 确保上传目录存在
   */
  private ensureUploadDir() {
    const dirs = ['', 'avatar', 'post', 'recipe', 'temp'];
    dirs.forEach((dir) => {
      const fullPath = path.join(this.uploadDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });
  }

  /**
   * 验证文件
   */
  validateFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    if (!this.allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('仅支持 JPG、PNG、WebP 格式图片');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `文件大小不能超过 ${Math.round(this.maxFileSize / 1024 / 1024)}MB`,
      );
    }
  }

  /**
   * 生成文件名
   */
  generateFileName(originalName: string): string {
    const ext = path.extname(originalName).toLowerCase() || '.jpg';
    return `${Date.now()}-${uuidv4().slice(0, 8)}${ext}`;
  }

  /**
   * 保存文件
   */
  async saveFile(file: Express.Multer.File, folder: string = 'temp'): Promise<string> {
    this.validateFile(file);

    const fileName = this.generateFileName(file.originalname);
    const folderPath = path.join(this.uploadDir, folder);
    const filePath = path.join(folderPath, fileName);

    // 确保文件夹存在
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // 写入文件
    fs.writeFileSync(filePath, file.buffer);

    // 返回可访问的 URL 路径
    return `/uploads/${folder}/${fileName}`;
  }

  /**
   * 删除文件
   */
  async deleteFile(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.uploadDir, '..', filePath);
    try {
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
    } catch (error) {
      console.error('删除文件失败:', error);
    }
    return false;
  }

  /**
   * 获取文件完整路径
   */
  getFullPath(relativePath: string): string {
    return path.join(this.uploadDir, '..', relativePath);
  }
}
