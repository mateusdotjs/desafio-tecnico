import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { doctors } from './schema/doctors.schema';
import { exams } from './schema/exams.schema';
import { shifts } from './schema/shifts.schema';

const examRows = [
  { id: 1, name: 'Raio-X de Tórax', durationMinutes: 20 },
  { id: 2, name: 'Raio-X de Coluna Lombar', durationMinutes: 20 },
  { id: 3, name: 'Raio-X de Crânio', durationMinutes: 20 },
  { id: 4, name: 'Raio-X de Joelho', durationMinutes: 20 },
  { id: 5, name: 'Raio-X de Abdome', durationMinutes: 20 },
  { id: 6, name: 'Mamografia Bilateral', durationMinutes: 30 },
  { id: 7, name: 'Ultrassonografia Abdominal Total', durationMinutes: 40 },
  { id: 8, name: 'Ultrassonografia Transvaginal', durationMinutes: 40 },
  { id: 9, name: 'Ultrassonografia de Tireoide', durationMinutes: 30 },
  { id: 10, name: 'Ultrassonografia de Mama', durationMinutes: 30 },
  { id: 11, name: 'Ultrassonografia Obstétrica', durationMinutes: 40 },
  { id: 12, name: 'Ultrassonografia de Próstata', durationMinutes: 30 },
  {
    id: 13,
    name: 'Ultrassonografia de Rins e Vias Urinárias',
    durationMinutes: 30,
  },
  { id: 14, name: 'Doppler de Carótidas', durationMinutes: 40 },
  { id: 15, name: 'Doppler Venoso de Membros Inferiores', durationMinutes: 40 },
  { id: 16, name: 'Ecocardiograma com Doppler', durationMinutes: 40 },
  { id: 17, name: 'Tomografia Computadorizada de Crânio', durationMinutes: 40 },
  { id: 18, name: 'Tomografia Computadorizada de Tórax', durationMinutes: 40 },
  { id: 19, name: 'Tomografia Computadorizada de Abdome', durationMinutes: 40 },
  { id: 20, name: 'Ressonância Magnética de Crânio', durationMinutes: 40 },
  { id: 21, name: 'Ressonância Magnética de Joelho', durationMinutes: 40 },
  {
    id: 22,
    name: 'Ressonância Magnética de Coluna Lombar',
    durationMinutes: 40,
  },
  { id: 23, name: 'Ressonância Magnética de Ombro', durationMinutes: 40 },
  { id: 24, name: 'Densitometria Óssea', durationMinutes: 30 },
  { id: 25, name: 'Cintilografia Óssea', durationMinutes: 40 },
  { id: 26, name: 'Cintilografia Miocárdica', durationMinutes: 40 },
  { id: 27, name: 'Angiotomografia Coronariana', durationMinutes: 40 },
  { id: 28, name: 'Mamografia Digital com Tomossíntese', durationMinutes: 30 },
  { id: 29, name: 'Ultrassonografia de Articulações', durationMinutes: 30 },
  { id: 30, name: 'Raio-X Panorâmico de Mandíbula', durationMinutes: 20 },
];

const doctorRows = [
  { name: 'Dra. Helena Marques' },
  { name: 'Dr. Rafael Teixeira' },
  { name: 'Dra. Beatriz Nogueira' },
  { name: 'Dr. Thiago Fontes' },
  { name: 'Dra. Camila Andrade' },
];

const shiftRows = [
  {
    doctorName: 'Dra. Helena Marques',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '12:00',
  },
  {
    doctorName: 'Dra. Helena Marques',
    dayOfWeek: 1,
    startTime: '14:00',
    endTime: '18:00',
  },
  {
    doctorName: 'Dra. Helena Marques',
    dayOfWeek: 2,
    startTime: '08:00',
    endTime: '12:00',
  },
  {
    doctorName: 'Dra. Helena Marques',
    dayOfWeek: 2,
    startTime: '14:00',
    endTime: '18:00',
  },
  {
    doctorName: 'Dra. Helena Marques',
    dayOfWeek: 3,
    startTime: '08:00',
    endTime: '12:00',
  },
  {
    doctorName: 'Dra. Helena Marques',
    dayOfWeek: 3,
    startTime: '14:00',
    endTime: '18:00',
  },
  {
    doctorName: 'Dra. Helena Marques',
    dayOfWeek: 4,
    startTime: '08:00',
    endTime: '12:00',
  },
  {
    doctorName: 'Dra. Helena Marques',
    dayOfWeek: 4,
    startTime: '14:00',
    endTime: '18:00',
  },
  {
    doctorName: 'Dra. Helena Marques',
    dayOfWeek: 5,
    startTime: '08:00',
    endTime: '12:00',
  },
  {
    doctorName: 'Dra. Helena Marques',
    dayOfWeek: 5,
    startTime: '14:00',
    endTime: '18:00',
  },

  {
    doctorName: 'Dr. Rafael Teixeira',
    dayOfWeek: 1,
    startTime: '07:00',
    endTime: '13:00',
  },
  {
    doctorName: 'Dr. Rafael Teixeira',
    dayOfWeek: 2,
    startTime: '13:00',
    endTime: '19:00',
  },
  {
    doctorName: 'Dr. Rafael Teixeira',
    dayOfWeek: 3,
    startTime: '07:00',
    endTime: '13:00',
  },
  {
    doctorName: 'Dr. Rafael Teixeira',
    dayOfWeek: 4,
    startTime: '13:00',
    endTime: '19:00',
  },
  {
    doctorName: 'Dr. Rafael Teixeira',
    dayOfWeek: 5,
    startTime: '07:00',
    endTime: '13:00',
  },

  {
    doctorName: 'Dra. Beatriz Nogueira',
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '12:00',
  },
  {
    doctorName: 'Dra. Beatriz Nogueira',
    dayOfWeek: 1,
    startTime: '18:00',
    endTime: '22:00',
  },
  {
    doctorName: 'Dra. Beatriz Nogueira',
    dayOfWeek: 2,
    startTime: '09:00',
    endTime: '12:00',
  },
  {
    doctorName: 'Dra. Beatriz Nogueira',
    dayOfWeek: 2,
    startTime: '18:00',
    endTime: '22:00',
  },
  {
    doctorName: 'Dra. Beatriz Nogueira',
    dayOfWeek: 3,
    startTime: '09:00',
    endTime: '12:00',
  },
  {
    doctorName: 'Dra. Beatriz Nogueira',
    dayOfWeek: 3,
    startTime: '18:00',
    endTime: '22:00',
  },
  {
    doctorName: 'Dra. Beatriz Nogueira',
    dayOfWeek: 4,
    startTime: '09:00',
    endTime: '12:00',
  },
  {
    doctorName: 'Dra. Beatriz Nogueira',
    dayOfWeek: 4,
    startTime: '18:00',
    endTime: '22:00',
  },

  {
    doctorName: 'Dr. Thiago Fontes',
    dayOfWeek: 2,
    startTime: '08:00',
    endTime: '12:00',
  },
  {
    doctorName: 'Dr. Thiago Fontes',
    dayOfWeek: 3,
    startTime: '08:00',
    endTime: '12:00',
  },
  {
    doctorName: 'Dr. Thiago Fontes',
    dayOfWeek: 3,
    startTime: '19:00',
    endTime: '22:00',
  },
  {
    doctorName: 'Dr. Thiago Fontes',
    dayOfWeek: 4,
    startTime: '08:00',
    endTime: '12:00',
  },
  {
    doctorName: 'Dr. Thiago Fontes',
    dayOfWeek: 5,
    startTime: '08:00',
    endTime: '12:00',
  },
  {
    doctorName: 'Dr. Thiago Fontes',
    dayOfWeek: 5,
    startTime: '19:00',
    endTime: '22:00',
  },
  {
    doctorName: 'Dr. Thiago Fontes',
    dayOfWeek: 6,
    startTime: '08:00',
    endTime: '12:00',
  },

  {
    doctorName: 'Dra. Camila Andrade',
    dayOfWeek: 1,
    startTime: '10:00',
    endTime: '14:00',
  },
  {
    doctorName: 'Dra. Camila Andrade',
    dayOfWeek: 2,
    startTime: '10:00',
    endTime: '14:00',
  },
  {
    doctorName: 'Dra. Camila Andrade',
    dayOfWeek: 3,
    startTime: '10:00',
    endTime: '14:00',
  },
  {
    doctorName: 'Dra. Camila Andrade',
    dayOfWeek: 4,
    startTime: '10:00',
    endTime: '14:00',
  },
  {
    doctorName: 'Dra. Camila Andrade',
    dayOfWeek: 5,
    startTime: '10:00',
    endTime: '14:00',
  },
  {
    doctorName: 'Dra. Camila Andrade',
    dayOfWeek: 6,
    startTime: '08:00',
    endTime: '12:00',
  },
];

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not set. Run the seed with npm run db:seed from the api folder.',
    );
  }

  console.log('Starting database seed…');
  console.log(
    `Planned inserts: ${examRows.length} exams, ${doctorRows.length} doctors, ${shiftRows.length} shifts`,
  );

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle({ client: pool });

  try {
    await db.transaction(async (tx) => {
      console.log('Inserting exams…');
      await tx.insert(exams).values(examRows);

      console.log('Inserting doctors…');
      const insertedDoctors = await tx
        .insert(doctors)
        .values(doctorRows)
        .returning();

      const doctorIdByName = Object.fromEntries(
        insertedDoctors.map((doctor) => [doctor.name, doctor.id]),
      );

      console.log('Inserting shifts…');
      await tx.insert(shifts).values(
        shiftRows.map(({ doctorName, dayOfWeek, startTime, endTime }) => ({
          doctorId: doctorIdByName[doctorName],
          dayOfWeek,
          startTime,
          endTime,
        })),
      );
    });

    console.log('Seed completed successfully.');
    console.log(
      `Inserted ${examRows.length} exams, ${doctorRows.length} doctors, and ${shiftRows.length} shifts.`,
    );
  } finally {
    await pool.end();
  }
}

seed().catch((error: unknown) => {
  console.error('Seed failed.');
  console.error(error);
  process.exitCode = 1;
});
