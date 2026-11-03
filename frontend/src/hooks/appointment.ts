import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAppointment,
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

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["appointments", "availability"],
      });
    },
  });
}
