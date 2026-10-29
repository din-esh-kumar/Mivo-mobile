// Setup mock storage and React Native environment for Node.js test runner
const memoryStorage: Record<string, string> = {};

export const mockStorage = {
  getItem: async (k: string): Promise<string | null> => (k in memoryStorage ? memoryStorage[k] : null),
  setItem: async (k: string, v: string): Promise<void> => {
    memoryStorage[k] = String(v);
  },
  removeItem: async (k: string): Promise<void> => {
    delete memoryStorage[k];
  },
  clear: async (): Promise<void> => {
    for (const key in memoryStorage) {
      delete memoryStorage[key];
    }
  },
  dump: () => ({ ...memoryStorage }),
};

try {
  const p = require.resolve('@react-native-async-storage/async-storage');
  require.cache[p] = {
    id: p,
    filename: p,
    loaded: true,
    exports: {
      default: mockStorage,
      ...mockStorage,
    },
  } as any;
} catch {
  // if not resolvable directly
}
