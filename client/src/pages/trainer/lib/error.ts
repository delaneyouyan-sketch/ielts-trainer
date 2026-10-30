export const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  const maybeResponse = error as {
    response?: { data?: { error?: { message?: string } } };
  };
  return (
    maybeResponse.response?.data?.error?.message ?? fallback
  );
};
