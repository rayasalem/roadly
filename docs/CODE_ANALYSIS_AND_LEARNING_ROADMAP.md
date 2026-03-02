# React Native Code Analysis & Learning Roadmap

**Purpose:** Understand exactly what concepts you're using, whether you're using them correctly, your current level, and what to learn next.

---

## 1. What you are currently using

### 1.1 React Native core components

| Component | Where you use it | What it does | Why it's used |
|-----------|------------------|--------------|----------------|
| **View** | Every screen and layout | A container that lays out children (flexbox by default). | Building blocks of the UI; you wrap content in `View` to group and style it. |
| **Text** | Titles, labels, buttons, toasts | Renders readable text. In RN, *all* text must be inside `<Text>`. | You can't put a string directly in a `View`; you need `Text`. |
| **ScrollView** | WelcomeScreen | A scrollable container. Content can be longer than the screen. | Long forms (login + register) need scrolling so nothing is cut off on small screens. |
| **TextInput** | LoginScreen (raw), Input component | Single-line or multiline text entry. | Email, password, name fields. |
| **TouchableOpacity** | Button, Card, ErrorBoundary | A wrapper that responds to press with opacity change; gives "button" feel. | Standard way to make tappable areas; you use `activeOpacity={0.8}` for press feedback. |
| **StyleSheet** | Every component | Creates a style object and optionally optimizes it. Styles are defined outside render. | Keeps styles out of the render path and encourages reuse; you use `StyleSheet.create({ ... })`. |
| **KeyboardAvoidingView** | WelcomeScreen | Shifts content when the keyboard opens so the focused input stays visible. | On iOS especially, the keyboard can cover inputs; this avoids that. |
| **ActivityIndicator** | Button (loading), LoadingSpinner | System loading spinner. | Shows "in progress" during async actions (login, etc.). |
| **Animated** (Animated.Value, Animated.View, Animated.timing, etc.) | ToastHost, Skeleton | RN's built-in animation API. You drive animations with a numeric value (e.g. 0 → 1). | Toast fade/slide and skeleton shimmer; you use `useNativeDriver: true` for better performance. |
| **Platform** | WelcomeScreen (KeyboardAvoidingView) | Lets you branch by OS (e.g. `Platform.OS === 'ios'`). | iOS and Android sometimes need different behavior (e.g. keyboard). |

**Are you using them correctly?**

- **Yes:** You use `View` and `Text` correctly; `ScrollView` with `contentContainerStyle` and `keyboardShouldPersistTaps="handled"` is correct for forms; `KeyboardAvoidingView` with `behavior` and `keyboardVerticalOffset` is the right pattern.
- **Small improvement:** In LoginScreen you use raw `TextInput` with inline styles; elsewhere you use your `Input` component (label, error). Prefer `Input` everywhere for consistency and focus/error states.

---

### 1.2 React hooks you're using

| Hook | Where you use it | What it does | Why it's used |
|------|------------------|--------------|----------------|
| **useState** | WelcomeScreen, LoginScreen, HomeScreen, useUserLocation, useLocationPermission | Holds a value that can change; when you call the setter, the component re-renders with the new value. | Form fields (email, password), loading/error state, saved auth info. |
| **useEffect** | WelcomeScreen (load saved auth), HttpEventsBinder (subscribe to HTTP errors) | Runs after render. You return a cleanup function to run when the component unmounts or before the effect runs again. | Load data once on mount (saved email); subscribe to events and unsubscribe on unmount. |
| **useCallback** | WelcomeScreen (onLogin, onRegister), HomeScreen (onToast, onLoader), useUserLocation (fetchLocation), useLocationPermission (check, request) | Returns a function that stays the same between re-renders unless its dependencies change. | Prevents creating a new function every render; useful for handlers passed to children or used in dependency arrays. |
| **useMemo** | AppProviders (queryClient), ToastHost (toast background color) | Returns a value that is recomputed only when dependencies change. | queryClient: create once so QueryClientProvider doesn't get a new client every render. Toast: derive style from `latest` only when `latest` changes. |
| **useRef** | ToastHost (Animated.Value), Skeleton (Animated.Value) | Holds a mutable value that does *not* trigger re-render when it changes. Also keeps the same object across re-renders. | Animated values must persist and not be recreated; `useRef(new Animated.Value(0)).current` is the correct pattern. |
| **useNavigation** | HomeScreen | Returns the navigation object so you can navigate from a screen without receiving it as a prop. | When you need to navigate from a child or a place where you don't have `navigation` in props. |

**Are you using them correctly?**

- **Yes:** You use `useState` for local UI state; `useEffect` with empty deps `[]` for mount-only logic and with cleanup for subscriptions; `useCallback` with proper dependency arrays; `useMemo` for the query client and derived values; `useRef` for animation values.
- **Good practice:** You list dependencies correctly in `useCallback`/`useEffect` (e.g. onLogin includes loginEmail, loginPassword, navigation, etc.), which avoids stale closures.

---

### 1.3 Navigation

| Concept | What you use | What it does | Why it's used |
|---------|--------------|--------------|----------------|
| **React Navigation** | `@react-navigation/native` + `@react-navigation/native-stack` | Stack navigator: screens stacked; "push" and "pop" (back). | Standard way to move between Welcome, Login, Home, Map. |
| **NavigationContainer** | AppProviders | Wraps the whole app and provides navigation context. | Required once at the root so `useNavigation()` and screen props work. |
| **createNativeStackNavigator** | RootNavigator | Defines a stack of screens with native header (iOS/Android). | You get a header (title, back button) and native transitions. |
| **Screen options** | `headerShown: false`, `title`, `headerStyle`, etc. | Configures header per screen. | Welcome has no header; others have title and styling. |
| **getComponent** | RootNavigator (lazy loading) | Function that returns the screen component (e.g. via `require()`). | Lazy loading: screen code loads when first needed, not at app start. |
| **navigation.navigate** | WelcomeScreen, HomeScreen | Goes to a screen by name; can pass params. | Moving from Welcome → Home, Home → Map, etc. |
| **navigation.replace** | LoginScreen | Replaces current screen (no "back" to Login). | After login you don't want the user to go "back" to the login form. |
| **Typed params** | RootStackParamList | TypeScript type: which screens exist and what params they take. | Type safety: `navigation.navigate('Map')` is checked; later you can add `MechanicDetail: { id: string }`. |

**Are you using it correctly?**

- **Yes:** One root stack, clear screen names, typed param list, lazy loading with `getComponent`. Using `replace` after login is correct.
- **Note:** You're not using nested navigators (e.g. tab + stack) or passing params yet; that's the next step when you add flows like "Provider detail" with an `id`.

---

### 1.4 State management

| What you use | Where | What it does | Why it's used |
|--------------|--------|--------------|----------------|
| **Zustand** (`create`, `useUIStore`) | uiStore.ts; WelcomeScreen, LoginScreen, HomeScreen, ToastHost, GlobalOverlayHost, HttpEventsBinder | Global store: any component can read (e.g. `useUIStore(s => s.toast)`) or call actions (e.g. `toast(...)`). | UI state that many screens need: toasts, global loader. You don't want to pass props through every level. |
| **Selector pattern** | `useUIStore((s) => s.toast)` | You subscribe only to the slice you use. When that slice changes, the component re-renders. | Good practice: if you only use `toast`, you don't re-render when `loadingCount` changes. |
| **TanStack Query (useQuery)** | useNearbyProviders | Manages server state: fetching, caching, refetching. You give it a key and a fetch function. | "Nearby providers" comes from the API; Query handles loading/error/cache and avoids duplicate requests. |
| **Local state (useState)** | Form fields, useUserLocation, useLocationPermission | State that belongs to one screen or one hook. | Email, password, permission status, etc. Not shared globally. |

**Are you using it correctly?**

- **Yes:** You separate *server state* (TanStack Query for API data) from *UI state* (Zustand for toasts, loader). That's the recommended split.
- **Yes:** Zustand selectors are used correctly; you don't over-subscribe.
- **Good:** Loading count in uiStore is a number (increment/decrement) so nested async flows (e.g. two loaders) work without race conditions.

---

### 1.5 Styling approach

| What you use | Where | What it does | Why it's used |
|--------------|--------|--------------|----------------|
| **StyleSheet.create** | All components | Builds a style object and (on native) can optimize. Styles are referenced by key (e.g. `styles.container`). | Central place for styles; avoids creating new objects in render. |
| **Flexbox** | Every layout | `flex: 1`, `flexDirection: 'row'`, `justifyContent`, `alignItems`, `gap`. RN uses flexbox by default for layout. | You use `flex: 1` for full-screen containers, `flexDirection: 'row'` for rows, `gap` for spacing. |
| **Design tokens** | colors, spacing, typography, radii, shadows from theme | Single source for colors, sizes, radii. You import and use (e.g. `colors.primary`, `spacing.xl`). | Consistency and easy theming; change once, update everywhere. |
| **No inline style objects in render** | You avoid `style={{ marginTop: 10 }}` in render for static styles | Static styles go in `StyleSheet.create`. | Better performance and readability; you only use inline for dynamic values (e.g. Skeleton width). |

**Are you using it correctly?**

- **Yes:** Theme-driven styling, StyleSheet at the bottom of the file, flexbox for layout. This is a solid, scalable approach.
- **One inconsistency:** LoginScreen uses raw `borderRadius: 12` and padding numbers instead of `radii.md` and `spacing`; the rest of the app uses the design system. Align LoginScreen with the theme for consistency.

---

### 1.6 Third-party libraries

| Library | What you use it for | Correct? |
|---------|---------------------|----------|
| **Expo** | App entry, build, StatusBar, Constants, Location, Asset | Yes. You're using Expo's managed workflow. |
| **@react-navigation/native** + **native-stack** | Stack navigation, NavigationContainer, screen options, types | Yes. Standard and used correctly. |
| **@tanstack/react-query** | useQuery in useNearbyProviders; QueryClientProvider in App | Yes. Server state only; enabled flag for when params exist. |
| **zustand** | useUIStore for toasts and global loader | Yes. Simple API, selector pattern. |
| **axios** | HTTP client in shared layer (api, httpClient) | Yes. Used in services, not in components. |
| **react-native-safe-area-context** | SafeAreaProvider in AppProviders | Yes. Wraps the app so content respects notches and status bar. |
| **react-native-screens** | Used by React Navigation under the hood | Yes. You get native screen behavior. |
| **expo-location** | locationService, locationPermissionService | Yes. Permission and getCurrentPosition / watchPosition. |
| **react-native-maps** | Listed in package.json; MapScreen is placeholder | Not used in UI yet; you have the dependency for when you build the map. |

---

## 2. Concepts in simple terms (teaching summary)

- **View / Text / TextInput:** Building blocks. View = container, Text = any text, TextInput = user input. You always need Text for strings.
- **ScrollView:** Lets content scroll when it's taller than the screen. Use `contentContainerStyle` for the inner content and `keyboardShouldPersistTaps="handled"` on forms.
- **TouchableOpacity:** Makes a region tappable with visual feedback (opacity). Use for buttons and tappable cards.
- **useState:** "Remember this value and re-render when it changes." Use for form fields and local UI state.
- **useEffect:** "Do something after render (e.g. load data, subscribe)." Use for side effects; return a function to clean up.
- **useCallback:** "Remember this function so it doesn't change every render." Use for event handlers that are passed down or in dependency arrays.
- **useMemo:** "Remember this computed value until dependencies change." Use for expensive computations or when you need a stable reference (e.g. queryClient).
- **useRef:** "Keep a value that doesn't cause re-render." Use for animation values, timers, or DOM-like refs.
- **Navigation:** Stack = stack of screens; navigate = go to screen; replace = go and remove current from stack. Type your param list for safety.
- **Zustand:** Global store; any component can read or call actions. Use for UI state that many parts of the app need (toasts, loader).
- **TanStack Query:** Holds server data (from API); handles loading, error, cache. Use for any data that comes from the network.
- **StyleSheet + theme:** Define styles once with design tokens; keep render clean and consistent.

---

## 3. Your current level: **Intermediate**

**Why Intermediate (and not Beginner):**

- You use **multiple hooks** correctly (useState, useEffect, useCallback, useMemo, useRef) and understand dependency arrays.
- You have **navigation** with types and lazy loading.
- You **split state**: server (Query) vs global UI (Zustand) vs local (useState).
- You use a **design system** (theme, shared components) and **custom hooks** (useUserLocation, useLocationPermission, useNearbyProviders).
- You use **React.memo** on shared components and **Animated** for toast and skeleton.
- You have a **feature-based structure** and **no API calls inside components** (calls in hooks/services).

**Why not Advanced (yet):**

- You're not using **FlatList** (or virtualization) for long lists; no **bottom sheet** or **gesture-based** UI yet.
- **Animations** are limited to a couple of components; no layout animations or shared element transitions.
- **Error boundaries** are only at the root; no granular boundaries per flow.
- **Testing** (unit, integration) is not present in the codebase.
- **Accessibility** (labels, roles, screen reader) is not explicitly implemented.

So: **Intermediate** — you're past basics and structure the app well; the next step is performance (lists), richer interaction (sheets, gestures), and polish (a11y, tests).

---

## 4. What you're NOT using yet (and should learn next)

| Concept | What it is | Why learn it next |
|---------|------------|-------------------|
| **FlatList** | Virtualized list: only visible items (plus buffer) are rendered. | When you show "nearest providers" (could be many), ScrollView with many cards will be slow. FlatList recycles items and keeps the app smooth. |
| **Bottom sheet** | A panel that slides up from the bottom (often with drag). | Your design spec is "map-first + sheet for list/detail." You need a bottom sheet component (e.g. @gorhom/bottom-sheet) or custom implementation. |
| **Focus/blur on inputs** | Handling focus and blur events and styling (e.g. border color). | Your `Input` has error state but no explicit focus state; adding it improves clarity and accessibility. |
| **KeyboardAvoidingView on Login** | Same as on Welcome. | LoginScreen doesn't wrap in KeyboardAvoidingView; on small screens the keyboard can cover the button. |
| **SafeAreaView** | Pushes content below status bar and notch. | You have SafeAreaProvider; for individual screens (e.g. full-screen map) you might want SafeAreaView so content isn't under the notch. |
| **Accessibility** | `accessibilityLabel`, `accessibilityRole`, `accessibilityState`. | Required for production; screen readers and better UX for many users. |
| **Unit / integration tests** | Jest + React Native Testing Library. | To refactor and add features without regressions; especially for hooks and critical flows. |
| **Gesture handlers** | react-native-gesture-handler for drag, pinch, etc. | Needed for a proper bottom sheet (drag to expand/collapse) and for map gestures that don't conflict with the sheet. |

---

## 5. Suggested learning roadmap (in order)

### Phase 1 — Fix and align (short term)

1. **Use your Input component on LoginScreen**  
   Replace raw TextInput with `Input` (label, error, same theme). Add **KeyboardAvoidingView** (and optional ScrollView) so the keyboard doesn't cover the submit button.

2. **Use design tokens in LoginScreen**  
   Replace hardcoded `borderRadius: 12`, padding, and font sizes with `radii`, `spacing`, and `typography` from the theme.

3. **Add focus state to Input**  
   Use `onFocus` / `onBlur` and a state or ref to toggle a "focused" style (e.g. border color) so users see which field is active.

### Phase 2 — Lists and performance

4. **Learn FlatList**  
   Build a "Nearest providers" list with FlatList: `data`, `renderItem`, `keyExtractor`, `ListHeaderComponent` (filters), and optional `ListEmptyComponent`. Use `initialNumToRender` and `windowSize` for performance.

5. **Optimize list items**  
   Make the provider list item a `React.memo` component and keep callbacks stable (useCallback) so list items don't re-render unnecessarily.

### Phase 3 — Map and bottom sheet

6. **Implement the map screen**  
   Use react-native-maps: show user location and provider markers, use your theme colors for marker types. Handle "tap marker" to select provider.

7. **Add a bottom sheet**  
   Use a library (e.g. @gorhom/bottom-sheet) or build a simple one with Animated. Show "Nearest" list in the sheet; tap item → expand or show detail. Match your design spec (peek / half / full).

### Phase 4 — Polish and quality

8. **Accessibility**  
   Add `accessibilityLabel` and `accessibilityRole` to Button, Input, and key screens. Test with a screen reader (e.g. TalkBack on Android).

9. **Testing**  
   Add Jest + React Native Testing Library. Write tests for: useUserLocation (mock services), useNearbyProviders (mock API), and one or two key components (e.g. Button, Input).

10. **Error boundaries per flow**  
    Wrap high-level flows (e.g. map, request flow) in their own ErrorBoundary so one crash doesn't take down the whole app.

---

## 6. Quick reference: "Am I using it correctly?"

| Pattern | Your code | Verdict |
|---------|-----------|--------|
| State in components | useState for form and local UI | ✅ Correct |
| Side effects on mount | useEffect with [] and cleanup | ✅ Correct |
| Handlers in dependency arrays | useCallback with deps | ✅ Correct |
| Global UI state | Zustand with selectors | ✅ Correct |
| Server state | TanStack Query, no fetch in components | ✅ Correct |
| Navigation | Stack, navigate/replace, typed list | ✅ Correct |
| Styling | StyleSheet + theme tokens | ✅ Correct; align LoginScreen |
| Lazy loading screens | getComponent with require() | ✅ Correct |
| Animation | useRef for Animated.Value, useNativeDriver: true | ✅ Correct |
| Raw TextInput in screen | LoginScreen | ⚠️ Prefer Input component + KeyboardAvoidingView |

---

You're at a solid **Intermediate** level with good structure and separation of concerns. The roadmap above takes you from small fixes (LoginScreen, Input focus) to list performance (FlatList), then to map + bottom sheet, and finally to accessibility and testing so the app is production-ready and maintainable.
