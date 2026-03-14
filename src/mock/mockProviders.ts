import { ROLES } from '../shared/constants/roles';
import type { Provider } from '../features/providers/domain/types';
import { MOCK_LOCATIONS } from './mockLocations';

export type ProviderStatus = 'available' | 'busy' | 'on_the_way' | 'offline';

export type MockProvider = Provider & {
  displayStatus: ProviderStatus;
};

const baseLoc = MOCK_LOCATIONS.find((l) => l.id === 'city_center')!;

export const MOCK_MECHANIC_PROVIDERS: MockProvider[] = [
  {
    id: 'mechanic_1',
    name: 'أحمد الميكانيكي',
    role: ROLES.MECHANIC,
    phone: '0590000000',
    rating: 4.8,
    reviews: 124,
    displayStatus: 'available',
    isAvailable: true,
    location: { latitude: baseLoc.latitude, longitude: baseLoc.longitude, lastUpdated: new Date().toISOString() },
  } as MockProvider,
  {
    id: 'mechanic_2',
    name: 'ورشة السرعة القصوى',
    role: ROLES.MECHANIC,
    phone: '0590000002',
    rating: 4.6,
    reviews: 98,
    displayStatus: 'busy',
    isAvailable: false,
    location: { latitude: baseLoc.latitude + 0.006, longitude: baseLoc.longitude + 0.004, lastUpdated: new Date().toISOString() },
  } as MockProvider,
  {
    id: 'mechanic_3',
    name: 'خدمة الطريق السريعة',
    role: ROLES.MECHANIC,
    phone: '0590000003',
    rating: 4.9,
    reviews: 210,
    displayStatus: 'on_the_way',
    isAvailable: false,
    location: { latitude: baseLoc.latitude - 0.005, longitude: baseLoc.longitude + 0.002, lastUpdated: new Date().toISOString() },
  } as MockProvider,
  {
    id: 'mechanic_4',
    name: 'ميكانيكي الحارة',
    role: ROLES.MECHANIC,
    phone: '0590000004',
    rating: 4.3,
    reviews: 75,
    displayStatus: 'available',
    isAvailable: true,
    location: { latitude: baseLoc.latitude + 0.01, longitude: baseLoc.longitude - 0.004, lastUpdated: new Date().toISOString() },
  } as MockProvider,
  {
    id: 'mechanic_5',
    name: 'ورشة النخبة',
    role: ROLES.MECHANIC,
    phone: '0590000005',
    rating: 4.7,
    reviews: 160,
    displayStatus: 'offline',
    isAvailable: false,
    location: { latitude: baseLoc.latitude - 0.012, longitude: baseLoc.longitude - 0.006, lastUpdated: new Date().toISOString() },
  } as MockProvider,
  {
    id: 'mechanic_6',
    name: 'خدمة الطوارئ السريعة',
    role: ROLES.MECHANIC,
    phone: '0590000006',
    rating: 4.4,
    reviews: 54,
    displayStatus: 'available',
    isAvailable: true,
    location: { latitude: baseLoc.latitude + 0.004, longitude: baseLoc.longitude - 0.008, lastUpdated: new Date().toISOString() },
  } as MockProvider,
];

export const MOCK_TOW_PROVIDERS: MockProvider[] = [
  {
    id: 'tow_1',
    name: 'ونش النجدة',
    role: ROLES.MECHANIC_TOW,
    phone: '0591000001',
    rating: 4.6,
    reviews: 87,
    displayStatus: 'available',
    isAvailable: true,
    location: { latitude: baseLoc.latitude + 0.008, longitude: baseLoc.longitude + 0.01, lastUpdated: new Date().toISOString() },
  } as MockProvider,
  {
    id: 'tow_2',
    name: 'ونش ٢٤/٧',
    role: ROLES.MECHANIC_TOW,
    phone: '0591000002',
    rating: 4.2,
    reviews: 45,
    displayStatus: 'busy',
    isAvailable: false,
    location: { latitude: baseLoc.latitude - 0.007, longitude: baseLoc.longitude + 0.009, lastUpdated: new Date().toISOString() },
  } as MockProvider,
  {
    id: 'tow_3',
    name: 'ونش الخط السريع',
    role: ROLES.MECHANIC_TOW,
    phone: '0591000003',
    rating: 4.9,
    reviews: 130,
    displayStatus: 'on_the_way',
    isAvailable: false,
    location: { latitude: baseLoc.latitude + 0.002, longitude: baseLoc.longitude + 0.015, lastUpdated: new Date().toISOString() },
  } as MockProvider,
  {
    id: 'tow_4',
    name: 'ونش المدينة',
    role: ROLES.MECHANIC_TOW,
    phone: '0591000004',
    rating: 4.1,
    reviews: 33,
    displayStatus: 'available',
    isAvailable: true,
    location: { latitude: baseLoc.latitude - 0.01, longitude: baseLoc.longitude - 0.012, lastUpdated: new Date().toISOString() },
  } as MockProvider,
  {
    id: 'tow_5',
    name: 'ونش الخدمة الذهبية',
    role: ROLES.MECHANIC_TOW,
    phone: '0591000005',
    rating: 4.7,
    reviews: 102,
    displayStatus: 'offline',
    isAvailable: false,
    location: { latitude: baseLoc.latitude + 0.012, longitude: baseLoc.longitude - 0.014, lastUpdated: new Date().toISOString() },
  } as MockProvider,
];

export const MOCK_RENTAL_PROVIDERS: MockProvider[] = [
  {
    id: 'rental_1',
    name: 'تأجير سيارات سيتي درايف',
    role: ROLES.CAR_RENTAL,
    phone: '0592000001',
    rating: 4.5,
    reviews: 190,
    displayStatus: 'available',
    isAvailable: true,
    location: { latitude: baseLoc.latitude + 0.003, longitude: baseLoc.longitude + 0.006, lastUpdated: new Date().toISOString() },
  } as MockProvider,
  {
    id: 'rental_2',
    name: 'تأجير الطريق السريع',
    role: ROLES.CAR_RENTAL,
    phone: '0592000002',
    rating: 4.3,
    reviews: 110,
    displayStatus: 'busy',
    isAvailable: false,
    location: { latitude: baseLoc.latitude - 0.004, longitude: baseLoc.longitude + 0.004, lastUpdated: new Date().toISOString() },
  } as MockProvider,
  {
    id: 'rental_3',
    name: 'مكتب السيارات الاقتصادية',
    role: ROLES.CAR_RENTAL,
    phone: '0592000003',
    rating: 4.1,
    reviews: 75,
    displayStatus: 'available',
    isAvailable: true,
    location: { latitude: baseLoc.latitude + 0.009, longitude: baseLoc.longitude - 0.002, lastUpdated: new Date().toISOString() },
  } as MockProvider,
  {
    id: 'rental_4',
    name: 'سيارات فخمة VIP',
    role: ROLES.CAR_RENTAL,
    phone: '0592000004',
    rating: 4.9,
    reviews: 250,
    displayStatus: 'on_the_way',
    isAvailable: false,
    location: { latitude: baseLoc.latitude - 0.006, longitude: baseLoc.longitude - 0.008, lastUpdated: new Date().toISOString() },
  } as MockProvider,
  {
    id: 'rental_5',
    name: 'تأجير المطار',
    role: ROLES.CAR_RENTAL,
    phone: '0592000005',
    rating: 4.4,
    reviews: 140,
    displayStatus: 'offline',
    isAvailable: false,
    location: { latitude: baseLoc.latitude + 0.014, longitude: baseLoc.longitude + 0.001, lastUpdated: new Date().toISOString() },
  } as MockProvider,
];

export const MOCK_PROVIDERS_ALL: MockProvider[] = [
  ...MOCK_MECHANIC_PROVIDERS,
  ...MOCK_TOW_PROVIDERS,
  ...MOCK_RENTAL_PROVIDERS,
];

