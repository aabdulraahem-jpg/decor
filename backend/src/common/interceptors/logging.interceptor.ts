import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import type { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const started = Date.now();
    const { method, url } = req;

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - started;
        this.logger.log(`${method} ${url} +${ms}ms`);
      }),
    );
  }
}
