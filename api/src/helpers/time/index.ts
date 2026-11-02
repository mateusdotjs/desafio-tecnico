import { DoctorShiftEntry } from '../../doctors/doctor.types';

export type TimeInterval = {
  startAt: Date;
  endAt: Date;
};

export function getDayOfWeek(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

export function getDayBounds(date: string): { dayStart: Date; dayEnd: Date } {
  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);
  return { dayStart, dayEnd };
}

export function buildDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`);
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function formatMinutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function generateSlotsForShifts(
  shifts: DoctorShiftEntry[],
  dayOfWeek: number,
  durationMinutes: number,
): string[] {
  const slots: string[] = [];

  for (const shift of shifts) {
    if (shift.dayOfWeek !== dayOfWeek) {
      continue;
    }

    const startMinutes = parseTimeToMinutes(shift.startTime);
    const endMinutes = parseTimeToMinutes(shift.endTime);

    for (
      let slotStart = startMinutes;
      slotStart + durationMinutes <= endMinutes;
      slotStart += durationMinutes
    ) {
      slots.push(formatMinutesToTime(slotStart));
    }
  }

  return slots;
}

export function overlapsAny(
  startAt: Date,
  endAt: Date,
  existing: TimeInterval[],
): boolean {
  return existing.some(
    (interval) => startAt < interval.endAt && endAt > interval.startAt,
  );
}
