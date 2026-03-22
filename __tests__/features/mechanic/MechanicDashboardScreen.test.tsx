import React from 'react';
import { fireEvent } from '@testing-library/react-native';

import { MechanicDashboardScreen } from '../../../src/features/mechanic/presentation/screens/MechanicDashboardScreen';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';

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

jest.mock('../../../src/features/mechanic/hooks/useMechanicDashboard', () => ({
  useMechanicDashboard: () => ({
    stats: { jobsToday: '3', onTheWay: '1', rating: '4.9' },
    jobs: [
      { id: '1', title: 'Job 1', distance: '2km', eta: '10m', status: 'new' },
    ],
    requesters: [
      { id: '1', customerName: 'أحمد', serviceType: 'ميكانيكي', time: 'الآن', status: 'new' },
    ],
    statusFilter: 'all',
    setStatusFilter: jest.fn(),
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
    acceptJob: jest.fn(),
    declineJob: jest.fn(),
    completeJob: jest.fn(),
    isAccepting: false,
    isDeclining: false,
    isCompleting: false,
  }),
}));

jest.mock('../../../src/store/authStore', () => ({
  useAuthStore: (sel: (s: { user: { id: string; name: string; role: string } | null }) => unknown) =>
    sel({
      user: { id: 'm1', name: 'Mechanic', role: 'mechanic' },
    }),
}));

jest.mock('../../../src/features/profile/hooks/useProviderLocationSync', () => ({
  useProviderLocationSync: () => {},
}));

jest.mock('../../../src/features/profile/hooks/useProviderProfile', () => ({
  useProviderProfile: () => ({
    profile: { isAvailable: true },
    refetch: jest.fn(),
  }),
}));

describe('MechanicDashboardScreen', () => {
  it('renders stats and active requests', () => {
    const { getByText, getAllByText } = renderWithProviders(<MechanicDashboardScreen />);

    expect(getAllByText('mechanic.dashboard.title').length).toBeGreaterThan(0);
    expect(getByText('Job 1')).toBeTruthy();
  });

  it('allows pressing filter chips', () => {
    const { getByText } = renderWithProviders(<MechanicDashboardScreen />);

    const allChip = getByText('mechanic.filterAll');
    fireEvent.press(allChip);
  });
});

