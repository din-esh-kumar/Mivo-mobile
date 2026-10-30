/* eslint-disable no-undef */

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => {
  const store = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key) => (key in store ? store[key] : null)),
      setItem: jest.fn(async (key, val) => {
        store[key] = String(val);
      }),
      removeItem: jest.fn(async (key) => {
        delete store[key];
      }),
      clear: jest.fn(async () => {
        for (const k in store) delete store[k];
      }),
    },
  };
});

// Mock expo-router
jest.mock('expo-router', () => {
  const pushMock = jest.fn();
  const replaceMock = jest.fn();
  const backMock = jest.fn();

  return {
    useRouter: () => ({
      push: pushMock,
      replace: replaceMock,
      back: backMock,
    }),
    useLocalSearchParams: () => ({
      id: 'chan-gen',
      name: 'general',
      type: 'channel',
      mode: 'VOICE',
    }),
    useSegments: () => [],
    usePathname: () => '/',
    Stack: {
      Screen: () => null,
    },
    Tabs: {
      Screen: () => null,
    },
    Link: 'Link',
    __routerMocks: { pushMock, replaceMock, backMock },
  };
});

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      version: '1.0.0',
      name: 'Mivo',
    },
  },
}));

