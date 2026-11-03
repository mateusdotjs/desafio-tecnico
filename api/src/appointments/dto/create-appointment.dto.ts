import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsUUID,
  Matches,
  MaxLength,
  IsDateString,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsNotEmpty({ message: 'O nome do paciente é obrigatório' })
  @MaxLength(255, {
    message: 'O nome do paciente deve ter no máximo 255 caracteres',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  patientName!: string;

  @IsInt({ message: 'O id do exame deve ser um número inteiro' })
  examId!: number;

  @IsUUID('all', { message: 'O id do médico deve ser um UUID válido' })
  doctorId!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'A data deve estar no formato AAAA-MM-DD',
  })
  @IsDateString({ strict: true }, { message: 'A data informada é inválida' })
  date!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'O horário deve estar no formato HH:mm',
  })
  startTime!: string;
}
