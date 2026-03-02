export type HttpErrorKind =
  | 'Network'
  | 'Timeout'
  | 'Unauthorized'
  | 'Forbidden'
  | 'NotFound'
  | 'Validation'
  | 'Server'
  | 'Unknown';

export type HttpError = {
  kind: HttpErrorKind;
  message: string;
  status?: number;
  requestId?: string;
  details?: unknown;
};

