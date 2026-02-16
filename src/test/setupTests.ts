import { vi, beforeAll, afterEach } from "vitest";

beforeAll(() => {
  globalThis.chrome = {
    tabs: {
      query: vi.fn((_, callback) => {
        if (typeof callback === "function") {
          callback([{ id: 1 }, { id: 2 }]); // pretend 2 tabs open
        }
      }),
      onCreated: { addListener: vi.fn(), removeListener: vi.fn() },
      onRemoved: { addListener: vi.fn(), removeListener: vi.fn() },
    },
    storage: {
      local: {
        get: vi.fn((_, callback) => {
          callback({}); // return empty object
        }),
        set: vi.fn(),
      },
      onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    },
  } as any;
});

afterEach(() => {
  vi.clearAllMocks();
});
