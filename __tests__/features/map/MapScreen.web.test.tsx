import React from 'react';
import { fireEvent } from '@testing-library/react-native';

import { MapScreen } from '../../../src/features/map/presentation/screens/MapScreen.web';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';

// Mock navigation and hooks used by MapScreen
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

jest.mock('../../../src/features/location/hooks/useUserLocation', () => ({
  useUserLocation: () => ({
    coords: { latitude: 25.0, longitude: 55.0 },
    isLoading: false,
    fetchLocation: jest.fn(),
  }),
}));

jest.mock('../../../src/features/providers/hooks/useNearbyProviders', () => ({
  useNearbyProviders: () => ({
    data: {
      items: [],
    },
    isLoading: false,
  }),
}));

jest.mock('../../../src/features/map/hooks/useMapFilters', () => ({
  useMapFilters: () => ({
    filterRole: null,
    setFilter: jest.fn(),
    filterOptions: [null, 'mechanic', 'mechanic_tow', 'car_rental'],
  }),
}));

jest.mock('../../../src/features/map/hooks/usePlacesSearch', () => ({
  usePlacesSearch: () => ({
    query: '',
    setQuery: jest.fn(),
    selectedPlace: null,
    suggestions: [],
    selectPlace: jest.fn(),
  }),
}));

jest.mock('../../../src/shared/i18n/t', () => ({
  t: (key: string) => key,
}));

describe('MapScreen (web)', () => {
  it('renders search input and filters without crashing', () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(<MapScreen />);

    expect(getByPlaceholderText('map.searchHerePlaceholder')).toBeTruthy();
    expect(getByText('map.filter.all')).toBeTruthy();
  });

  it('allows typing into search input', () => {
    const { getByPlaceholderText } = renderWithProviders(<MapScreen />);

    const input = getByPlaceholderText('map.searchHerePlaceholder');
    fireEvent.changeText(input, 'test');
  });
});

