/**
 * Web: Leaflet loaded from same-origin (public/leaflet.js, public/leaflet.css).
 * No CDN, no Metro resolution. Markers: emoji + availability color. Popup "Request service" → onRequestService.
 */
import React, { useEffect, useRef, useCallback, useState, memo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { Provider } from '../../../providers/domain/types';
import { colors } from '../../../../shared/theme/colors';
import { typography } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';
import { getMarkerColorByStatus, getServiceTypeEmoji, getAvailabilityLabel, buildProviderPopupHtml } from '../../utils/mapMarkerUtils';
import { LEAFLET_CRITICAL_CSS } from '../../leafletCriticalCss';

/** Minimal Leaflet map instance used by this screen (zoom + events). */
export type LeafletMapInstance = {
  setView: (c: [number, number], z: number) => void;
  remove: () => void;
  getZoom?: () => number;
  on: (e: string, fn: () => void) => void;
  off?: (e: string, fn: () => void) => void;
};

declare global {
  interface Window {
    L?: {
      map: (
        el: HTMLElement,
        o: { center: [number, number]; zoom: number; zoomControl?: boolean; dragging?: boolean; scrollWheelZoom?: boolean }
      ) => LeafletMapInstance;
      tileLayer: (url: string, o: { attribution?: string }) => { addTo: (m: unknown) => unknown };
      circleMarker: (latlng: [number, number], o: Record<string, unknown>) => { addTo: (m: unknown) => unknown };
      marker: (latlng: [number, number], o: { icon: unknown }) => { addTo: (m: unknown) => unknown; bindPopup: (html: string, o?: { maxWidth?: number }) => void; on: (e: string, cb: () => void) => void };
      divIcon: (o: { html: string; className: string; iconSize: [number, number]; iconAnchor: [number, number] }) => unknown;
    };
  }
}

const LEAFLET_JS = '/leaflet.js';
const LEAFLET_CSS = '/leaflet.css';
const OSM_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const LEAFLET_STYLE_ID = 'mechnow-leaflet-inline-css';
const MAX_MARKERS = 150;
const PULSE_STYLE_ID = 'mechnow-marker-pulse';

function useLeafletSameOrigin(): { L: typeof window.L; error: string | null; ready: boolean } {
  const [L, setL] = useState<typeof window.L>(typeof window !== 'undefined' ? window.L : undefined);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (window.L) {
      setL(window.L);
      setReady(true);
      return;
    }
    if (!document.querySelector(`script[src=\"${LEAFLET_JS}\"]`)) {
      const style = document.createElement('style');
      style.id = LEAFLET_STYLE_ID;
      style.textContent = LEAFLET_CRITICAL_CSS;
      document.head.appendChild(style);

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = LEAFLET_JS;
      script.async = false;
      script.onerror = () => setError('Leaflet failed to load');
      script.onload = () => {
        if (window.L) {
          setL(window.L);
          setReady(true);
        } else setError('Leaflet not on window');
      };
      document.head.appendChild(script);
    } else {
      const check = setInterval(() => {
        if (window.L) {
          setL(window.L);
          setReady(true);
          clearInterval(check);
        }
      }, 50);
      return () => clearInterval(check);
    }
  }, []);

  return { L: L ?? undefined, error, ready };
}

export interface OSMMapViewProps {
  center: { latitude: number; longitude: number };
  providers: Provider[];
  userLocation: { latitude: number; longitude: number } | null;
  selectedProviderId: string | null;
  nearestProviderId?: string | null;
  onProviderPress: (provider: Provider) => void;
  onRequestService?: (provider: Provider) => void;
}

function OSMMapViewWebInner(props: OSMMapViewProps) {
  const { center, providers, userLocation, selectedProviderId, nearestProviderId, onProviderPress, onRequestService } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMapInstance | null>(null);
  const markersByProviderIdRef = useRef<Record<string, unknown>>({});
  const userMarkerRef = useRef<unknown | null>(null);
  const circleUserMarkerRef = useRef<unknown | null>(null);
  const providersByIdRef = useRef<Record<string, Provider>>({});
  const onProviderPressRef = useRef(onProviderPress);
  const onRequestServiceRef = useRef(onRequestService);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [leafletZoom, setLeafletZoom] = useState<number>(14);

  const { L, error: leafletError, ready: leafletReady } = useLeafletSameOrigin();

  onProviderPressRef.current = onProviderPress;
  onRequestServiceRef.current = onRequestService;

  useEffect(() => {
    if (leafletError) {
      setLoadError(leafletError);
      return;
    }
    setLoadError(null);
  }, [leafletError]);

  useEffect(() => {
    if (typeof document === 'undefined' || !L) return;

    const el = containerRef.current;
    if (!el || !leafletReady) return;

    setLoadError(null);
    const map = L!.map(el, {
      center: [center.latitude, center.longitude],
      zoom: 14,
      zoomControl: true,
      dragging: true,
      scrollWheelZoom: true,
    });
    mapRef.current = map;
    setLeafletZoom(typeof map.getZoom === 'function' ? map.getZoom() : 14);
    L!.tileLayer(OSM_TILES, { attribution: '© OpenStreetMap' }).addTo(map);
    const onZoomEnd = () => {
      try {
        if (typeof map.getZoom === 'function') setLeafletZoom(map.getZoom());
      } catch {
        // ignore
      }
    };
    map.on('zoomend', onZoomEnd);
    return () => {
      map.remove();
      mapRef.current = null;
      markersByProviderIdRef.current = {};
      circleUserMarkerRef.current = null;
      userMarkerRef.current = null;
      providersByIdRef.current = {};
      try {
        map.off?.('zoomend', onZoomEnd);
      } catch {
        // ignore
      }
    };
  }, [L, leafletReady]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView([center.latitude, center.longitude], 14);
  }, [center.latitude, center.longitude]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !L) return;
    // "Smart clustering" without extra leaflet plugins:
    // when providers are dense, we pick representative providers per geo grid cell
    // (still keeping marker selection consistent via provider ids).
    const scoreProvider = (p: Provider): number => {
      if (p.id === selectedProviderId) return 1000;
      if (p.id === nearestProviderId) return 900;
      if (p.displayStatus === 'offline' || !p.isAvailable) return 10;
      if (p.displayStatus === 'busy') return 600;
      if (p.displayStatus === 'on_the_way') return 700;
      return 800;
    };

    const computeClusterRepresentatives = (all: Provider[]): Provider[] => {
      const zoom = leafletZoom;
      const zoomDelta = zoom - 14;
      // Smaller cells on higher zoom.
      const rawStep = 0.02 / Math.pow(2, zoomDelta);
      const step = Math.max(0.003, Math.min(0.06, rawStep));
      const stepLng = step;

      const byCell: Record<string, Provider> = {};
      for (const p of all) {
        const loc = p.location;
        if (!loc || typeof loc.latitude !== 'number' || typeof loc.longitude !== 'number') continue;
        const key = `${Math.floor(loc.latitude / step)}_${Math.floor(loc.longitude / stepLng)}`;
        const prev = byCell[key];
        if (!prev) {
          byCell[key] = p;
          continue;
        }
        // Keep the most relevant provider per cell.
        if (scoreProvider(p) > scoreProvider(prev)) byCell[key] = p;
      }
      const reps = Object.values(byCell);
      reps.sort((a, b) => scoreProvider(b) - scoreProvider(a));
      return reps.slice(0, MAX_MARKERS);
    };

    const providersToShow = providers.length > MAX_MARKERS ? computeClusterRepresentatives(providers) : providers;
    const nextProviderIds: Record<string, true> = {};

    // Maintain latest providers by id for popup button click handlers.
    const nextProvidersById: Record<string, Provider> = {};
    providersToShow.forEach((p) => {
      nextProvidersById[p.id] = p;
      nextProviderIds[p.id] = true;
    });
    providersByIdRef.current = nextProvidersById;

    if (typeof document !== 'undefined' && !document.getElementById(PULSE_STYLE_ID)) {
      const style = document.createElement('style');
      style.id = PULSE_STYLE_ID;
      style.textContent = `@keyframes mechnow-pulse{0%,100%{transform:scale(1);box-shadow:0 1px 4px rgba(0,0,0,0.25)}50%{transform:scale(1.2);box-shadow:0 0 0 8px rgba(34,197,94,0.3)}}.mechnow-marker-nearest{animation:mechnow-pulse 1.8s ease-in-out infinite}`;
      document.head.appendChild(style);
    }

    // Update user marker (circleMarker) without recreating all providers.
    if (userLocation) {
      const lat = userLocation.latitude;
      const lng = userLocation.longitude;
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        if (circleUserMarkerRef.current) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (circleUserMarkerRef.current as any).setLatLng?.([lat, lng]);
        } else {
          const userM = L.circleMarker([lat, lng], {
            radius: 8,
            fillColor: colors.mapUser,
            color: '#fff',
            weight: 2,
            fillOpacity: 1,
          });
          userM.addTo(map);
          circleUserMarkerRef.current = userM;
        }
      }
    } else if (circleUserMarkerRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (circleUserMarkerRef.current as any).remove?.();
      circleUserMarkerRef.current = null;
    }

    // Remove markers that are no longer in view.
    const existingIds = Object.keys(markersByProviderIdRef.current);
    existingIds.forEach((id) => {
      if (!nextProviderIds[id]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (markersByProviderIdRef.current[id] as any)?.remove?.();
        delete markersByProviderIdRef.current[id];
      }
    });

    providersToShow.forEach((provider) => {
      const loc = provider.location;
      if (!loc || typeof loc.latitude !== 'number' || typeof loc.longitude !== 'number') return;
      const latlng: [number, number] = [loc.latitude, loc.longitude];
      const isNearestMarker = provider.id === nearestProviderId;
      const color = getMarkerColorByStatus(provider, provider.id === selectedProviderId);
      const divClass = isNearestMarker ? 'mechnow-marker-nearest' : '';
      const emoji = getServiceTypeEmoji(provider);
      const avail = getAvailabilityLabel(provider);
      const markerHtml = `<div class="${divClass}" title="${emoji} ${avail.text}" style="width:40px;height:40px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:20px;line-height:1;">${emoji}</div>`;

      const popupHtml = buildProviderPopupHtml(provider, t('map.requestService'));

      const existing = markersByProviderIdRef.current[provider.id];
      if (existing) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (existing as any).setLatLng?.(latlng);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (existing as any).setIcon?.(
          L.divIcon({
            html: markerHtml,
            className: '',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          })
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const popup = (existing as any).getPopup?.();
        if (popup?.setContent) popup.setContent(popupHtml);
        return;
      }

      const marker = L.marker(latlng, {
        icon: L.divIcon({
          html: markerHtml,
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        }),
      });

      marker.addTo(map);
      marker.bindPopup(popupHtml, { maxWidth: 320 });
      marker.on('popupopen', () => {
        // Bind popup button click only when popup opens.
        const btn = document.querySelector(`[data-provider-id="${provider.id}"]`) as HTMLElement | null;
        if (!btn) return;
        if (btn.dataset.bound === '1') return;
        btn.dataset.bound = '1';
        btn.addEventListener('click', () => {
          const providerId = btn.dataset.providerId || provider.id;
          const currentProvider = providersByIdRef.current[providerId];
          const cb = onRequestServiceRef.current;
          if (currentProvider) {
            if (cb) cb(currentProvider);
            else onProviderPressRef.current(currentProvider);
          }
        });
      });

      markersByProviderIdRef.current[provider.id] = marker;
    });
  }, [L, leafletReady, providers, userLocation, selectedProviderId, nearestProviderId, leafletZoom]);

  const setRef = useCallback((r: unknown) => {
    containerRef.current = (r as HTMLDivElement | null) ?? null;
  }, []);

  if (loadError) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{loadError}</Text>
        {typeof window !== 'undefined' && (
          <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()} activeOpacity={0.8}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.containerWeb]}>
      <View style={StyleSheet.absoluteFill} ref={setRef as (r: View | null) => void} collapsable={false} />
      {!leafletReady && !loadError && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <Text style={styles.loadingText}>{t('map.mapLoading')}</Text>
        </View>
      )}
    </View>
  );
}

function arePropsEqual(prev: OSMMapViewProps, next: OSMMapViewProps): boolean {
  if (prev.providers.length !== next.providers.length) return false;
  if (prev.center.latitude !== next.center.latitude || prev.center.longitude !== next.center.longitude) return false;
  if ((prev.userLocation == null) !== (next.userLocation == null)) return false;
  if (prev.userLocation && next.userLocation &&
      (prev.userLocation.latitude !== next.userLocation.latitude || prev.userLocation.longitude !== next.userLocation.longitude)) return false;
  if (prev.selectedProviderId !== next.selectedProviderId) return false;
  if (prev.nearestProviderId !== next.nearestProviderId) return false;
  const prevIds = prev.providers.map((p) => p.id).join(',');
  const nextIds = next.providers.map((p) => p.id).join(',');
  return prevIds === nextIds;
}

export const OSMMapView = memo(OSMMapViewWebInner, arePropsEqual);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    minHeight: 320,
  },
  containerWeb: { height: '100%' as const, minHeight: 280 },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.surface,
  },
  errorText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  retryButtonText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 15,
    color: colors.primaryContrast,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  loadingText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
