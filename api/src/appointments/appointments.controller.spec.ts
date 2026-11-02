import { Test, TestingModule } from '@nestjs/testing';
import { Appointment } from '../database/schema/appointments.schema';
import { DoctorAvailability } from './appointment.types';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';

describe('AppointmentsController', () => {
  let controller: AppointmentsController;
  let getAvailability: jest.MockedFunction<
    AppointmentsService['getAvailability']
  >;
  let create: jest.MockedFunction<AppointmentsService['create']>;

  const availability: DoctorAvailability[] = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Dra. Helena Marques',
      availableSlots: ['08:00'],
    },
  ];

  const appointment: Appointment = {
    id: '33333333-3333-3333-3333-333333333333',
    patientName: 'Maria',
    doctorId: '11111111-1111-1111-1111-111111111111',
    examId: 7,
    startAt: new Date('2026-11-03T08:00:00'),
    endAt: new Date('2026-11-03T08:40:00'),
    createdAt: new Date('2026-11-03T07:00:00'),
  };

  beforeEach(async () => {
    getAvailability = jest.fn().mockResolvedValue(availability);
    create = jest.fn().mockResolvedValue(appointment);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentsController],
      providers: [
        {
          provide: AppointmentsService,
          useValue: { getAvailability, create },
        },
      ],
    }).compile();

    controller = module.get<AppointmentsController>(AppointmentsController);
  });

  it('delegates availability lookup to the service', async () => {
    await expect(
      controller.getAvailability({ examId: 7, date: '2026-11-03' }),
    ).resolves.toEqual(availability);

    expect(getAvailability).toHaveBeenCalledWith(7, '2026-11-03');
  });

  it('delegates appointment creation to the service', async () => {
    const dto = {
      patientName: 'Maria',
      examId: 7,
      doctorId: '11111111-1111-1111-1111-111111111111',
      date: '2026-11-03',
      startTime: '08:00',
    };

    await expect(controller.create(dto)).resolves.toEqual(appointment);
    expect(create).toHaveBeenCalledWith(dto);
  });
});
