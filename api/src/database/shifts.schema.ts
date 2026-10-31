import { integer, pgTable, time, uuid } from 'drizzle-orm/pg-core';
import { doctors } from './doctors.schema';

export const shifts = pgTable('shifts', {
  id: uuid('id').defaultRandom().primaryKey(),
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => doctors.id),
  dayOfWeek: integer('day_of_week').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
});

export type Shift = typeof shifts.$inferSelect;
