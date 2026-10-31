import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

export const doctors = pgTable('doctors', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
});

export type Doctor = typeof doctors.$inferSelect;
