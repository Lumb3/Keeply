import { describe, it, expect, beforeEach, vi } from "vitest";
import { saveTabGroup, getAllTabGroups, deleteTabGroup, updateTabGroup, getTabGroupsCount, type TabGroup } from "../backend/storage";

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

describe("Tests for storage-managing methods", () => {
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

    it("updates an existing tab group by id", async () => {
        for (const id of ["1", "2"]) {
            await saveTabGroup(makeGroup(id));
        }

        const updated: TabGroup = {
            ...makeGroup("1"),
            name: "Updated Group 1",
            tabCount: 3,
            color: "red",
            tabs: [
                { title: "A", url: "https://a.com" },
                { title: "B", url: "https://b.com" },
                { title: "C", url: "https://c.com" },
            ],
        };
        await updateTabGroup(updated);
        const groups = await getAllTabGroups();
        expect(groups.map(g => g.id).sort().length).toBe(2); // the sorted length of the total tab counts should be equal

        const groups1 = groups.find(g => g.id === "1"); // Returns the first matching element (get the group id === 1)
        console.log("Expect block 1: Checks if the group 1 is actually updated");
        expect(groups1).toEqual(updated);

        console.log("Expect block 2: ");
        const tabGroupCount_Equals1: TabGroup[] = groups.filter(g => g.tabCount === 1); // Create a new array with TabGroup interface, filtering tabCount === 1
        expect(tabGroupCount_Equals1.length).toBe(1);
        expect(tabGroupCount_Equals1[0].id).toBe("2");
    })
    it("gets the expected tab group count", async () => {
        for (const id of ["1", "2"]) {
            await saveTabGroup(makeGroup(id));
        }
        //** Good practice: Do not use try, catch block when writing tests */
        const tabGroupCount = await getTabGroupsCount();
        console.log("Successfully catched the tab group count: ", tabGroupCount);
        expect(tabGroupCount).toBe(2);
        await saveTabGroup(makeGroup("10"));
        await expect(getTabGroupsCount()).resolves.toBe(3);
    })
});