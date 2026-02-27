import { describe, it, expect, beforeEach, vi } from "vitest";
import { saveTabGroup, getAllTabGroups, deleteTabGroup, type TabGroup } from "../backend/storage";

const makeGroup = (id: string): TabGroup => ({
    id,
    name: `Group ${id}`,
    tabCount: 1,
    timestamp: new Date().toISOString(),
    color: "blue",
    tabs: [{ title: "T", url: "https://test.com" }],
});

async function getGroupCount() {
    return (await getAllTabGroups()).length;
}

describe("saveTabGroup", () => {
    beforeEach(() => {
        (globalThis as any).__testChrome.resetDb();
        vi.resetAllMocks();
    });

    it("adds a group when storage is empty", async () => {
        await saveTabGroup(makeGroup("1"));
        expect((await getAllTabGroups()).map(g => g.id)).toEqual(["1"]);
    })

    it("deletes a tab group", async () => {
        for (const id of ["1", "2", "3", "4"]) {
            await saveTabGroup(makeGroup(id));
        }
        await deleteTabGroup("1");
        expect(await getGroupCount()).toBe(3);

        const ids = (await getAllTabGroups()).map(g => g.id).sort();
        expect(ids).toEqual(["2", "3", "4"]);
    })

    it("adds multiple groups correctly", async () => {
        for (const i of ["1", "2"]) {
            await saveTabGroup(makeGroup(i));
        }

        const ids = (await getAllTabGroups()).map(g => g.id);
        expect(ids).toEqual(["2", "1"]);
    })
});