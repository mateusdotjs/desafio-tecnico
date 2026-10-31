import { Injectable } from '@nestjs/common';
import { DoctorWithShifts } from './doctor.types';
import { DoctorsRepository } from './doctors.repository';

@Injectable()
export class DoctorsService {
  constructor(private readonly doctorsRepository: DoctorsRepository) {}

  findAll(): Promise<DoctorWithShifts[]> {
    return this.doctorsRepository.findAllWithShifts();
  }
}
