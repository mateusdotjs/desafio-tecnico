export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class ExamNotFoundException extends DomainException {
  constructor(examId: number) {
    super(`Exame com id ${examId} não encontrado`);
  }
}

export class DoctorNotFoundException extends DomainException {
  constructor(doctorId: string) {
    super(`Médico com id ${doctorId} não encontrado`);
  }
}

export class InvalidAppointmentTimeException extends DomainException {
  constructor() {
    super(
      'O horário selecionado não está dentro de um turno válido deste médico',
    );
  }
}

export class PastAppointmentException extends DomainException {
  constructor() {
    super('Não é possível agendar um horário no passado');
  }
}

export class AppointmentConflictException extends DomainException {
  constructor() {
    super('O horário selecionado conflita com um agendamento existente');
  }
}
