// import {
//   ExceptionFilter,
//   Catch,
//   ArgumentsHost,
//   HttpException,
//   HttpStatus,
// } from '@nestjs/common';
// import { Request, Response } from 'express';

// @Catch()
// export class AllExceptionsFilter implements ExceptionFilter {
//   catch(exception: unknown, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();
//     const request = ctx.getRequest<Request>();

//     let code = HttpStatus.INTERNAL_SERVER_ERROR;
//     let message = 'Internal server error';

//     // Nếu là HttpException (NestJS có sẵn)
//     if (exception instanceof HttpException) {
//       code = exception.getStatus();
//       const res = exception.getResponse();

//       if (typeof res === 'string') {
//         message = res;
//       } else if (typeof res === 'object' && res !== null) {
//         message = (res as any).message || exception.message;
//       } else {
//         message = exception.message;
//       }
//     } else if (exception instanceof Error) {
//       message = exception.message;
//     }

//     response.status(code).json({
//       code,
//       message,
//     });
//   }
// }
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let code = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = null;

    // ✅ Trường hợp là HttpException (ví dụ: BadRequestException, NotFoundException, v.v)
    if (exception instanceof HttpException) {
      code = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const r = res as any;
        message = r.message || exception.message;
        errors = r.errors || null; // ← Lấy thêm errors nếu có
      } else {
        message = exception.message;
      }
    }

    // ✅ Trường hợp là Error bình thường (ví dụ throw new Error())
    else if (exception instanceof Error) {
      message = exception.message;
    }

    // ✅ Format phản hồi thống nhất
    const payload: Record<string, any> = {
      code,
      message,
    };

    if (errors) payload.errors = errors;

    response.status(code).json(payload);
  }
}
