import { sum, subtract } from '../sum';
import { describe, expect, test, it } from 'vitest';
import { getAllTabsCount } from "../backend/tab-manager";


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

        // Testing async function
        it('fetch a user', async () => {
            const user = await getAllTabsCount();
            expect (user).toBe(0);
        })
    });
})

