# Full UX/UI Spec: On-Demand Car Services App

**Roles:** User (Customer) · Mechanic · Tow Truck · Car Rental · Admin  
**Theme:** Green (primary unchanged). Modern design system around it.  
**Purpose:** Single reference for layout, inputs, outputs, icons, navigation, and design recommendations.

---

## 1. Reference Apps & What to Take

| App / Website | Use for inspiration |
|---------------|----------------------|
| **Uber** | Map interaction, provider/car on map, live tracking, ETA countdown, post-ride rating flow, minimal bottom sheet for driver info. |
| **Bolt** | Smooth transitions, service type filter chips, map-based provider selection, clear price estimate. |
| **Careem** | Clean MEA mobile UX, live tracking screen, call/driver actions in one bar. |
| **YourMechanic** | Mechanic booking flow, provider profiles with ratings/reviews, “describe your issue” + photo upload. |
| **Wrench** | Maintenance service UX, issue reporting, service type selection. |
| **HONK** | Tow truck request flow, vehicle type, breakdown location, route tracking. |
| **Turo** | Car rental: listing cards with photos, price per day, availability calendar, booking flow. |
| **Getaround** | Car rental UX: search, filters, listing detail, booking dates, pickup location. |

**Synthesis:** Map-first home (Uber/Bolt), clear service filters (Bolt), rich provider cards (YourMechanic/Turo), live tracking + ETA (Uber/Careem), issue + photo (YourMechanic/Wrench), tow-specific fields (HONK), rental listings + booking (Turo/Getaround), rating after service (Uber).

---

## 2. Design Guidelines (Summary)

- **Primary Green** = main CTAs (do not change).
- **Palette:** Light Green, Dark Green, Soft Gray background, White cards.
- **Cards:** border-radius 16px, soft shadow, padding 16px.
- **Buttons:** Rounded, primary green, large tap area.
- **Inputs:** Rounded, icon inside (leading), clear placeholder.

### Icon Set (concept → icon / emoji)

| Function / Concept | Emoji | Icon (MaterialCommunityIcons) |
|--------------------|--------|------------------------------|
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
| Availability (on/off) | — | `circle` (green/amber/gray) |

---

## 3. Full Screen List by Role (Layout, Inputs, Outputs, Icons, Navigation)

### 3.1 Shared (all users)

| # | Screen | Layout | Inputs | Outputs | Icons | Navigation |
|---|--------|--------|--------|--------|-------|------------|
| 1 | **Splash** | Full screen, green gradient, centered logo, short animation | — | — | App logo | → Onboarding (first) or Login/Home (returning) |
| 2 | **Onboarding 1** | Illustration + title “Find nearby mechanics instantly” + subtitle | — | — | 🔧 | Next / Skip |
| 3 | **Onboarding 2** | “Request tow trucks anytime” | — | — | 🚛 | Next / Skip |
| 4 | **Onboarding 3** | “Rent cars easily” | — | — | 🚗 | Get Started |
| 5 | **Login** | Logo, phone input, password input, Login btn, Forgot password, Google/Apple | Phone, Password | Error message | 📞 (phone), lock | → Home (by role) / Register |
| 6 | **Register** | Name, phone, email, password, role chips (User/Mechanic/Tow/Rental), Create account | Name, Phone, Email, Password, Role | Validation errors | 👤, 📞, mail, 🔧🚛🚗 | → Login or Home |
| 7 | **Location Permission** | Illustration (map + pin), copy, Enable Location button | — | Permission result | 📍 | → Home / Map |

---

### 3.2 User (Customer)

| # | Screen | Layout | Inputs | Outputs | Icons | Navigation |
|---|--------|--------|--------|--------|-------|------------|
| 8 | **Home (Map)** | Full map; top: search bar; below: filter chips (Mechanic/Tow/Rental); markers (🔧🚛🚗); bottom sheet: provider card | Search query, Filter selection | Markers, provider list, selected provider (photo, name, type, ⭐, distance, availability) | 🔧🚛🚗, 📍, ⭐, magnify | → Request Service, View Profile, Notifications, Settings |
| 9 | **Provider Profile** | Photo, name, service type, ⭐ rating, reviews snippet, distance, availability; buttons: Request service, 💬 Chat, 📞 Call | — | Provider details, reviews, availability | 👤, 🔧/🚛/🚗, ⭐, 📍, 💬, 📞 | → Request Service, Chat |
| 10 | **Request Service** | Service type (prefilled), description textarea, photo upload; block: ETA, price estimate; Confirm request | Service type, Description, Photo(s) | ETA, Price estimate | 🔧/🚛/🚗, 📍 | → Live Tracking |
| 11 | **Live Tracking** | Map (user + provider + route); card: provider photo, name, distance, ETA; actions: 📞 Call, 💬 Chat, Cancel | — | Provider position, distance, ETA (live) | 📍, 📞, 💬, 🧭 | → Chat, Service Completion on done |
| 12 | **Chat** | Conversation thread; input: message + send | Message text | Messages (provider ↔ user) | 💬 | ← from Live Tracking / Profile |
| 13 | **Service Completion** | Summary (service, provider, price); rate ⭐ + optional review; Submit | Star rating, Review text | Summary (type, provider, price) | ⭐, 👤 | → Home / History |
| 14 | **Profile** | Avatar, name, email/phone; Favorites list; Edit profile | — | User info, Favorites (providers) | 👤, ⭐ | → Edit, Favorites, Request History |
| 15 | **Notifications** | List of items (request accepted, ETA, message, etc.) | — | Notification list | bell | ← from Home |
| 16 | **Settings** | Language, Notifications toggle, Privacy, Logout | Toggles, language | — | cog | ← from Home |

---

### 3.3 Mechanic

| # | Screen | Layout | Inputs | Outputs | Icons | Navigation |
|---|--------|--------|--------|--------|-------|------------|
| 17 | **Mechanic Dashboard** | Status toggle (Available / Busy / Offline); stat cards: Today’s jobs, Completed, Earnings; list: incoming/active requests | Status toggle | Stats, request list (user, distance, issue preview) | 🔧, 📍, ⭐ | → Incoming Request |
| 18 | **Incoming Request** | Mini map (user 📍); user name, distance, issue description, image; Accept / Reject | — | User location, distance, description, image | 👤, 📍, 🔧 | Accept → Navigation; Reject → Dashboard |
| 19 | **Navigation to User** | Full map + route to user; card: distance, ETA; Start navigation | — | Route, distance, ETA | 🧭, 📍 | → Completion |
| 20 | **Completion** | Repair notes (textarea), Service cost (number); Complete service | Repair notes, Service cost | — | 🔧 | → Dashboard |

---

### 3.4 Tow Truck

| # | Screen | Layout | Inputs | Outputs | Icons | Navigation |
|---|--------|--------|--------|--------|-------|------------|
| 21 | **Tow Dashboard** | Status toggle; stats: Active tows, Completed; list of requests | Status toggle | Stats, request list | 🚛, 📍 | → Incoming Request |
| 22 | **Incoming Request** | Vehicle type, breakdown location, distance; Accept / Reject | — | Vehicle type, location, distance | 🚛, 📍 | Accept → Navigation; Reject → Dashboard |
| 23 | **Navigation to User** | Map + route; distance, ETA; Start navigation | — | Route, distance, ETA | 🧭, 📍 | → Completion |
| 24 | **Completion** | Tow distance (km), Service price; Complete | Tow distance, Service price | — | 🚛 | → Dashboard |

---

### 3.5 Car Rental

| # | Screen | Layout | Inputs | Outputs | Icons | Navigation |
|---|--------|--------|--------|--------|-------|------------|
| 25 | **Rental Dashboard** | Tabs/sections: Available cars, Active rentals; cards: car photo, name, price/day, availability; Add car FAB | — | Car list, active rentals | 🚗, ⭐ | → Car Management, Booking Request |
| 26 | **Car Management** | Car name, photos (multi), price per day, availability toggle; Save / Delete | Name, Photos, Price/day, Availability | — | 🚗, 📍 | → Dashboard |
| 27 | **Booking Request** | User name, rental period (dates), pickup location; Accept / Reject | — | User name, period, pickup | 👤, 📍, 🚗 | → Dashboard |

---

### 3.6 Admin

| # | Screen | Layout | Inputs | Outputs | Icons | Navigation |
|---|--------|--------|--------|--------|-------|------------|
| 28 | **Admin Dashboard** | Stat cards: Total users, Total providers, Active requests, Completed services; links: Map, Analytics, Lists | — | Four stats | dashboard, 👤, 🔧🚛🚗 | → Admin Map, Analytics, User/Provider lists |
| 29 | **Admin Map** | Full map, all providers (🔧🚛🚗); list/panel with status; per provider: Suspend, Disable, Change status | Status change, Suspend/Disable | All providers on map, list | 🔧🚛🚗, 📍, dashboard | ← Dashboard |
| 30 | **Analytics** | Requests per day (chart/list), Revenue stats; optional date range | Date range (optional) | Chart data, totals | chart, ⭐ | ← Dashboard |

---

## 4. Navigation Flow (All Roles)

```
Splash → Onboarding (3) → Login | Register → Location Permission
    → [Role-based root]

USER:
  Home (Map) ⇄ Provider Profile ⇄ Request Service → Live Tracking ⇄ Chat → Service Completion → Home
  Home ⇄ Profile (Favorites, History) ⇄ Notifications, Settings

MECHANIC:
  Dashboard ⇄ Incoming Request → Navigation to User → Completion → Dashboard

TOW:
  Dashboard ⇄ Incoming Request → Navigation to User → Completion → Dashboard

RENTAL:
  Dashboard ⇄ Car Management | Booking Request (Accept/Reject) → Dashboard

ADMIN:
  Dashboard ⇄ Admin Map | Analytics | User List | Provider List
  Admin Map → Provider actions (Suspend, Disable, Status)
```

---

## 5. Design Recommendations

### 5.1 Provider Cards (map bottom sheet / list)

- **Layout:** White card, radius 16px, padding 16px, soft shadow.
- **Content:** Profile image (left), name (bold), service type with icon (🔧/🚛/🚗), rating (stars + number), distance, availability badge (green/amber/gray).
- **Actions:** Primary “Request service”, secondary “View profile” (optional: Call/Chat on card).
- **Inspiration:** Uber driver card (compact, one primary CTA), YourMechanic provider block (rating + distance).

### 5.2 Map Markers

- **By type:** Mechanic 🔧, Tow 🚛, Car Rental 🚗 (emoji or icon in pin).
- **By status:** Available (green tint), Busy (amber), Offline (hidden or gray).
- **Tap:** Center on provider + open provider card (bottom sheet); do not open a second map screen.
- **Clustering:** If many providers, cluster with count; tap cluster to zoom.
- **Inspiration:** Uber/Bolt car markers, Careem driver pin.

### 5.3 Live Tracking

- **Map:** User pin (e.g. green), provider pin (moving), route polyline; auto-follow provider or “Center on provider” button.
- **Card:** Provider photo, name, distance (updated), ETA countdown; actions: Call, Chat, Cancel.
- **Updates:** Poll or WebSocket every 5–10 s for provider position; update ETA when route changes.
- **Inspiration:** Uber “Driver is 2 min away”, Careem live tracking bar.

### 5.4 Ratings

- **After service:** Dedicated completion screen with summary (service, provider, price).
- **Input:** 1–5 stars (tap to set), optional review text.
- **Display:** On provider profile and cards: star icon + average + count (e.g. “4.5 ⭐ (120)”).
- **Inspiration:** Uber post-trip rating, YourMechanic reviews.

### 5.5 Inputs (global)

- Rounded (e.g. radius 12px), icon inside (leading), placeholder, focus border green.
- Request “description”: multiline, optional photo attach (camera/gallery).
- Provider forms (notes, cost, distance): clear labels, numeric keyboard where needed.

### 5.6 Empty & Loading States

- **Empty:** Illustration + short message + CTA (e.g. “No requests yet”, “No providers nearby”).
- **Loading:** Skeleton for lists/cards; spinner for map/submit; button loading state on Confirm/Accept.

---

## 6. Features Checklist (by role)

- **User:** Map, filters (🔧🚛🚗), provider card, profile, request (type, description, photo), ETA & price, live tracking, call/chat/cancel, completion, rate & review, favorites, notifications.
- **Mechanic:** Status (Available/Busy/Offline), dashboard stats, incoming request (map, description, image), accept/reject, navigation, completion (notes, cost).
- **Tow:** Same pattern; incoming: vehicle type, breakdown location; completion: tow distance, price.
- **Rental:** Dashboard (cars, active rentals), car management (name, photos, price, availability), booking request (user, period, location), accept/reject.
- **Admin:** Dashboard stats, map of all providers, provider actions (suspend, disable, status), analytics (requests/day, revenue).

---

## 7. Alignment with Codebase

- **Theme:** Use existing `primary` green; `greenPrimary`, `greenDark`, `greenLight`, `backgroundSoft`, `cardWhite` in `theme/colors.ts`.
- **Cards:** `radii.lg` (16), `shadows.md`, padding 16.
- **Icons:** MaterialCommunityIcons: `wrench`, `tow-truck`, `car-side`, `account`, `map-marker`, `phone`, `star`, `message-text`, `compass`, `view-dashboard`; emoji can be used in labels/callouts (🔧🚛🚗👤📍📞⭐💬🧭).
- **Screens:** Map to existing `*Screen.tsx` and stacks; add or rename screens to match this spec.

This document is the single reference for full app experience, reference apps, per-role screens, inputs/outputs, icons, navigation, and design recommendations while keeping the green theme.
