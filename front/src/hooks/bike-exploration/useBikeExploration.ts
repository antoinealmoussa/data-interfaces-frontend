import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  bikeApi,
  type UploadComplete,
  type UploadEvent,
} from "../../api/bike-exploration/bikeApi";

export const useAllCols = () =>
  useQuery({
    queryKey: ["be", "cols"],
    queryFn: bikeApi.getCols,
  });

export const useConqueredCols = () =>
  useQuery({
    queryKey: ["be", "cols", "conquered"],
    queryFn: bikeApi.getConqueredCols,
  });

export interface UploadProgress {
  current: number;
  total: number;
  name: string;
}

export type UploadPhase = "idle" | "uploading" | "processing" | "cancelling";

export const useUploadActivities = () => {
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [result, setResult] = useState<UploadComplete | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);

  const mutate = useCallback(
    async (file: File) => {
      setPhase("uploading");
      setProgress(null);
      setResult(null);
      setError(null);
      setTaskId(null);

      try {
        const { task_id } = await bikeApi.uploadFile(file);
        setTaskId(task_id);

        setPhase("processing");
        await bikeApi.streamProgress(task_id, (event: UploadEvent) => {
          switch (event.type) {
            case "start":
              setProgress({ current: 0, total: event.total, name: "" });
              break;
            case "progress":
              setProgress({
                current: event.current,
                total: event.total,
                name: event.name,
              });
              break;
            case "complete":
              setResult(event);
              setProgress(null);
              setPhase("idle");
              queryClient.invalidateQueries({
                queryKey: ["be", "cols", "conquered"],
              });
              break;
            case "cancelled":
              setResult(null);
              setProgress(null);
              setPhase("idle");
              queryClient.invalidateQueries({
                queryKey: ["be", "cols", "conquered"],
              });
              break;
            case "error":
              setError(event.message);
              setProgress(null);
              setPhase("idle");
              break;
          }
        });

        setPhase((prev) => {
          if (prev === "processing") {
            setError("La connexion avec le serveur a été perdue");
            return "idle";
          }
          return prev;
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur inconnue");
        setPhase("idle");
      }
    },
    [queryClient],
  );

  const cancel = useCallback(async () => {
    if (!taskId) return;
    setPhase("cancelling");
    try {
      await bikeApi.cancelTask(taskId);
    } catch {
      setPhase("idle");
    }
  }, [taskId]);

  return { mutate, cancel, phase, progress, result, error, isPending: phase !== "idle" };
};
