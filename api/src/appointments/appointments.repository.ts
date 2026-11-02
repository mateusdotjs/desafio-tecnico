import { InjectDrizzle } from '@nestjs/drizzle';
import { Injectable } from '@nestjs/common';
import { and, eq, gt, lt } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  appointments,
  Appointment,
} from '../database/schema/appointments.schema';

export type NewAppointment = {
  patientName: string;
  doctorId: string;
  examId: number;
  startAt: Date;
  endAt: Date;
};

@Injectable()
export class AppointmentsRepository {
  constructor(@InjectDrizzle() private readonly db: NodePgDatabase) {}

  async findInRange(from: Date, to: Date): Promise<Appointment[]> {
    return this.db
      .select()
      .from(appointments)
      .where(and(lt(appointments.startAt, to), gt(appointments.endAt, from)));
  }

  async findInRangeByDoctorId(
    from: Date,
    to: Date,
    doctorId: string,
  ): Promise<Appointment[]> {
    return this.db
      .select()
      .from(appointments)
      .where(
        and(
          lt(appointments.startAt, to),
          gt(appointments.endAt, from),
          eq(appointments.doctorId, doctorId),
        ),
      );
  }

  async create(values: NewAppointment): Promise<Appointment> {
    const rows = await this.db.insert(appointments).values(values).returning();

    return rows[0];
  }
}
