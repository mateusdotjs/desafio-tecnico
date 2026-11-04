/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Pool } from 'pg';
import request, { Response } from 'supertest';
import { App } from 'supertest/types';
import { resetDb } from '../../test/reset-db';
import { AppModule } from '../app.module';
import { getDayOfWeek } from '../helpers/time';

const date = '2027-06-07';
const conflictMessage =
  'O horário selecionado conflita com um agendamento existente';

describe('POST /appointments', () => {
  let app: INestApplication<App>;
  let pool: Pool;

  beforeAll(async () => {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();
  });

  beforeEach(() => resetDb(pool));

  afterAll(async () => {
    await app.close();
    await pool.end();
  });

  async function insertExam(
    id: number,
    name: string,
    durationMinutes: number,
  ): Promise<void> {
    await pool.query(
      `INSERT INTO exams (id, name, duration_minutes) VALUES ($1, $2, $3)`,
      [id, name, durationMinutes],
    );
  }

  async function insertDoctor(name: string): Promise<string> {
    const { rows } = await pool.query<{ id: string }>(
      `INSERT INTO doctors (name) VALUES ($1) RETURNING id`,
      [name],
    );
    const doctorId = rows[0].id;

    await pool.query(
      `INSERT INTO shifts (doctor_id, day_of_week, start_time, end_time)
       VALUES ($1, $2, '08:00', '12:00')`,
      [doctorId, getDayOfWeek(date)],
    );

    return doctorId;
  }

  function book(
    patientName: string,
    examId: number,
    doctorId: string,
    startTime: string,
  ): Promise<Response> {
    return request(app.getHttpServer()).post('/appointments').send({
      patientName,
      examId,
      doctorId,
      date,
      startTime,
    });
  }

  async function countForDoctor(doctorId: string): Promise<number> {
    const { rows } = await pool.query<{ count: number }>(
      `SELECT count(*)::int AS count FROM appointments WHERE doctor_id = $1`,
      [doctorId],
    );
    return rows[0].count;
  }

  function expectConflicts(responses: Response[], conflictCount: number): void {
    const created = responses.filter((response) => response.status === 201);
    const conflicts = responses.filter((response) => response.status === 409);

    expect(created).toHaveLength(responses.length - conflictCount);
    expect(conflicts).toHaveLength(conflictCount);

    for (const response of conflicts) {
      expect(response.body).toEqual({
        statusCode: 409,
        message: conflictMessage,
      });
    }
  }

  it('keeps a single appointment when the same slot is booked concurrently', async () => {
    await insertExam(1, 'Ultrassonografia', 40);
    const doctorId = await insertDoctor('Dra. Helena Marques');
    const patients = ['Ana', 'Bruno', 'Carla', 'Diego', 'Eva'];

    const responses = await Promise.all(
      patients.map((patientName) => book(patientName, 1, doctorId, '08:00')),
    );

    expectConflicts(responses, patients.length - 1);
    expect(patients).toContain(
      responses.find((response) => response.status === 201)?.body.patientName,
    );
    expect(await countForDoctor(doctorId)).toBe(1);
  });

  it('rejects a 20-minute booking at 08:20 that overlaps a 40-minute booking at 08:00', async () => {
    await insertExam(1, 'Ultrassonografia', 40);
    await insertExam(2, 'Raio-X de Tórax', 20);
    const doctorId = await insertDoctor('Dra. Helena Marques');

    const responses = await Promise.all([
      book('Ana', 1, doctorId, '08:00'),
      book('Bruno', 2, doctorId, '08:20'),
    ]);

    expectConflicts(responses, 1);
    expect(await countForDoctor(doctorId)).toBe(1);
  });

  it('creates both appointments when different doctors book the same slot', async () => {
    await insertExam(1, 'Ultrassonografia', 40);
    const helenaId = await insertDoctor('Dra. Helena Marques');
    const rafaelId = await insertDoctor('Dr. Rafael Teixeira');

    const responses = await Promise.all([
      book('Ana', 1, helenaId, '08:00'),
      book('Bruno', 1, rafaelId, '08:00'),
    ]);

    expect(responses.map((response) => response.status)).toEqual([201, 201]);
    expect(await countForDoctor(helenaId)).toBe(1);
    expect(await countForDoctor(rafaelId)).toBe(1);
  });

  it('creates both appointments when the slots only touch at the boundary', async () => {
    await insertExam(1, 'Ultrassonografia', 40);
    const doctorId = await insertDoctor('Dra. Helena Marques');

    const responses = await Promise.all([
      book('Ana', 1, doctorId, '08:00'),
      book('Bruno', 1, doctorId, '08:40'),
    ]);

    expect(responses.map((response) => response.status)).toEqual([201, 201]);
    expect(await countForDoctor(doctorId)).toBe(2);
  });
});
