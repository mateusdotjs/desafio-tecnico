import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Appointment } from '../database/schema/appointments.schema';
import { DoctorAvailability } from './appointment.types';
import { AppointmentsService } from './appointments.service';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('availability')
  getAvailability(
    @Query() query: AvailabilityQueryDto,
  ): Promise<DoctorAvailability[]> {
    return this.appointmentsService.getAvailability(query.examId, query.date);
  }

  @Post()
  create(@Body() dto: CreateAppointmentDto): Promise<Appointment> {
    return this.appointmentsService.create(dto);
  }
}
