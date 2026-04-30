import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: exception.message || 'Internal server error',
    });
  }
}
