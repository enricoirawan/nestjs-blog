import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Upload } from 'src/uploads/upload.entity';
import { Repository } from 'typeorm';
import { UploadsToAwsProvider } from '../uploads-to-aws.provider';
import { ConfigService } from '@nestjs/config';
import { UploadFile } from 'src/uploads/interfaces/upload-file.interface';
import { FileTypes } from 'src/uploads/enums/file-types.enum';

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(Upload)
    private readonly uploadsRepository: Repository<Upload>,
    private readonly uploadToAWSProvider: UploadsToAwsProvider,
    private readonly configService: ConfigService,
  ) {}

  public async uploadFile(file: Express.Multer.File) {
    // Throw error if MIME type is unsupported
    if (
      !['image/gif', 'image/jpeg', 'image/jpg', 'image/png'].includes(
        file.mimetype,
      )
    ) {
      throw new BadRequestException('Mime type not supported');
    }

    try {
      // Upload file to AWS S3
      const name = await this.uploadToAWSProvider.fileUpload(file);

      // Generate new entry in database
      const uploadFile: UploadFile = {
        name,
        path: `${this.configService.get('appConfig.awsCloudfrontUrl')}/${name}`,
        type: FileTypes.IMAGE,
        mime: file.mimetype,
        size: file.size,
      };

      const upload = this.uploadsRepository.create(uploadFile);
      return await this.uploadsRepository.save(upload);
    } catch (error) {
      throw new ConflictException(error);
    }
  }
}
