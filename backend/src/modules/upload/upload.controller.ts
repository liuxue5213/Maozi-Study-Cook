import { Controller, Post, UseInterceptors, UploadedFile, Body, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '上传图片' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder: string = 'temp',
  ) {
    const url = await this.uploadService.saveFile(file, folder);
    return {
      url,
      filename: file.originalname,
      size: file.size,
    };
  }

  @Post('images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量上传图片（最多9张）' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('files', 9))
  async uploadImages(
    @UploadedFile() files: Express.Multer.File[],
    @Body('folder') folder: string = 'post',
  ) {
    const results = [];
    for (const file of files) {
      const url = await this.uploadService.saveFile(file, folder);
      results.push({
        url,
        filename: file.originalname,
        size: file.size,
      });
    }
    return results;
  }
}
