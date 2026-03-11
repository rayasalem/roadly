/**
 * Web: OpenStreetMap via Leaflet (free, no API key).
 * Renders OSM tiles, user location, and provider markers with popup (photo, name, rating, services).
 * Map is zoomable, draggable, and responsive. Uses shared mapMarkerUtils for colors and popup HTML.
 */
import React, { useEffect, useRef, useCallback, useState, memo } from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import type { Provider } from '../../../providers/domain/types';
import { colors } from '../../../../shared/theme/colors';
import { typography } from '../../../../shared/theme';
import { t } from '../../../../shared/i18n/t';
import { getMarkerColorByStatus, buildProviderPopupHtml } from '../../utils/mapMarkerUtils';

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const OSM_TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
/** Cap markers for performance on large provider lists */
const MAX_MARKERS = 150;

const PULSE_STYLE_ID = 'mechnow-marker-pulse';

export interface OSMMapViewProps {
  center: { latitude: number; longitude: number };
  providers: Provider[];
  userLocation: { latitude: number; longitude: number } | null;
  selectedProviderId: string | null;
  /** When set, this marker gets a pulse animation (closest provider). */
  nearestProviderId?: string | null;
  onProviderPress: (provider: Provider) => void;
}

function OSMMapViewInner({
  center,
  providers,
  userLocation,
  selectedProviderId,
  nearestProviderId,
  onProviderPress,
}: OSMMapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<{ setView: (latlng: [number, number], zoom: number) => void; remove?: () => void } | null>(null);
  const markersRef = useRef<unknown[]>([]);
  const onProviderPressRef = useRef(onProviderPress);
  const [mapReady, setMapReady] = useState(false);
  onProviderPressRef.current = onProviderPress;

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const loadScript = (src: string): Promise<void> =>
      new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Leaflet load failed'));
        document.head.appendChild(s);
      });
    const loadCss = (href: string): void => {
      if (document.querySelector(`link[href="${href}"]`)) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    };
    loadCss(LEAFLET_CSS);
    const L = (window as unknown as { L?: unknown }).L;
    if (L && typeof (L as { map: (el: HTMLElement, o?: object) => unknown }).map === 'function') {
      initMap((window as unknown as { L: { map: (el: HTMLElement, o?: object) => unknown; tileLayer: (url: string, o?: object) => { addTo: (m: unknown) => unknown }; marker: (latlng: [number, number], o?: object) => { addTo: (m: unknown) => unknown; bindPopup: (html: string, o?: object) => unknown }; latLng: (lat: number, lng: number) => unknown } }).L);
      return;
    }
    loadScript(LEAFLET_JS).then(() => {
      const L = (window as unknown as { L: { map: (el: HTMLElement, o?: object) => unknown; tileLayer: (url: string, o?: object) => { addTo: (m: unknown) => unknown }; marker: (latlng: [number, number], o?: object) => { addTo: (m: unknown) => unknown; bindPopup: (html: string, o?: object) => unknown }; latLng: (lat: number, lng: number) => unknown } }).L;
      initMap(L);
    }).catch(() => {});

    function initMap(L: { map: (el: HTMLElement, o?: object) => unknown; tileLayer: (url: string, o?: object) => { addTo: (m: unknown) => unknown }; marker: (latlng: [number, number], o?: object) => { addTo: (m: unknown) => unknown; bindPopup: (html: string, o?: object) => unknown } }) {
      const el = containerRef.current;
      if (!el) return;
      const map = L.map(el, {
      center: [center.latitude, center.longitude],
      zoom: 14,
      zoomControl: true,
      dragging: true,
      scrollWheelZoom: true,
    }) as { setView: (latlng: [number, number], zoom: number) => void; eachLayer: (fn: (l: unknown) => void) => void; remove: () => void };
      mapRef.current = map;
      L.tileLayer(OSM_TILES, { attribution: '© OpenStreetMap' }).addTo(map);
    }
    return () => {
      const map = mapRef.current as { remove?: () => void } | null;
      if (map?.remove) map.remove();
      mapRef.current = null;
      markersRef.current = [];
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([center.latitude, center.longitude], 14);
  }, [center.latitude, center.longitude]);

  useEffect(() => {
    const map = mapRef.current as { removeLayer?: (l: unknown) => void } | null;
    const L = (window as unknown as { L?: { marker: (latlng: [number, number], o?: object) => { addTo: (m: unknown) => unknown; bindPopup: (html: string, o?: object) => unknown; on: (e: string, fn: () => void) => unknown; remove?: () => void }; circleMarker: (latlng: [number, number], o?: object) => { addTo: (m: unknown) => unknown; remove?: () => void } } }).L;
    if (!map || !L) return;
    markersRef.current.forEach((m: { remove?: () => void }) => {
      if (typeof m?.remove === 'function') m.remove();
    });
    markersRef.current = [];

    const providersToShow = providers.length > MAX_MARKERS ? providers.slice(0, MAX_MARKERS) : providers;

    if (userLocation) {
      const userM = L.circleMarker([userLocation.latitude, userLocation.longitude], { radius: 8, fillColor: colors.mapUser, color: '#fff', weight: 2, fillOpacity: 1 });
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
      const isSelected = provider.id === selectedProviderId;
      const isNearestMarker = provider.id === nearestProviderId;
      const color = getMarkerColorByStatus(provider, isSelected);
      const divClass = isNearestMarker ? 'mechnow-marker-nearest' : '';
      const photoUri = provider.photo ?? provider.avatarUri ?? null;
      const safeUri = photoUri ? String(photoUri).replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;') : '';
      const innerHtml = safeUri
        ? `<img src="${safeUri}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.style.display='none'" />`
        : '';
      const markerHtml = `<div class="${divClass}" style="width:28px;height:28px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.25);overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;">${innerHtml}${!safeUri ? '👤' : ''}</div>`;
      const marker = L.marker(latlng, {
        icon: (L as unknown as { divIcon: (o: object) => unknown }).divIcon
          ? (L as unknown as { divIcon: (o: { html: string; className: string; iconSize: [number, number]; iconAnchor: [number, number] }) => unknown }).divIcon({
              html: markerHtml,
              className: '',
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            })
          : undefined,
      });
      const popupHtml = buildProviderPopupHtml(provider, t('map.requestService'));
      const m = marker.addTo(map);
      m.bindPopup(popupHtml, { maxWidth: 320 });
      m.on('popupopen', () => {
        const btn = document.querySelector(`[data-provider-id="${provider.id}"]`);
        if (btn && !(btn as HTMLElement).dataset.bound) {
          (btn as HTMLElement).dataset.bound = '1';
          btn.addEventListener('click', () => onProviderPressRef.current(provider));
        }
      });
      markersRef.current.push(marker);
    });
  }, [providers, userLocation, selectedProviderId, nearestProviderId, center.latitude, center.longitude]);

  const setRef = useCallback((r: unknown) => {
    containerRef.current = (r as HTMLDivElement | null) ?? null;
  }, []);

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.fallback}>OpenStreetMap is available on web only.</Text>
      </View>
    );
  }

  return <View style={styles.container} ref={setRef as (r: View | null) => void} collapsable={false} />;
}

/** Stable props compare: re-render only when center or provider list identity/length changes. */
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

export const OSMMapView = memo(OSMMapViewInner, arePropsEqual);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    minHeight: 320,
  },
  fallback: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
