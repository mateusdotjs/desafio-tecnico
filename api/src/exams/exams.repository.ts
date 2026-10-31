import { InjectDrizzle } from '@nestjs/drizzle';
import { Injectable } from '@nestjs/common';
import { asc, ilike } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Exam, exams } from '../database/exams.schema';

@Injectable()
export class ExamsRepository {
  constructor(@InjectDrizzle() private readonly db: NodePgDatabase) {}

  async findManyByName(name?: string): Promise<Exam[]> {
    if (!name) {
      return this.db.select().from(exams).orderBy(asc(exams.name));
    }

    return this.db
      .select()
      .from(exams)
      .where(ilike(exams.name, `%${name}%`))
      .orderBy(asc(exams.name));
  }
}
