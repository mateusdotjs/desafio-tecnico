import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class SearchExamsQueryDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name?: string;
}
