import { Controller, Get } from '@nestjs/common';
import { DoctorWithShifts } from './doctor.types';
import { DoctorsService } from './doctors.service';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  findAll(): Promise<DoctorWithShifts[]> {
    return this.doctorsService.findAll();
  }
}
