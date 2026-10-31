import { Controller, Get, Query } from '@nestjs/common';
import { SearchExamsQueryDto } from './dto/search-exams-query.dto';
import { Exam } from '../database/exams.schema';
import { ExamsService } from './exams.service';

@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get()
  findMany(@Query() query: SearchExamsQueryDto): Promise<Exam[]> {
    return this.examsService.findMany(query.name);
  }
}
