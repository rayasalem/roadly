# Opening Screens Design: Splash, Onboarding, Welcome

**App:** On-demand car services (User, Mechanic, Tow Truck, Car Rental)  
**Theme:** Green — consistent across all screens.  
**Goal:** Highly engaging first impression; motivate sign-up and first use.

---

## 1. Splash Screen

### Marketing copy / tagline (rotate or pick one)

| Option | Copy |
|--------|------|
| A | **Your car's best friend, anytime, anywhere!** |
| B | **Fast. Reliable. On-demand car services.** |
| C | **From a tow to a tune-up, we've got you covered.** |
| D | **One tap. Real help. Every time.** |

**Recommendation:** Use **A** or **C** for emotion; **B** for clarity. Can A/B test or rotate on each launch.

### Visual design

- **Background:** Green gradient (e.g. `#22C55E` → `#16A34A`), full screen.
- **Logo:** Centered; primary white or light green tint.
- **Optional:** Subtle geometric shapes or soft circles in a lighter green for depth.

### Illustration / animation ideas

- **Logo animation:** Scale-in + light fade (0.8 → 1, 400–600 ms); optional gentle pulse once.
- **Background:** Very subtle gradient shift or soft particle/dot motion (low opacity).
- **Loading:** Thin progress bar or circular indicator in white at bottom; avoid “loading” text unless necessary.
- **No illustration** on splash — keep it minimal so it feels fast and premium.

### Buttons

- None on splash; auto-advance after ~2 s or when app ready.

### Micro-interactions

- Logo appears with spring scale (slight overshoot to 1.02 then 1).
- If showing tagline: fade in 200 ms after logo.
- Optional: small “sparkle” or checkmark that draws when load completes before transition.

---

## 2. Onboarding Screen 1 — Mechanic Service

### Marketing copy

**Headline (short):**  
**Find skilled mechanics instantly, wherever you are!**

**Supporting line (optional):**  
*Car trouble? We bring the experts to your door!*

### Visual design

- **Background:** Soft gray `#F3F4F6` or very light green tint `#F0FDF4`.
- **Card/surface:** White card (radius 16px, padding 16px, soft shadow) for text if needed; or text over background.

### Illustration ideas

- **Option A:** Flat illustration — mechanic in uniform with 🔧 next to a car (hood open or wheel); friendly, simple shapes; green accents on clothes or tools.
- **Option B:** Isometric scene — small car, mechanic with wrench, “ping” or location pin to suggest “we come to you.”
- **Option C:** Icon-led — large 🔧 icon (or custom wrench icon) with small car silhouette; minimal, modern.
- **Style:** Rounded shapes, limited palette (green + gray + white), no heavy realism.

### Animation ideas

- Illustration: gentle float (translateY 2–4px loop) or fade-in on mount.
- Wrench icon: subtle rotate (e.g. -5° → 5°) on loop for “working” feel.
- Car: optional tiny “engine glow” or checkmark that appears after 1 s.

### Buttons

| Label | Placement | Style |
|-------|-----------|--------|
| **Next** | Bottom right or center | Primary green, rounded, min height 48px |
| **Skip** | Top right (text) or bottom left | Text button, gray or dark gray |

### Icons

- **Service:** 🔧 or custom wrench icon (green when active).
- **Decorative:** Small map-pin or “location” dot to reinforce “wherever you are.”

### Micro-interactions

- Swipe left to next screen (with rubber-band).
- Next: scale press (0.97) on tap.
- Skip: subtle underline on press.
- Page indicator: dot 1 filled (green), 2 and 3 outline.

---

## 3. Onboarding Screen 2 — Tow Truck Service

### Marketing copy

**Headline:**  
**Stranded? A tow truck is just a tap away!**

**Supporting line:**  
*Quick, safe, and reliable roadside assistance.*

### Visual design

- Same as screen 1: soft background, white card optional; green only for CTA and accents.

### Illustration ideas

- **Option A:** Tow truck 🚛 (stylized) approaching a small car on a road; soft clouds or “help is coming” vibe.
- **Option B:** Phone in hand with “Request tow” UI; truck icon moving toward a pin on map.
- **Option C:** Large 🚛 icon + “1 tap” badge or finger tap icon; minimal.
- **Style:** Same as screen 1 — rounded, green accents, friendly.

### Animation ideas

- Tow truck: slow move from left to right (e.g. 20px over 3 s loop) to suggest “on the way.”
- Optional: small “road” line that draws in or subtle dust/dots behind truck.
- Text: stagger fade-in (headline first, then supporting line).

### Buttons

| Label | Placement | Style |
|-------|-----------|--------|
| **Next** | Bottom right or center | Primary green |
| **Skip** | Top right or bottom left | Text |

### Icons

- **Service:** 🚛 or custom tow-truck icon (green accent).
- **Trust:** Optional small shield or checkmark for “safe, reliable.”

### Micro-interactions

- Same swipe, press, and page indicator as screen 1 (dot 2 filled).

---

## 4. Onboarding Screen 3 — Car Rental Service

### Marketing copy

**Headline:**  
**Need a car? Rent with ease in minutes!**

**Supporting line:**  
*Choose your ride and get moving instantly.*

### Visual design

- Same system; keep green and white consistent.

### Illustration ideas

- **Option A:** Happy user with keys and a car 🚗; “ready to go” feeling.
- **Option B:** Row of 2–3 car silhouettes (different types) with one highlighted in green.
- **Option C:** Large 🚗 icon + “minutes” or clock icon; focus on speed and simplicity.
- **Style:** Same rounded, green-accent style.

### Animation ideas

- Car(s): slight bounce on mount or gentle horizontal slide.
- Keys: optional jingle motion (rotate 5° back and forth).
- “Get Started” button: can have a subtle glow or pulse to draw attention.

### Buttons

| Label | Placement | Style |
|-------|-----------|--------|
| **Get Started** | Bottom center | Primary green, full-width or prominent |
| **Skip** | Top right | Text (only if not on last screen) |

### Icons

- **Service:** 🚗 or car icon (green accent).
- **Speed:** Optional small clock or “fast” icon next to “minutes.”

### Micro-interactions

- Swipe or tap “Get Started” → Welcome or Login/Register.
- Get Started: scale press + optional haptic; transition to next screen (e.g. fade or slide).

---

## 5. Welcome / Sign-up Screen

### Marketing copy

**Headline (optional):**  
**Join thousands of drivers and car owners today!**

**Subhead:**  
*Fast, easy, and secure car services at your fingertips.*

**Alternative headline:**  
**You're one tap away from help.**

**Alternative subhead:**  
*Mechanics, tows, and rentals — all in one app.*

### Visual design

- **Background:** Soft gray or very light green; optional gradient at top (green → transparent).
- **Card:** White card (radius 16px, shadow, padding 24px) containing logo/brand, copy, and buttons.
- **Buttons:** Primary green for main CTA; outline or secondary for Login; text for Guest if needed.

### Illustration ideas

- **Option A:** Happy user (illustration) holding phone with app open; small icons 🔧🚛🚗 around.
- **Option B:** Abstract “community” — multiple small avatars or cars in a circle; “thousands” feel.
- **Option C:** App mockup or phone frame with map and one provider card; “real” preview.
- **Style:** Same friendly, rounded, green-accent style; avoid clutter.

### Animation ideas

- Card: slide up from bottom (or fade-in) when screen mounts.
- Illustration: fade-in after card.
- Buttons: stagger (Sign Up → Login → Guest) 80 ms apart for polish.

### Buttons

| Label | Placement | Style |
|-------|-----------|--------|
| **Sign Up** | First in stack | Primary green, full-width, rounded |
| **Login** | Second | Outline green or secondary |
| **Continue as Guest** | Third or link | Text, gray |

### Icons

- Optional: small 🔧🚛🚗 under headline or in illustration.
- Buttons: optional leading icon (person for Sign Up, login for Login).

### Micro-interactions

- All buttons: scale on press (0.97).
- Sign Up / Login: navigate to respective screens with slide or fade.
- Guest: light feedback then enter app (e.g. map home) with limited features.

---

## 6. Green Theme Consistency

- **Primary green** `#22C55E`: CTAs (Next, Get Started, Sign Up), active dot, key illustration accents.
- **Dark green** `#16A34A`: Gradient end on splash; pressed state.
- **Light green** `#D1FAE5`: Optional background tints, badges.
- **White** `#FFFFFF`: Cards, logo area, button text.
- **Soft gray** `#F3F4F6`: Screen backgrounds.
- **Text:** Dark gray/black for headlines; `#6B7280` for supporting copy.

---

## 7. Copy Summary & i18n Keys

All copy is available in `src/shared/i18n/strings.ts` (EN + AR). Use these keys:

| Screen | Copy | i18n key |
|--------|------|----------|
| Splash | Tagline (rotate) | `splash.tagline1` … `splash.tagline4` |
| Onboarding 1 | Headline | `onboarding.mechanic.title` |
| Onboarding 1 | Subline | `onboarding.mechanic.subtitle` |
| Onboarding 2 | Headline | `onboarding.tow.title` |
| Onboarding 2 | Subline | `onboarding.tow.subtitle` |
| Onboarding 3 | Headline | `onboarding.rental.title` |
| Onboarding 3 | Subline | `onboarding.rental.subtitle` |
| Onboarding | Next | `onboarding.cta.next` |
| Onboarding | Skip | `onboarding.cta.skip` |
| Onboarding 3 | Primary CTA | `onboarding.cta.getStarted` |
| Welcome | Headline | `welcome.headline` |
| Welcome | Subtitle | `welcome.subtitle` |
| Welcome | Sign Up | `welcome.signUp` |
| Welcome | Login | `welcome.login` |
| Welcome | Guest | `welcome.continueAsGuest` |

---

## 8. Service Icons (consistent across app)

- **Mechanic:** 🔧 or `wrench` (MaterialCommunityIcons)
- **Tow truck:** 🚛 or `tow-truck`
- **Car rental:** 🚗 or `car-side`

Use the same icons in onboarding illustrations and in-app (filters, markers, cards) for a cohesive green-themed experience.
