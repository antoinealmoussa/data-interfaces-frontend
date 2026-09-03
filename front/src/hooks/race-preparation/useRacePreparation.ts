import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { raceApi } from "../../api/race-preparation/raceApi";
import type {
  UpdateSectionsRequest,
  CalculateSectionsRequest,
} from "../../types/race-preparation/raceTypes";

export const useRaces = () =>
  useQuery({
    queryKey: ["rp", "races"],
    queryFn: raceApi.listRaces,
  });

export const useRace = (id: number) =>
  useQuery({
    queryKey: ["rp", "races", id],
    queryFn: () => raceApi.getRace(id),
  });

export const useTrackPoints = (id: number) =>
  useQuery({
    queryKey: ["rp", "races", id, "track-points"],
    queryFn: () => raceApi.getTrackPoints(id),
  });

export const useCalculateSections = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CalculateSectionsRequest) =>
      raceApi.calculateSections(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rp", "races", id] });
    },
  });
};

export const useUploadGpx = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => raceApi.uploadGpx(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rp", "races"] });
    },
  });
};

export const useUpdateSections = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: UpdateSectionsRequest) =>
      raceApi.updateSections(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rp", "races", id] });
    },
  });
};

export const useDeleteRace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => raceApi.deleteRace(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rp", "races"] });
    },
  });
};