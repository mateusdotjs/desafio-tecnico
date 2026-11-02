import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  IsDateString,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  patientName!: string;

  @IsInt()
  @Min(1)
  examId!: number;

  @IsUUID()
  doctorId!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  date!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startTime!: string;
}
