import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const tripPlans = sqliteTable('trip_plans', {
  userId: text('user_id').primaryKey(),
  data: text('data').notNull(),
  version: integer('version').notNull().default(1),
  updatedAt: text('updated_at').notNull(),
});
