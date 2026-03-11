/**
 * Unit tests for haversine distance and sortByNearest.
 */
import { haversineDistanceKm, sortByNearest } from '../../../src/features/location/data/haversine';

describe('haversine', () => {
  it('returns 0 for same point', () => {
    const p = { latitude: 32.3, longitude: 35.2 };
    expect(haversineDistanceKm(p, p)).toBe(0);
  });

  it('returns positive distance for distinct points', () => {
    const a = { latitude: 32.3075, longitude: 35.168 };
    const b = { latitude: 32.31, longitude: 35.17 };
    const d = haversineDistanceKm(a, b);
    expect(d).toBeGreaterThan(0);
    expect(d).toBeLessThan(10);
  });

  it('is symmetric', () => {
    const a = { latitude: 32, longitude: 35 };
    const b = { latitude: 33, longitude: 36 };
    expect(haversineDistanceKm(a, b)).toBe(haversineDistanceKm(b, a));
  });
});

describe('sortByNearest', () => {
  const ref = { latitude: 32.3, longitude: 35.2 };

  it('sorts by distance ascending', () => {
    const items = [
      { id: 'far', location: { latitude: 33, longitude: 36 } },
      { id: 'near', location: { latitude: 32.31, longitude: 35.21 } },
      { id: 'mid', location: { latitude: 32.5, longitude: 35.5 } },
    ];
    const sorted = sortByNearest(items, (x) => x.location, ref);
    expect(sorted[0].id).toBe('near');
    expect(sorted[sorted.length - 1].id).toBe('far');
  });

  it('does not mutate original array', () => {
    const items = [
      { id: 'a', location: { latitude: 33, longitude: 36 } },
      { id: 'b', location: { latitude: 32.31, longitude: 35.21 } },
    ];
    const copy = [...items];
    sortByNearest(items, (x) => x.location, ref);
    expect(items).toEqual(copy);
  });
});
