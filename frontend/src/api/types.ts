export type Exam = {
  id: number;
  name: string;
  durationMinutes: number;
};

export type DoctorAvailability = {
  id: string;
  name: string;
  availableSlots: string[];
};

export type CreateAppointmentInput = {
  patientName: string;
  examId: number;
  doctorId: string;
  date: string;
  startTime: string;
};

export type Appointment = {
  id: string;
  patientName: string;
  doctorId: string;
  examId: number;
  startAt: string;
  endAt: string;
  createdAt: string;
};

export type AppointmentListItem = {
  id: string;
  patientName: string;
  examName: string;
  doctorName: string;
  date: string;
  startTime: string;
  endTime: string;
};
