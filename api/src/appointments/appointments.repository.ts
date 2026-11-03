import { InjectDrizzle } from '@nestjs/drizzle';
import { Injectable } from '@nestjs/common';
import { and, desc, eq, gt, lt } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  appointments,
  Appointment,
} from '../database/schema/appointments.schema';
import { doctors } from '../database/schema/doctors.schema';
import { exams } from '../database/schema/exams.schema';
import { AppointmentListItem } from './appointment.types';

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

  async findAll(): Promise<AppointmentListItem[]> {
    return this.db
      .select({
        id: appointments.id,
        patientName: appointments.patientName,
        examName: exams.name,
        doctorName: doctors.name,
        startAt: appointments.startAt,
        endAt: appointments.endAt,
      })
      .from(appointments)
      .innerJoin(exams, eq(appointments.examId, exams.id))
      .innerJoin(doctors, eq(appointments.doctorId, doctors.id))
      .orderBy(desc(appointments.createdAt));
  }

  async create(values: NewAppointment): Promise<Appointment> {
    const rows = await this.db.insert(appointments).values(values).returning();

    return rows[0];
  }
}
