import '@testing-library/jest-native/extend-expect';

jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    GestureHandlerRootView: View,
    PanGestureHandler: View,
    State: {},
    Directions: {},
  };
});

jest.mock('@react-native-async-storage/async-storage', () => {
  const store: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      setItem: jest.fn((k: string, v: string) => {
        store[k] = v;
        return Promise.resolve();
      }),
      getItem: jest.fn((k: string) => Promise.resolve(store[k] ?? null)),
      removeItem: jest.fn((k: string) => {
        delete store[k];
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach((k) => delete store[k]);
        return Promise.resolve();
      }),
      getAllKeys: jest.fn(() => Promise.resolve(Object.keys(store))),
      multiGet: jest.fn((keys: string[]) =>
        Promise.resolve(keys.map((k) => [k, store[k] ?? null])),
      ),
      multiSet: jest.fn((pairs: [string, string][]) => {
        pairs.forEach(([k, v]) => {
          store[k] = v;
        });
        return Promise.resolve();
      }),
      multiRemove: jest.fn((keys: string[]) => {
        keys.forEach((k) => delete store[k]);
        return Promise.resolve();
      }),
    },
  };
});

