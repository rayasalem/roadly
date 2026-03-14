import type { GeoPoint } from '../shared/types/geo';

export type RequestStatus = 'pending' | 'accepted' | 'on_the_way' | 'completed' | 'cancelled';

export type MockRequest = {
  id: string;
  customerId: string;
  providerId: string;
  service: 'mechanic' | 'tow' | 'rental';
  status: RequestStatus;
  customerLocation: GeoPoint;
  createdAt: string;
};

const baseLoc: GeoPoint = { latitude: 32.221, longitude: 35.261 };

export const MOCK_REQUESTS: MockRequest[] = [
  {
    id: 'request_1',
    customerId: 'user_1',
    providerId: 'mechanic_1',
    service: 'mechanic',
    status: 'pending',
    customerLocation: baseLoc,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'request_2',
    customerId: 'user_1',
    providerId: 'mechanic_3',
    service: 'mechanic',
    status: 'on_the_way',
    customerLocation: { latitude: baseLoc.latitude + 0.004, longitude: baseLoc.longitude - 0.002 },
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'request_3',
    customerId: 'user_2',
    providerId: 'tow_1',
    service: 'tow',
    status: 'accepted',
    customerLocation: { latitude: baseLoc.latitude - 0.003, longitude: baseLoc.longitude + 0.004 },
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: 'request_4',
    customerId: 'user_1',
    providerId: 'tow_3',
    service: 'tow',
    status: 'completed',
    customerLocation: { latitude: baseLoc.latitude + 0.006, longitude: baseLoc.longitude + 0.001 },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'request_5',
    customerId: 'user_2',
    providerId: 'rental_1',
    service: 'rental',
    status: 'cancelled',
    customerLocation: { latitude: baseLoc.latitude - 0.005, longitude: baseLoc.longitude - 0.003 },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

