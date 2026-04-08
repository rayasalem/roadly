import { createQueryClient } from '../../../src/shared/services/query/queryClient';

describe('createQueryClient', () => {
  it('returns QueryClient with defaults', () => {
    const qc = createQueryClient();
    const qo = qc.getDefaultOptions().queries ?? {};
    const mo = qc.getDefaultOptions().mutations ?? {};
    expect(qo.retry).toBe(1);
    expect(qo.staleTime).toBe(60 * 1000);
    expect(qo.refetchOnWindowFocus).toBe(false);
    expect(mo.retry).toBe(0);
  });
});
