import { Module } from '@nestjs/common';
import { DoctorsRepository } from './doctors.repository';

@Module({
  providers: [DoctorsRepository],
  exports: [DoctorsRepository],
})
export class DoctorsModule {}
