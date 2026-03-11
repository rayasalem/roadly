import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { MechanicDashboardScreen } from '../../../src/features/mechanic/presentation/screens/MechanicDashboardScreen';

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
  }),
}));

describe('MechanicDashboardScreen', () => {
  it('renders stats and active requests', () => {
    const { getByText } = render(<MechanicDashboardScreen />);

    expect(getByText('mechanic.dashboard.title')).toBeTruthy();
    expect(getByText('Job 1')).toBeTruthy();
  });

  it('allows pressing filter chips', () => {
    const { getByText } = render(<MechanicDashboardScreen />);

    const allChip = getByText('mechanic.filterAll');
    fireEvent.press(allChip);
  });
});

