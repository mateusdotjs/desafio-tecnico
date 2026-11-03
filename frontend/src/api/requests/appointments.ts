import { request } from "../client.ts";
import type {
  Appointment,
  CreateAppointmentInput,
  DoctorAvailability,
} from "../types.ts";

export function getAvailability(
  examId: number,
  date: string,
): Promise<DoctorAvailability[]> {
  const params = new URLSearchParams({
    examId: String(examId),
    date,
  });

  return request<DoctorAvailability[]>(`/appointments/availability?${params}`);
}

export function createAppointment(
  input: CreateAppointmentInput,
): Promise<Appointment> {
  return request<Appointment>("/appointments", {
    method: "POST",
    body: input,
  });
}
