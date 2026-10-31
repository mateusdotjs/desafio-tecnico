import { Doctor } from '../database/doctors.schema';
import { Shift } from '../database/shifts.schema';

export type DoctorShiftEntry = Omit<Shift, 'doctorId'>;

export type DoctorWithShifts = Doctor & {
  shifts: DoctorShiftEntry[];
};

export type DoctorShiftRow = {
  doctor: Doctor;
  shift: Shift | null;
};
