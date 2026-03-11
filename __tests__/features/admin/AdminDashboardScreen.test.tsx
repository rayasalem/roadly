import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { AdminDashboardScreen } from '../../../src/features/admin/presentation/screens/AdminDashboardScreen';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
  };
});

jest.mock('../../../src/shared/i18n/t', () => ({
  t: (key: string) => key,
}));

jest.mock('../../../src/features/admin/hooks/useAdminDashboard', () => {
  const ROLE_THEMES = require('../../../src/shared/theme/roleThemes').ROLE_THEMES;
  return {
    useAdminDashboard: () => ({
      stats: { users: 10, providers: 5, requests: 20, revenue: 1000 },
      chartData: [10, 20, 30],
      activeTab: 'mechanic',
      setActiveTab: jest.fn(),
      mechanicPanel: {
        stats: { jobsToday: 3, activeRequests: 2, avgRating: 4.7 },
        filter: 'all',
        setFilter: jest.fn(),
        requests: [
          {
            id: '1',
            title: 'طلب ميكانيكي',
            customerName: 'أحمد',
            distance: '2km',
            eta: '10m',
            status: 'new',
          },
        ],
      },
      towPanel: {
        stats: { active: 1, waiting: 1, fleet: 2 },
        filter: 'all',
        setFilter: jest.fn(),
        requests: [],
      },
      rentalPanel: {
        stats: { total: 5, available: 3, rented: 2 },
        filter: 'all',
        setFilter: jest.fn(),
        vehicles: [],
      },
    }),
    ROLE_THEMES,
  };
});

describe('AdminDashboardScreen', () => {
  it('renders global stats and mechanic panel', () => {
    const { getByText } = render(<AdminDashboardScreen />);

    expect(getByText('admin.dashboard.title')).toBeTruthy();
    expect(getByText('mechanic.stats.jobsToday')).toBeTruthy();
  });

  it('allows switching tabs', () => {
    const { getByText } = render(<AdminDashboardScreen />);

    const mechTab = getByText('admin.section.mechanics');
    fireEvent.press(mechTab);
  });
});

