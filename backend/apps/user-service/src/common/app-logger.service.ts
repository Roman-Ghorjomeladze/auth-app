import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class AppLogger {
  private traceId?: string;

  setTraceId(traceId?: string) {
    this.traceId = traceId;
  }

  getTraceId(): string | undefined {
    return this.traceId;
  }

  log(message: string, meta?: Record<string, unknown>) {
    console.log(
      JSON.stringify({
        level: 'info',
        traceId: this.traceId,
        message,
        ...meta,
      }),
    );
  }

  error(message: string, meta?: Record<string, unknown>) {
    console.error(
      JSON.stringify({
        level: 'error',
        traceId: this.traceId,
        message,
        ...meta,
      }),
    );
  }
}
