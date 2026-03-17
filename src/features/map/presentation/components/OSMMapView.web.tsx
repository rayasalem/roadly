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

declare global {
  interface Window {
    L?: {
      map: (el: HTMLElement, o: { center: [number, number]; zoom: number; zoomControl?: boolean; dragging?: boolean; scrollWheelZoom?: boolean }) => { setView: (c: [number, number], z: number) => void; remove: () => void };
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
  const mapRef = useRef<ReturnType<LType['map']> | null>(null);
  const markersRef = useRef<unknown[]>([]);
  const onProviderPressRef = useRef(onProviderPress);
  const onRequestServiceRef = useRef(onRequestService);
  const [loadError, setLoadError] = useState<string | null>(null);

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
    L!.tileLayer(OSM_TILES, { attribution: '© OpenStreetMap' }).addTo(map);
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
    };
  }, [L, leafletReady]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView([center.latitude, center.longitude], 14);
  }, [center.latitude, center.longitude]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !L) return;
    markersRef.current.forEach((m: { remove?: () => void }) => {
      if (typeof m?.remove === 'function') m.remove();
    });
    markersRef.current = [];

    const providersToShow = providers.length > MAX_MARKERS ? providers.slice(0, MAX_MARKERS) : providers;

    if (userLocation) {
      const userM = L.circleMarker([userLocation.latitude, userLocation.longitude], {
        radius: 8,
        fillColor: colors.mapUser,
        color: '#fff',
        weight: 2,
        fillOpacity: 1,
      });
      userM.addTo(map);
      markersRef.current.push(userM);
    }

    if (typeof document !== 'undefined' && !document.getElementById(PULSE_STYLE_ID)) {
      const style = document.createElement('style');
      style.id = PULSE_STYLE_ID;
      style.textContent = `@keyframes mechnow-pulse{0%,100%{transform:scale(1);box-shadow:0 1px 4px rgba(0,0,0,0.25)}50%{transform:scale(1.2);box-shadow:0 0 0 8px rgba(34,197,94,0.3)}}.mechnow-marker-nearest{animation:mechnow-pulse 1.8s ease-in-out infinite}`;
      document.head.appendChild(style);
    }

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
      const marker = L.marker(latlng, {
        icon: L.divIcon({
          html: markerHtml,
          className: '',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        }),
      });
      const popupHtml = buildProviderPopupHtml(provider, t('map.requestService'));
      const m = marker.addTo(map);
      m.bindPopup(popupHtml, { maxWidth: 320 });
      m.on('popupopen', () => {
        const btn = document.querySelector(`[data-provider-id="${provider.id}"]`);
        if (btn && !(btn as HTMLElement).dataset.bound) {
          (btn as HTMLElement).dataset.bound = '1';
          btn.addEventListener('click', () => {
            const cb = onRequestServiceRef.current;
            if (cb) cb(provider);
            else onProviderPressRef.current(provider);
          });
        }
      });
      markersRef.current.push(marker);
    });
  }, [L, leafletReady, providers, userLocation, selectedProviderId, nearestProviderId, center.latitude, center.longitude]);

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
