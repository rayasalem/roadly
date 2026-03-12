# Full Application UX/UI Design Specification

**Product:** On-demand car service platform (Uber-style for car services)  
**Design system:** Green theme (primary preserved). Modern, professional, scalable.  
**Roles:** User (Customer) · Mechanic · Tow Truck · Car Rental · Admin  

---

## 1. Global Design System (Green Theme)

### 1.1 Color Palette (around existing green)

| Token | Hex | Usage |
|-------|-----|--------|
| **Primary Green** | `#22C55E` | Main CTAs, active states, links (do not change) |
| **Dark Green** | `#16A34A` | Pressed states, headers |
| **Light Green** | `#D1FAE5` | Backgrounds for success, availability badges |
| **Soft Gray Background** | `#F3F4F6` | Screen background |
| **White Cards** | `#FFFFFF` | Cards, inputs, sheets |
| **Border** | `#E5E7EB` | Input borders, dividers |
| **Text Primary** | `#111827` | Headings, body |
| **Text Secondary** | `#6B7280` | Hints, captions |
| **Text Muted** | `#9CA3AF` | Placeholders |

### 1.2 UI Component Style

**Cards**
- Border radius: **16**
- Shadow: soft (elevation 4 / shadowMd)
- Background: white
- Padding: **16**

**Buttons**
- Primary: green background, white text, rounded (e.g. radius 12–16)
- Large tap area: min height 48–56
- Secondary: outline green or gray

**Inputs**
- Rounded (radius 12)
- Icon inside input (leading)
- Clear placeholder text
- Border focus: green

### 1.3 Icon Set (minimal, modern)

| Concept | Icon (e.g. MaterialCommunityIcons) |
|---------|-------------------------------------|
| Mechanic | `wrench` |
| Tow Truck | `tow-truck` |
| Car Rental | `car-side` |
| User | `account` / `account-outline` |
| Location | `map-marker` / `map-marker-outline` |
| Call | `phone` |
| Rating | `star` / `star-outline` |
| Chat | `message-text` / `message-outline` |
| Navigation | `compass` / `navigation` |
| Admin | `view-dashboard` / `shield-account` |
| Search | `magnify` |
| Filter | `filter-variant` |
| Availability | `circle` (green/amber/gray) |

---

## 2. Full Screen List (Entire App)

### Shared / Pre-auth
1. Splash Screen  
2. Onboarding 1 – Find mechanics  
3. Onboarding 2 – Request tow trucks  
4. Onboarding 3 – Rent cars  
5. Login  
6. Register  
7. Location Permission  

### User (Customer)
8. Home (Map)  
9. Request Service  
10. Live Tracking  
11. Service Completion (Summary + Rate)  
12. Profile / Favorites  
13. Notifications  
14. Settings  
15. Chat (conversation)  

### Mechanic
16. Mechanic Dashboard  
17. Incoming Request (Mechanic)  
18. Navigation to User  
19. Completion (repair notes + cost)  

### Tow Truck
20. Tow Truck Dashboard  
21. Incoming Request (Tow)  
22. Navigation to User  
23. Completion (tow distance + price)  

### Car Rental
24. Rental Dashboard  
25. Car Management (add/edit car)  
26. Booking Request (incoming)  
27. Accept/Reject booking  

### Admin
28. Admin Dashboard  
29. Admin Map (all providers)  
30. Provider Actions (suspend, disable, status)  
31. Analytics (requests per day, revenue)  
32. User/Provider lists  

---

## 3. Screen-by-Screen Layout, Inputs, Outputs

### 1️⃣ Splash Screen

**Purpose:** Branding, short load.

**Layout**
- Full screen.
- Green gradient background (e.g. primary → dark green).
- Centered: app logo.
- Optional: short fade or scale animation (1–2 s).

**Inputs:** None  
**Outputs:** None  
**Navigation:** Auto-navigate to Onboarding (first time) or Login/Home (returning).  
**Components:** `SplashView`, `Animated.View`, logo asset.

---

### 2️⃣ Onboarding (3 swipe screens)

**Layout**
- Horizontal `ScrollView` / `PagerView` (3 pages).
- Each page: illustration or icon + title + short description.
- Bottom: Skip (text), Next (button), or Get Started on last page.

**Screen 1**
- Title: “Find nearby mechanics instantly”
- Subtitle: Short line.
- Icon: wrench.

**Screen 2**
- Title: “Request tow trucks anytime”
- Icon: tow-truck.

**Screen 3**
- Title: “Rent cars easily”
- Icon: car-side.

**Inputs:** None (tap Skip / Next / Get Started).  
**Outputs:** None.  
**Navigation:** Skip/Get Started → Auth or Location Permission.  
**Components:** `OnboardingPager`, `OnboardingSlide`, `Button`.

---

### 3️⃣ Login

**Layout**
- Header: app name or logo.
- Two inputs: Phone number, Password.
- Buttons: Login (primary green), Forgot password (text).
- Divider: “or”
- Social: Google, Apple (icon buttons).

**Inputs**
- Phone number (numeric keyboard, with country code or placeholder).
- Password (secure, optional show/hide).

**Outputs:** Error message (e.g. invalid credentials).  
**Navigation:** Login success → Home (by role). Register → Register screen.  
**Components:** `Input` (with leading icon), `Button`, `SocialLoginRow`.

---

### 4️⃣ Register

**Layout**
- Scrollable form.
- Inputs: Name, Phone, Email, Password.
- Role selection: User | Mechanic | Tow Truck | Car Rental (chips or cards).
- Button: Create account.

**Inputs**
- Name (text).
- Phone (numeric).
- Email (email keyboard).
- Password (secure).
- Role (single choice).

**Outputs:** Validation errors.  
**Navigation:** Success → Login or direct into app.  
**Components:** `Input`, `RoleSelector`, `Button`.

---

### 5️⃣ Location Permission

**Layout**
- Illustration (e.g. map with pin).
- Title and short copy explaining why location is needed.
- Button: Enable Location.

**Inputs:** None (system permission).  
**Outputs:** Permission result.  
**Navigation:** After enable → Home/Map.  
**Components:** `Illustration`, `Button`.

---

### 6️⃣ Home (User) – Map

**Layout**
- Full-screen map (primary content).
- Top: Search bar (rounded, icon inside).
- Below search: Service filter chips – Mechanic | Tow Truck | Car Rental (green when active).
- Map: user location + provider markers (icon by type: wrench / tow-truck / car).
- Bottom sheet or card: selected provider card.

**Provider card (in list or bottom sheet)**
- Profile image, name, service type icon, rating (stars), distance, availability (badge).
- Buttons: Request service (primary), View profile (secondary).

**Inputs:** Search query, filter selection.  
**Outputs:** Map markers, provider list, selected provider details.  
**Navigation:** Request service → Request Service screen. View profile → Profile.  
**Components:** `MapView`, `SearchBar`, `FilterChips`, `ProviderMarker`, `ProviderCard`, `BottomSheet`.

---

### 7️⃣ Request Service (User)

**Layout**
- Form: Service type (prefilled or selector), Description (textarea), Upload image (button + thumbnails).
- Outputs section: Estimated arrival (e.g. “~15 min”), Price estimate (e.g. “From 50 SAR”).
- Button: Confirm request.

**Inputs**
- Service type (mechanic / tow / rental).
- Description of issue (multiline).
- Image(s) (camera or gallery).

**Outputs**
- Estimated arrival time.
- Price estimate (range or “From X”).

**Navigation:** Confirm → Live Tracking (or pending).  
**Components:** `Input`, `TextArea`, `ImagePicker`, `EstimateCard`, `Button`.

---

### 8️⃣ Live Tracking (User)

**Layout**
- Map: user pin, provider moving, route line.
- Card: provider avatar, name, distance, ETA.
- Buttons: Call provider, Chat, Cancel service.

**Inputs:** None (user actions only).  
**Outputs:** Provider position, distance, ETA (updated).  
**Navigation:** Cancel → Home. Completion → Service Completion.  
**Components:** `MapView`, `TrackingCard`, `ActionButtons`.

---

### 9️⃣ Service Completion (User)

**Layout**
- Summary: service type, provider name, price paid.
- Provider info (avatar, name, rating).
- Rate: stars + optional review text.
- Button: Submit rating.

**Inputs:** Star rating, review text (optional).  
**Outputs:** Summary (service, provider, price).  
**Navigation:** Submit → Home or History.  
**Components:** `SummaryCard`, `RatingStars`, `TextArea`, `Button`.

---

### 🔟 Mechanic Dashboard

**Layout**
- Status toggle: Available | Busy | Offline (segmented or chips, green/gray).
- Stats row: Today’s jobs, Completed, Earnings (cards, white, radius 16, padding 16).
- List: Incoming / active requests (cards with user, distance, issue preview).
- Tap request → Incoming Request screen.

**Inputs:** Status toggle.  
**Outputs:** Stats, list of requests.  
**Navigation:** Request tap → Incoming Request.  
**Components:** `StatusToggle`, `StatCard`, `RequestCard`, `List`.

---

### 1️⃣1️⃣ Incoming Request (Mechanic)

**Layout**
- Map snippet: user location.
- User name, distance, issue description, image (if any).
- Buttons: Accept (green), Reject (outline/gray).

**Inputs:** None (Accept/Reject).  
**Outputs:** User location, distance, description, image.  
**Navigation:** Accept → Navigation to User. Reject → back to Dashboard.  
**Components:** `MiniMap`, `RequestDetailCard`, `Button`.

---

### 1️⃣2️⃣ Navigation (Mechanic)

**Layout**
- Full-screen map with route to user and user marker.
- Card: distance, ETA, user name.
- Button: Start navigation (open system maps or in-app).

**Inputs:** None.  
**Outputs:** Route, distance, ETA.  
**Navigation:** Arrive → Completion screen.  
**Components:** `MapView`, `RouteCard`, `Button`.

---

### 1️⃣3️⃣ Completion (Mechanic)

**Layout**
- Form: Repair notes (textarea), Service cost (numeric input).
- Button: Complete service.

**Inputs:** Repair notes, service cost.  
**Outputs:** None (submit to backend).  
**Navigation:** Submit → Dashboard.  
**Components:** `TextArea`, `Input`, `Button`.

---

### 1️⃣4️⃣ Tow Truck Dashboard

**Layout**
- Similar to Mechanic: status toggle, stats (Active towing, Completed).
- List of incoming/active tow requests.

**Inputs:** Status toggle.  
**Outputs:** Stats, request list.  
**Navigation:** Request → Incoming Request (Tow).  
**Components:** Same pattern as Mechanic.

---

### 1️⃣5️⃣ Incoming Request (Tow)

**Layout**
- Vehicle type, breakdown location, distance.
- Buttons: Accept, Reject.

**Inputs:** None.  
**Outputs:** Vehicle type, location, distance.  
**Navigation:** Accept → Navigation. Reject → Dashboard.  
**Components:** `RequestDetailCard`, `MiniMap`, `Button`.

---

### 1️⃣6️⃣ Navigation (Tow) & Completion (Tow)

**Navigation screen:** Same as Mechanic (map, route, user).  
**Completion screen:** Inputs: Tow distance, Service price. Button: Complete.

---

### 1️⃣7️⃣ Car Rental Dashboard

**Layout**
- Tabs or sections: Available cars, Active rentals.
- Cards: car image, name, price per day, availability.
- FAB or button: Add car (→ Car Management).

**Inputs:** None (list view).  
**Outputs:** List of cars, active rentals.  
**Navigation:** Add car → Car Management. Car tap → Edit. Booking request → Booking Request screen.  
**Components:** `CarCard`, `List`, `FAB`.

---

### 1️⃣8️⃣ Car Management

**Layout**
- Form: Car name, Car photos (multi), Price per day, Availability toggle.
- Buttons: Save, Delete (if edit).

**Inputs:** Car name, photos, price per day, availability.  
**Outputs:** None (persist to backend).  
**Navigation:** Save → Dashboard.  
**Components:** `Input`, `ImagePicker`, `Switch`, `Button`.

---

### 1️⃣9️⃣ Booking Request (Rental)

**Layout**
- User name, rental period (dates), pickup location.
- Buttons: Accept booking, Reject booking.

**Inputs:** None.  
**Outputs:** User name, period, location.  
**Navigation:** Accept/Reject → Dashboard.  
**Components:** `BookingRequestCard`, `Button`.

---

### 2️⃣0️⃣ Admin Dashboard

**Layout**
- Stats row: Total users, Total providers, Active requests, Completed services (4 cards).
- Section: Recent activity or quick links.
- Button/link: Admin map, Analytics, User/Provider lists.

**Inputs:** None.  
**Outputs:** All four stats.  
**Navigation:** Links to Admin Map, Analytics, lists.  
**Components:** `StatCard` (x4), `LinkRow`.

---

### 2️⃣1️⃣ Admin Map

**Layout**
- Full-screen map with all providers (markers by type).
- List or panel: provider list with status.
- Actions per provider: Suspend, Disable account, Change status.

**Inputs:** Status change, suspend/disable actions.  
**Outputs:** All providers on map, provider list.  
**Navigation:** Back to Dashboard.  
**Components:** `MapView`, `ProviderMarker`, `ProviderList`, `ActionMenu`.

---

### 2️⃣2️⃣ Admin Analytics

**Layout**
- Requests per day (chart or list).
- Revenue statistics (chart or summary).
- Optional date range filter.

**Inputs:** Date range (optional).  
**Outputs:** Chart data, totals.  
**Components:** `BarChart` / `LineChart`, `StatCard`.

---

## 4. Navigation Flow (Summary)

```
Splash → Onboarding → Login/Register → Location Permission
    → [Role-based root]

User:    Home (Map) ⇄ Request Service → Live Tracking → Service Completion → Home
         Home ⇄ Profile, Notifications, Settings, Chat

Mechanic: Dashboard ⇄ Incoming Request → Navigation → Completion → Dashboard

Tow:     Dashboard ⇄ Incoming Request → Navigation → Completion → Dashboard

Rental:  Dashboard ⇄ Car Management, Booking Request

Admin:   Dashboard ⇄ Admin Map, Analytics, User List, Provider List
```

---

## 5. Component Suggestions

| Component | Purpose |
|-----------|--------|
| `ScreenContainer` | Safe area, background, padding |
| `Card` | White, radius 16, padding 16, shadow |
| `Button` | Primary (green), secondary (outline), large tap |
| `Input` | Rounded, leading icon, placeholder |
| `SearchBar` | Rounded, magnify icon, clear button |
| `FilterChips` | Horizontal scroll, green when selected |
| `ProviderCard` | Avatar, name, type icon, rating, distance, status, actions |
| `ProviderMarker` | Map marker with type icon (wrench/tow-truck/car), color by status |
| `StatusToggle` | Available / Busy / Offline (segmented) |
| `StatCard` | Number + label, white card |
| `BottomSheet` | Rounded top, handle, scrollable content |
| `RatingStars` | 5 stars (full/half/empty) |
| `EmptyState` | Illustration + title + subtitle + optional CTA |
| `LoadingState` | Skeleton or spinner + message |
| `Illustration` | Reusable empty/onboarding art |

---

## 6. Additional UX (Implementation Notes)

- **Provider rating:** Show stars on provider card and completion screen; submit rating + optional review after service.
- **Favorites:** List of saved providers; add/remove from provider profile or card.
- **Push notifications:** Request accepted, provider en route, message received; permission screen and settings toggle.
- **Live tracking:** Poll or WebSocket for provider location; update map and ETA.
- **Chat:** Simple conversation screen (provider ↔ user); list + detail; optional push on new message.
- **ETA:** Display on Request (estimate) and Live Tracking (dynamic); backend or client calc from distance/speed.
- **Loading states:** Skeleton for lists and cards; spinner for map and submit actions.
- **Empty states:** Illustration + “No requests yet” / “No providers nearby” + CTA where relevant.

---

## 7. Alignment with Codebase

- **Green theme:** Use existing `primary` (#22C55E), `primaryDark` (#16A34A). Add `primaryLight` / `successLight` for light green surfaces.
- **Cards:** Use `radii.lg` (16), `shadows.md`, `surface` background, `spacing.md` (16) padding.
- **Buttons:** Use `Button` with `primary` variant; ensure min height 48.
- **Icons:** Use `MaterialCommunityIcons` (wrench, tow-truck, car-side, account, map-marker, phone, star, message-text, etc.).
- **Screens:** Map to existing `*Screen.tsx` and stacks (CustomerStack, MechanicStack, TowStack, RentalStack, AdminStack); add or rename screens to match this spec where needed.

This document is the single source of truth for building a modern, green-themed, role-full UX comparable to top ride-service apps.
