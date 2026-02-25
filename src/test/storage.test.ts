import { describe, it, expect, beforeEach, vi } from "vitest";
import { saveTabGroup, getAllTabGroups, type TabGroup } from "../backend/storage";

const makeGroup = (id: string): TabGroup => ({
    id,
    name: `Group ${id}`,
    tabCount: 1,
    timestamp: new Date().toISOString(),
    color: "blue",
    tabs: [{ title: "T", url: "https://test.com" }],
});

describe("saveTabGroup", () => {
    beforeEach(() => {
        (globalThis as any).__testChrome.resetDb();
        vi.resetAllMocks();
    });

    it("adds a group when storage is empty", async () => {
        await saveTabGroup(makeGroup("1"));
        expect((await getAllTabGroups()).map(g => g.id)).toEqual(["1"]);
    })
});