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

      if (errors) {
        response.status(status).json({
          statusCode: status,
          message: VALIDATION_ERROR_MESSAGE,
          errors,
        });
        return;
      }

      response.status(status).json({
        statusCode: status,
        message: exception.message,
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

  private validationErrors(exception: HttpException): string[] | null {
    const body = exception.getResponse();

    if (typeof body !== 'object' || body === null || !('message' in body)) {
      return null;
    }

    if (!Array.isArray(body.message)) {
      return null;
    }

    const errors: string[] = [];

    for (const item of body.message) {
      if (typeof item === 'string') {
        errors.push(item);
      }
    }

    return errors.length > 0 ? errors : null;
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
