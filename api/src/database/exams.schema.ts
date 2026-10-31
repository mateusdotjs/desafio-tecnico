import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const exams = pgTable('exams', {
  id: integer('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
});
