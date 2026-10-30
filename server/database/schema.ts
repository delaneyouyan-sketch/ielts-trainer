/* eslint-disable */
/** 独立化改造：移除平台 user_profile / file_attachment 复合类型，改用标准 uuid / text */
import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uuid,
  varchar,
  customType,
} from 'drizzle-orm/pg-core';

export const customTimestamptz = customType<{
  data: Date;
  driverData: string;
  config: { precision?: number };
}>({
  dataType(config) {
    const precision = typeof config?.precision !== 'undefined'
      ? ` (${config.precision})`
      : '';
    return `timestamptz${precision}`;
  },
  toDriver(value: Date | string | number) {
    if (value == null) return value as any;
    if (typeof value === 'number') return new Date(value).toISOString();
    if (typeof value === 'string') return value;
    if (value instanceof Date) return value.toISOString();
    throw new Error('Invalid timestamp value');
  },
  fromDriver(value: string | Date): Date {
    if (value instanceof Date) return value;
    return new Date(value);
  },
});

export const trainerRecording = pgTable(
  'trainer_recording',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    owner: uuid('owner').notNull(),
    tag: varchar('tag', { length: 100 }).notNull(),
    task: text('task').notNull(),
    duration: integer('duration').notNull().default(0),
    checks: text('checks').array().notNull().default([]),
    audioUrl: text('audio_url').notNull(),
    createdAt: customTimestamptz('_created_at', { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
    createdBy: uuid('_created_by'),
    updatedAt: customTimestamptz('_updated_at', { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedBy: uuid('_updated_by'),
  },
  (table) => [
    index('idx_trainer_recording_owner_created').on(table.owner, table.createdAt),
  ],
);

export const trainerState = pgTable('trainer_state', {
  owner: uuid('owner').primaryKey(),
  doneLessons: jsonb('done_lessons').notNull().default('{}'),
  checkins: text('checkins').array().notNull().default([]),
  mistakes: text('mistakes').array().notNull().default([]),
  bestScore: integer('best_score'),
  createdAt: customTimestamptz('_created_at', { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  createdBy: uuid('_created_by'),
  updatedAt: customTimestamptz('_updated_at', { precision: 3 }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedBy: uuid('_updated_by'),
});

// table aliases
export const trainerRecordingTable = trainerRecording;
export const trainerStateTable = trainerState;
