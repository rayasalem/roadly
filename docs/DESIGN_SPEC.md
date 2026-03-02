# Roadly — World-Class Product Design Spec

**Senior Product Designer perspective.**  
Location-based service app: nearest mechanic, tow truck, car rental.  
Design target: **Global production quality** (Uber, Careem, Airbnb tier).

---

## Part 1 — Research & rationale

### 1.1 Modern mobile design trends (2024–2025)

- **Map-first home** — The home screen is the map. Search/address and list live in sheets or overlays so the map stays the hero. (Uber, Careem, Google Maps.)
- **Single primary action** — One clear CTA per context (e.g. “Request mechanic”) to reduce cognitive load and increase conversion.
- **Bottom sheets as primary UI** — Lists, filters, and detail use sheets with drag handles and breakpoints (peek / half / full), not full-screen modals for secondary content.
- **Generous whitespace** — 16–24px horizontal padding, clear section spacing. Clutter is the enemy of trust and conversion.
- **Strong type hierarchy** — One dominant title (24–28px, semibold), clear body (16px), supporting captions (12–14px). No more than 3 levels per layout.
- **Minimal color** — One primary brand color + neutrals; accent only for critical actions (e.g. “Request”, “On the way”). Semantic colors (success, error) used sparingly.
- **System-native feel** — Respect platform (iOS/Android) for navigation, gestures, and controls so the app feels native and fast.
- **Skeleton > spinners** — For lists and cards, skeleton loading is preferred over full-screen spinners to keep context and reduce perceived wait.

### 1.2 Marketplace & on-demand apps (reference)

| Pattern | Uber / Careem | Airbnb | Applied to Roadly |
|--------|----------------|--------|--------------------|
| Home | Map-first, destination bar, FAB/CTA | Search-first, then map/list | **Map-first**; “Where to?” replaced by “Find mechanic / tow / rental” and filters. |
| List vs map | Bottom sheet list; tap to focus map | Toggle map/list; cards on map | **Sheet list** of nearby providers; tap card → focus marker + expand detail in same sheet. |
| Primary CTA | “Request” / “Book” — one color, one place | “Reserve” — sticky bottom | **Single CTA** per context: “Request mechanic” from sheet or detail. |
| Detail | Bottom sheet or slide-over | Full-screen listing | **Provider detail in sheet** (not full screen) to keep map context. |
| Trust | ETA, driver photo, rating | Host photo, reviews, policy | **ETA, distance, provider name, availability**; rating later. |
| Empty / loading | Skeleton, empty state with illustration | Same | **Skeleton cards** for list; clear empty state copy and illustration. |

### 1.3 Map-based UX patterns

- **User location** — One tap to center; persistent “my location” control. User dot is always visible when permission granted.
- **Provider markers** — Distinct by type (mechanic / tow / rental); clustering when zoomed out to avoid clutter.
- **Tap marker** — Does not open full screen: show callout or expand bottom sheet to “peek” with provider summary and “Request” CTA.
- **Sheet breakpoints** — Peek (~120–160px) shows “Nearest” list; half (~50%) shows list + selected; full for detail or request flow. Drag handle always visible.
- **FAB or sticky CTA** — One main action (e.g. “Find mechanic”) that opens filters or sheet; secondary actions (e.g. filter by type) in sheet or top bar.

---

## Part 2 — Design system

### 2.1 Color

**Principle:** One primary, strict neutrals, minimal accent. No decorative color.

#### Primary & secondary

| Token | Hex | Usage |
|-------|-----|--------|
| **Primary** | `#0066CC` | Main CTA, links, selected state, brand. Trust, familiarity (global blue). |
| **Primary dark** | `#0052A3` | Pressed state, hover. |
| **Primary contrast** | `#FFFFFF` | Text/icon on primary. |
| **Secondary** | `#6B7280` | Secondary buttons, captions, supporting text. Not for primary CTAs. |

#### Neutral palette

| Token | Hex | Usage |
|-------|-----|--------|
| **Background** | `#F9FAFB` | App background (off-white to reduce glare). |
| **Surface** | `#FFFFFF` | Cards, sheets, inputs. |
| **Surface elevated** | `#FFFFFF` | Same, with shadow for elevation. |
| **Text primary** | `#111827` | Headlines, body. |
| **Text secondary** | `#6B7280` | Labels, metadata. |
| **Text muted** | `#9CA3AF` | Placeholders, hints, disabled. |
| **Border** | `#E5E7EB` | Dividers, input borders. |
| **Border focus** | `#0066CC` | Focus ring (inputs, buttons). |

#### Semantic (use sparingly)

| Token | Hex | Usage |
|-------|-----|--------|
| **Success** | `#059669` | Success state, “Available”, “On the way”. |
| **Success light** | `#D1FAE5` | Success background. |
| **Error** | `#DC2626` | Errors, destructive. |
| **Error light** | `#FEE2E2` | Error background. |
| **Warning** | `#D97706` | Warnings. |
| **Warning light** | `#FEF3C7` | Warning background. |

#### Map & role (markers, chips)

| Token | Hex | Usage |
|-------|-----|--------|
| **Map user** | `#0066CC` | User location dot. |
| **Map mechanic** | `#0891B2` | Mechanic marker. |
| **Map tow** | `#EA580C` | Tow truck marker (high visibility). |
| **Map rental** | `#7C3AED` | Car rental marker. |

**Design decisions:**  
- **#0066CC** is a standard “trust blue” used in global products; works in light mode and on maps.  
- **Single primary** for both brand and main CTA keeps the UI calm and conversion-focused.  
- **Neutrals** are a consistent gray scale (Tailwind-style) for hierarchy without extra color.  
- **Map colors** are distinct for quick scanning; tow is amber for urgency.

---

### 2.2 Typography

**Principle:** Clear hierarchy. Three levels per screen max. System fonts (SF Pro / Roboto) for performance and native feel.

| Scale | Size (px) | Weight | Line height | Usage |
|-------|-----------|--------|-------------|--------|
| **Display** | 28 | Semibold (600) | 1.25 | Hero (splash, onboarding). |
| **Title 1** | 24 | Semibold (600) | 1.3 | Screen title. |
| **Title 2** | 20 | Semibold (600) | 1.35 | Section title, sheet title. |
| **Title 3** | 18 | Semibold (600) | 1.4 | Card title, list primary. |
| **Body** | 16 | Regular (400) | 1.5 | Body copy. |
| **Body medium** | 16 | Medium (500) | 1.5 | Emphasized body. |
| **Callout** | 14 | Regular (400) | 1.45 | Secondary copy, list secondary. |
| **Caption** | 12 | Regular (400) | 1.4 | Metadata, hints, labels. |
| **Caption medium** | 12 | Medium (500) | 1.4 | Emphasized caption. |

**Letter spacing:** Default for body; titles can use -0.02em for large text if desired.  
**Design decisions:** Scale aligns with iOS HIG / Material Type; 16px body for readability; one dominant size per block.

---

### 2.3 Spacing system

**Base unit: 4px.** All spacing is a multiple of 4.

| Token | Value (px) | Usage |
|-------|------------|--------|
| **xs** | 4 | Inline gaps (icon–text). |
| **sm** | 8 | Between related elements. |
| **md** | 12 | Between form fields, list items. |
| **lg** | 16 | Section padding, card padding. |
| **xl** | 24 | Screen horizontal padding, between sections. |
| **xxl** | 32 | Large section gaps. |
| **xxxl** | 48 | Hero spacing, bottom sheet padding. |

**Screen padding:** Horizontal **24px** (xl). Vertical as needed; safe area respected.  
**Design decisions:** 8pt grid is industry standard; 24px horizontal keeps content from edges on all devices.

---

### 2.4 Radii

| Token | Value (px) | Usage |
|-------|------------|--------|
| **xs** | 4 | Chips, tags. |
| **sm** | 8 | Small buttons, thumbnails. |
| **md** | 12 | Buttons, inputs. |
| **lg** | 16 | Cards, list items. |
| **xl** | 20 | Bottom sheet (top corners). |
| **xxl** | 24 | Modals, large sheets (top). |
| **full** | 9999 | Pills, avatars. |

**Design decisions:** 12px on buttons/inputs is touch-friendly; 20–24px on sheet top gives a clear “sheet” affordance.

---

### 2.5 Shadow system

**Principle:** Subtle elevation. No heavy drop shadows. Two to three levels only.

| Token | iOS | Android (elevation) | Usage |
|-------|-----|----------------------|--------|
| **shadowSm** | 0 1px 2px rgba(0,0,0,0.05) | 2 | Cards, list items. |
| **shadowMd** | 0 4px 12px rgba(0,0,0,0.08) | 4 | FAB, sticky CTA, dropdown. |
| **shadowLg** | 0 12px 24px rgba(0,0,0,0.12) | 8 | Bottom sheet, modal. |

**Design decisions:** Soft shadows keep the UI light and modern (Airbnb/Uber style); elevation clarifies stacking.

---

### 2.6 Button styles

| Variant | Background | Text | Border | Min height | Use case |
|---------|------------|------|--------|------------|----------|
| **Primary** | Primary | Primary contrast | None | 48px | One main CTA per screen (e.g. “Request mechanic”). |
| **Secondary** | Transparent | Primary | 1px primary | 48px | Secondary action (e.g. “Cancel”, “Back”). |
| **Tertiary / Ghost** | Transparent | Text secondary | None | 48px | Low emphasis (e.g. “Skip”, “Maybe later”). |
| **Destructive** | Error or transparent | Error | Optional | 48px | “Remove”, “Cancel request”. |

- **Padding:** 16px horizontal (lg).  
- **Radius:** 12px (md).  
- **Type:** 16px, Semibold.  
- **Touch target:** Minimum 44pt height; 48px preferred.

**Design decisions:** One primary style per screen; secondary/ghost for alternatives. 48px meets accessibility and feels solid.

---

### 2.7 Input styles

- **Height:** 52px (slightly larger than buttons for tap comfort).  
- **Padding:** 16px horizontal, 14px vertical.  
- **Radius:** 12px.  
- **Border:** 1px border default; 2px primary on focus.  
- **Label:** 14px medium, text secondary, 8px below label.  
- **Placeholder:** 16px regular, text muted.  
- **Error:** Border + label/caption in error color.

**Design decisions:** 52px and 12px radius match premium apps; focus state is clearly visible.

---

### 2.8 Card components

| Variant | Background | Radius | Shadow | Usage |
|---------|------------|--------|--------|--------|
| **Elevated** | Surface | 16px | shadowSm | Provider cards, list rows. |
| **Outlined** | Surface | 16px | None, 1px border | Secondary blocks. |
| **Flat** | Surface | 16px | None | In sheets, no elevation needed. |

- **Padding:** 16px (lg) standard; 20px for “hero” cards.  
- **Design decisions:** Cards are containers; content (typography, spacing) creates hierarchy, not decoration.

---

## Part 3 — Screen structure

### 3.1 Splash

- **Layout:** Centered logo + wordmark; optional short tagline.  
- **Background:** Solid primary or surface; no imagery.  
- **Duration:** ~1.5–2s while app init (auth check, config).  
- **Transition:** To Onboarding (first launch) or to Home / Login (returning).  
- **No** version number or extra copy on screen.

---

### 3.2 Onboarding

- **Format:** 3 screens, horizontal scroll; pagination dots; skip (top-right) and “Next” / “Get started”.  
- **Screen 1:** Value prop — “Nearest mechanic, tow, or rental.” One illustration or icon.  
- **Screen 2:** Trust — “Verified providers. Clear pricing.” (or similar).  
- **Screen 3:** Permission — “Enable location to find providers near you.” Primary CTA: “Enable location” → system permission.  
- **Typography:** Display (28px) for headline; body (16px) for subtext.  
- **Spacing:** 24px horizontal; 32px between headline and body; CTA 48px from bottom (safe area).  
- **Design decisions:** Short, benefit-led; location ask on last screen with clear reason.

---

### 3.3 Login / Register

- **Layout:** Single scrollable column; logo or app name at top (optional).  
- **Login:** Email, password, primary “Sign in”, link “Forgot password?”, link “Create account”.  
- **Register:** Name, email, password (and confirm if required), primary “Create account”, link “Already have an account?”.  
- **Fields:** Full-width inputs per design system; one primary button; links in callout/caption, secondary or tertiary style.  
- **No** inline errors on first submit; validate on submit then show error under field.  
- **Design decisions:** Minimal steps; no decorative elements; focus on completion and trust.

---

### 3.4 Home (map-first)

- **Above the fold:** Full-screen map. User marker (blue); provider markers (mechanic / tow / rental) with distinct colors; optional clustering when zoomed out.  
- **Top bar:** Transparent or blurred; app name or “Find help”; profile icon; optional notification icon. No search bar in top bar.  
- **FAB or sticky bottom bar:** One primary CTA, e.g. “Find mechanic” or “Find help” — opens filter/chip strip or bottom sheet.  
- **Bottom sheet (default peek):** Drag handle; title “Nearest” or “Near you”; horizontal chip filters (Mechanic, Tow, Rental); vertical list of provider cards (avatar/icon, name, type, distance, ETA). Tapping a card focuses map on marker and expands sheet to half or to detail.  
- **Sheet breakpoints:** Peek (~140px), Half (~50%), Full (detail or request).  
- **Empty state:** “No providers in range” + suggestion to expand or try later; illustration optional.  
- **Design decisions:** Map is the home; list and filters live in sheet to keep context and reduce navigation depth.

---

### 3.5 Provider details (bottom sheet)

- **Entry:** From Home sheet (tap card) or tap marker callout.  
- **Content (in sheet):** Provider name (Title 2); type chip (Mechanic / Tow / Rental); distance & ETA (Caption); optional rating; short description or “Available now”; primary CTA “Request [mechanic/tow/rental]”; secondary “Contact” or “Call”.  
- **Map snippet (optional):** Small map strip showing user + provider; not interactive, context only.  
- **Sheet:** Same drag handle; can drag to half or peek to return to list.  
- **Design decisions:** Detail stays in sheet so user keeps map context; one primary CTA for conversion.

---

### 3.6 Request flow

- **Step 1 — Confirm:** “Request [Provider name]?” Summary: type, distance, ETA. Optional note (e.g. “Car won’t start”). Primary “Send request”.  
- **Step 2 — Sent:** “Request sent.” Subtext: “Waiting for [Provider] to accept.” Loading or pulse; optional “Cancel request” (tertiary/destructive).  
- **Step 3 — Accepted (or rejected):** If accepted → navigate to Active request tracking. If rejected → toast + return to list/detail with option to request another.  
- **Design decisions:** Few steps; clear state changes; cancel always available until provider accepts.

---

### 3.7 Active request tracking

- **Layout:** Map fills screen; user marker, provider marker, optional route line (if backend supports).  
- **Top:** “Request in progress” or “[Provider name] is on the way”; ETA; optional “Call” / “Chat”.  
- **Bottom sheet (peek or half):** Status timeline (Requested → Accepted → On the way → Arrived); provider card (name, vehicle if tow); primary “Call” or “Chat”; optional “Cancel” (if policy allows).  
- **Design decisions:** Map-centric like Uber/Careem; status and contact in sheet; one clear next action (call/chat).

---

### 3.8 Profile

- **Layout:** List of sections; no card per section unless needed.  
- **Header:** Avatar, name, email (or phone); optional edit.  
- **Sections:** Account (edit profile, password); Notifications; Language; Help / FAQ; Terms & Privacy; Log out (destructive or tertiary at bottom).  
- **Role-specific:** Mechanic/Tow/Rental: “Availability” toggle, “My location”; Admin: “Manage users”, “Manage providers”, “Live map”.  
- **Design decisions:** Simple list; destructive action separated; role blocks clearly labeled.

---

## Part 4 — UX flow (end-to-end)

**Target flow:**  
User opens app → Location auto-detected → Nearest providers appear → User selects → Sends request → Tracks provider in real time.

1. **Open app** → Splash (init) → If first time: Onboarding → “Enable location” (permission). If returning: go to Home (or Login if session expired).  
2. **Home** → Map loads; if location granted, get position and fetch nearby providers; show user dot and provider markers; sheet in peek shows “Nearest” list.  
3. **Discover** → User can change filter (Mechanic / Tow / Rental); list and map update; distance and ETA visible in list and on tap.  
4. **Select** → User taps a provider card or marker → Sheet expands to provider detail; primary CTA “Request [type]”.  
5. **Request** → User taps “Request” → Confirm step (optional note) → “Send request” → Waiting state in sheet or full screen.  
6. **Accepted** → Navigate to Active request tracking; map shows user + provider; ETA and status in sheet; “Call” / “Chat” available.  
7. **Completion** → When provider arrives or request completed, show “Done” state; optional rating; return to Home.

**Principles:**  
- Minimize steps (request in 2–3 taps from home).  
- Keep map visible wherever it adds context (home, tracking).  
- One primary action per screen.  
- Clear feedback at every step (loading, success, error).  
- Location and permissions asked in context with clear benefit.

---

## Part 5 — Design decisions summary

| Decision | Rationale |
|----------|-----------|
| Map-first home | Matches user mental model (“where is help?”); aligns with Uber/Careem; reduces taps to see options. |
| Single primary CTA | Increases conversion; reduces confusion; matches best practices from marketplace apps. |
| Bottom sheets for list & detail | Keeps map context; avoids full-screen stacking; familiar pattern on mobile. |
| One primary color + neutrals | Feels premium and global; avoids “random” or noisy palettes. |
| 48px buttons, 52px inputs | Accessibility and tap comfort; aligns with platform guidelines. |
| Skeleton over full-screen loader | Maintains layout and reduces perceived wait. |
| Request flow in 2–3 steps | Fewer steps to request = higher completion. |
| Active tracking map-centric | Reuses same mental model as “find”; builds trust with live ETA. |

This spec is the single source of truth for design. Implementation (theme tokens, components, screens) should follow it for a consistent, world-class product.
