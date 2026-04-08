jest.mock('../../../src/store/uiStore', () => ({
  useUIStore: {
    getState: () => ({
      showLoader: jest.fn(),
      hideLoader: jest.fn(),
    }),
  },
}));

jest.mock('../../../src/shared/services/http/httpEvents', () => ({
  httpEvents: { emit: jest.fn() },
}));

jest.mock('../../../src/shared/constants/env', () => ({
  API_BASE_URL: 'http://localhost:9999',
  logResolvedApiBaseUrl: jest.fn(),
}));

jest.mock('../../../src/shared/services/auth/tokenStore', () => ({
  tokenStore: {
    getAccessToken: jest.fn(() => null),
  },
}));

jest.mock('../../../src/shared/services/auth/refreshAccessToken', () => ({
  refreshAccessTokenSafe: jest.fn(async () => null),
}));

jest.mock('../../../src/shared/services/http/httpClient', () => ({
  createHttpClient: jest.fn(() => ({
    interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
    get: jest.fn(),
    post: jest.fn(),
  })),
}));

import { createHttpClient } from '../../../src/shared/services/http/httpClient';
import { resetUnauthorizedGuard } from '../../../src/shared/services/http/api';

describe('api module', () => {
  it('createHttpClient was invoked with expected options', () => {
    expect(createHttpClient).toHaveBeenCalled();
    const opts = (createHttpClient as jest.Mock).mock.calls[0][0];
    expect(opts.baseURL).toBe('http://localhost:9999');
    expect(typeof opts.onError).toBe('function');
  });

  it('resetUnauthorizedGuard is callable', () => {
    expect(() => resetUnauthorizedGuard()).not.toThrow();
  });
});
