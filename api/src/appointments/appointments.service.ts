import { Injectable } from '@nestjs/common';
import {
  AppointmentConflictException,
  DoctorNotFoundException,
  ExamNotFoundException,
  InvalidAppointmentTimeException,
  PastAppointmentException,
} from '../common/exceptions/domain.exception';
import { Appointment } from '../database/schema/appointments.schema';
import { DoctorsRepository } from '../doctors/doctors.repository';
import { ExamsRepository } from '../exams/exams.repository';
import {
  addMinutes,
  buildDateTime,
  formatClinicDate,
  formatClinicTime,
  generateSlotsForShifts,
  getDayBounds,
  getDayOfWeek,
  overlapsAny,
} from '../helpers/time';
import { AppointmentListItem, DoctorAvailability } from './appointment.types';
import { AppointmentsRepository } from './appointments.repository';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

const EXCLUSION_VIOLATION = '23P01';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly examsRepository: ExamsRepository,
    private readonly doctorsRepository: DoctorsRepository,
    private readonly appointmentsRepository: AppointmentsRepository,
  ) {}

  async findAll(): Promise<AppointmentListItem[]> {
    const rows = await this.appointmentsRepository.findAll();

    return rows.map((row) => ({
      id: row.id,
      patientName: row.patientName,
      examName: row.examName,
      doctorName: row.doctorName,
      date: formatClinicDate(row.startAt),
      startTime: formatClinicTime(row.startAt),
      endTime: formatClinicTime(row.endAt),
    }));
  }

  async getAvailability(
    examId: number,
    date: string,
  ): Promise<DoctorAvailability[]> {
    const exam = await this.examsRepository.findById(examId);
    if (!exam) {
      throw new ExamNotFoundException(examId);
    }

    const doctors = await this.doctorsRepository.findAllWithShifts();
    const dayOfWeek = getDayOfWeek(date);
    const { dayStart, dayEnd } = getDayBounds(date);
    const existingAppointments = await this.appointmentsRepository.findInRange(
      dayStart,
      dayEnd,
    );
    const now = new Date();

    return doctors.map((doctor) => {
      const doctorAppointments = existingAppointments.filter(
        (appointment) => appointment.doctorId === doctor.id,
      );
      const shiftSlots = generateSlotsForShifts(
        doctor.shifts,
        dayOfWeek,
        exam.durationMinutes,
      );

      const availableSlots = shiftSlots.filter((startTime) => {
        const startAt = buildDateTime(date, startTime);
        const endAt = addMinutes(startAt, exam.durationMinutes);

        if (startAt < now) {
          return false;
        }

        return !overlapsAny(startAt, endAt, doctorAppointments);
      });

      return {
        id: doctor.id,
        name: doctor.name,
        availableSlots,
      };
    });
  }

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    const exam = await this.examsRepository.findById(dto.examId);
    if (!exam) {
      throw new ExamNotFoundException(dto.examId);
    }

    const doctor = await this.doctorsRepository.findByIdWithShifts(
      dto.doctorId,
    );
    if (!doctor) {
      throw new DoctorNotFoundException(dto.doctorId);
    }

    const dayOfWeek = getDayOfWeek(dto.date);
    const shiftSlots = generateSlotsForShifts(
      doctor.shifts,
      dayOfWeek,
      exam.durationMinutes,
    );

    if (!shiftSlots.includes(dto.startTime)) {
      throw new InvalidAppointmentTimeException();
    }

    const startAt = buildDateTime(dto.date, dto.startTime);
    const endAt = addMinutes(startAt, exam.durationMinutes);

    if (startAt < new Date()) {
      throw new PastAppointmentException();
    }

    const overlapping = await this.appointmentsRepository.findInRangeByDoctorId(
      startAt,
      endAt,
      dto.doctorId,
    );

    if (overlapping.length > 0) {
      throw new AppointmentConflictException();
    }

    try {
      return await this.appointmentsRepository.create({
        patientName: dto.patientName,
        doctorId: dto.doctorId,
        examId: dto.examId,
        startAt,
        endAt,
      });
    } catch (error: unknown) {
      if (this.isExclusionViolation(error)) {
        throw new AppointmentConflictException();
      }
      throw error;
    }
  }

  private isExclusionViolation(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const record = error as { code?: string; cause?: { code?: string } };
    return (
      record.code === EXCLUSION_VIOLATION ||
      record.cause?.code === EXCLUSION_VIOLATION
    );
  }
}
