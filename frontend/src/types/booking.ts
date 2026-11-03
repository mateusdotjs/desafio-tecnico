import type { CreateAppointmentInput } from "../api/types.ts";

export type BookingDraft = {
  examId?: number;
  date?: string;
  doctorId?: string;
  startTime?: string;
  patientName?: string;
};

export function isBookingComplete(
  draft: BookingDraft,
): draft is CreateAppointmentInput {
  return (
    draft.examId != null &&
    draft.date != null &&
    draft.date.length > 0 &&
    draft.doctorId != null &&
    draft.doctorId.length > 0 &&
    draft.startTime != null &&
    draft.startTime.length > 0 &&
    draft.patientName != null &&
    draft.patientName.trim().length > 0
  );
}
