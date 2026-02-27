import "@testing-library/jest-dom";
import { vi } from "vitest";

type Listener<T extends (...args: any[]) => void> = T[];

const createdListeners: Listener<() => void> = [];
const removedListeners: Listener<() => void> = [];
const storageChangedListeners: Listener<() => void> = [];

const db: Record<string, any> = {};

(globalThis as any).chrome = {
  tabs: {
    query: vi.fn(async () => []),
    create: vi.fn(async () => ({ id: 1 })),
    update: vi.fn(async () => ({})),
    onCreated: {
      addListener: vi.fn((cb: () => void) => createdListeners.push(cb)),
      removeListener: vi.fn((cb: () => void) => {
        const i = createdListeners.indexOf(cb);
        if (i >= 0) createdListeners.splice(i, 1);
      }),
    },
    onRemoved: {
      addListener: vi.fn((cb: () => void) => removedListeners.push(cb)),
      removeListener: vi.fn((cb: () => void) => {
        const i = removedListeners.indexOf(cb);
        if (i >= 0) removedListeners.splice(i, 1);
      }),
    },
  },
  storage: {
    local: {
      get: vi.fn(async (key: string) => ({ [key]: db[key] })),
      set: vi.fn(async (obj: Record<string, any>) => {
        Object.assign(db, obj);
      }),
    },
    onChanged: {
      addListener: vi.fn((cb: () => void) => storageChangedListeners.push(cb)),
      removeListener: vi.fn((cb: () => void) => {
        const i = storageChangedListeners.indexOf(cb);
        if (i >= 0) storageChangedListeners.splice(i, 1);
      }),
    },
  },
  action: {
    setBadgeText: vi.fn(),
    setBadgeBackgroundColor: vi.fn(),
  },
};

// Helpers for tests
(globalThis as any).__testChrome = {
  resetDb: () => {
    for (const k of Object.keys(db)) delete db[k];
  },
  emitTabCreated: () => createdListeners.forEach((cb) => cb()),
  emitTabRemoved: () => removedListeners.forEach((cb) => cb()),
  emitStorageChanged: () => storageChangedListeners.forEach((cb) => cb()),
};
