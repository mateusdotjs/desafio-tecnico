import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAppointment,
  getAppointments,
  getAvailability,
} from "../api/requests/appointments.ts";

export function useAvailability(
  examId: number | undefined,
  date: string | undefined,
) {
  return useQuery({
    queryKey: ["appointments", "availability", examId, date],
    queryFn: () => getAvailability(examId!, date!),
    enabled: examId != null && date != null && date.length > 0,
  });
}

export function useAppointments() {
  return useQuery({
    queryKey: ["appointments", "list"],
    queryFn: getAppointments,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAppointment,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["appointments", "availability"],
      });
      queryClient.invalidateQueries({
        queryKey: ["appointments", "list"],
      });
    },
  });
}
