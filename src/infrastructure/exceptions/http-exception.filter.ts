import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import DuplicatedUserException from 'src/domain/exceptions/duplicated-user.exception';
import UserDomainException from 'src/domain/exceptions/user-domain.exception';

@Catch()
export default class HttpExceptionFilter implements ExceptionFilter<Error> {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { message, status } = this.isBusinessException(exception);
    response.status(status).json({
      message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public isBusinessException(exception: Error): any {
    if (exception instanceof UserDomainException) {
      return { message: exception.message, status: 400 };
    }

    if (exception instanceof DuplicatedUserException) {
      return { message: exception.message, status: 409 };
    }

    Logger.log(exception.stack);
    return {
      message: 'unknown',
      status: 500,
    };
  }
}
