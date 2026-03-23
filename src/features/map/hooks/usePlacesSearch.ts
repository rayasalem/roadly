/**
 * Place search for map (Google Places). Connect search input to this hook.
 * API calls live in data/placesApi; query is debounced (350ms) to reduce requests.
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPlaceSuggestions, fetchPlaceCoordinates } from '../data/placesApi';
import type { PlaceSuggestion } from '../data/placesApi';

const QUERY_KEY = ['places', 'search'] as const;
const DEBOUNCE_MS = 350;

export function usePlacesSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<{
    latitude: number;
    longitude: number;
    description: string;
  } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
      debounceRef.current = null;
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: [...QUERY_KEY, debouncedQuery],
    queryFn: () => fetchPlaceSuggestions(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    retry: 2,
    retryDelay: 800,
  });

  const selectPlace = useCallback(async (suggestion: PlaceSuggestion) => {
    try {
      setQuery(suggestion.description);
      const coords = await fetchPlaceCoordinates(suggestion.id);
      if (coords && Number.isFinite(coords.latitude) && Number.isFinite(coords.longitude)) {
        setSelectedPlace({
          ...coords,
          description: suggestion.description,
        });
      }
    } catch {
      // Swallow to avoid breaking the map; keep previous selection.
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPlace(null);
  }, []);

  return {
    query,
    setQuery,
    suggestions,
    isLoading,
    selectPlace,
    selectedPlace,
    clearSelection,
  };
}
