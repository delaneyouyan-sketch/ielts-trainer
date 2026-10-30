import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteRecordingRequest,
  fetchRecordings,
  postRecording,
} from '@client/src/api/trainer';
import type { CreateRecordingRequest } from '@shared/api.interface';

export const TRAINER_RECORDINGS_KEY = ['trainer-recordings'] as const;

export const useRecordings = () => {
  const query = useQuery({
    queryKey: TRAINER_RECORDINGS_KEY,
    queryFn: fetchRecordings,
  });
  return {
    recordings: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
};

export const useCreateRecording = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateRecordingRequest) => postRecording(body),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRAINER_RECORDINGS_KEY });
    },
  });
};

export const useDeleteRecording = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRecordingRequest(id),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRAINER_RECORDINGS_KEY });
    },
  });
};
