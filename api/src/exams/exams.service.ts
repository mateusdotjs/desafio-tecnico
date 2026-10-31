import { Injectable } from '@nestjs/common';
import { Exam } from '../database/schema/exams.schema';
import { ExamsRepository } from './exams.repository';

@Injectable()
export class ExamsService {
  constructor(private readonly examsRepository: ExamsRepository) {}

  findMany(name?: string): Promise<Exam[]> {
    const trimmed = name?.trim();
    const filter = trimmed === '' ? undefined : trimmed;
    return this.examsRepository.findManyByName(filter);
  }
}
