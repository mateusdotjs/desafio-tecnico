import { InjectDrizzle } from '@nestjs/drizzle';
import { Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { doctors } from '../database/doctors.schema';
import { shifts } from '../database/shifts.schema';
import { DoctorShiftRow, DoctorWithShifts } from './doctor.types';

@Injectable()
export class DoctorsRepository {
  constructor(@InjectDrizzle() private readonly db: NodePgDatabase) {}

  async findAllWithShifts(): Promise<DoctorWithShifts[]> {
    const rows = await this.db
      .select({
        doctor: doctors,
        shift: shifts,
      })
      .from(doctors)
      .leftJoin(shifts, eq(shifts.doctorId, doctors.id))
      .orderBy(asc(doctors.name), asc(shifts.dayOfWeek), asc(shifts.startTime));

    return this.groupRows(rows);
  }

  private groupRows(rows: DoctorShiftRow[]): DoctorWithShifts[] {
    const byDoctorId = new Map<string, DoctorWithShifts>();

    for (const row of rows) {
      let doctor = byDoctorId.get(row.doctor.id);
      if (!doctor) {
        doctor = {
          id: row.doctor.id,
          name: row.doctor.name,
          shifts: [],
        };
        byDoctorId.set(row.doctor.id, doctor);
      }

      if (row.shift) {
        const { doctorId: _doctorId, ...shift } = row.shift;
        doctor.shifts.push(shift);
      }
    }

    return [...byDoctorId.values()];
  }
}
