import axios, { AxiosError } from 'axios';
import {
  toHttpError,
  createHttpClient,
  httpGet,
  httpPost,
  type TokenProvider,
} from '../../../src/shared/services/http/httpClient';

describe('toHttpError', () => {
  it('maps ECONNABORTED to Timeout', () => {
    const err = new AxiosError('timeout', 'ECONNABORTED');
    const e = toHttpError(err);
    expect(e.kind).toBe('Timeout');
    expect(e.message).toContain('timed out');
  });

  it('maps 401 Unauthorized', () => {
    const err = new AxiosError('x', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 401,
      data: { message: 'nope' },
      headers: {},
      statusText: 'Unauthorized',
      config: {} as any,
    });
    const e = toHttpError(err);
    expect(e.kind).toBe('Unauthorized');
    expect(e.message).toBe('nope');
  });

  it('maps 403 Forbidden', () => {
    const err = new AxiosError('x', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 403,
      data: { error: 'denied' },
      headers: {},
      statusText: 'Forbidden',
      config: {} as any,
    });
    expect(toHttpError(err).kind).toBe('Forbidden');
  });

  it('maps 404 NotFound', () => {
    const err = new AxiosError('x', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 404,
      data: {},
      headers: {},
      statusText: 'Not Found',
      config: {} as any,
    });
    expect(toHttpError(err).kind).toBe('NotFound');
  });

  it('maps 422 Validation', () => {
    const err = new AxiosError('x', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 422,
      data: { message: 'bad' },
      headers: {},
      statusText: 'Unprocessable',
      config: {} as any,
    });
    expect(toHttpError(err).kind).toBe('Validation');
  });

  it('maps 500 Server', () => {
    const err = new AxiosError('x', 'ERR_BAD_REQUEST', undefined, undefined, {
      status: 502,
      data: {},
      headers: {},
      statusText: 'Bad Gateway',
      config: {} as any,
    });
    expect(toHttpError(err).kind).toBe('Server');
  });

  it('maps missing response to Network', () => {
    const err = new AxiosError('net', 'ERR_NETWORK', undefined, undefined, undefined);
    expect(toHttpError(err).kind).toBe('Network');
  });

  it('maps plain Error', () => {
    expect(toHttpError(new Error('oops')).message).toBe('oops');
  });

  it('maps unknown to Unknown', () => {
    expect(toHttpError('x').kind).toBe('Unknown');
  });
});

describe('createHttpClient', () => {
  it('returns axios instance with interceptors', () => {
    const client = createHttpClient({
      baseURL: 'http://test.local',
      tokenProvider: { getAccessToken: () => 't' } satisfies TokenProvider,
    });
    expect(typeof client.get).toBe('function');
    expect(client.interceptors?.request).toBeDefined();
  });

  it('httpGet and httpPost return data', async () => {
    const client = axios.create();
    jest.spyOn(client, 'get').mockResolvedValue({ data: { a: 1 } } as any);
    jest.spyOn(client, 'post').mockResolvedValue({ data: { b: 2 } } as any);
    await expect(httpGet<{ a: number }>(client, '/a')).resolves.toEqual({ a: 1 });
    await expect(httpPost<{ b: number }>(client, '/b', {})).resolves.toEqual({ b: 2 });
  });
});
