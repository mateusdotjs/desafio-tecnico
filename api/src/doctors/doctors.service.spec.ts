import { Test, TestingModule } from '@nestjs/testing';
import { DoctorWithShifts } from './doctor.types';
import { DoctorsRepository } from './doctors.repository';
import { DoctorsService } from './doctors.service';

describe('DoctorsService', () => {
  let service: DoctorsService;
  let findAllWithShifts: jest.MockedFunction<
    DoctorsRepository['findAllWithShifts']
  >;

  const sampleDoctors: DoctorWithShifts[] = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Dra. Helena Marques',
      shifts: [
        {
          id: 'shift-1',
          dayOfWeek: 1,
          startTime: '08:00:00',
          endTime: '12:00:00',
        },
      ],
    },
  ];

  beforeEach(async () => {
    findAllWithShifts = jest.fn().mockResolvedValue(sampleDoctors);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoctorsService,
        {
          provide: DoctorsRepository,
          useValue: { findAllWithShifts },
        },
      ],
    }).compile();

    service = module.get<DoctorsService>(DoctorsService);
  });

  it('returns doctors with nested shifts from the repository', async () => {
    await expect(service.findAll()).resolves.toEqual(sampleDoctors);
    expect(findAllWithShifts).toHaveBeenCalled();
  });

  it('returns an empty array when there are no doctors', async () => {
    findAllWithShifts.mockResolvedValue([]);

    await expect(service.findAll()).resolves.toEqual([]);
  });

  it('propagates repository errors', async () => {
    const error = new Error('db unavailable');
    findAllWithShifts.mockRejectedValue(error);

    await expect(service.findAll()).rejects.toThrow(error);
  });
});
