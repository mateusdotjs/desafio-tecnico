import { Doctor } from '../database/schema/doctors.schema';
import { Shift } from '../database/schema/shifts.schema';

export type DoctorShiftEntry = Omit<Shift, 'doctorId'>;

export type DoctorWithShifts = Doctor & {
  shifts: DoctorShiftEntry[];
};

export type DoctorShiftRow = {
  doctor: Doctor;
  shift: Shift | null;
};
