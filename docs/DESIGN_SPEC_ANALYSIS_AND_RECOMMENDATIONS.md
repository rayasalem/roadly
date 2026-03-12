# Complete Mobile App Design: On-Demand Car Services (Green Theme)

**Roles:** User · Mechanic · Tow Truck · Car Rental · Admin  
**Theme:** Green (primary unchanged). Modern, professional design system around it.  
**Basis:** Analysis of Uber, Bolt, Careem, YourMechanic, Wrench, HONK, Turo, Getaround — adapted to green.

---

## Part 1 — Analysis of Similar Apps

### 1.1 Uber

**Sources:** Uber Design (Medium), Uber Blog (Carbon map, Live Activity), design teardowns.

| Aspect | Findings | Apply to our app (green theme) |
|--------|----------|--------------------------------|
| **Map** | Map as background layer; driver + pickup/dropoff; ETA on map; separate components for display, no single monolith. | Map-first home; user pin + provider markers; ETA in card, not only on map. |
| **Live tracking** | Driver location + route; Live Activity (iOS): driver photo, ETA, progress bar; info optimized for glance (seconds). | Live screen: provider moving, route, ETA countdown; compact card (photo, name, ETA, distance). |
| **Bottom sheet** | Booking in few taps; bottom sheet for destination/options; confirmation at bottom. | Provider card in bottom sheet; “Request service” as primary CTA; progressive disclosure. |
| **Ratings** | Post-trip rating; simple star + optional feedback. | Completion screen: summary + stars + optional review; same pattern. |
| **Colors / theme** | Black/white + brand accent. | Keep our primary green; use white cards, soft gray background. |

### 1.2 Bolt & Careem

**Sources:** Bolt redesign (dynamic pricing), Uber vs Careem UX, Bolt support.

| Aspect | Findings | Apply to our app (green theme) |
|--------|----------|--------------------------------|
| **Map** | Bolt: map for location, green pin adjustable; confirm destination before service. Careem: Google Maps, compare options. | Search bar + movable pin or “my location”; confirm location before request. |
| **Service filter** | Ride type/category selection; compare fare and time. | Filter chips: Mechanic / Tow / Car Rental (green when active); clear selection state. |
| **Pricing** | Transparent, upfront estimate. | Request screen: show ETA + price estimate before confirm. |
| **Localization** | Careem: Arabic, regional payments. | Keep RTL/i18n; green as primary CTA. |

### 1.3 YourMechanic & Wrench

**Sources:** YourMechanic app/store, Wrench FAQ, mechanic profiles.

| Aspect | Findings | Apply to our app (green theme) |
|--------|----------|--------------------------------|
| **Mechanic profile** | Experience, certifications, skills, ratings; vetting and reviews. | Provider card and profile: photo, name, type, rating (stars + count), distance, availability. |
| **Booking** | Service catalog; describe issue; quote before book; chat before appointment. | Request: service type, description, photo; show ETA + estimate; optional chat. |
| **Tracking** | Real-time mechanic en route. | Live tracking: provider on map, ETA, distance; same as Uber-style. |
| **Reviews** | Ratings influence visibility. | Show rating on card and profile; post-service rate + review. |

### 1.4 HONK

**Sources:** HONK app stores, honkforhelp, partner app.

| Aspect | Findings | Apply to our app (green theme) |
|--------|----------|--------------------------------|
| **Flow** | Select service type → price quote → location (GPS) → dispatch → tracking. | Request: type → description/location → ETA + estimate → confirm → live tracking. |
| **Tow-specific** | Service type (tow, battery, tire, etc.); destination for tow; ride-along. | Tow: vehicle type, breakdown location; optional destination; same map + card pattern. |
| **Map** | GPS map; user + service partner; real-time updates, ETA. | One map for request and tracking; provider marker; ETA in card. |
| **Payment** | In-app, no cash. | Keep in-app payment; green primary for “Pay” / “Confirm”. |

### 1.5 Turo & Getaround

**Sources:** Turo design/engineering (Medium), UI sources, Turo Go case study.

| Aspect | Findings | Apply to our app (green theme) |
|--------|----------|--------------------------------|
| **Listings** | Car photos, price per day, location, availability; filters. | Rental dashboard: cards with photo, name, price/day, availability; filters. |
| **Booking flow** | Search → filters → car detail → dates → checkout. | Rental: list → car detail → booking request (dates, pickup) → accept/reject. |
| **Host view** | Manage cars, availability, bookings. | Car Rental: dashboard, car management (photos, price, availability), booking requests. |
| **Design** | Clear expectations; expressive color/illustration; strong onboarding. | Green as accent; clear CTAs; onboarding (3 screens); empty states with illustration. |
| **Map + sheet** | Turo Eng: map camera adjusts when bottom sheet moves; controls don’t obstruct. | Map re-centers or keeps key points visible when provider sheet opens. |

### 1.6 Cross-app patterns (synthesis)

- **Map + bottom sheet:** Map for context; sheet for details and actions; map camera/insets consider sheet height (Turo/Uber).
- **Service selection:** Chips or list (Bolt, Uber, Careem); one primary selection; green for active.
- **Provider/driver card:** Photo, name, rating, ETA/distance, one primary CTA (Uber, YourMechanic).
- **Live tracking:** Map + moving provider + route + ETA; compact card; Call/Chat/Cancel (Uber, Careem, HONK).
- **Transparent pricing:** Estimate before confirm (Bolt, HONK, YourMechanic).
- **Ratings:** After service; stars + optional text; shown on profile (Uber, YourMechanic).

---

## Part 2 — Full Screen List by Role (Layout, Inputs, Outputs, Icons)

### 2.1 Shared (all roles)

| Screen | Layout | Inputs | Outputs | Icons |
|--------|--------|--------|--------|--------|
| **Splash** | Full screen, green gradient, logo, short animation | — | — | App logo |
| **Onboarding 1–3** | Illustration + title + subtitle; Skip / Next / Get Started | — | — | 🔧 🚛 🚗 |
| **Login** | Logo, phone, password, Login, Forgot password, Google/Apple | Phone, Password | Error msg | 📞 🔒 |
| **Register** | Name, phone, email, password, role (User/Mechanic/Tow/Rental), Create account | Name, Phone, Email, Password, Role | Validation | 👤 📞 ✉️ 🔧🚛🚗 |
| **Location Permission** | Illustration, copy, Enable Location | — | Permission | 📍 |

### 2.2 User (Customer)

| Screen | Layout | Inputs | Outputs | Icons |
|--------|--------|--------|--------|--------|
| **Home (Map)** | Map full; top: search; chips: Mechanic/Tow/Rental; markers; bottom sheet: provider card | Search, Filter | Markers, list, selected (photo, name, type, ⭐, distance, status) | 🔧🚛🚗 📍 ⭐ 🔍 |
| **Provider Profile** | Photo, name, type, ⭐, reviews, distance; Request service, Chat, Call | — | Profile, reviews | 👤 🔧/🚛/🚗 ⭐ 📍 💬 📞 |
| **Request Service** | Type, description, photo; ETA + price block; Confirm | Type, Description, Photo(s) | ETA, Price estimate | 🔧/🚛/🚗 📍 |
| **Live Tracking** | Map (user + provider + route); card: photo, name, distance, ETA; Call, Chat, Cancel | — | Position, distance, ETA | 📍 📞 💬 🧭 |
| **Chat** | Thread; message input + send | Message | Messages | 💬 |
| **Service Completion** | Summary; stars + review; Submit | Rating, Review | Summary (type, provider, price) | ⭐ 👤 |
| **Profile** | Avatar, name, Favorites, Edit | — | User, Favorites | 👤 ⭐ |
| **Notifications** | List | — | Notifications | 🔔 |
| **Settings** | Language, Notifications, Logout | Toggles | — | ⚙️ |

### 2.3 Mechanic

| Screen | Layout | Inputs | Outputs | Icons |
|--------|--------|--------|--------|--------|
| **Dashboard** | Status (Available/Busy/Offline); stat cards; request list | Status | Stats, requests | 🔧 📍 ⭐ |
| **Incoming Request** | Mini map, user name, distance, issue, image; Accept / Reject | — | Location, description, image | 👤 📍 🔧 |
| **Navigation** | Map + route; distance, ETA; Start navigation | — | Route, ETA | 🧭 📍 |
| **Completion** | Repair notes, service cost; Complete | Notes, Cost | — | 🔧 |

### 2.4 Tow Truck

| Screen | Layout | Inputs | Outputs | Icons |
|--------|--------|--------|--------|--------|
| **Dashboard** | Status; stats; request list | Status | Stats, requests | 🚛 📍 |
| **Incoming Request** | Vehicle type, location, distance; Accept / Reject | — | Type, location, distance | 🚛 📍 |
| **Navigation** | Map + route; ETA | — | Route, ETA | 🧭 📍 |
| **Completion** | Tow distance, price; Complete | Distance, Price | — | 🚛 |

### 2.5 Car Rental

| Screen | Layout | Inputs | Outputs | Icons |
|--------|--------|--------|--------|--------|
| **Dashboard** | Available cars, active rentals; Add car | — | Cars, rentals | 🚗 ⭐ |
| **Car Management** | Name, photos, price/day, availability; Save | Name, Photos, Price, Availability | — | 🚗 📍 |
| **Booking Request** | User, period, pickup; Accept / Reject | — | User, period, pickup | 👤 📍 🚗 |

### 2.6 Admin

| Screen | Layout | Inputs | Outputs | Icons |
|--------|--------|--------|--------|--------|
| **Dashboard** | 4 stat cards; links to Map, Analytics, Lists | — | Users, providers, active, completed | 📊 👤 🔧 |
| **Admin Map** | Map + all providers; list; Suspend, Disable, Status | Status, actions | All providers | 🔧🚛🚗 📍 |
| **Analytics** | Requests/day, revenue; date range | Date range | Charts, totals | 📊 |

---

## Part 3 — Navigation Flow

```
Splash → Onboarding (3) → Login | Register → Location Permission
    → [By role]

USER:   Home ⇄ Provider Profile ⇄ Request Service → Live Tracking ⇄ Chat → Completion → Home
        Home ⇄ Profile ⇄ Notifications, Settings

MECHANIC: Dashboard ⇄ Incoming Request → Navigation → Completion → Dashboard

TOW:    Dashboard ⇄ Incoming Request → Navigation → Completion → Dashboard

RENTAL: Dashboard ⇄ Car Management | Booking Request → Dashboard

ADMIN:  Dashboard ⇄ Admin Map | Analytics | User/Provider lists
        Admin Map → Provider actions (Suspend, Disable, Status)
```

---

## Part 4 — Design Recommendations (Inspired by Analysis, Adapted to Green)

### 4.1 Provider cards (bottom sheet / list)

**From:** Uber (driver card, 2-tap confirm), YourMechanic (profile, rating), Bolt (clear selection).

- **Container:** White card, radius 16px, padding 16px, soft shadow; bottom sheet or list item.
- **Content:**  
  - Leading: profile image (round, 48–56px).  
  - Name (bold), service type with icon (🔧/🚛/🚗).  
  - Rating: stars + number + “(n reviews)” if available.  
  - Distance (e.g. “2.3 km”).  
  - Availability: badge (green = available, amber = busy); hide offline from list.
- **Actions:**  
  - Primary: “Request service” (green, full-width, rounded).  
  - Secondary: “View profile” (outline or text).  
  - Optional on card: Call, Chat (icons).
- **Map sync:** When user selects a marker, sheet opens with same card; map camera keeps user + provider in view (Turo-style).

### 4.2 Map markers

**From:** Uber (vehicle markers), Bolt (green pin), Careem (driver on map).

- **By type:** Mechanic 🔧, Tow 🚛, Car Rental 🚗 (emoji or icon in pin/callout).
- **By status:** Available = green tint; Busy = amber; Offline = do not show (or gray if needed).
- **User:** Single green pin; pulse or circle for “you are here”.
- **Interaction:** Tap marker → center map on provider + open provider card in sheet; no full-screen map change.
- **Clustering:** If many providers, cluster with count; tap cluster to zoom in.
- **Performance:** Reuse marker views; avoid re-creating on every move (Uber Carbon-style separation of map layers).

### 4.3 Live tracking

**From:** Uber (Live Activity, ETA, progress), Careem (tracking bar), HONK (updates, ETA).

- **Map:** User pin (green), provider pin (moving), route polyline; optional “Center on provider” button.
- **Updates:** Poll or WebSocket every 5–10 s; update ETA when route/location changes.
- **Card (compact):** Provider photo, name, “X min away”, distance; primary actions: Call, Chat; secondary: Cancel.
- **Glanceable:** ETA and distance in large enough type; progress feel (e.g. “2 min” countdown) without cluttering.
- **After arrival:** Card can switch to “Provider arrived” and then to completion/rating flow.

### 4.4 Ratings

**From:** Uber (post-trip), YourMechanic (reviews on profile).

- **When:** Dedicated screen after service completion; summary first (service type, provider name, price).
- **Input:** 1–5 stars (tap to set); optional review text (single or multiline).
- **Display:** On provider card and profile: star icon + average + count (e.g. “4.5 ⭐ (120)”); optional “See reviews” for list.
- **Green:** Use green for “Submit” and success state; keep stars gold/amber for contrast.

### 4.5 UI improvements inspired by analyzed apps

| From | Improvement | Green-theme application |
|------|--------------|--------------------------|
| Uber | Few-tap booking; bottom sheet for actions | One-tap “Request service” from card; sheet for confirm/options. |
| Bolt | Transparent pricing | Always show ETA + price estimate before “Confirm request”. |
| Careem | Clean MEA UX, localization | RTL/i18n; green as primary; clear hierarchy. |
| YourMechanic | Rich provider info | Card + profile: rating, distance, availability, reviews. |
| HONK | Clear request steps | Request: type → location/description → estimate → confirm. |
| Turo | Map + sheet coordination | Map insets/camera account for sheet; no overlap of key controls. |
| All | Loading and empty states | Skeleton for lists/cards; spinner for map/submit; empty state with illustration + CTA. |
| All | Strong CTAs | Primary green button; large tap area (min 48px height). |

---

## Part 5 — Green Design System (Reminder)

- **Primary green:** Main CTAs, active filter, links (do not change).
- **Palette:** Primary green, dark green (pressed/header), light green (badges/success bg), soft gray (screen bg), white (cards).
- **Cards:** Radius 16px, soft shadow, padding 16px.
- **Buttons:** Rounded, primary green, large tap area.
- **Inputs:** Rounded, icon inside (leading), clear placeholder, focus border green.

---

## Part 6 — Icon Reference (by function)

| Function | Emoji | MaterialCommunityIcons (suggestion) |
|----------|--------|--------------------------------------|
| Mechanic | 🔧 | `wrench` |
| Tow Truck | 🚛 | `tow-truck` |
| Car Rental | 🚗 | `car-side` |
| User | 👤 | `account` / `account-outline` |
| Location | 📍 | `map-marker` / `map-marker-outline` |
| Phone | 📞 | `phone` |
| Rating | ⭐ | `star` / `star-outline` |
| Chat | 💬 | `message-text` / `message-outline` |
| Navigation | 🧭 | `compass` / `navigation` |
| Admin | — | `view-dashboard` / `shield-account` |
| Search | — | `magnify` |
| Filter | — | `filter-variant` |

---

This document is the single reference that: (1) summarizes analysis of the similar apps, (2) lists all screens per role with layout, inputs, outputs, and icons, (3) defines navigation flow, (4) gives design recommendations for provider cards, map markers, live tracking, and ratings, and (5) suggests UI improvements—all adapted to the green theme without changing the main green color.
