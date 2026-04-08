/**
 * Shared tab config for BottomNavBar + SideNavRail (Uber/Careem-style IA).
 */
export type NavTabId = 'Home' | 'Requests' | 'Chat' | 'Profile';

export type NavTabConfig = {
  id: NavTabId;
  icon: string;
  labelKey: string;
};

export const NAV_TABS: NavTabConfig[] = [
  { id: 'Home', icon: 'home', labelKey: 'nav.home' },
  { id: 'Requests', icon: 'clipboard-text-outline', labelKey: 'nav.requests' },
  { id: 'Chat', icon: 'message-text-outline', labelKey: 'nav.chat' },
  { id: 'Profile', icon: 'account-outline', labelKey: 'nav.profile' },
];
