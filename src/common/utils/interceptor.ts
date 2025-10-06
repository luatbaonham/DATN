import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  code: number;
  data: T;
  message: string;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<StandardResponse<T>> {
    const httpContext = context.switchToHttp();
    const res = httpContext.getResponse();

    return next.handle().pipe(
      map((result: any) => {
        const statusCode = 200;

        if (result && typeof result === 'object' && 'data' in result) {
          return {
            code: statusCode,
            data: result.data,
            message: result.message ?? 'Action successfully.',
          };
        }

        return {
          code: statusCode,
          data: result,
          message: 'Action successfully.',
        };
      }),
    );
  }
}
