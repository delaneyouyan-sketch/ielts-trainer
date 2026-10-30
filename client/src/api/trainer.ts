import { apiClient } from '../lib/api-client';
import type {
  CreateRecordingRequest,
  RecordingItem,
  RemoveMistakeRequest,
  SubmitQuizRequest,
  SubmitQuizResponse,
  ToggleLessonRequest,
  ToggleLessonResponse,
  TrainerState,
} from '@shared/api.interface';

const BASE = '/trainer';

export async function fetchTrainerState(): Promise<TrainerState> {
  const res = await apiClient.get(`${BASE}/state`);
  return res.data as TrainerState;
}

export async function postToggleLesson(
  body: ToggleLessonRequest,
): Promise<ToggleLessonResponse> {
  const res = await apiClient.post(`${BASE}/lessons/toggle`, body);
  return res.data as ToggleLessonResponse;
}

export async function postSubmitQuiz(
  body: SubmitQuizRequest,
): Promise<SubmitQuizResponse> {
  const res = await apiClient.post(`${BASE}/quiz/submit`, body);
  return res.data as SubmitQuizResponse;
}

export async function postRemoveMistake(
  body: RemoveMistakeRequest,
): Promise<SubmitQuizResponse> {
  const res = await apiClient.post(`${BASE}/mistakes/remove`, body);
  return res.data as SubmitQuizResponse;
}

export async function fetchRecordings(): Promise<RecordingItem[]> {
  const res = await apiClient.get(`${BASE}/recordings`);
  return res.data as RecordingItem[];
}

export async function postRecording(
  body: CreateRecordingRequest,
): Promise<RecordingItem> {
  const res = await apiClient.post(`${BASE}/recordings`, body);
  return res.data as RecordingItem;
}

export async function deleteRecordingRequest(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/recordings/${id}`);
}
