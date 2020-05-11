import {
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  Catch,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const status = exception.getStatus();

    const errorResponse = {
      status: status,
      timestamp: new Date(),
      path: request.url,
      method: request.method,
      message: exception.message || null,
    };

    Logger.error(
      `${request.method} ${request.url}`,
      exception.stack,
      HttpErrorFilter.name,
    );

    return response.status(status).json(errorResponse);
  }
}
