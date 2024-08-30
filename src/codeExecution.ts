export type ExecutionResponse = CompletedExecutionResponse | FailedExecution;

export interface CompletedExecutionResponse {
  type: 'success' | 'error',
  stdout: string,
  stderr: string,
}

export interface FailedExecution {
  type: 'time-limit-exceeded' | 'output-limit-exceeded' | 'network-error',
}

export function isExecutionCompleted(res: ExecutionResponse): res is CompletedExecutionResponse {
  return res.type === 'success' || res.type === 'error';
}

export function isExecutionFailed(res: ExecutionResponse): res is FailedExecution {
  return !isExecutionCompleted(res);
}
