import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
  } from '@nestjs/common';
  import { Observable, map } from 'rxjs';
  
  @Injectable()
  export class SerializeBigIntInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(
        map((data) =>
          JSON.parse(
            JSON.stringify(data, (_, value) =>
              typeof value === 'bigint' ? value.toString() : value
            )
          )
        )
      );
    }
  }
  