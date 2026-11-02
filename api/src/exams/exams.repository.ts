import { InjectDrizzle } from '@nestjs/drizzle';
import { Injectable } from '@nestjs/common';
import { asc, eq, ilike } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Exam, exams } from '../database/schema/exams.schema';

@Injectable()
export class ExamsRepository {
  constructor(@InjectDrizzle() private readonly db: NodePgDatabase) {}

  async findById(id: number): Promise<Exam | undefined> {
    const rows = await this.db
      .select()
      .from(exams)
      .where(eq(exams.id, id))
      .limit(1);

    return rows[0];
  }

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
