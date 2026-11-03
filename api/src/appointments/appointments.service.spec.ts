import { Test, TestingModule } from '@nestjs/testing';
import {
  AppointmentConflictException,
  DoctorNotFoundException,
  ExamNotFoundException,
  InvalidAppointmentTimeException,
  PastAppointmentException,
} from '../common/exceptions/domain.exception';
import { Appointment } from '../database/schema/appointments.schema';
import { Exam } from '../database/schema/exams.schema';
import { DoctorWithShifts } from '../doctors/doctor.types';
import { DoctorsRepository } from '../doctors/doctors.repository';
import { ExamsRepository } from '../exams/exams.repository';
import { AppointmentListItem } from './appointment.types';
import { AppointmentsRepository } from './appointments.repository';
import { AppointmentsService } from './appointments.service';

describe('AppointmentsService', () => {
  let service: AppointmentsService;

  let findExamById: jest.MockedFunction<ExamsRepository['findById']>;
  let findAllDoctors: jest.MockedFunction<
    DoctorsRepository['findAllWithShifts']
  >;
  let findDoctorById: jest.MockedFunction<
    DoctorsRepository['findByIdWithShifts']
  >;
  let findInRange: jest.MockedFunction<AppointmentsRepository['findInRange']>;
  let findInRangeByDoctorId: jest.MockedFunction<
    AppointmentsRepository['findInRangeByDoctorId']
  >;
  let createAppointment: jest.MockedFunction<AppointmentsRepository['create']>;
  let findAllAppointments: jest.MockedFunction<
    AppointmentsRepository['findAll']
  >;

  const doctorId = '11111111-1111-1111-1111-111111111111';
  const otherDoctorId = '22222222-2222-2222-2222-222222222222';
  const date = '2026-11-03';

  const exam40: Exam = {
    id: 7,
    name: 'Ultrassonografia Abdominal Total',
    durationMinutes: 40,
  };

  const exam20: Exam = {
    id: 1,
    name: 'Raio-X de Tórax',
    durationMinutes: 20,
  };

  const doctorWithMorningShift: DoctorWithShifts = {
    id: doctorId,
    name: 'Dra. Helena Marques',
    shifts: [
      {
        id: 'shift-1',
        dayOfWeek: 2,
        startTime: '08:00:00',
        endTime: '12:00:00',
      },
    ],
  };

  const doctorWithTwoShifts: DoctorWithShifts = {
    id: otherDoctorId,
    name: 'Dr. Rafael Teixeira',
    shifts: [
      {
        id: 'shift-2',
        dayOfWeek: 2,
        startTime: '08:00:00',
        endTime: '12:00:00',
      },
      {
        id: 'shift-3',
        dayOfWeek: 2,
        startTime: '14:00:00',
        endTime: '18:00:00',
      },
    ],
  };

  beforeEach(async () => {
    findExamById = jest.fn();
    findAllDoctors = jest.fn();
    findDoctorById = jest.fn();
    findInRange = jest.fn().mockResolvedValue([]);
    findInRangeByDoctorId = jest.fn().mockResolvedValue([]);
    createAppointment = jest.fn();
    findAllAppointments = jest.fn().mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: ExamsRepository, useValue: { findById: findExamById } },
        {
          provide: DoctorsRepository,
          useValue: {
            findAllWithShifts: findAllDoctors,
            findByIdWithShifts: findDoctorById,
          },
        },
        {
          provide: AppointmentsRepository,
          useValue: {
            findInRange,
            findInRangeByDoctorId,
            findAll: findAllAppointments,
            create: createAppointment,
          },
        },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getAvailability', () => {
    it('throws ExamNotFoundException when the exam does not exist', async () => {
      findExamById.mockResolvedValue(undefined);

      await expect(service.getAvailability(999, date)).rejects.toThrow(
        ExamNotFoundException,
      );
    });

    it('generates 40-minute slots for a morning shift', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(`${date}T07:00:00`));

      findExamById.mockResolvedValue(exam40);
      findAllDoctors.mockResolvedValue([doctorWithMorningShift]);

      await expect(service.getAvailability(exam40.id, date)).resolves.toEqual([
        {
          id: doctorId,
          name: 'Dra. Helena Marques',
          availableSlots: [
            '08:00',
            '08:40',
            '09:20',
            '10:00',
            '10:40',
            '11:20',
          ],
        },
      ]);
    });

    it('generates 20-minute slots for a morning shift', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(`${date}T07:00:00`));

      findExamById.mockResolvedValue(exam20);
      findAllDoctors.mockResolvedValue([doctorWithMorningShift]);

      const [result] = await service.getAvailability(exam20.id, date);

      expect(result.availableSlots).toEqual([
        '08:00',
        '08:20',
        '08:40',
        '09:00',
        '09:20',
        '09:40',
        '10:00',
        '10:20',
        '10:40',
        '11:00',
        '11:20',
        '11:40',
      ]);
    });

    it('includes slots from multiple shifts on the same day', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(`${date}T07:00:00`));

      findExamById.mockResolvedValue(exam40);
      findAllDoctors.mockResolvedValue([doctorWithTwoShifts]);

      const [result] = await service.getAvailability(exam40.id, date);

      expect(result.availableSlots).toEqual([
        '08:00',
        '08:40',
        '09:20',
        '10:00',
        '10:40',
        '11:20',
        '14:00',
        '14:40',
        '15:20',
        '16:00',
        '16:40',
        '17:20',
      ]);
    });

    it('returns an empty availableSlots array when the doctor has no shift on the date', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(`${date}T07:00:00`));

      findExamById.mockResolvedValue(exam40);
      findAllDoctors.mockResolvedValue([
        {
          ...doctorWithMorningShift,
          shifts: [{ ...doctorWithMorningShift.shifts[0], dayOfWeek: 1 }],
        },
      ]);

      const [result] = await service.getAvailability(exam40.id, date);

      expect(result.availableSlots).toEqual([]);
    });

    it('removes slots that overlap existing appointments', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(`${date}T07:00:00`));

      findExamById.mockResolvedValue(exam40);
      findAllDoctors.mockResolvedValue([doctorWithMorningShift]);
      findInRange.mockResolvedValue([
        {
          id: 'appt-1',
          patientName: 'João',
          doctorId,
          examId: exam40.id,
          startAt: new Date(`${date}T09:20:00`),
          endAt: new Date(`${date}T10:00:00`),
          createdAt: new Date(),
        },
      ]);

      const [result] = await service.getAvailability(exam40.id, date);

      expect(result.availableSlots).toEqual([
        '08:00',
        '08:40',
        '10:00',
        '10:40',
        '11:20',
      ]);
    });

    it('removes slots in the past', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(`${date}T09:00:00`));

      findExamById.mockResolvedValue(exam40);
      findAllDoctors.mockResolvedValue([doctorWithMorningShift]);

      const [result] = await service.getAvailability(exam40.id, date);

      expect(result.availableSlots).toEqual([
        '09:20',
        '10:00',
        '10:40',
        '11:20',
      ]);
    });
  });

  describe('create', () => {
    const createdAppointment: Appointment = {
      id: '33333333-3333-3333-3333-333333333333',
      patientName: 'Maria',
      doctorId,
      examId: exam40.id,
      startAt: new Date(`${date}T08:40:00`),
      endAt: new Date(`${date}T09:20:00`),
      createdAt: new Date(`${date}T07:00:00`),
    };

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(`${date}T07:00:00`));
    });

    it('creates an appointment with endAt derived from exam duration', async () => {
      findExamById.mockResolvedValue(exam40);
      findDoctorById.mockResolvedValue(doctorWithMorningShift);
      createAppointment.mockResolvedValue(createdAppointment);

      await expect(
        service.create({
          patientName: 'Maria',
          examId: exam40.id,
          doctorId,
          date,
          startTime: '08:40',
        }),
      ).resolves.toEqual(createdAppointment);

      expect(createAppointment).toHaveBeenCalledWith({
        patientName: 'Maria',
        doctorId,
        examId: exam40.id,
        startAt: new Date(`${date}T08:40:00`),
        endAt: new Date(`${date}T09:20:00`),
      });
    });

    it('throws ExamNotFoundException when the exam does not exist', async () => {
      findExamById.mockResolvedValue(undefined);

      await expect(
        service.create({
          patientName: 'Maria',
          examId: 999,
          doctorId,
          date,
          startTime: '08:00',
        }),
      ).rejects.toThrow(ExamNotFoundException);
    });

    it('throws DoctorNotFoundException when the doctor does not exist', async () => {
      findExamById.mockResolvedValue(exam40);
      findDoctorById.mockResolvedValue(undefined);

      await expect(
        service.create({
          patientName: 'Maria',
          examId: exam40.id,
          doctorId,
          date,
          startTime: '08:00',
        }),
      ).rejects.toThrow(DoctorNotFoundException);
    });

    it('throws InvalidAppointmentTimeException when the time is outside a valid shift', async () => {
      findExamById.mockResolvedValue(exam40);
      findDoctorById.mockResolvedValue(doctorWithMorningShift);

      await expect(
        service.create({
          patientName: 'Maria',
          examId: exam40.id,
          doctorId,
          date,
          startTime: '12:00',
        }),
      ).rejects.toThrow(InvalidAppointmentTimeException);
    });

    it('throws InvalidAppointmentTimeException when the time is misaligned with exam duration', async () => {
      findExamById.mockResolvedValue(exam40);
      findDoctorById.mockResolvedValue(doctorWithMorningShift);

      await expect(
        service.create({
          patientName: 'Maria',
          examId: exam40.id,
          doctorId,
          date,
          startTime: '08:20',
        }),
      ).rejects.toThrow(InvalidAppointmentTimeException);
    });

    it('throws PastAppointmentException when scheduling in the past', async () => {
      jest.setSystemTime(new Date(`${date}T10:00:00`));

      findExamById.mockResolvedValue(exam40);
      findDoctorById.mockResolvedValue(doctorWithMorningShift);

      await expect(
        service.create({
          patientName: 'Maria',
          examId: exam40.id,
          doctorId,
          date,
          startTime: '08:00',
        }),
      ).rejects.toThrow(PastAppointmentException);
    });

    it('throws AppointmentConflictException when a conflicting appointment exists', async () => {
      findExamById.mockResolvedValue(exam40);
      findDoctorById.mockResolvedValue(doctorWithMorningShift);
      findInRangeByDoctorId.mockResolvedValue([
        {
          id: 'appt-1',
          patientName: 'João',
          doctorId,
          examId: exam40.id,
          startAt: new Date(`${date}T08:40:00`),
          endAt: new Date(`${date}T09:20:00`),
          createdAt: new Date(),
        },
      ]);

      await expect(
        service.create({
          patientName: 'Maria',
          examId: exam40.id,
          doctorId,
          date,
          startTime: '08:40',
        }),
      ).rejects.toThrow(AppointmentConflictException);
    });

    it('throws AppointmentConflictException when the database reports an exclusion violation', async () => {
      findExamById.mockResolvedValue(exam40);
      findDoctorById.mockResolvedValue(doctorWithMorningShift);
      createAppointment.mockRejectedValue({ code: '23P01' });

      await expect(
        service.create({
          patientName: 'Maria',
          examId: exam40.id,
          doctorId,
          date,
          startTime: '08:40',
        }),
      ).rejects.toThrow(AppointmentConflictException);
    });

    it('throws AppointmentConflictException when the exclusion violation is nested in cause', async () => {
      findExamById.mockResolvedValue(exam40);
      findDoctorById.mockResolvedValue(doctorWithMorningShift);
      createAppointment.mockRejectedValue({ cause: { code: '23P01' } });

      await expect(
        service.create({
          patientName: 'Maria',
          examId: exam40.id,
          doctorId,
          date,
          startTime: '08:40',
        }),
      ).rejects.toThrow(AppointmentConflictException);
    });
  });

  describe('findAll', () => {
    it('returns the appointments from the repository', async () => {
      const list: AppointmentListItem[] = [
        {
          id: '33333333-3333-3333-3333-333333333333',
          patientName: 'Maria',
          examName: exam40.name,
          doctorName: 'Dra. Helena Marques',
          startAt: new Date(`${date}T08:00:00`),
          endAt: new Date(`${date}T08:40:00`),
        },
      ];
      findAllAppointments.mockResolvedValue(list);

      await expect(service.findAll()).resolves.toEqual(list);
      expect(findAllAppointments).toHaveBeenCalledWith();
    });
  });
});
