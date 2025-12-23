import { RpcError } from './rpc-error';

export function isRpcError(err: unknown): err is RpcError {
  return (
    typeof err === 'object' && err !== null && 'code' in err && 'message' in err
  );
}
