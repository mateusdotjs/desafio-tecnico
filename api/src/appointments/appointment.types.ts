export type DoctorAvailability = {
  id: string;
  name: string;
  availableSlots: string[];
};

export type AppointmentListItem = {
  id: string;
  patientName: string;
  examName: string;
  doctorName: string;
  startAt: Date;
  endAt: Date;
};
