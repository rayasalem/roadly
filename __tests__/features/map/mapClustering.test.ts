/**
 * Unit tests for map clustering. Native: cluster only when count > threshold.
 */
import { clusterProviders, CLUSTER_THRESHOLD_DEFAULT } from '../../../src/features/map/utils/mapClustering';

const mkProvider = (id: string, lat: number, lng: number) => ({
  id,
  name: `Provider ${id}`,
  role: 'mechanic' as const,
  location: { latitude: lat, longitude: lng, lastUpdated: new Date().toISOString() },
  isAvailable: true,
});

describe('clusterProviders', () => {
  it('returns empty array for empty input', () => {
    expect(clusterProviders([])).toEqual([]);
  });

  it('returns one provider as single marker when count <= threshold', () => {
    const one = [mkProvider('1', 32.3, 35.2)];
    const result = clusterProviders(one, 20);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('provider');
    expect((result[0] as { provider: { id: string } }).provider.id).toBe('1');
  });

  it('returns all as individual markers when count equals threshold', () => {
    const many = Array.from({ length: CLUSTER_THRESHOLD_DEFAULT }, (_, i) =>
      mkProvider(`p${i}`, 32.3 + i * 0.01, 35.2)
    );
    const result = clusterProviders(many, CLUSTER_THRESHOLD_DEFAULT);
    expect(result).toHaveLength(CLUSTER_THRESHOLD_DEFAULT);
    result.forEach((item) => expect(item.type).toBe('provider'));
  });

  it('clusters when count exceeds threshold', () => {
    const many = Array.from({ length: 25 }, (_, i) =>
      mkProvider(`p${i}`, 32.3 + (i % 5) * 0.001, 35.2 + Math.floor(i / 5) * 0.001)
    );
    const result = clusterProviders(many, 20);
    expect(result.length).toBeLessThan(25);
    const clusters = result.filter((r) => r.type === 'cluster');
    expect(clusters.length).toBeGreaterThan(0);
    clusters.forEach((c) => {
      expect(c.type).toBe('cluster');
      if (c.type === 'cluster') expect(c.count).toBeGreaterThan(1);
    });
  });

  it('filters out providers without valid location', () => {
    const withInvalid = [
      mkProvider('1', 32.3, 35.2),
      { id: '2', name: 'No location', role: 'mechanic' as const, location: null, isAvailable: true },
    ] as Parameters<typeof clusterProviders>[0];
    const result = clusterProviders(withInvalid);
    expect(result).toHaveLength(1);
  });
});
