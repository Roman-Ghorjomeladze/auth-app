import 'express';

declare module 'express' {
  export interface Request {
    traceId: string;
    user: { userId: string };
  }
}
