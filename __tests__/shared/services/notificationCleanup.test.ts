jest.mock('../../../src/shared/services/http/api', () => ({
  api: { post: jest.fn(() => Promise.resolve()) },
}));

jest.mock('../../../src/shared/services/auth/tokenStore', () => ({
  tokenStore: {
    getAccessToken: jest.fn(),
  },
}));

import { api } from '../../../src/shared/services/http/api';
import { tokenStore } from '../../../src/shared/services/auth/tokenStore';
import { cleanupNotifications } from '../../../src/shared/services/notifications/notificationCleanup';

describe('cleanupNotifications', () => {
  it('no-op when no access token', async () => {
    (tokenStore.getAccessToken as jest.Mock).mockReturnValue(null);
    await cleanupNotifications();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('calls unregister when token present', async () => {
    (tokenStore.getAccessToken as jest.Mock).mockReturnValue('tok');
    await cleanupNotifications();
    expect(api.post).toHaveBeenCalledWith('/notifications/unregister', {});
  });

  it('swallows post errors', async () => {
    (tokenStore.getAccessToken as jest.Mock).mockReturnValue('tok');
    (api.post as jest.Mock).mockRejectedValueOnce(new Error('x'));
    await expect(cleanupNotifications()).resolves.toBeUndefined();
  });
});
