import { savedAuthStorage } from '../../../src/shared/services/savedAuthStorage';

describe('savedAuthStorage', () => {
  beforeEach(() => {
    try {
      window.localStorage?.clear();
    } catch {
      /* no window */
    }
  });

  it('get/set last login email trims', () => {
    savedAuthStorage.setLastLoginEmail('  a@b.com  ');
    expect(savedAuthStorage.getLastLoginEmail()).toBe('a@b.com');
  });

  it('empty email does not overwrite stored value', () => {
    savedAuthStorage.setLastLoginEmail('keep@x.com');
    savedAuthStorage.setLastLoginEmail('   ');
    expect(savedAuthStorage.getLastLoginEmail()).toBe('keep@x.com');
  });

  it('get/set last register', () => {
    savedAuthStorage.setLastRegister({ name: 'N', email: 'e@e.com' });
    expect(savedAuthStorage.getLastRegister()).toEqual({ name: 'N', email: 'e@e.com' });
  });
});
