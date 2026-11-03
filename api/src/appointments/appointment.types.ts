export type DoctorAvailability = {
  id: string;
  name: string;
  availableSlots: string[];
};

export type AppointmentListRow = {
  id: string;
  patientName: string;
  examName: string;
  doctorName: string;
  startAt: Date;
  endAt: Date;
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
