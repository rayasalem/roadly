/**
 * Shared map marker utilities: marker color by status/role, popup HTML for web.
 * Used by ProviderMarker (native) and OSMMapView (web).
 */
import type { Provider } from '../../providers/domain/types';
import { colors } from '../../../shared/theme/colors';

/** Marker color by provider role (mechanic / tow / rental). */
export function getMarkerColorByRole(provider: Provider): string {
  if (provider.role === 'mechanic_tow') return colors.mapTow;
  if (provider.role === 'car_rental') return colors.mapRental;
  if (provider.role === 'insurance') return colors.mapInsurance;
  return colors.mapMechanic;
}

/** Marker color by status: available (role color), busy (orange), offline (gray, caller should hide). */
export function getMarkerColorByStatus(provider: Provider, selected?: boolean): string {
  if (selected) return colors.primary;
  if (provider.displayStatus === 'offline' || !provider.isAvailable) return colors.textMuted;
  if (provider.displayStatus === 'busy') return colors.warning;
  return getMarkerColorByRole(provider);
}

/** Service type icon for map markers: Mechanic 🔧, Tow 🚛, Car Rental 🚗. */
export function getServiceTypeEmoji(provider: Provider): string {
  if (provider.role === 'mechanic_tow') return '🚛';
  if (provider.role === 'car_rental') return '🚗';
  if (provider.role === 'insurance') return '🛡️';
  return '🔧';
}

/** MaterialCommunityIcons name for service type: mechanic, tow, car rental. */
export function getServiceTypeIconName(provider: Provider): 'wrench' | 'tow-truck' | 'car-side' | 'shield-check' {
  if (provider.role === 'mechanic_tow') return 'tow-truck';
  if (provider.role === 'car_rental') return 'car-side';
  if (provider.role === 'insurance') return 'shield-check';
  return 'wrench';
}

/** Escape for safe HTML in popup. */
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Availability label for popup/callout (raw text for HTML). */
export function getAvailabilityLabel(provider: Provider): { text: string; color: string } {
  if (provider.displayStatus === 'offline' || provider.isAvailable === false)
    return { text: 'Unavailable', color: '#9ca3af' };
  if (provider.displayStatus === 'busy') return { text: 'Busy', color: '#f59e0b' };
  return { text: 'Available', color: '#22c55e' };
}

/** i18n key for availability (for use with t() in components). */
export function getAvailabilityStatusKey(provider: Provider): 'map.status.available' | 'map.status.busy' | 'map.status.offline' {
  if (provider.displayStatus === 'offline' || provider.isAvailable === false) return 'map.status.offline';
  if (provider.displayStatus === 'busy') return 'map.status.busy';
  return 'map.status.available';
}

/** Build Leaflet popup HTML: name, service type, availability, rating, Request Service button. */
export function buildProviderPopupHtml(provider: Provider, requestButtonLabel: string = 'Request service'): string {
  const name = esc(provider.name || '');
  const phone = esc(String(provider.phone || provider.contact || ''));
  const rating = Math.min(5, Math.max(0, provider.rating ?? 0));
  const ratingText = `${rating.toFixed(1)} ★`;
  const services = Array.isArray(provider.services) ? provider.services.slice(0, 5) : [];
  const servicesText = services.length ? services.map((s) => esc(String(s))).join(', ') : '—';
  const serviceEmoji = getServiceTypeEmoji(provider);
  const serviceName =
    provider.role === 'mechanic_tow'
      ? 'ونش'
      : provider.role === 'car_rental'
        ? 'تأجير'
        : provider.role === 'insurance'
          ? 'تأمين'
          : 'ميكانيكي';
  const avail = getAvailabilityLabel(provider);
  const photoUri = provider.photo ?? provider.avatarUri ?? null;
  const imgHtml = photoUri
    ? `<img src="${esc(String(photoUri))}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:8px;margin-right:8px;" />`
    : '<div style="width:48px;height:48px;background:#e5e7eb;border-radius:8px;margin-right:8px;display:flex;align-items:center;justify-content:center;color:#9ca3af;">👤</div>';
  const btnLabel = esc(requestButtonLabel);
  return `
    <div style="min-width:220px;font-family:system-ui,sans-serif;">
      <div style="display:flex;align-items:flex-start;margin-bottom:8px;">
        ${imgHtml}
        <div style="flex:1;min-width:0;">
          <strong style="display:block;font-size:15px;margin-bottom:2px;">${name}</strong>
          <div style="font-size:13px;color:#6b7280;">${serviceEmoji} ${serviceName}</div>
          <div style="font-size:12px;margin-top:4px;font-weight:600;color:${avail.color};">${esc(avail.text)}</div>
          ${phone ? `<div style="font-size:12px;color:#6b7280;">${phone}</div>` : ''}
          <div style="font-size:12px;color:#f59e0b;margin-top:2px;">${ratingText}</div>
          <div style="font-size:11px;color:#6b7280;margin-top:4px;">${servicesText}</div>
        </div>
      </div>
      <button type="button" data-provider-id="${esc(provider.id)}" style="width:100%;padding:10px 14px;background:#22C55E;color:#fff;border:none;border-radius:10px;cursor:pointer;font-size:14px;font-weight:600;">${btnLabel}</button>
    </div>
  `;
}
