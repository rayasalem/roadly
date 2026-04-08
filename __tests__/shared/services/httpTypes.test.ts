import type { HttpError, HttpErrorKind } from '../../../src/shared/services/http/types';

describe('HttpError type', () => {
  it('accepts all kinds', () => {
    const kinds: HttpErrorKind[] = [
      'Network',
      'Timeout',
      'Unauthorized',
      'Forbidden',
      'NotFound',
      'Validation',
      'Server',
      'Unknown',
    ];
    const errors: HttpError[] = kinds.map((kind) => ({ kind, message: 'm' }));
    expect(errors).toHaveLength(8);
  });
});
