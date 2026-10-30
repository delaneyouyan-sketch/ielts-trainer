import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchTrainerState,
  postRemoveMistake,
  postSubmitQuiz,
  postToggleLesson,
} from '@client/src/api/trainer';
import type {
  RemoveMistakeRequest,
  SubmitQuizRequest,
  ToggleLessonRequest,
  TrainerState,
} from '@shared/api.interface';

export const TRAINER_STATE_KEY = ['trainer-state'] as const;

export const EMPTY_TRAINER_STATE: TrainerState = {
  doneLessons: {},
  checkins: [],
  mistakes: [],
  bestScore: null,
};

export const useTrainerState = () => {
  const query = useQuery({
    queryKey: TRAINER_STATE_KEY,
    queryFn: fetchTrainerState,
  });
  return {
    state: query.data ?? EMPTY_TRAINER_STATE,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

export const useToggleLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ToggleLessonRequest) => postToggleLesson(body),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRAINER_STATE_KEY });
    },
  });
};

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SubmitQuizRequest) => postSubmitQuiz(body),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRAINER_STATE_KEY });
    },
  });
};

export const useRemoveMistake = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: RemoveMistakeRequest) => postRemoveMistake(body),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRAINER_STATE_KEY });
    },
  });
};
