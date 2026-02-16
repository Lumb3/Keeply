import { sum, subtract } from '../sum';
import { describe, expect, test } from 'vitest';

describe("Arithmetic Operations: ", () => {
    test('adds 1 + 2 to equal 3', () => {
        expect(sum(1, 2)).toBe(3);
    });


    test('subtract 5 - 2 to equal 3', () => {
        expect(subtract(5, 2)).toBe(3);
    });

    test ('add 1 + 2 to not equal 4', () =>  {
        expect(sum(1, 2)).not.toBe(4);
    })
});
