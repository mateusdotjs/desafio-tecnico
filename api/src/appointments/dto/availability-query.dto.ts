import { Type } from 'class-transformer';
import { IsDateString, IsInt, Matches } from 'class-validator';

export class AvailabilityQueryDto {
  @Type(() => Number)
  @IsInt({ message: 'O id do exame deve ser um número inteiro' })
  examId!: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'A data deve estar no formato AAAA-MM-DD',
  })
  @IsDateString({ strict: true }, { message: 'A data informada é inválida' })
  date!: string;
}
