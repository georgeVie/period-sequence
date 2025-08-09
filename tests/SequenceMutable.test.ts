/**
 * Tests for mutable-style methods in Sequence class
 * These methods provide PHP League Period compatibility while maintaining immutability
 */

import { Period, Sequence } from '../src/index';

describe('Sequence Mutable-Style Methods', () => {
  let period1: Period;
  let period2: Period;
  let period3: Period;
  let sequence: Sequence;

  beforeEach(() => {
    period1 = Period.fromDay('2024-01-01');
    period2 = Period.fromDay('2024-01-02'); 
    period3 = Period.fromDay('2024-01-03');
    sequence = new Sequence(period1, period2);
  });

  describe('push()', () => {
    test('adds period to end and returns new sequence', () => {
      const newSequence = sequence.push(period3);
      
      expect(newSequence.count()).toBe(3);
      expect(newSequence.get(2)).toBe(period3);
      expect(newSequence.last()).toBe(period3);
      
      // Original sequence unchanged (immutable)
      expect(sequence.count()).toBe(2);
      expect(sequence !== newSequence).toBe(true);
    });

    test('preserves order when pushing', () => {
      const newSequence = sequence.push(period3);
      
      expect(newSequence.get(0)).toBe(period1);
      expect(newSequence.get(1)).toBe(period2);
      expect(newSequence.get(2)).toBe(period3);
    });
  });

  describe('unshift()', () => {
    test('adds period to beginning and returns new sequence', () => {
      const newPeriod = Period.fromDay('2023-12-31');
      const newSequence = sequence.unshift(newPeriod);
      
      expect(newSequence.count()).toBe(3);
      expect(newSequence.get(0)).toBe(newPeriod);
      expect(newSequence.first()).toBe(newPeriod);
      
      // Original sequence unchanged
      expect(sequence.count()).toBe(2);
    });

    test('shifts existing periods to the right', () => {
      const newPeriod = Period.fromDay('2023-12-31');
      const newSequence = sequence.unshift(newPeriod);
      
      expect(newSequence.get(0)).toBe(newPeriod);
      expect(newSequence.get(1)).toBe(period1);
      expect(newSequence.get(2)).toBe(period2);
    });
  });

  describe('insert()', () => {
    test('inserts period at specified index', () => {
      const newSequence = sequence.insert(1, period3);
      
      expect(newSequence.count()).toBe(3);
      expect(newSequence.get(0)).toBe(period1);
      expect(newSequence.get(1)).toBe(period3);
      expect(newSequence.get(2)).toBe(period2);
    });

    test('inserts at beginning (index 0)', () => {
      const newSequence = sequence.insert(0, period3);
      
      expect(newSequence.get(0)).toBe(period3);
      expect(newSequence.get(1)).toBe(period1);
      expect(newSequence.get(2)).toBe(period2);
    });

    test('inserts at end (index = length)', () => {
      const newSequence = sequence.insert(2, period3);
      
      expect(newSequence.get(0)).toBe(period1);
      expect(newSequence.get(1)).toBe(period2);
      expect(newSequence.get(2)).toBe(period3);
    });

    test('supports negative indexing', () => {
      // -1 means insert before the last element (at index 1 in a 2-element array)
      const newSequence = sequence.insert(-1, period3);
      
      expect(newSequence.get(0)).toBe(period1);
      expect(newSequence.get(1)).toBe(period3);
      expect(newSequence.get(2)).toBe(period2);
    });

    test('throws error for invalid index', () => {
      expect(() => sequence.insert(10, period3)).toThrow('Index 10 is out of bounds');
    });
  });

  describe('remove()', () => {
    test('removes and returns period at index', () => {
      const originalSequence = new Sequence(period1, period2, period3);
      const removedPeriod = originalSequence.remove(1);
      
      expect(removedPeriod).toBe(period2);
      expect(originalSequence.count()).toBe(2);
      expect(originalSequence.get(0)).toBe(period1);
      expect(originalSequence.get(1)).toBe(period3);
    });

    test('supports negative indexing', () => {
      const originalSequence = new Sequence(period1, period2, period3);
      const removedPeriod = originalSequence.remove(-1);
      
      expect(removedPeriod).toBe(period3);
      expect(originalSequence.count()).toBe(2);
    });

    test('throws error for invalid index', () => {
      expect(() => sequence.remove(10)).toThrow('Index 10 is out of bounds');
      expect(() => sequence.remove(-5)).toThrow('Index -3 is out of bounds');
    });
  });

  describe('set()', () => {
    test('replaces period at index and returns new sequence', () => {
      const newSequence = sequence.set(1, period3);
      
      expect(newSequence.count()).toBe(2);
      expect(newSequence.get(0)).toBe(period1);
      expect(newSequence.get(1)).toBe(period3);
      
      // Original unchanged
      expect(sequence.get(1)).toBe(period2);
    });

    test('supports negative indexing', () => {
      const newSequence = sequence.set(-1, period3);
      
      expect(newSequence.get(0)).toBe(period1);
      expect(newSequence.get(1)).toBe(period3);
    });

    test('throws error for invalid index', () => {
      expect(() => sequence.set(10, period3)).toThrow('Index 10 is out of bounds');
    });
  });

  describe('clear()', () => {
    test('returns empty sequence', () => {
      const emptySequence = sequence.clear();
      
      expect(emptySequence.isEmpty()).toBe(true);
      expect(emptySequence.count()).toBe(0);
      
      // Original unchanged
      expect(sequence.count()).toBe(2);
    });
  });

  describe('contains()', () => {
    test('returns true for periods in sequence', () => {
      expect(sequence.contains(period1)).toBe(true);
      expect(sequence.contains(period2)).toBe(true);
    });

    test('returns false for periods not in sequence', () => {
      expect(sequence.contains(period3)).toBe(false);
    });

    test('uses period equality for comparison', () => {
      const samePeriod = Period.fromDay('2024-01-01');
      expect(sequence.contains(samePeriod)).toBe(true);
    });
  });

  describe('indexOf()', () => {
    test('returns index of period in sequence', () => {
      expect(sequence.indexOf(period1)).toBe(0);
      expect(sequence.indexOf(period2)).toBe(1);
    });

    test('returns false for period not in sequence', () => {
      expect(sequence.indexOf(period3)).toBe(false);
    });

    test('returns first occurrence index', () => {
      const duplicateSequence = new Sequence(period1, period2, period1);
      expect(duplicateSequence.indexOf(period1)).toBe(0);
    });
  });

  describe('toList()', () => {
    test('returns array of periods (alias for toArray)', () => {
      const list = sequence.toList();
      const array = sequence.toArray();
      
      expect(list).toEqual(array);
      expect(list).toEqual([period1, period2]);
    });
  });

  describe('PHP League Period compatibility', () => {
    test('matches PHP behavior for push operations', () => {
      // Based on the PHP test: $sequence->push(Period::fromDay(2012, 6, 23))
      const sequence = new Sequence();
      const newSequence = sequence.push(Period.fromDay('2012-06-23'));
      
      expect(newSequence.count()).toBe(1);
      expect(newSequence.isEmpty()).toBe(false);
      expect(newSequence.contains(Period.fromDay('2012-06-23'))).toBe(true);
    });

    test('matches PHP behavior for remove operations', () => {
      // Based on the PHP test pattern
      const event1 = Period.fromDay('2012-06-23');
      const event2 = Period.fromDay('2012-06-24');
      const sequence = new Sequence(event1, event2);
      
      const removed = sequence.remove(0);
      expect(removed).toBe(event1);
      expect(sequence.contains(event1)).toBe(false);
      expect(sequence.count()).toBe(1);
    });

    test('matches PHP behavior for insert operations', () => {
      // Based on the PHP insert test patterns
      const sequence = new Sequence();
      const seq1 = sequence.insert(0, Period.fromDay('2010-06-23'));
      expect(seq1.count()).toBe(1);
      
      const seq2 = seq1.insert(1, Period.fromDay('2011-06-24'));
      expect(seq2.count()).toBe(2);
      
      const seq3 = seq2.insert(-1, Period.fromDay('2012-06-25'));
      expect(seq3.count()).toBe(3);
      // -1 insert means before last element, so it goes at index 1
      expect(seq3.get(1)).toEqual(Period.fromDay('2012-06-25'));
    });
  });

  describe('performance with mutable-style operations', () => {
    test('push operations are efficient', () => {
      let currentSequence = Sequence.empty();
      
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        currentSequence = currentSequence.push(Period.fromDay(`2024-01-${(i % 30) + 1}`));
      }
      const end = performance.now();
      
      expect(currentSequence.count()).toBe(1000);
      expect(end - start).toBeLessThan(100); // Should be very fast
    });
  });
});
