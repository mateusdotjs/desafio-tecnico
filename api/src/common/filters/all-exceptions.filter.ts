import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import {
  AppointmentConflictException,
  DoctorNotFoundException,
  DomainException,
  ExamNotFoundException,
  InvalidAppointmentTimeException,
  PastAppointmentException,
} from '../exceptions/domain.exception';

const INTERNAL_SERVER_ERROR_MESSAGE = 'Erro interno do servidor';
const VALIDATION_ERROR_MESSAGE = 'Erro de validação';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const errors = this.validationErrors(exception);

      response.status(status).json({
        statusCode: status,
        message: VALIDATION_ERROR_MESSAGE,
        errors,
      });
      return;
    }

    if (exception instanceof DomainException) {
      const status = this.resolveStatus(exception);

      response.status(status).json({
        statusCode: status,
        message: exception.message,
      });
      return;
    }

    this.logger.error(exception instanceof Error ? exception.stack : exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: INTERNAL_SERVER_ERROR_MESSAGE,
    });
  }

  private validationErrors(exception: HttpException): string[] {
    const body = exception.getResponse();

    if (typeof body === 'string') {
      return [body];
    }

    if (typeof body === 'object' && body !== null && 'message' in body) {
      const message = body.message;

      if (typeof message === 'string') {
        return [message];
      }

      if (Array.isArray(message)) {
        const errors = message.filter(
          (item): item is string => typeof item === 'string',
        );

        if (errors.length > 0) {
          return errors;
        }
      }
    }

    return [exception.message];
  }

  private resolveStatus(exception: DomainException): HttpStatus {
    switch (true) {
      case exception instanceof ExamNotFoundException:
      case exception instanceof DoctorNotFoundException:
        return HttpStatus.NOT_FOUND;

      case exception instanceof InvalidAppointmentTimeException:
      case exception instanceof PastAppointmentException:
        return HttpStatus.BAD_REQUEST;

      case exception instanceof AppointmentConflictException:
        return HttpStatus.CONFLICT;

      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
