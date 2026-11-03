import {
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  AppointmentConflictException,
  DoctorNotFoundException,
  ExamNotFoundException,
  InvalidAppointmentTimeException,
  PastAppointmentException,
} from '../exceptions/domain.exception';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
    }),
  } as unknown as ArgumentsHost;
  const filter = new AllExceptionsFilter();

  beforeEach(() => {
    json.mockClear();
    status.mockClear();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('maps a missing exam to 404', () => {
    filter.catch(new ExamNotFoundException(7), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Exame com id 7 não encontrado',
    });
  });

  it('maps a missing doctor to 404', () => {
    filter.catch(new DoctorNotFoundException('doctor-id'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Médico com id doctor-id não encontrado',
    });
  });

  it('maps an invalid appointment time to 400', () => {
    filter.catch(new InvalidAppointmentTimeException(), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message:
        'O horário selecionado não está dentro de um turno válido deste médico',
    });
  });

  it('maps a past appointment to 400', () => {
    filter.catch(new PastAppointmentException(), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Não é possível agendar um horário no passado',
    });
  });

  it('maps an appointment conflict to 409', () => {
    filter.catch(new AppointmentConflictException(), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      message: 'O horário selecionado conflita com um agendamento existente',
    });
  });

  it('maps a validation HttpException to message and errors', () => {
    filter.catch(
      new BadRequestException(['O nome do paciente é obrigatório']),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Erro de validação',
      errors: ['O nome do paciente é obrigatório'],
    });
  });

  it('keeps each validation failure in errors', () => {
    filter.catch(
      new BadRequestException([
        'O nome do paciente é obrigatório',
        'A data informada é inválida',
      ]),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Erro de validação',
      errors: [
        'O nome do paciente é obrigatório',
        'A data informada é inválida',
      ],
    });
  });

  it('hides unexpected errors behind a generic 500', () => {
    const errorSpy = jest.spyOn(Logger.prototype, 'error');

    filter.catch(new Error('senha do banco vazou'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Erro interno do servidor',
    });
    expect(JSON.stringify(json.mock.calls)).not.toContain('senha do banco');
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('senha do banco vazou'),
    );
  });
});
