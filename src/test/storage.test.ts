import { describe, it, expect, beforeEach, vi } from "vitest";
import {
    saveTabGroup,
    getAllTabGroups,
    // getRecentTabGroups,
    // deleteTabGroup,
    // updateTabGroup,
    // getTabGroupsCount,
    // formatRelativeTime,
    type TabGroup,
} from "../backend/storage";

const group = (id: string, name = "G"): TabGroup => ({
    id,
    name,
    color: "blue",
    tabCount: 1,
    timestamp: new Date().toISOString(),
    tabs: [{ title: "T", url: "http://a.com" }],
});

describe("storage.ts", () => {
    beforeEach(() => {
        (globalThis as any).__testChrome.resetDb();
        vi.useRealTimers();
    });
    it("savetabGroup prepends new group", async () => {
        await saveTabGroup(group("1", "old"));
        await saveTabGroup(group("2", "new"));

        const all = await getAllTabGroups();
        expect(all.map((g) => g.id)).toEqual(["2", "1"]);
    })
});