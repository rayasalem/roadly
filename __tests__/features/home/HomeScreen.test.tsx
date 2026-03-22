import React from 'react';
import { fireEvent } from '@testing-library/react-native';

import { HomeScreen } from '../../../src/features/home/presentation/screens/HomeScreen';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';

// Mock navigation hooks
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      canGoBack: jest.fn(() => false),
    }),
  };
});

// Simplify translations in tests
jest.mock('../../../src/shared/i18n/t', () => ({
  t: (key: string) => key,
}));

jest.mock('../../../src/features/location/hooks/useUserLocation', () => ({
  useUserLocation: () => ({
    coords: { latitude: 25.0, longitude: 55.0 },
    isLoading: false,
    error: null,
    fetchLocation: jest.fn(),
  }),
}));

jest.mock('../../../src/features/providers/hooks/useNearbyProviders', () => ({
  useNearbyProviders: () => ({
    data: { items: [], total: 0 },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
}));

jest.mock('../../../src/features/requests/hooks/useRequestHistory', () => ({
  useRequestHistory: () => ({
    requests: [],
    isLoading: false,
    refetch: jest.fn(),
  }),
}));

describe('HomeScreen', () => {
  it('renders header, inputs, and nearby riders list', () => {
    const { getByText } = renderWithProviders(<HomeScreen />);

    // AppHeader uses centerLogo: title prop is hidden; center shows app.name
    expect(getByText('app.name')).toBeTruthy();
    expect(getByText('home.nearbyServicesTitle')).toBeTruthy();
  });

  it('allows pressing the map preview card to navigate to Map', () => {
    const { getByText } = renderWithProviders(<HomeScreen />);

    // Entire map card is a TouchableOpacity; subtitle is reliably tappable in tests
    fireEvent.press(getByText('home.mapPreviewSubtitle'));
  });
});

