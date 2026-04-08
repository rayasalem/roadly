/**
 * Places search (Google Places API or backend proxy).
 * Set EXPO_PUBLIC_GOOGLE_PLACES_KEY or implement backend proxy for production.
 * When no key: returns TEST_PLACES (city/village) for realistic map testing.
 */

export interface PlaceSuggestion {
  id: string;
  description: string;
  mainText: string;
  secondaryText?: string;
  latitude: number;
  longitude: number;
}

const PLACES_KEY =
  typeof process !== 'undefined' ? process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY : '';

/** Test data: city and village names with coordinates for map search when no Google key. */
const TEST_PLACES: PlaceSuggestion[] = [
  { id: 'test-bazariya', description: 'بزارية، فلسطين', mainText: 'بزارية', secondaryText: 'فلسطين', latitude: 32.3075, longitude: 35.168 },
  { id: 'test-nablus', description: 'نابلس، فلسطين', mainText: 'نابلس', secondaryText: 'فلسطين', latitude: 32.2211, longitude: 35.2544 },
  { id: 'test-ramallah', description: 'رام الله، فلسطين', mainText: 'رام الله', secondaryText: 'فلسطين', latitude: 31.9038, longitude: 35.2040 },
  { id: 'test-jenin', description: 'جنين، فلسطين', mainText: 'جنين', secondaryText: 'فلسطين', latitude: 32.4607, longitude: 35.2959 },
  { id: 'test-tulkarm', description: 'طولكرم، فلسطين', mainText: 'طولكرم', secondaryText: 'فلسطين', latitude: 32.3101, longitude: 35.0286 },
  { id: 'test-hebron', description: 'الخليل، فلسطين', mainText: 'الخليل', secondaryText: 'فلسطين', latitude: 31.5326, longitude: 35.0998 },
  { id: 'test-dubai', description: 'دبي، الإمارات', mainText: 'دبي', secondaryText: 'الإمارات', latitude: 25.2048, longitude: 55.2708 },
];

/**
 * Fetch place suggestions. When no Google key, returns TEST_PLACES filtered by query (city/village).
 * Production: use Google Places Autocomplete or backend proxy to hide key.
 */
export async function fetchPlaceSuggestions(query: string): Promise<PlaceSuggestion[]> {
  if (!query || query.trim().length < 2) return [];
  if (!PLACES_KEY) {
    const q = query.trim().toLowerCase();
    return TEST_PLACES.filter(
      (p) =>
        p.mainText.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.secondaryText && p.secondaryText.toLowerCase().includes(q)),
    );
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${PLACES_KEY}&types=establishment|geocode`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = (await res.json()) as {
      predictions?: Array<{
        place_id: string;
        description: string;
        structured_formatting?: { main_text: string; secondary_text?: string };
      }>;
    };
    const predictions = data.predictions ?? [];
    // Autocomplete does not return lat/lng; need Place Details per selection.
    // For now return descriptions only; caller can use Geocoding or Place Details on select.
    return predictions.map((p) => ({
      id: p.place_id,
      description: p.description,
      mainText: p.structured_formatting?.main_text ?? p.description,
      secondaryText: p.structured_formatting?.secondary_text,
      latitude: 0,
      longitude: 0,
    }));
  } catch {
    return [];
  }
}

/**
 * Get lat/lng for a place ID. When no Google key, resolve from TEST_PLACES by id.
 */
export async function fetchPlaceCoordinates(
  placeId: string,
): Promise<{ latitude: number; longitude: number } | null> {
  if (!placeId) return null;
  if (!PLACES_KEY) {
    const place = TEST_PLACES.find((p) => p.id === placeId);
    return place ? { latitude: place.latitude, longitude: place.longitude } : null;
  }
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=geometry&key=${PLACES_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      result?: { geometry?: { location?: { lat: number; lng: number } } };
      status?: string;
    };
    if (data.status !== 'OK' || !data.result?.geometry?.location) return null;
    const { lat, lng } = data.result.geometry.location;
    return { latitude: lat, longitude: lng };
  } catch {
    return null;
  }
}
