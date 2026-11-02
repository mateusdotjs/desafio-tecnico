import {
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { doctors } from './doctors.schema';
import { exams } from './exams.schema';

export const appointments = pgTable('appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  patientName: varchar('patient_name', { length: 255 }).notNull(),
  doctorId: uuid('doctor_id')
    .notNull()
    .references(() => doctors.id),
  examId: integer('exam_id')
    .notNull()
    .references(() => exams.id),
  startAt: timestamp('start_at', { withTimezone: true }).notNull(),
  endAt: timestamp('end_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
