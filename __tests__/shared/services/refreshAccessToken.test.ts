jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

jest.mock('../../../src/shared/constants/env', () => ({
  API_BASE_URL: 'http://api.test',
}));

jest.mock('../../../src/shared/services/http/httpEvents', () => ({
  httpEvents: { emit: jest.fn() },
}));

import axios from 'axios';
import { refreshAccessTokenSafe } from '../../../src/shared/services/auth/refreshAccessToken';

const axiosPost = axios.post as jest.Mock;
import { tokenStore } from '../../../src/shared/services/auth/tokenStore';
import { httpEvents } from '../../../src/shared/services/http/httpEvents';

describe('refreshAccessTokenSafe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    tokenStore.clear();
  });

  it('returns null and emits unauthorized when no refresh token', async () => {
    const r = await refreshAccessTokenSafe();
    expect(r).toBeNull();
    expect(httpEvents.emit).toHaveBeenCalledWith('unauthorized', undefined);
  });

  it('stores tokens on success', async () => {
    tokenStore.setTokens({ accessToken: '', refreshToken: 'ref' });
    axiosPost.mockResolvedValueOnce({
      data: { accessToken: 'newA', refreshToken: 'newR' },
    });
    const r = await refreshAccessTokenSafe();
    expect(r).toBe('newA');
    expect(tokenStore.getAccessToken()).toBe('newA');
    expect(tokenStore.getRefreshToken()).toBe('newR');
  });

  it('keeps old refresh when API omits refreshToken', async () => {
    tokenStore.setTokens({ accessToken: '', refreshToken: 'ref' });
    axiosPost.mockResolvedValueOnce({
      data: { accessToken: 'newA' },
    });
    await refreshAccessTokenSafe();
    expect(tokenStore.getRefreshToken()).toBe('ref');
  });

  it('returns null when accessToken missing in body', async () => {
    tokenStore.setTokens({ accessToken: '', refreshToken: 'ref' });
    axiosPost.mockResolvedValueOnce({ data: {} });
    const r = await refreshAccessTokenSafe();
    expect(r).toBeNull();
    expect(httpEvents.emit).toHaveBeenCalled();
  });

  it('returns null on axios error', async () => {
    tokenStore.setTokens({ accessToken: '', refreshToken: 'ref' });
    axiosPost.mockRejectedValueOnce(new Error('net'));
    const r = await refreshAccessTokenSafe();
    expect(r).toBeNull();
    expect(httpEvents.emit).toHaveBeenCalled();
  });
});
