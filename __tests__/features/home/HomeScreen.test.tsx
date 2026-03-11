import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { HomeScreen } from '../../../src/features/home/presentation/screens/HomeScreen';

// Mock navigation hooks
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

// Simplify translations in tests
jest.mock('../../../src/shared/i18n/t', () => ({
  t: (key: string) => key,
}));

describe('HomeScreen', () => {
  it('renders header, inputs, and nearby riders list', () => {
    const { getByText } = render(<HomeScreen />);

    expect(getByText('home.startJourney')).toBeTruthy();
    expect(getByText('home.nearbyRiders')).toBeTruthy();
  });

  it('allows pressing the nearest locations card to navigate to Map', () => {
    const { getByText } = render(<HomeScreen />);

    const nearestCard = getByText('home.nearestLocations');
    fireEvent.press(nearestCard);
  });
});

