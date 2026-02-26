// Tips for Writing Good Tests

// One assertion per test where possible — it makes failures easier to diagnose.
// Name tests like sentences — it('returns null when user is not found') is much better than it('test 1').
// Test behavior, not implementation — test what a function does, not how it's internally structured.
// Keep tests isolated — use beforeEach to reset state; never let one test depend on another.

import { sum, subtract } from '../sum';
import { describe, expect, test, it, vi, beforeEach, afterAll } from 'vitest';
import { getAllTabsCount } from "../backend/tab-manager";

//**
// Every it() block starts fresh getAllTabsCount
//  */
beforeEach(() => {
    vi.clearAllMocks(); // Clear mocks between tests
});


// mock function (stores an object -> key-value pair)
vi.mock("../backend/tab-manager", () => ({
    getAllTabsCount: vi
        .fn()
        .mockResolvedValueOnce(5)          // First call
        .mockResolvedValueOnce({ name: "Alice" }) // Second call
        .mockResolvedValue(0) // Third call
}))

//** Professional version – Just create the mock,
//   Use the function in different ResolvedValues  */
vi.mock("../backend/storage", () => ({
    saveTabGroup: vi.fn()
}))

describe("Math utility tests: ", () => {
    describe("Arithmetic Operations: ", () => {
        test('adds 1 + 2 to equal 3', () => {
            expect(sum(1, 2)).toBe(3);
        });


        test('subtract 5 - 2 to equal 3', () => {
            expect(subtract(5, 2)).toBe(3);
        });

        test('add 1 + 2 to not equal 4', () => {
            expect(sum(1, 2)).not.toBe(4);
        })

        test("subtract 2 - 1 to equal to 1", () => {
            expect(subtract(2, 1)).toEqual(1);
        })
        it("subtract 2 - 1 to not equal to 0", () => {
            expect(subtract(2, 1)).not.toBe(0);
        })

        // Testing async function (it = test)
        it('First call of the getAllTabsCount function', async () => {
            // First call of the getAllTabsCount function
            const user = await getAllTabsCount();
            expect(user).toBe(5);
        })
    });
})

// Using vi for mocking (replacing real Chrome with a fake version)
const mockFn = vi.fn().mockReturnValue(42); // create a mock function
mockFn('hello');
expect(mockFn).toHaveBeenCalledWith('hello');
expect(mockFn).toHaveBeenCalledTimes(1);
expect(mockFn()).toBe(42); // the function mock returns value 42


// Testing an async function:

describe("Async function test", () => {
    it("Second call of the getAllTabsCount function", async () => {
        // Second call of the getAllTabsCount function
        const user = await getAllTabsCount();
        expect(user).toEqual({ name: "Alice" });
        expect(getAllTabsCount).toHaveBeenCalledTimes(1);
    })

    it("Third call of the getAllTabsCount function", async () => {
        const user = await getAllTabsCount();
        expect(user).toBe(0); // Third call
    })
})

afterAll(() => {
    vi.clearAllMocks();
})