import { httpEvents } from '../../../src/shared/services/http/httpEvents';

describe('httpEvents', () => {
  it('notifies subscribers on emit', () => {
    const fn = jest.fn();
    const off = httpEvents.on('httpError', fn);
    httpEvents.emit('httpError', { kind: 'Unknown', message: 'x' });
    expect(fn).toHaveBeenCalledWith({ kind: 'Unknown', message: 'x' });
    off();
    httpEvents.emit('httpError', { kind: 'Unknown', message: 'y' });
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
