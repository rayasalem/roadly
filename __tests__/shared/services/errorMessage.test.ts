jest.mock('../../../src/shared/i18n/t', () => ({
  t: (k: string) => `t:${k}`,
}));

import { AxiosError } from 'axios';
import {
  getMessageFromHttpError,
  getErrorMessage,
  isNetworkOrTimeoutError,
} from '../../../src/shared/services/http/errorMessage';
describe('getMessageFromHttpError', () => {
  it('maps kinds to i18n or message', () => {
    expect(getMessageFromHttpError({ kind: 'Network', message: 'x' })).toBe('t:error.network');
    expect(getMessageFromHttpError({ kind: 'Timeout', message: 'x' })).toBe('t:error.timeout');
    expect(getMessageFromHttpError({ kind: 'Server', message: 'x' })).toBe('t:error.server');
    expect(getMessageFromHttpError({ kind: 'Unauthorized', message: 'hello' })).toBe('hello');
    expect(getMessageFromHttpError({ kind: 'Unknown', message: '' })).toBe('t:error.unknown');
  });
});

describe('getErrorMessage', () => {
  it('normalizes axios error', () => {
    const err = new AxiosError('x', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 401,
      data: { message: 'bad' },
      headers: {},
      statusText: 'Unauthorized',
      config: {} as any,
    });
    expect(getErrorMessage(err)).toBe('bad');
  });
});

describe('isNetworkOrTimeoutError', () => {
  it('returns true for axios network/timeout errors', () => {
    const netErr = new AxiosError('net', 'ERR_NETWORK', undefined, undefined, undefined);
    const timeoutErr = new AxiosError('t', 'ECONNABORTED');
    expect(isNetworkOrTimeoutError(netErr)).toBe(true);
    expect(isNetworkOrTimeoutError(timeoutErr)).toBe(true);
    const srv = new AxiosError('x', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 500,
      data: {},
      headers: {},
      statusText: 'x',
      config: {} as any,
    });
    expect(isNetworkOrTimeoutError(srv)).toBe(false);
  });
});
