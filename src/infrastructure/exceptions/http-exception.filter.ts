import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import DuplicatedUserException from 'src/domain/exceptions/duplicated-user.exception';
import UserDomainException from 'src/domain/exceptions/user-domain.exception';

@Catch()
export default class HttpExceptionFilter implements ExceptionFilter<Error> {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    /* ---------- Reconoce excepciones propias ---------- */
    if (exception instanceof UserDomainException) {
      return response
        .status(400)
        .json(buildBody(exception.message, 400, request));
    }
    if (exception instanceof DuplicatedUserException) {
      return response
        .status(409)
        .json(buildBody(exception.message, 409, request));
    }

    /* ---------- BadRequestException (Validaciones) ---------- */
    if (exception instanceof BadRequestException) {
      const status = exception.getStatus();
      const res = exception.getResponse(); // ← aquí viene el array de errores
      return response.status(status).json(buildBody(res, status, request));
    }

    /* ---------- Cualquier HttpException ---------- */
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      return response.status(status).json(buildBody(res, status, request));
    }

    /* ---------- Desconocido ---------- */
    Logger.error(exception.stack);
    return response
      .status(500)
      .json(buildBody(exception.message, 500, request));
  }
}

/* Helper para unificar estructura */
function buildBody(message: any, status: number, req: Request) {
  return {
    message, // puede ser string o ValidationError[]
    statusCode: status,
    timestamp: new Date().toISOString(),
    path: req.url,
  };
}
