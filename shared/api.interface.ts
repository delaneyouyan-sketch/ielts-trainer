/* 前后端共享的类型写在这里 */

export interface TrainerState {
  doneLessons: Record<string, boolean>;
  checkins: string[];
  mistakes: string[];
  bestScore: number | null;
}

export interface ToggleLessonRequest {
  lessonKey: string;
  done: boolean;
}

export interface ToggleLessonResponse {
  state: TrainerState;
  checkedToday: boolean;
}

export interface SubmitQuizRequest {
  wrongQuestions: string[];
  scorePercent: number;
  onlyMistakes: boolean;
}

export interface SubmitQuizResponse {
  state: TrainerState;
}

export interface RemoveMistakeRequest {
  question: string;
}

export interface RecordingItem {
  id: string;
  tag: string;
  task: string;
  duration: number;
  checks: string[];
  audioUrl: string;
  createdAt: string;
}

export interface CreateRecordingRequest {
  tag: string;
  task: string;
  duration: number;
  checks: string[];
  audioUrl: string;
}
