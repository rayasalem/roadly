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
  return colors.mapMechanic;
}

/** Marker color by status: available (role color), busy (orange), offline (gray). */
export function getMarkerColorByStatus(provider: Provider, selected?: boolean): string {
  if (selected) return colors.primary;
  if (!provider.isAvailable) return colors.textMuted;
  if (provider.displayStatus === 'busy') return colors.warning;
  return getMarkerColorByRole(provider);
}

/** Escape for safe HTML in popup. */
function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Build Leaflet popup HTML: photo, name, rating, services, Request Service button. */
export function buildProviderPopupHtml(provider: Provider, requestButtonLabel: string = 'Request service'): string {
  const name = esc(provider.name || '');
  const phone = esc(String(provider.phone || provider.contact || ''));
  const rating = Math.min(5, Math.max(0, provider.rating ?? 0));
  const ratingText = `${rating.toFixed(1)} ★`;
  const services = Array.isArray(provider.services) ? provider.services.slice(0, 5) : [];
  const servicesText = services.length ? services.map((s) => esc(String(s))).join(', ') : '—';
  const photoUri = provider.photo ?? provider.avatarUri ?? null;
  const imgHtml = photoUri
    ? `<img src="${esc(String(photoUri))}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:8px;margin-right:8px;" />`
    : '<div style="width:48px;height:48px;background:#e5e7eb;border-radius:8px;margin-right:8px;display:flex;align-items:center;justify-content:center;color:#9ca3af;">👤</div>';
  const btnLabel = esc(requestButtonLabel);
  return `
    <div style="min-width:200px;font-family:system-ui,sans-serif;">
      <div style="display:flex;align-items:flex-start;margin-bottom:8px;">
        ${imgHtml}
        <div style="flex:1;min-width:0;">
          <strong style="display:block;font-size:14px;margin-bottom:2px;">${name}</strong>
          ${phone ? `<div style="font-size:12px;color:#6b7280;">${phone}</div>` : ''}
          <div style="font-size:12px;color:#f59e0b;margin-top:2px;">${ratingText}</div>
          <div style="font-size:11px;color:#6b7280;margin-top:4px;">${servicesText}</div>
        </div>
      </div>
      <button type="button" data-provider-id="${esc(provider.id)}" style="width:100%;padding:8px 12px;background:#22C55E;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;">${btnLabel}</button>
    </div>
  `;
}
