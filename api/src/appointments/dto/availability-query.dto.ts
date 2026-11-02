import { Type } from 'class-transformer';
import { IsDateString, IsInt, Matches, Min } from 'class-validator';

export class AvailabilityQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  examId!: number;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  date!: string;
}
