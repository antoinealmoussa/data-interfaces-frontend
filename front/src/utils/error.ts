export const handleApiError = (error: unknown, context: string): string => {
  const message =
    error instanceof Error ? error.message : `Erreur lors de ${context}`;
  console.error(`[${context}]`, error);
  return message;
};
