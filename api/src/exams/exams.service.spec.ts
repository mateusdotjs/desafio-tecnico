import { Test, TestingModule } from '@nestjs/testing';
import { Exam } from '../database/exams.schema';
import { ExamsRepository } from './exams.repository';
import { ExamsService } from './exams.service';

describe('ExamsService', () => {
  let service: ExamsService;
  let findManyByName: jest.MockedFunction<ExamsRepository['findManyByName']>;

  const sampleExams: Exam[] = [
    { id: 1, name: 'Raio-X de Tórax', durationMinutes: 20 },
  ];

  beforeEach(async () => {
    findManyByName = jest.fn().mockResolvedValue(sampleExams);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamsService,
        {
          provide: ExamsRepository,
          useValue: { findManyByName },
        },
      ],
    }).compile();

    service = module.get<ExamsService>(ExamsService);
  });

  it('calls findManyByName without filter when name is omitted', async () => {
    await expect(service.findMany()).resolves.toEqual(sampleExams);
    expect(findManyByName).toHaveBeenCalledWith(undefined);
  });

  it('calls findManyByName without filter when name is whitespace only', async () => {
    await expect(service.findMany('   ')).resolves.toEqual(sampleExams);
    expect(findManyByName).toHaveBeenCalledWith(undefined);
  });

  it('trims name before calling the repository', async () => {
    await expect(service.findMany('  ultra  ')).resolves.toEqual(sampleExams);
    expect(findManyByName).toHaveBeenCalledWith('ultra');
  });

  it('returns an empty array when the repository finds no exams', async () => {
    findManyByName.mockResolvedValue([]);

    await expect(service.findMany('inexistente')).resolves.toEqual([]);
  });

  it('propagates repository errors', async () => {
    const error = new Error('db unavailable');
    findManyByName.mockRejectedValue(error);

    await expect(service.findMany('raio')).rejects.toThrow(error);
  });
});
