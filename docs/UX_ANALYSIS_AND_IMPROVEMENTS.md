# UI/UX Analysis & Improvement Recommendations

**Document type:** Product design & mobile UX review  
**Application:** Roadly (React Native + Expo, Web)  
**Benchmarks:** Uber, Airbnb, Bolt, Careem  
**Author perspective:** Senior product designer & mobile UX expert  

---

## Executive summary

Roadly follows a **role-based, stack-based navigation** model with a **map-first** customer journey. The structure is clear and the use of glassmorphism, role themes, and bottom sheets aligns with modern on-demand apps. Gaps exist in **entry-point clarity**, **reduced-tap flows**, **consistent bottom navigation**, **empty states**, and **progressive disclosure**. This document evaluates each area and proposes concrete improvements inspired by Uber, Airbnb, Bolt, and Careem.

---

## 1. Navigation structure

### Current state

- **Root:** Launch → Welcome → Login / Register → App (RoleNavigator).
- **Customer:** Stack with Home, Map, Request, Profile, Chat, Notifications, Settings; **bottom nav** with 5 tabs (Home, Chat, Notifications, Profile, Settings). Map is **not** in the tab bar; it’s reached via Home “Nearest Locations” or (for other roles) FAB/card.
- **Provider roles (Mechanic, Tow, Rental):** Dedicated stack (Dashboard, Services, Skills, Map, Profile); no bottom nav, back + header profile + FAB.
- **Admin:** Stack with Dashboard, AdminUsers, Map, Profile; tabs on dashboard (Mechanic / Tow / Rental).

**Strengths**

- Role-based stacks avoid showing irrelevant screens.
- Single “App” entry after auth keeps mental model simple.
- Custom headers and FABs give each role a clear primary action (e.g. Open Map).

**Issues**

1. **Map not in Customer tab bar**  
   Map is a core screen (find providers) but requires: Home → “Nearest Locations” or a rider card. Uber/Bolt/Careem put “Map” or “Find” as a primary tab so the main action is one tap from anywhere.

2. **Request screen has no bottom nav**  
   Customer can’t switch to Home, Profile, or Map from Request without Back or header Profile. This breaks the “always one tap from main areas” pattern and can feel like a dead end.

3. **Home tab does nothing when already on Home**  
   Tapping Home on Home is a no-op. Common pattern (Uber, Careem) is “scroll to top” or “refresh” to give feedback.

4. **Inconsistent “Map” access**  
   Customer: from Home card. Provider: from GlassCard + FAB. Admin: from card + FAB. Same concept, different entry points; consider a consistent “Map” tab or always-visible map entry for roles that need it.

5. **Deep stacks without breadcrumbs**  
   Customer can go Home → Map → Request; provider can go Dashboard → Services/Skills. No breadcrumb or “where am I” beyond header title; fine for 2–3 levels but worth watching as flows grow.

### Recommendations

| # | Recommendation | Rationale |
|---|----------------|-----------|
| N1 | Add **Map as a tab** in Customer bottom nav (e.g. replace or reorder to: Home, Map, Request/Activity, Profile, More). | Matches Uber/Careem: primary action (find/service) is one tap away. |
| N2 | Show **bottom nav on Request screen** (Customer) so user can go to Home, Map, or Profile without going back. | Reduces “trapped” feeling and supports multi-tasking (e.g. check request then open map). |
| N3 | On Home tab press when already on Home: **scroll to top** or **pull-to-refresh** and show a short haptic/toast. | Gives clear feedback and matches common ride-hailing behavior. |
| N4 | Consider a **floating “Request help” / CTA** on Map that goes straight to Request (with default or selected provider) to shorten the flow. | Reduces taps from “see provider → open sheet → Request” to “see provider → one CTA”. |

---

## 2. Dashboard usability

### Customer Home

- **Layout:** Header (“Start your journey”), two disabled pickup/destination inputs, two dark cards (Nearest Locations, Saved Places), “Nearby Riders” list, bottom nav.
- **Issues:**  
  - Pickup/destination are **non-interactive** (editable={false}); look tappable but do nothing. Uber/Bolt use these as the main search/where-to.  
  - **Saved Places** has no onPress; creates confusion.  
  - **Nearby Riders** all navigate to Request with same `serviceType: 'mechanic'`; no differentiation for tow vs rental.  
  - No personalization (e.g. “Hi, [Name]”) or quick actions (e.g. “Repeat last request”).

### Provider dashboards (Mechanic, Tow, Rental)

- **Layout:** GlassCard with stats (e.g. jobs today, on the way, rating), “Open Map” CTA, “Who requested me” list, two cards (My Services, My Skills), filter chips, job/vehicle list, FAB (Map).
- **Strengths:** Clear hierarchy, role color coding, FAB always visible.
- **Issues:**  
  - “Who requested me” and “Active requests” are both list-heavy; on small screens the dashboard can feel long before the main action (jobs/vehicles).  
  - No **pull-to-refresh** on lists.  
  - Accept/Decline are mock-only and don’t update list; users may think the app is broken.  
  - No empty states (e.g. “No jobs yet” with illustration and CTA).

### Recommendations

| # | Recommendation | Rationale |
|---|----------------|-----------|
| D1 | Make **pickup/destination** tappable: open location search or Map with search focused. If not ready, use placeholder screen or hide until feature exists. | Aligns with Uber/Careem: “where to?” is the core input. |
| D2 | **Saved Places:** Either wire to a “Saved places” screen or remove the card until the feature exists. | Avoids dead affordances. |
| D3 | **Nearby Riders:** Differentiate by service type (mechanic / tow / rental) and pass correct `serviceType` from each card; consider small icon or label per type. | Matches user intent and reduces wrong-request confusion. |
| D4 | Add **greeting** on Home: “Hi, [Name]” and optional “Where to?” or “Get help” CTA. | Personalization and clear next step (Airbnb/Uber style). |
| D5 | Add **pull-to-refresh** on provider dashboards (and Customer Home if list is dynamic). | Expected on list-based screens. |
| D6 | Add **empty states** for “No jobs”, “No vehicles”, “No requests” with illustration + short copy + CTA (e.g. “Open Map” or “You’ll be notified when…”). | Reduces confusion and guides next action (Airbnb-style). |
| D7 | Show a **clear “live” or “new” indicator** (e.g. badge) for new requests so providers know when to refresh or are taken to the right tab. | Critical for time-sensitive roles (Bolt/Careem driver apps). |

---

## 3. Map interaction

### Current state

- Full-width map with floating search, filter chips (All / Mechanic / Tow / Rental), my-location button, bottom card (nearest provider + “Request Service” which opens sheet). Markers open ProviderBottomSheet.
- **Strengths:** Filters, search bar, my location, bottom card and sheet are in line with ride-hailing maps.

**Issues**

1. **“Request Service” on bottom card** opens the sheet instead of going straight to Request; user must tap again in the sheet. Uber/Careem often have “Confirm” or “Request” on the bottom card that completes the action in one tap when context is clear.
2. **Search** does not move the map (fetchPlaceCoordinates is stub); users may think search is broken.
3. **Calendar icon** in header has no action; looks interactive but does nothing.
4. **No ETA or distance** on the bottom card for “nearest”; only name + “Nearest”. Showing “~2 min” or “1.2 km” would set expectations (Uber style).
5. **No loading skeleton** for the bottom card while providers load; empty state appears abruptly.
6. **Native vs web:** Native has no mock fallback when API returns empty (empty markers); web has fallback. Inconsistent and can make native feel broken.

### Recommendations

| # | Recommendation | Rationale |
|---|----------------|-----------|
| M1 | **One-tap request from bottom card:** Add a primary “Request [Provider name]” that goes straight to Request with that provider’s service type (and optionally prefill provider). Keep “View details” or tap card to open sheet. | Matches Uber “Confirm pickup” / Careem “Book” on bottom card. |
| M2 | **Bottom card content:** Show distance and/or ETA to nearest provider (e.g. “1.2 km • ~5 min”) and keep provider name and role. | Sets expectations and increases trust. |
| M3 | **Search:** Implement place selection → move map (fetchPlaceCoordinates or geocode) or show “Coming soon” so the control doesn’t look broken. | Aligns perceived and actual behavior. |
| M4 | **Calendar icon:** Either link to “Schedule for later” / bookings or use `rightIcon="none"` until the feature exists. | Removes false affordance. |
| M5 | **Loading state:** Skeleton or shimmer for the bottom card while `isLoadingProviders`; same for provider list if present. | Smoother perceived performance. |
| M6 | **Native map:** Use the same fallback as web (e.g. mock providers when API returns empty) so both platforms behave consistently. | Consistent UX and avoids “no markers” confusion. |

---

## 4. Provider selection flow

### Current state

- User taps marker → sheet opens (avatar, name, role, status, rating, Open Map, Request service).
- **Strengths:** Sheet is clear, role-themed, two actions (recenter map, request). Pan-to-close and handle are good.

**Issues**

1. **Two taps to request:** Tap marker → tap “Request service”. For “I want this provider” the ideal is one tap from sheet or one tap from bottom card (see M1).
2. **No distance/ETA in sheet;** only in bottom card (and currently not shown). Adding distance/ETA in sheet would help.
3. **No “Call” or “Chat”** even as placeholder; real apps often offer contact from the same context.
4. **Sheet doesn’t show “price” or “from”** (e.g. “From 25 AED”); if pricing exists later, this is the right place (Uber/Careem).
5. **Accessibility:** Sheet content should be announced when opened (e.g. “Provider [name], [role], [status]. Request service button.”).

### Recommendations

| # | Recommendation | Rationale |
|---|----------------|-----------|
| P1 | **Single-tap request:** Ensure one clear path: either “Request” on bottom card goes to Request with nearest, or sheet has one prominent “Request [Provider]” CTA that navigates and closes sheet. | Minimizes taps for the main conversion. |
| P2 | **Distance/ETA in sheet:** Show “X km away” and optionally “~Y min” in the provider sheet. | Reuses same expectation-setting as map bottom card. |
| P3 | **Contact:** Add “Call” or “Chat” (or “Contact”) in sheet when backend supports it; until then, optional “Coming soon” or hide. | Prepares for trust and support (Uber/Careem). |
| P4 | **Pricing (when available):** Add “From [price]” or price range in sheet and bottom card. | Reduces surprise and supports conversion. |
| P5 | **Accessibility:** Add `accessibilityLabel` and `accessibilityHint` on sheet title and main CTA; ensure focus moves into sheet when it opens. | Better for screen-reader and switch-control users. |

---

## 5. Service request flow

### Current state

- Entry: Home (rider card) or Map (sheet “Request service”). Request screen shows service type, “Create request” button, then “Current request” with status and buttons (Accepted, On the way, Completed, Cancelled).
- **Strengths:** Single screen for create + status; status buttons are clear.

**Issues**

1. **No bottom nav on Request:** User can’t go to Map or Home without back or header Profile; feels like a separate funnel.
2. **No confirmation step** before “Create request” (e.g. “You’re requesting [Mechanic] at [location]. Confirm?”). Uber/Careem often show a summary before “Confirm”.
3. **No progress or timeline** (e.g. “Request sent → Finding provider → Provider accepted → On the way”). Visual timeline would reduce anxiety.
4. **Location** is implicit (current coords or fallback); user doesn’t see “Help at [address or pin]”. Showing a small map or address would build trust.
5. **Error state** is text only; no retry button or illustration.
6. **No “Cancel request”** in a prominent place before provider is assigned (only status “Cancelled” after creation). Pre-assignment cancel is standard in ride-hailing.

### Recommendations

| # | Recommendation | Rationale |
|---|----------------|-----------|
| R1 | **Bottom nav on Request:** Add the same Customer bottom nav on Request so user can switch to Home, Map, or Profile. | Consistency and escape hatch (see N2). |
| R2 | **Pre-create confirmation:** Optional step: “Request [Mechanic/Tow/Rental] at [address or map pin]. [Edit location] [Cancel] [Confirm request].” | Reduces mis-taps and sets expectations (Uber/Careem). |
| R3 | **Request timeline:** Add a vertical or horizontal timeline (Request sent → Accepted → On the way → Completed) with current step highlighted. | Clear status and reduces support questions. |
| R4 | **Show location:** Display “Help at [address]” or a small static map with pin; allow “Change location” if product supports it. | Transparency and trust. |
| R5 | **Error + retry:** On create or update error, show short message + “Try again” button and keep form state. | Recoverable UX. |
| R6 | **Cancel before assign:** If backend supports it, show “Cancel request” prominently while status is “pending”; after accept, show “Cancel” with possible consequences. | Matches user mental model (Bolt/Careem). |

---

## 6. Admin panel usability

### Current state

- Single dashboard: global stats, “Manage users” card, tabs (Mechanic / Tow / Rental), per-tab filters and lists, FAB and card “Open Map”. Tapping a request/vehicle opens a sheet with Open Map and Edit/Update Status (Edit only closes sheet).
- **Strengths:** One screen for all roles; tabs and filters reduce clutter; GlassCard and role colors aid scanning.

**Issues**

1. **Edit / Update Status** in sheet does nothing meaningful (TODO); admins may think they can edit from here.
2. **Add vehicle** (Rental tab) has no handler; same dead-affordance issue.
3. **Dense layout:** Many cards and lists; on small screens prioritization of “what to do first” could be clearer (e.g. “Pending actions” or “Needs attention” at top).
4. **No search** in user list (Admin Users); with many users, find-by-name would help.
5. **No bulk actions** (e.g. multi-select to assign or export); lower priority but common in admin tools.
6. **Chart** (if present) has no clear purpose or time range; could be “Requests last 7 days” or “By status”.

### Recommendations

| # | Recommendation | Rationale |
|---|----------------|-----------|
| A1 | **Implement or hide Edit:** Either implement edit/update status (e.g. modal or navigate to edit screen) or remove the button and show “View only” until ready. | Avoids confusion and support load. |
| A2 | **Add vehicle:** Implement “Add vehicle” flow or replace with “Coming soon” / disable with tooltip. | Same as above. |
| A3 | **Priority block:** Add “Requires attention” or “Pending” (e.g. unassigned requests, expiring items) at top of dashboard. | Speeds up admin workflow (Airbnb host dashboard style). |
| A4 | **Search in Admin Users:** Add search by name/email with debounced filter. | Essential at scale. |
| A5 | **Chart:** Give chart a title and time range (e.g. “Requests last 7 days”); use consistent colors with role themes. | Clarifies meaning. |

---

## 7. Benchmark comparison (Uber, Airbnb, Bolt, Careem)

| Dimension | Roadly (current) | Uber / Bolt / Careem | Airbnb | Recommendation |
|-----------|------------------|----------------------|--------|----------------|
| **Primary action visibility** | Map behind Home card | Map or “Where to?” as tab or hero | Search as hero | N1: Map as tab or hero CTA |
| **Request in 2 taps** | 2–3 (card → sheet → Request) | 1–2 (bottom bar “Confirm”) | N/A | M1, P1: One-tap from card/sheet |
| **Bottom nav consistency** | Missing on Request | Present on all main screens | Tab bar on main flows | N2, R1: Nav on Request |
| **Empty states** | Missing or minimal | Illustration + copy + CTA | Strong empty states | D6: Add empty states |
| **Location clarity** | Implicit | “Pickup at X”, map snippet | “Where to?” + map | R4: Show “Help at [location]” |
| **Request status** | Text + buttons | Timeline + map (driver moving) | Booking timeline | R3: Request timeline |
| **Provider card** | Name, role, status, rating | + ETA, distance, price | + price, reviews | M2, P2, P4: ETA, distance, price |
| **Admin “what’s next”** | Flat lists | Alerts / priority section | Host to-do, messages | A3: “Requires attention” |
| **Dead affordances** | Saved Places, calendar, some buttons | Rare; or “Coming soon” | Clear disabled vs coming soon | D2, M4, A1, A2: Wire or hide |

---

## 8. Specific UI/UX improvements (prioritized)

### P0 – Critical for conversion and clarity

1. **Map as primary tab (Customer)** or hero “Find help” that opens Map.
2. **One-tap request** from map bottom card or provider sheet (nearest or selected provider).
3. **Bottom nav on Request screen** so user can leave without back.
4. **Remove or implement** Saved Places, calendar icon, Edit/Add vehicle, and other no-op controls (or show “Coming soon”).
5. **Distance/ETA** on map bottom card and in provider sheet.
6. **Empty states** for no providers, no jobs, no vehicles, with illustration + CTA.

### P1 – High impact

7. **Request timeline** (Request sent → Accepted → On the way → Completed).
8. **Pre-create confirmation** for request (location + service type summary).
9. **Pull-to-refresh** on Home and provider dashboards.
10. **“Help at [location]”** (and optional small map) on Request screen.
11. **Error + Retry** on Request create/update.
12. **Home tab:** scroll-to-top or refresh when tapping Home on Home.
13. **Nearby Riders:** pass correct `serviceType` per card and show type (mechanic/tow/rental).
14. **Admin:** Implement or hide Edit and Add vehicle; add “Requires attention” block.

### P2 – Polish and consistency

15. **Loading skeletons** for map bottom card and lists.
16. **Native map** mock fallback when API returns empty (match web).
17. **Search:** implement place→map move or “Coming soon”.
18. **Greeting** on Home (“Hi, [Name]”).
19. **Contact** (Call/Chat) in provider sheet when backend supports it.
20. **Admin Users** search by name/email.
21. **Accessibility:** labels and hints on provider sheet and main CTAs.
22. **Chart** on Admin: title and time range.

---

## 9. Summary

- **Navigation:** Make Map and Request part of a consistent tab/escape model; add bottom nav on Request; fix Home-tab feedback.
- **Dashboards:** Make Home inputs and Saved Places either functional or clearly non-interactive; add empty states, refresh, and clear service-type differentiation for riders.
- **Map:** One-tap request from bottom card, distance/ETA, loading state, and consistent fallback on native.
- **Provider sheet:** One-tap request, distance/ETA, optional price and contact; improve accessibility.
- **Request flow:** Bottom nav, optional confirmation step, timeline, visible location, retry on error, and cancel-before-assign when supported.
- **Admin:** Resolve Edit and Add vehicle; add priority block and user search; clarify chart.

Applying the P0 and P1 items will bring the experience close to the clarity and conversion patterns of Uber, Bolt, Careem, and Airbnb while keeping the current architecture and role model intact.
