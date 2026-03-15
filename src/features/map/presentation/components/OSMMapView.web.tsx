/**
 * Web: Leaflet loaded via CDN (no Metro require = no "Cannot find module 'leaflet'").
 * Safe load: if Leaflet fails, show clear error. Markers: profession emoji 🔧🚛🚗 + availability color.
 * Popup "Request service" calls onRequestService (same navigation as Native).
 */
import React, { useEffect, useRef, useCallback, useState, memo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { Provider } from '../../../providers/domain/types';
import { colors } from '../../../../shared/theme/colors';
import { typography } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';
import { getMarkerColorByStatus, getServiceTypeEmoji, getAvailabilityLabel, buildProviderPopupHtml } from '../../utils/mapMarkerUtils';
import { LEAFLET_CRITICAL_CSS } from '../../leafletCriticalCss';

const LEAFLET_CDN_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const LEAFLET_CDN_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

type LeafletLib = {
  map: (el: HTMLElement, o?: object) => { setView: (lat: number[], zoom: number) => void; remove: () => void };
  tileLayer: (url: string, o?: object) => { addTo: (map: unknown) => void };
  marker: (latlng: [number, number], o?: object) => { addTo: (map: unknown) => unknown; bindPopup: (html: string, o?: object) => void; on: (e: string, fn: () => void) => void; remove?: () => void };
  divIcon: (o: { html: string; className: string; iconSize: [number, number]; iconAnchor: [number, number] }) => unknown;
  circleMarker: (latlng: [number, number], o?: object) => { addTo: (map: unknown) => void };
};

function getLeafletFromWindow(): LeafletLib | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { L?: LeafletLib };
  return w.L ?? null;
}

/** Load Leaflet via script tag (CDN) so Metro never has to resolve 'leaflet'. */
function useLeaflet(): { L: LeafletLib | null; error: string | null; loading: boolean } {
  const [L, setL] = useState<LeafletLib | null>(() => getLeafletFromWindow());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!getLeafletFromWindow());
  const loadingRef = useRef(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const existing = getLeafletFromWindow();
    if (existing) {
      setL(existing);
      setLoading(false);
      return;
    }
    if (loadingRef.current) return;
    loadingRef.current = true;

    const onLoad = () => {
      const lib = getLeafletFromWindow();
      if (lib) {
        setL(lib);
        setError(null);
      } else {
        setError('Leaflet script loaded but L not found.');
      }
      setLoading(false);
      loadingRef.current = false;
    };

    const onError = () => {
      setError('Failed to load map library.');
      setLoading(false);
      loadingRef.current = false;
    };

    if (document.querySelector('script[data-mechnow-leaflet]')) {
      if (getLeafletFromWindow()) onLoad();
      else setTimeout(onLoad, 100);
      return;
    }

    if (!document.getElementById(LEAFLET_STYLE_ID)) {
      const style = document.createElement('style');
      style.id = LEAFLET_STYLE_ID;
      style.textContent = LEAFLET_CRITICAL_CSS;
      document.head.appendChild(style);
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = LEAFLET_CDN_CSS;
    link.onerror = () => {}; // optional
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.setAttribute('data-mechnow-leaflet', '1');
    script.src = LEAFLET_CDN_JS;
    script.async = true;
    script.onload = onLoad;
    script.onerror = onError;
    document.head.appendChild(script);

    return () => {};
  }, []);

  return { L, error, loading };
}

const OSM_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const LEAFLET_STYLE_ID = 'mechnow-leaflet-inline-css';
const MAX_MARKERS = 150;
const PULSE_STYLE_ID = 'mechnow-marker-pulse';

export interface OSMMapViewProps {
  center: { latitude: number; longitude: number };
  providers: Provider[];
  userLocation: { latitude: number; longitude: number } | null;
  selectedProviderId: string | null;
  nearestProviderId?: string | null;
  /** عند الضغط على الماركر / فتح البوب آب */
  onProviderPress: (provider: Provider) => void;
  /** اختياري: عند الضغط على زر "طلب خدمة" في البوب آب — نفس سلوك Native (انتقال لـ RequestScreen) */
  onRequestService?: (provider: Provider) => void;
}

function OSMMapViewWebInner(props: OSMMapViewProps) {
  const { center, providers, userLocation, selectedProviderId, nearestProviderId, onProviderPress, onRequestService } = props;
  const { L, error: leafletError, loading: leafletLoading } = useLeaflet();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<ReturnType<LeafletLib['map']> | null>(null);
  const markersRef = useRef<unknown[]>([]);
  const onProviderPressRef = useRef(onProviderPress);
  const onRequestServiceRef = useRef(onRequestService);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [leafletReady, setLeafletReady] = useState(false);
  onProviderPressRef.current = onProviderPress;
  onRequestServiceRef.current = onRequestService;

  useEffect(() => {
    if (typeof document === 'undefined' || !L) return;
    if (!document.getElementById(LEAFLET_STYLE_ID)) {
      const style = document.createElement('style');
      style.id = LEAFLET_STYLE_ID;
      style.textContent = LEAFLET_CRITICAL_CSS;
      document.head.appendChild(style);
    }

    const el = containerRef.current;
    if (!el) return;

    setLoadError(null);
    const map = L.map(el, {
      center: [center.latitude, center.longitude],
      zoom: 14,
      zoomControl: true,
      dragging: true,
      scrollWheelZoom: true,
    });
    mapRef.current = map;
    L.tileLayer(OSM_TILES, { attribution: '© OpenStreetMap' }).addTo(map);
    setLeafletReady(true);
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
      setLeafletReady(false);
    };
  }, [L]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([center.latitude, center.longitude], 14);
  }, [center.latitude, center.longitude]);

  useEffect(() => {
    if (!L) return;
    const map = mapRef.current;
    if (!map) return;
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
      // Marker: دائرة ملوّنة حسب الحالة + Emoji للمهنة في الوسط
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
            if (cb) {
              cb(provider);
            } else {
              onProviderPressRef.current(provider);
            }
          });
        }
      });
      markersRef.current.push(marker);
    });
  }, [providers, userLocation, selectedProviderId, nearestProviderId, center.latitude, center.longitude, leafletReady]);

  const setRef = useCallback((r: unknown) => {
    containerRef.current = (r as HTMLDivElement | null) ?? null;
  }, []);

  const showError = (!L && !leafletLoading) || !!loadError || !!leafletError;
  if (showError) {
    const message =
      loadError ||
      leafletError ||
      t('map.webMapLoadFailed') ||
      'Map could not load (e.g. blocked by tracking prevention). Try disabling it for this site or use another browser.';
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{message}</Text>
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
      {(leafletLoading || !leafletReady) && (
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
