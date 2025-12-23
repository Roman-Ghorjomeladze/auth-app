import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

import { TRACE_ID_HEADER } from '@app/common';

@Injectable()
export class TraceMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const incomingTraceId = req.headers[TRACE_ID_HEADER] as string | undefined;
    const traceId = incomingTraceId ?? randomUUID();

    req.headers[TRACE_ID_HEADER] = traceId;
    res.setHeader(TRACE_ID_HEADER, traceId);

    (req as Request & { traceId: string }).traceId = traceId;

    next();
  }
}
