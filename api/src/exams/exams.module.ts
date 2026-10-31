import { Module } from '@nestjs/common';
import { ExamsController } from './exams.controller';
import { ExamsRepository } from './exams.repository';
import { ExamsService } from './exams.service';

@Module({
  controllers: [ExamsController],
  providers: [ExamsService, ExamsRepository],
})
export class ExamsModule {}
