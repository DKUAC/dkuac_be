import { Module } from '@nestjs/common';
import { AwsService } from './aws.service';
import { AwsController } from './aws.controller';

@Module({
  exports: [AwsService],
  controllers: [AwsController],
  providers: [AwsService],
})
export class AwsModule {}
