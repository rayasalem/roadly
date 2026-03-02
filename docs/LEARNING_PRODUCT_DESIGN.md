# Learning Product Design — How to Think Before You Design

**For:** Beginners building a location-based app (mechanics, tow, car rental).  
**Goal:** Understand *why* designers make decisions, not just *what* they build.

---

## 1. How I think before designing

Before I pick colors or place buttons, I ask a few questions. This is **design thinking**: start with the problem and the user, not with the solution.

### Step 1: Who is using this and what do they want?

- **User (driver):** "I'm stuck. I need a mechanic or a tow *now*." They are stressed, maybe on the roadside. They want: **speed**, **clarity**, **trust** that someone is coming.
- **Mechanic / Tow / Rental provider:** They want: **simple requests**, **clear location**, **one tap to accept or decline**.

So from the start I know: the app must feel **calm and clear**, not noisy. Every screen should answer: "What do I do next?" without making the user think.

### Step 2: What is the one thing the app must do well?

If the app does only one thing, it's: **"Show me who can help me nearby, and let me request them fast."**

So the **home screen is not a menu**. It's the place where that one thing happens: **see nearby help on a map and act on it.** That’s why we go **map-first**: the map *is* the home.

### Step 3: What do successful apps in this space do?

I look at Uber, Careem, Google Maps:

- They put the **map in the center**.
- They use **one main button** (e.g. "Request", "Book").
- They use **bottom sheets** for lists and details so you don’t lose the map.

I’m not copying them for the sake of it; they’ve already learned that this pattern **reduces steps and feels familiar**. So I reuse the pattern and adapt it to "mechanic / tow / rental."

### Step 4: What do I want to avoid?

- **Too many colors** → looks unprofessional, distracts from "Request" and "Where is help?"
- **Too many buttons** → user doesn’t know what to tap.
- **Full-screen lists** → user loses the map and the sense of "nearby."
- **Asking for location too early** → user doesn’t yet know why we need it.

So before I design a single screen, I already have: **user goal**, **one main job of the app**, **patterns that work**, and **things to avoid**. That’s how I think *before* designing.

---

## 2. Why I choose specific colors

Colors are not "what looks nice." They do a **job**: guide attention, create trust, and show what’s clickable.

### One primary color (e.g. blue #0066CC)

- **Why one?** If everything is colored, nothing stands out. One main color says: "This is our brand, and this is the main action."
- **Why blue?** In many cultures, blue = trust, reliability, calm. For "someone is coming to help you," that’s useful. It’s also used by many global apps (e.g. Facebook, LinkedIn, banks), so it feels **familiar**.
- **Why not red for "Request"?** Red = danger or stop. We want "request help" to feel safe and clear, not alarming. So we use the same blue for the main button.

### Neutrals (grays) for almost everything else

- **Why grays?** Text, borders, and backgrounds need to be **readable and calm**. Grays create **hierarchy**: dark gray = important (titles), medium gray = secondary (labels), light gray = hints (placeholders). No extra meaning, no distraction.
- **Why not white background everywhere?** A very slight gray background (#F9FAFB) makes **white cards** stand out and reduces glare. Small difference, but it makes the UI feel softer and more "premium."

### One accent color (e.g. orange) used rarely

- **Why have it?** For things that must stand out *without* being the main CTA: e.g. "Tow" marker on the map, or a "Urgent" badge. So we use it **sparingly**.
- **Why orange/amber?** It’s visible and suggests "attention" or "action" without being as strong as red. Good for "tow truck" or "special type" on the map.

### Summary

- **Primary:** One color for brand + main button → trust and focus.
- **Neutrals:** Grays for hierarchy and readability.
- **Accent:** One extra color, used rarely, for emphasis (e.g. tow, urgent).
- **Semantic:** Green = success, red = error, only where needed.

So: I don’t "pick pretty colors." I pick **one primary** for trust and action, **neutrals** for clarity, and **minimal accent/semantic** for the rest.

---

## 3. Why the home screen is structured that way (map-first + sheet)

The home screen is built around one idea: **"Where is help, and how do I get it?"**

### Why put the map in the center?

- The user’s mental question is: **"Who is near me?"** The map answers that directly. If the home were a list or a menu, they’d have to do an extra step to "see" nearby.
- So: **map = main content**. It’s not a small widget; it’s the whole screen. That’s "map-first."

### Why a bottom sheet for the list of providers?

- We need to show **"Nearest mechanics / tow / rentals"** with distance and ETA. Two options:
  - **Option A:** Open a full new screen with a list. Problem: the map disappears. User loses context ("where am I?").
  - **Option B:** Show the list in a **sheet** that slides up from the bottom. The map stays visible (maybe a bit covered). User can drag the sheet up (more list) or down (more map).
- I choose **Option B** because:
  - The map stays visible → user keeps **context**.
  - It’s a pattern users already know (Uber, maps apps) → **familiar**.
  - One gesture (drag) controls "how much list vs map" → **simple**.

So the structure is: **map = full screen**, **list = sheet on top**. That’s a *reasoning* decision, not a random layout.

### Why filters (Mechanic / Tow / Rental) in the sheet?

- The user might want only "tow" or only "rental." So we need **filters**.
- Putting them **inside the sheet**, near the list, keeps the top of the screen (and the map) clean. The user opens the sheet to see "Nearest" and can change the filter there. So: **filters live with the list**, not floating on the map (which would add clutter).

### Summary

- **Map first** = answer "who is near me?" immediately.
- **Sheet for list** = show options without losing the map.
- **Filters in sheet** = keep map clean, group "what type" with "list of providers."

Every layout choice is to support: **see nearby → choose type → pick provider**, with minimal steps and no loss of context.

---

## 4. How I decide where to put buttons

Buttons are "what can the user do here?" Placement and style tell the user **what matters most**.

### One primary action per screen

- If there are five buttons of the same importance, the user doesn’t know what to tap. So I ask: **"What is the one thing we want them to do on this screen?"**
  - Home (sheet open): **"Request this provider"** or **"Find mechanic"** (if no provider selected).
  - Provider detail: **"Request mechanic"** (or tow/rental).
  - Request sent: **"Call"** or **"See tracking."**
- That one thing gets the **primary button** (filled, primary color). Other actions (Cancel, Back, Contact) are **secondary** (outline or text). So **placement** follows **importance**: main action = most visible and easy to tap.

### Where to put the main button

- **Bottom of the sheet or screen:** The thumb can reach it easily; it’s the "end" of the flow (you read the content, then act). So: primary button at the **bottom** of the content (with safe area), not floating in the middle.
- **Sticky (fixed) at bottom:** On home, we might make "Find mechanic" or "Request" **sticky** so it’s always visible without scrolling. That’s a deliberate choice: "No matter where you are in the list, the main action is one tap away."

### Size and touch target

- Buttons must be **easy to tap**. Too small = mistakes and frustration. So we use a **minimum height (e.g. 48px)** and enough padding. That’s not aesthetic; it’s **usability**.

### Summary

- **One primary action per screen** → one main button style.
- **Primary button** = main action; **secondary/ghost** = other options.
- **Placement:** main action at **bottom** of content or **sticky** at bottom; secondary at top (e.g. "Cancel") or below primary.
- **Size:** big enough to tap reliably (e.g. 48px min height).

So button placement comes from: "What do we want the user to do here?" and "Where is the thumb and where does the flow end?"

---

## 5. Spacing and typography decisions

Spacing and type are what make the screen **readable** and **calm**. They’re not "make it pretty"; they create **hierarchy** and **rhythm**.

### Why use a spacing scale (e.g. 4, 8, 12, 16, 24)?

- **Consistency:** If I use 7px here and 13px there, the layout feels random. If I use only numbers from a scale (e.g. 8, 16, 24), the eye sees **rhythm**. So we pick a **base unit** (often 4px) and use multiples (4, 8, 12, 16, 24, 32, 48).
- **Faster decisions:** I don’t ask "how much gap?" every time. I ask "is this a small gap (8) or a section gap (24)?" and pick from the scale.
- **Result:** The whole app feels **orderly** and **intentional**.

### Why 24px horizontal padding on screens?

- Too little padding → content touches the edges; it feels cramped and cheap.
- Too much → we waste space and content feels lost.
- **24px** is a common choice: enough "air" so the content doesn’t touch the edge, but not so much that we lose space. Same on left and right so the layout is **balanced**.

### Why a typography scale (e.g. 12, 14, 16, 18, 20, 24, 28)?

- **Hierarchy:** Bigger text = more important. So we use **sizes** to say "this is the title" (e.g. 24px), "this is body" (16px), "this is a hint" (12px). We don’t use 10 different sizes; we use **3–4** so the hierarchy is clear.
- **Readability:** Body text at **16px** is comfortable to read on phones. Smaller than 12px is hard for many people. So the scale has a **minimum** for body/caption.
- **Fewer decisions:** Like spacing, we stick to the scale. Title = 24, body = 16, caption = 12. No random 15px or 19px.

### Why font weight (regular, medium, semibold)?

- **Weight** also shows importance: **semibold** for titles, **regular** for body, **medium** for labels or emphasis. So we combine **size + weight** to create levels: e.g. "Screen title" = 24px semibold, "Section title" = 18px semibold, "Body" = 16px regular.

### Summary

- **Spacing:** One scale (e.g. 4-based), use it everywhere. 24px horizontal padding for screens. Reason: consistency and rhythm.
- **Typography:** One scale (e.g. 12–28px). 3–4 levels (title, body, caption). Body ≥ 16px for readability. Reason: hierarchy and readability.
- **Weight:** Semibold for titles, regular for body. Reason: clarity without adding color or decoration.

So spacing and typography are chosen to make the UI **consistent**, **readable**, and **hierarchical** — not to "look cool."

---

## 6. UX flow decisions step-by-step

The **flow** is: what happens from "open app" to "provider is on the way." Each step is a design decision.

### Step 1: First open → Splash then Onboarding or Home

- **Why splash?** App needs a moment to load (e.g. check login, config). A splash with logo feels intentional instead of a blank screen.
- **Why onboarding only for first time?** Returning users want to go **straight to the map**. So we show onboarding (what the app does + "Enable location") only once, then save "onboarding seen" and skip it next time.
- **Decision:** Splash → if first launch → Onboarding → then Home or Login. If not first launch → Home or Login.

### Step 2: Ask for location at the right time

- **Why not on first screen?** If the first thing we do is "Allow location?", the user doesn’t yet know *why*. They might say no.
- **Why at the end of onboarding?** We’ve just explained: "Find mechanics/tow/rental *near you*." So when we say "Enable location to see who’s nearby," the **reason** is clear. More likely they allow.
- **Decision:** Ask for location **in context** (e.g. last onboarding screen or when they first open the map), with a short explanation.

### Step 3: Home = map + sheet, not a menu

- **Why not a menu (e.g. "Mechanic / Tow / Rental" as three big tiles)?** That adds a step: tap tile → then see map/list. The user already knows they want "help nearby." So we go **directly** to map + "Nearest" list. Type (mechanic/tow/rental) becomes a **filter** in the sheet, not a separate screen.
- **Decision:** Home = map full screen; sheet with "Nearest" + filters; one main CTA (e.g. "Find mechanic" or "Request").

### Step 4: From list to detail without losing the map

- **Why not open provider detail in a new full screen?** Full screen = map is gone. User might want to compare or go back to the list. So we keep detail **in the same sheet**: tap a card → sheet expands (or content changes) to show provider detail. Map still visible behind/beside.
- **Decision:** Provider detail = same bottom sheet, expanded. Primary button there: "Request mechanic" (or tow/rental).

### Step 5: Request in as few steps as possible

- **Ideal:** Tap "Request" → one confirmation (optional note) → "Send" → done. Not 5 screens.
- **Why confirmation?** So the user doesn’t request by mistake. One screen: "Request [Name]? [Distance] away. [Optional: Add note.]" → "Send request."
- **Decision:** Request flow = Confirm (1 screen) → Send → Waiting. If accepted → Tracking screen. If rejected → toast + back to list.

### Step 6: Tracking = map + status, not a form

- **Why map-centric for tracking?** User wants to know "where is they?" So we show **map** (user + provider, maybe route) and **status** (On the way, ETA). Call/Chat as the main action.
- **Decision:** Tracking screen = map full screen + sheet with status and "Call" / "Chat."

### Summary of flow logic

- **Reduce steps:** No unnecessary menus or screens.
- **Context:** Ask location when we’ve explained why; keep map visible when it helps (home, tracking).
- **One main action per step:** So the user always knows what to do next.
- **Clear feedback:** Loading, "Request sent," "Accepted," "On the way."

So every step in the flow is there to make the path from "I need help" to "Help is on the way" **short, clear, and predictable**.

---

## 7. How to think like a product designer (short guide)

You don’t need to memorize rules. You need a **habit of thinking** in this order:

### 1. User and goal first

- Who is using this screen? (e.g. stressed driver, mechanic at work.)
- What do they want here? (e.g. "See who’s nearby and request one.")
- Everything (layout, buttons, copy) should serve that goal.

### 2. One main job per screen

- Each screen should have **one** main job. Name it in one sentence: "This screen lets the user …."
- If you can’t, the screen is probably doing too much. Split or simplify.

### 3. One primary action per screen

- What is the **one** thing we want them to do? That gets the primary button. The rest is secondary (or hidden in menus).

### 4. Use patterns that already work

- Map-first home, bottom sheets, one CTA — these exist because they **work**. Don’t reinvent unless you have a good reason. Learn from Uber, Careem, Airbnb, Google Maps.

### 5. Less is more

- Fewer colors, fewer buttons, fewer steps. If you can remove something and the screen still works, try removing it.

### 6. Consistency = scale

- Same spacing scale, same type scale, same button style everywhere. That’s how an app feels **professional** and **scalable**.

### 7. Test with "why?"

- For every choice (color, position, copy), ask: **"Why this and not something else?"** If you can’t answer, rethink. If the answer is "because it looks nice," dig deeper: "What user need does it serve?"

---

## After the reasoning: what we actually use

Once the reasoning is clear, we turn it into a **concrete** design system and screen structure. Below is a short summary; the full detail is in [DESIGN_SPEC.md](./DESIGN_SPEC.md) and in the app’s theme (colors, typography, spacing, shadows).

### Design system (summary)

- **Colors:** One primary (#0066CC), secondary (#6B7280), neutrals (background #F9FAFB, surface #FFFFFF, text #111827 / #6B7280 / #9CA3AF), one accent for emphasis (#EA580C), semantic (success, error, warning).
- **Typography:** Scale from 12px (caption) to 28px (display); 16px body; semibold for titles, regular for body.
- **Spacing:** 4px base (4, 8, 12, 16, 24, 32, 48); 24px screen padding.
- **Radii:** 12px buttons/inputs, 16px cards, 20–24px sheet top.
- **Shadows:** 3 levels (sm, md, lg), subtle.
- **Buttons:** Primary (filled), Secondary (outline), Tertiary (ghost); min height 48px; one primary per screen.
- **Inputs:** 52px height, 12px radius, clear focus state.
- **Cards:** Elevated / Outlined / Flat; 16px padding.

### Screen structure (summary)

| Screen | Role |
|--------|------|
| **Splash** | Logo, short load, then Onboarding or Home/Login. |
| **Onboarding** | 3 screens: value → trust → "Enable location" with one CTA. |
| **Login / Register** | Simple form, one primary button, links for "Forgot?" / "Create account." |
| **Home** | Map full screen; top bar (transparent); FAB or sticky CTA; bottom sheet with "Nearest" list + filters (Mechanic / Tow / Rental). |
| **Provider detail** | In sheet: name, type, distance, ETA, "Request" (primary), "Contact" (secondary). |
| **Request flow** | Confirm (optional note) → Send → Waiting → Accepted (→ Tracking) or Rejected (toast + list). |
| **Active tracking** | Map + user/provider (+ route); sheet with status, ETA, "Call" / "Chat." |
| **Profile** | Avatar + name; list: Account, Notifications, Language, Help, Terms, Log out; role-specific (Availability, Admin). |

You can now open [DESIGN_SPEC.md](./DESIGN_SPEC.md) and the theme files and see how each token and each screen **implements** the reasoning above. When you change something, ask again: "What user goal does this serve?" and "Why this and not something else?" That’s how you keep thinking like a product designer.
