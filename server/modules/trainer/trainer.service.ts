import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { and, desc, eq } from 'drizzle-orm';
import {
  trainerRecording,
  trainerState,
} from '../../database/schema';
import { DRIZZLE_DATABASE } from '../../database/database.module';
import type {
  RecordingItem,
  TrainerState,
} from '../../../shared/api.interface';

const EMPTY_STATE: TrainerState = {
  doneLessons: {},
  checkins: [],
  mistakes: [],
  bestScore: null,
};

function todayShanghai(): string {
  return new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Shanghai',
  });
}

function isRecord(value: unknown): value is Record<string, boolean> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === 'string')
    : [];
}

function normalizeState(row: {
  doneLessons: unknown;
  checkins: unknown;
  mistakes: unknown;
  bestScore: number | null;
} | null): TrainerState {
  if (!row) return { ...EMPTY_STATE, doneLessons: {} };
  const rawDone: unknown = row.doneLessons;
  const doneLessons: Record<string, boolean> = isRecord(rawDone)
    ? Object.fromEntries(
        Object.entries(rawDone).filter(
          ([, v]: [string, unknown]) => v === true,
        ),
      )
    : {};
  return {
    doneLessons,
    checkins: toStringArray(row.checkins),
    mistakes: toStringArray(row.mistakes),
    bestScore: typeof row.bestScore === 'number' ? row.bestScore : null,
  };
}

function toRecordingItem(row: {
  id: string;
  tag: string;
  task: string;
  duration: number;
  checks: unknown;
  audioUrl: string;
  createdAt: Date;
}): RecordingItem {
  return {
    id: row.id,
    tag: row.tag,
    task: row.task,
    duration: row.duration,
    checks: toStringArray(row.checks),
    audioUrl: row.audioUrl,
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : new Date(row.createdAt).toISOString(),
  };
}

@Injectable()
export class TrainerService {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: PostgresJsDatabase,
  ) {}

  async getState(owner: string): Promise<TrainerState> {
    const rows = await this.db
      .select()
      .from(trainerState)
      .where(eq(trainerState.owner, owner));
    return normalizeState(rows[0] ?? null);
  }

  async toggleLesson(
    owner: string,
    lessonKey: string,
    done: boolean,
  ): Promise<{ state: TrainerState; checkedToday: boolean }> {
    const current: TrainerState = await this.getState(owner);
    const doneLessons: Record<string, boolean> = {
      ...current.doneLessons,
    };
    const checkins: string[] = [...current.checkins];
    const today: string = todayShanghai();

    if (done) {
      const wasDone: boolean = doneLessons[lessonKey] === true;
      doneLessons[lessonKey] = true;
      if (!wasDone && !checkins.includes(today)) {
        checkins.push(today);
      }
    } else {
      delete doneLessons[lessonKey];
    }

    const rows = await this.db
      .select({ id: trainerState.owner })
      .from(trainerState)
      .where(eq(trainerState.owner, owner));

    if (rows.length === 0) {
      await this.db.insert(trainerState).values({
        owner,
        doneLessons,
        checkins,
        mistakes: current.mistakes,
        bestScore: current.bestScore,
      });
    } else {
      await this.db
        .update(trainerState)
        .set({
          doneLessons,
          checkins,
          updatedAt: new Date(),
          updatedBy: owner,
        })
        .where(eq(trainerState.owner, owner));
    }

    const nextState: TrainerState = {
      ...current,
      doneLessons,
      checkins,
    };
    return {
      state: nextState,
      checkedToday: checkins.includes(today),
    };
  }

  async submitQuiz(
    owner: string,
    wrongQuestions: string[],
    scorePercent: number,
    onlyMistakes: boolean,
  ): Promise<TrainerState> {
    const current: TrainerState = await this.getState(owner);
    const mistakeSet: Set<string> = new Set(current.mistakes);
    wrongQuestions.forEach((q: string) => {
      if (q.trim()) mistakeSet.add(q);
    });
    const mistakes: string[] = [...mistakeSet];
    const bestScore: number | null = onlyMistakes
      ? current.bestScore
      : Math.max(current.bestScore ?? 0, scorePercent);

    const rows = await this.db
      .select({ id: trainerState.owner })
      .from(trainerState)
      .where(eq(trainerState.owner, owner));

    if (rows.length === 0) {
      await this.db.insert(trainerState).values({
        owner,
        mistakes,
        bestScore,
      });
    } else {
      await this.db
        .update(trainerState)
        .set({
          mistakes,
          bestScore,
          updatedAt: new Date(),
          updatedBy: owner,
        })
        .where(eq(trainerState.owner, owner));
    }

    return { ...current, mistakes, bestScore };
  }

  async removeMistake(
    owner: string,
    question: string,
  ): Promise<TrainerState> {
    const current: TrainerState = await this.getState(owner);
    const mistakes: string[] = current.mistakes.filter(
      (q: string) => q !== question,
    );

    await this.db
      .update(trainerState)
      .set({
        mistakes,
        updatedAt: new Date(),
        updatedBy: owner,
      })
      .where(eq(trainerState.owner, owner));

    return { ...current, mistakes };
  }

  async listRecordings(owner: string): Promise<RecordingItem[]> {
    const rows = await this.db
      .select()
      .from(trainerRecording)
      .where(eq(trainerRecording.owner, owner))
      .orderBy(desc(trainerRecording.createdAt));
    return rows.map(
      (row: {
        id: string;
        tag: string;
        task: string;
        duration: number;
        checks: unknown;
        audioUrl: string;
        createdAt: Date;
      }): RecordingItem => toRecordingItem(row),
    );
  }

  async createRecording(
    owner: string,
    input: {
      tag: string;
      task: string;
      duration: number;
      checks: string[];
      audioUrl: string;
    },
  ): Promise<RecordingItem> {
    const rows = await this.db
      .insert(trainerRecording)
      .values({
        owner,
        tag: input.tag,
        task: input.task,
        duration: input.duration,
        checks: input.checks,
        audioUrl: input.audioUrl,
      })
      .returning();
    return toRecordingItem({
      id: rows[0].id,
      tag: rows[0].tag,
      task: rows[0].task,
      duration: rows[0].duration,
      checks: rows[0].checks,
      audioUrl: rows[0].audioUrl,
      createdAt: rows[0].createdAt,
    });
  }

  async deleteRecording(owner: string, id: string): Promise<void> {
    const deleted = await this.db
      .delete(trainerRecording)
      .where(
        and(
          eq(trainerRecording.id, id),
          eq(trainerRecording.owner, owner),
        ),
      )
      .returning({ id: trainerRecording.id });
    if (deleted.length === 0) {
      throw new NotFoundException('录音不存在');
    }
  }
}
