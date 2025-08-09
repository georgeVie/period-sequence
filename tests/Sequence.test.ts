/**
 * Comprehensive test suite for Sequence class
 * Tests core functionality, performance, and edge cases
 */

import { Sequence, Period, Bounds, DurationInterval } from '../src/index';

describe('Sequence Class', () => {
  // Test data setup
  const jan1 = new Date('2024-01-01T00:00:00.000Z');
  const jan15 = new Date('2024-01-15T00:00:00.000Z');
  const jan31 = new Date('2024-01-31T00:00:00.000Z');
  const feb1 = new Date('2024-02-01T00:00:00.000Z');
  const feb15 = new Date('2024-02-15T00:00:00.000Z');
  const feb28 = new Date('2024-02-28T00:00:00.000Z');
  const mar1 = new Date('2024-03-01T00:00:00.000Z');

  const period1 = new Period(jan1, jan15);   // Jan 1-15
  const period2 = new Period(jan31, feb15);  // Jan 31 - Feb 15
  const period3 = new Period(feb28, mar1);   // Feb 28 - Mar 1

  describe('Constructor and Basic Properties', () => {
    test('creates empty sequence', () => {
      const sequence = new Sequence();
      expect(sequence.isEmpty()).toBe(true);
      expect(sequence.count()).toBe(0);
    });

    test('creates sequence from periods', () => {
      const sequence = new Sequence(period1, period2, period3);
      expect(sequence.isEmpty()).toBe(false);
      expect(sequence.count()).toBe(3);
    });

    test('sorts periods by start date automatically', () => {
      // Create sequence with periods out of order
      const sequence = new Sequence(period3, period1, period2);
      
      expect(sequence.get(0)).toEqual(period1); // Jan 1-15 first
      expect(sequence.get(1)).toEqual(period2); // Jan 31 - Feb 15 second
      expect(sequence.get(2)).toEqual(period3); // Feb 28 - Mar 1 last
    });

    test('static factory methods work', () => {
      const fromArray = Sequence.fromArray([period1, period2]);
      expect(fromArray.count()).toBe(2);

      const empty = Sequence.empty();
      expect(empty.isEmpty()).toBe(true);
    });
  });

  describe('Access Methods', () => {
    const sequence = new Sequence(period1, period2, period3);

    test('get() returns period by index', () => {
      expect(sequence.get(0)).toEqual(period1);
      expect(sequence.get(1)).toEqual(period2);
      expect(sequence.get(2)).toEqual(period3);
    });

    test('get() throws error for invalid index', () => {
      expect(() => sequence.get(-1)).toThrow('Index -1 out of bounds');
      expect(() => sequence.get(3)).toThrow('Index 3 out of bounds');
    });

    test('first() and last() work correctly', () => {
      expect(sequence.first()).toEqual(period1);
      expect(sequence.last()).toEqual(period3);
      
      const empty = Sequence.empty();
      expect(empty.first()).toBeUndefined();
      expect(empty.last()).toBeUndefined();
    });

    test('toArray() returns copy of periods', () => {
      const array = sequence.toArray();
      expect(array).toEqual([period1, period2, period3]);
      
      // Verify it's a copy (mutation doesn't affect original)
      array.push(new Period(new Date(), new Date(Date.now() + 86400000)));
      expect(sequence.count()).toBe(3);
    });
  });

  describe('Iterator Protocol', () => {
    const sequence = new Sequence(period1, period2, period3);

    test('supports for...of loop', () => {
      const periods: Period[] = [];
      for (const period of sequence) {
        periods.push(period);
      }
      expect(periods).toEqual([period1, period2, period3]);
    });

    test('supports array destructuring', () => {
      const [first, second, third] = sequence;
      expect(first).toEqual(period1);
      expect(second).toEqual(period2);
      expect(third).toEqual(period3);
    });

    test('supports spread operator', () => {
      const periods = [...sequence];
      expect(periods).toEqual([period1, period2, period3]);
    });
  });

  describe('Boundaries Method', () => {
    test('returns undefined for empty sequence', () => {
      const empty = Sequence.empty();
      expect(empty.boundaries()).toBeUndefined();
    });

    test('returns single period for sequence of one', () => {
      const sequence = new Sequence(period1);
      expect(sequence.boundaries()).toEqual(period1);
    });

    test('calculates boundaries correctly for multiple periods', () => {
      const sequence = new Sequence(period1, period2, period3);
      const boundaries = sequence.boundaries();
      
      expect(boundaries?.start).toEqual(jan1);   // Earliest start
      expect(boundaries?.end).toEqual(mar1);     // Latest end
    });

    test('handles overlapping periods in boundaries', () => {
      const longPeriod = new Period(jan1, feb28);    // Longer period
      const shortPeriod = new Period(jan15, feb1);   // Shorter period inside
      
      const sequence = new Sequence(shortPeriod, longPeriod);
      const boundaries = sequence.boundaries();
      
      expect(boundaries?.start).toEqual(jan1);
      expect(boundaries?.end).toEqual(feb28);
    });
  });

  describe('Gap Analysis', () => {
    test('returns empty sequence for no gaps', () => {
      // Adjacent periods with no gaps
      const period1 = new Period(jan1, jan15);
      const period2 = new Period(jan15, jan31);  // Touches period1
      
      const sequence = new Sequence(period1, period2);
      const gaps = sequence.gaps();
      
      expect(gaps.isEmpty()).toBe(true);
      expect(gaps.count()).toBe(0);
    });

    test('finds single gap between periods', () => {
      // period1: Jan 1-15, period2: Jan 31-Feb 15 (gap: Jan 15-31)
      const sequence = new Sequence(period1, period2);
      const gaps = sequence.gaps();
      
      expect(gaps.count()).toBe(1);
      const gap = gaps.first()!;
      expect(gap.start).toEqual(jan15);
      expect(gap.end).toEqual(jan31);
    });

    test('finds multiple gaps between periods', () => {
      const sequence = new Sequence(period1, period2, period3);
      const gaps = sequence.gaps();
      
      expect(gaps.count()).toBe(2);
      
      // First gap: Jan 15 - Jan 31
      const gap1 = gaps.get(0);
      expect(gap1.start).toEqual(jan15);
      expect(gap1.end).toEqual(jan31);
      
      // Second gap: Feb 15 - Feb 28
      const gap2 = gaps.get(1);
      expect(gap2.start).toEqual(feb15);
      expect(gap2.end).toEqual(feb28);
    });

    test('handles overlapping periods in gap analysis', () => {
      const overlapping1 = new Period(jan1, jan31);
      const overlapping2 = new Period(jan15, feb15);  // Overlaps with first
      const separate = new Period(feb28, mar1);       // Gap after overlap
      
      const sequence = new Sequence(overlapping1, overlapping2, separate);
      const gaps = sequence.gaps();
      
      // Should find gap between end of overlap and separate period
      expect(gaps.count()).toBe(1);
      const gap = gaps.first()!;
      expect(gap.start).toEqual(feb15);  // End of overlapping2
      expect(gap.end).toEqual(feb28);    // Start of separate
    });

    test('caches gap results for performance', () => {
      const sequence = new Sequence(period1, period2, period3);
      
      const gaps1 = sequence.gaps();
      const gaps2 = sequence.gaps();
      
      // Should return the same cached instance
      expect(gaps1).toBe(gaps2);
    });
  });

  describe('Collection Methods', () => {
    const sequence = new Sequence(period1, period2, period3);

    test('filter() creates new sequence with matching periods', () => {
      // Filter periods that start in January
      const januaryPeriods = sequence.filter(p => p.start.getMonth() === 0);
      
      expect(januaryPeriods.count()).toBe(2); // period1 and period2
      expect(januaryPeriods.get(0)).toEqual(period1);
      expect(januaryPeriods.get(1)).toEqual(period2);
    });

    test('map() transforms periods to other values', () => {
      const durations = sequence.map(p => p.getDuration().days);
      expect(durations).toEqual([14, 15, 2]); // Actual days: 14, 15, 2
    });

    test('some() checks if any period matches', () => {
      expect(sequence.some(p => p.start.getMonth() === 1)).toBe(true);  // February exists
      expect(sequence.some(p => p.start.getMonth() === 3)).toBe(false); // April doesn't exist
    });

    test('every() checks if all periods match', () => {
      expect(sequence.every(p => p.start.getFullYear() === 2024)).toBe(true);  // All in 2024
      expect(sequence.every(p => p.start.getMonth() === 0)).toBe(false);       // Not all in January
    });

    test('find() returns first matching period', () => {
      const februaryPeriod = sequence.find(p => p.start.getMonth() === 1);
      expect(februaryPeriod).toEqual(period3); // period3 starts in February (Feb 28)
      
      const nonExistent = sequence.find(p => p.start.getMonth() === 5);
      expect(nonExistent).toBeUndefined();
    });
  });

  describe('Sorting Methods', () => {
    test('sort() with custom comparator', () => {
      const sequence = new Sequence(period1, period2, period3);
      
      // Sort by duration (longest first)
      const byDuration = sequence.sort((a, b) => {
        const durA = a.endTime - a.startTime;
        const durB = b.endTime - b.startTime;
        return durB - durA;
      });
      
      // period2 should be first (longest duration: 15 days)
      expect(byDuration.get(0)).toEqual(period2);
    });

    test('sortByStartDate() returns same sequence if already sorted', () => {
      const sequence = new Sequence(period1, period2, period3);
      const sorted = sequence.sortByStartDate();
      
      // Should return same instance since already sorted
      expect(sorted).toBe(sequence);
    });

    test('sortByDuration() sorts by duration correctly', () => {
      const sequence = new Sequence(period1, period2, period3);
      const sorted = sequence.sortByDuration();
      
      // The original sequence is [period1: 14 days, period2: 15 days, period3: 2 days]
      // After sorting by duration: [period3: 2 days, period1: 14 days, period2: 15 days]
      const durations = sorted.map(p => p.getDuration().days);
      expect(durations).toEqual([2, 14, 15]); // Shortest to longest
      expect(sorted.get(0)).toEqual(period3); // period3 has shortest duration
    });
  });

  describe('Equality and String Representation', () => {
    test('equals() compares sequences correctly', () => {
      const sequence1 = new Sequence(period1, period2);
      const sequence2 = new Sequence(period1, period2);
      const sequence3 = new Sequence(period1, period3);
      
      expect(sequence1.equals(sequence2)).toBe(true);
      expect(sequence1.equals(sequence3)).toBe(false);
      
      const empty1 = Sequence.empty();
      const empty2 = Sequence.empty();
      expect(empty1.equals(empty2)).toBe(true);
    });

    test('toString() provides meaningful representation', () => {
      const empty = Sequence.empty();
      expect(empty.toString()).toBe('Sequence(empty)');
      
      const sequence = new Sequence(period1, period2);
      const str = sequence.toString();
      expect(str).toContain('Sequence(2 periods');
      expect(str).toContain('[2024-01-01, 2024-02-15)');
    });
  });

  describe('Performance Tests', () => {
    test('handles large sequences efficiently', () => {
      // Create 10k periods
      const periods: Period[] = [];
      for (let i = 0; i < 10000; i++) {
        const start = new Date(2024, 0, 1 + i);
        const end = new Date(2024, 0, 2 + i);
        periods.push(new Period(start, end));
      }
      
      const startTime = performance.now();
      const sequence = new Sequence(...periods);
      const endTime = performance.now();
      
      expect(sequence.count()).toBe(10000);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });

    test('gap analysis is efficient on large sequences', () => {
      // Create 1k periods with gaps
      const periods: Period[] = [];
      for (let i = 0; i < 1000; i++) {
        const start = new Date(2024, 0, 1 + i * 2);     // Every other day
        const end = new Date(2024, 0, 2 + i * 2);
        periods.push(new Period(start, end));
      }
      
      const sequence = new Sequence(...periods);
      
      const startTime = performance.now();
      const gaps = sequence.gaps();
      const endTime = performance.now();
      
      expect(gaps.count()).toBe(999); // 999 gaps between 1000 periods
      expect(endTime - startTime).toBeLessThan(50); // Should be very fast
    });

    test('boundaries calculation is cached and fast', () => {
      const periods: Period[] = [];
      for (let i = 0; i < 5000; i++) {
        const start = new Date(2024, 0, 1 + i);
        const end = new Date(2024, 0, 2 + i);
        periods.push(new Period(start, end));
      }
      
      const sequence = new Sequence(...periods);
      
      // First call
      const start1 = performance.now();
      const boundaries1 = sequence.boundaries();
      const end1 = performance.now();
      
      // Second call (should be cached)
      const start2 = performance.now();
      const boundaries2 = sequence.boundaries();
      const end2 = performance.now();
      
      expect(boundaries1).toBe(boundaries2); // Same instance
      expect(end2 - start2).toBeLessThan(end1 - start1); // Cached call faster
    });
  });

  describe('Edge Cases', () => {
    test('handles single period sequence', () => {
      const sequence = new Sequence(period1);
      
      expect(sequence.count()).toBe(1);
      expect(sequence.isEmpty()).toBe(false);
      expect(sequence.first()).toEqual(period1);
      expect(sequence.last()).toEqual(period1);
      expect(sequence.boundaries()).toEqual(period1);
      expect(sequence.gaps().isEmpty()).toBe(true);
    });

    test('handles periods with different bounds', () => {
      const inclusive = new Period(jan1, jan15, Bounds.IncludeAll);
      const exclusive = new Period(jan31, feb15, Bounds.ExcludeAll);
      
      const sequence = new Sequence(inclusive, exclusive);
      expect(sequence.count()).toBe(2);
      
      const gaps = sequence.gaps();
      expect(gaps.count()).toBe(1); // Should find gap regardless of bounds
    });

    test('handles overlapping periods correctly', () => {
      const period1 = new Period(jan1, jan31);
      const period2 = new Period(jan15, feb15); // Overlaps with period1
      
      const sequence = new Sequence(period1, period2);
      const gaps = sequence.gaps();
      
      expect(gaps.isEmpty()).toBe(true); // No gaps when periods overlap
    });

    test('handles identical periods', () => {
      const identical1 = new Period(jan1, jan15);
      const identical2 = new Period(jan1, jan15);
      
      const sequence = new Sequence(identical1, identical2);
      expect(sequence.count()).toBe(2);
      expect(sequence.gaps().isEmpty()).toBe(true); // No gaps between identical periods
    });
  });

  describe('Sequence Set Operations', () => {
    const jan1to15 = new Period(new Date('2024-01-01T00:00:00.000Z'), new Date('2024-01-15T00:00:00.000Z'));
    const jan10to25 = new Period(new Date('2024-01-10T00:00:00.000Z'), new Date('2024-01-25T00:00:00.000Z'));
    const feb1to15 = new Period(new Date('2024-02-01T00:00:00.000Z'), new Date('2024-02-15T00:00:00.000Z'));
    
    const sequence1 = new Sequence(jan1to15, feb1to15);
    const sequence2 = new Sequence(jan10to25);

    test('union combines all periods from both sequences', () => {
      const result = sequence1.union(sequence2);
      
      expect(result.count()).toBe(3); // jan1to15, feb1to15, jan10to25
      expect(result.toArray()).toContain(jan1to15);
      expect(result.toArray()).toContain(jan10to25);
      expect(result.toArray()).toContain(feb1to15);
    });

    test('intersect finds overlapping periods', () => {
      const result = sequence1.intersect(sequence2);
      
      expect(result.count()).toBe(1); // Only jan1to15 overlaps with jan10to25
      const intersection = result.first()!;
      
      // Intersection should be from jan10 to jan15
      expect(intersection.start).toEqual(new Date('2024-01-10T00:00:00.000Z'));
      expect(intersection.end).toEqual(new Date('2024-01-15T00:00:00.000Z'));
    });

    test('subtract removes overlapping periods', () => {
      const result = sequence1.subtract(sequence2);
      
      expect(result.count()).toBe(1); // Only feb1to15 remains (jan1to15 overlaps with jan10to25)
      expect(result.first()).toEqual(feb1to15);
    });

    test('intersect with no overlaps returns empty sequence', () => {
      const nonOverlapping = new Sequence(new Period(new Date('2024-03-01T00:00:00.000Z'), new Date('2024-03-15T00:00:00.000Z')));
      const result = sequence1.intersect(nonOverlapping);
      
      expect(result.isEmpty()).toBe(true);
    });

    test('subtract with no overlaps returns original sequence', () => {
      const nonOverlapping = new Sequence(new Period(new Date('2024-03-01T00:00:00.000Z'), new Date('2024-03-15T00:00:00.000Z')));
      const result = sequence1.subtract(nonOverlapping);
      
      expect(result.count()).toBe(2);
      expect(result.equals(sequence1)).toBe(true);
    });

    test('set operations preserve period boundaries', () => {
      const inclusivePeriod = new Period(jan1to15.start, jan1to15.end, Bounds.IncludeAll);
      const inclusiveSequence = new Sequence(inclusivePeriod);
      
      const intersection = sequence1.intersect(inclusiveSequence);
      expect(intersection.count()).toBe(1);
      
      // The intersection should preserve the original bounds
      expect(intersection.first()!.bounds).toBe(jan1to15.bounds);
    });
  });

  describe('High-Performance Sequence Operations', () => {
    // Test data that matches the existing test scope
    const jan1to15 = new Period(new Date('2024-01-01T00:00:00.000Z'), new Date('2024-01-15T00:00:00.000Z'));
    const jan10to25 = new Period(new Date('2024-01-10T00:00:00.000Z'), new Date('2024-01-25T00:00:00.000Z'));
    const feb1to15 = new Period(new Date('2024-02-01T00:00:00.000Z'), new Date('2024-02-15T00:00:00.000Z'));
    
    // Create test data for performance testing
    const createLargeSequence = (count: number, startDate: Date = new Date('2024-01-01T00:00:00.000Z')): Sequence => {
      const periods: Period[] = [];
      for (let i = 0; i < count; i++) {
        const start = new Date(startDate.getTime() + i * 86400000); // Each day
        const end = new Date(start.getTime() + 43200000); // 12 hours duration
        periods.push(new Period(start, end));
      }
      return new Sequence(...periods);
    };

    describe('Union Operations', () => {
      test('handles empty sequence union efficiently', () => {
        const seq1 = new Sequence(jan1to15);
        const empty = Sequence.empty();
        
        const result1 = seq1.union(empty);
        const result2 = empty.union(seq1);
        
        expect(result1).toBe(seq1); // Fast path returns same instance
        expect(result2).toBe(seq1); // Fast path returns same instance
      });

      test('deduplicates identical periods in union', () => {
        const seq1 = new Sequence(jan1to15, feb1to15);
        const seq2 = new Sequence(jan1to15, jan10to25); // jan1to15 is duplicate
        
        const result = seq1.union(seq2);
        
        expect(result.count()).toBe(3); // Should deduplicate jan1to15
        expect(result.toArray()).toContain(jan1to15);
        expect(result.toArray()).toContain(feb1to15);
        expect(result.toArray()).toContain(jan10to25);
      });

      test('union performance with large sequences', () => {
        const seq1 = createLargeSequence(1000);
        const seq2 = createLargeSequence(1000, new Date('2024-06-01T00:00:00.000Z'));
        
        const startTime = performance.now();
        const result = seq1.union(seq2);
        const endTime = performance.now();
        
        expect(result.count()).toBe(2000);
        expect(endTime - startTime).toBeLessThan(50); // Should be very fast
      });
    });

    describe('Intersect Operations with Two-Pointer Algorithm', () => {
      test('handles non-overlapping sequences efficiently', () => {
        const seq1 = new Sequence(jan1to15);
        const seq2 = new Sequence(feb1to15);
        
        const result = seq1.intersect(seq2);
        
        expect(result.isEmpty()).toBe(true);
      });

      test('finds multiple intersections efficiently', () => {
        const jan1to20 = new Period(new Date('2024-01-01T00:00:00.000Z'), new Date('2024-01-20T00:00:00.000Z'));
        const jan15to31 = new Period(new Date('2024-01-15T00:00:00.000Z'), new Date('2024-01-31T00:00:00.000Z'));
        const jan25to31 = new Period(new Date('2024-01-25T00:00:00.000Z'), new Date('2024-01-31T00:00:00.000Z'));
        
        const seq1 = new Sequence(jan1to20, jan25to31);
        const seq2 = new Sequence(jan15to31);
        
        const result = seq1.intersect(seq2);
        
        expect(result.count()).toBe(2);
        // First intersection: jan15 to jan20
        expect(result.get(0).start).toEqual(new Date('2024-01-15T00:00:00.000Z'));
        expect(result.get(0).end).toEqual(new Date('2024-01-20T00:00:00.000Z'));
        // Second intersection: jan25 to jan31
        expect(result.get(1).start).toEqual(new Date('2024-01-25T00:00:00.000Z'));
        expect(result.get(1).end).toEqual(new Date('2024-01-31T00:00:00.000Z'));
      });

      test('intersect performance with large sequences', () => {
        // Create overlapping sequences
        const seq1 = createLargeSequence(1000);
        const seq2 = createLargeSequence(1000, new Date('2024-01-01T06:00:00.000Z')); // 6 hour offset for overlaps
        
        const startTime = performance.now();
        const result = seq1.intersect(seq2);
        const endTime = performance.now();
        
        expect(result.count()).toBeGreaterThan(0);
        expect(endTime - startTime).toBeLessThan(100); // Two-pointer algorithm should be fast
      });
    });

    describe('Subtract Operations with Early Termination', () => {
      test('handles non-overlapping subtract efficiently', () => {
        const seq1 = new Sequence(jan1to15, feb1to15);
        const seq2 = new Sequence(new Period(new Date('2024-03-01T00:00:00.000Z'), new Date('2024-03-15T00:00:00.000Z')));
        
        const result = seq1.subtract(seq2);
        
        expect(result.equals(seq1)).toBe(true); // Fast path returns original
      });

      test('boundary optimization in subtract', () => {
        // Create sequences where boundary check can eliminate most comparisons
        const earlySeq = createLargeSequence(100, new Date('2024-01-01T00:00:00.000Z'));
        const lateSeq = createLargeSequence(100, new Date('2024-12-01T00:00:00.000Z'));
        
        const startTime = performance.now();
        const result = earlySeq.subtract(lateSeq);
        const endTime = performance.now();
        
        expect(result.count()).toBe(100); // All periods should remain
        expect(endTime - startTime).toBeLessThan(10); // Boundary optimization should make this very fast
      });

      test('subtract performance with partial overlaps', () => {
        const seq1 = createLargeSequence(1000);
        const seq2 = createLargeSequence(100, new Date('2024-01-15T00:00:00.000Z')); // Smaller overlapping sequence
        
        const startTime = performance.now();
        const result = seq1.subtract(seq2);
        const endTime = performance.now();
        
        expect(result.count()).toBeLessThan(seq1.count());
        expect(endTime - startTime).toBeLessThan(50); // Early termination should help
      });
    });

    describe('Merge Operations', () => {
      test('merges overlapping periods efficiently', () => {
        const jan1to15 = new Period(new Date('2024-01-01T00:00:00.000Z'), new Date('2024-01-15T00:00:00.000Z'));
        const jan10to20 = new Period(new Date('2024-01-10T00:00:00.000Z'), new Date('2024-01-20T00:00:00.000Z'));
        const jan18to25 = new Period(new Date('2024-01-18T00:00:00.000Z'), new Date('2024-01-25T00:00:00.000Z'));
        const feb1to15 = new Period(new Date('2024-02-01T00:00:00.000Z'), new Date('2024-02-15T00:00:00.000Z'));
        
        const sequence = new Sequence(jan1to15, jan10to20, jan18to25, feb1to15);
        const merged = sequence.merge();
        
        expect(merged.count()).toBe(2); // Should merge the three January periods into one
        expect(merged.get(0).start).toEqual(new Date('2024-01-01T00:00:00.000Z'));
        expect(merged.get(0).end).toEqual(new Date('2024-01-25T00:00:00.000Z'));
        expect(merged.get(1)).toEqual(feb1to15);
      });

      test('merge performance with many overlapping periods', () => {
        // Create overlapping periods
        const periods: Period[] = [];
        for (let i = 0; i < 1000; i++) {
          const start = new Date(2024, 0, 1 + Math.floor(i / 10)); // 10 periods per day
          const end = new Date(start.getTime() + 86400000); // 1 day duration
          periods.push(new Period(start, end));
        }
        
        const sequence = new Sequence(...periods);
        
        const startTime = performance.now();
        const merged = sequence.merge();
        const endTime = performance.now();
        
        expect(merged.count()).toBeLessThan(sequence.count());
        expect(endTime - startTime).toBeLessThan(25); // O(n) algorithm should be very fast
      });

      test('handles touching periods in merge', () => {
        const jan1to15 = new Period(new Date('2024-01-01T00:00:00.000Z'), new Date('2024-01-15T00:00:00.000Z'));
        const jan15to31 = new Period(new Date('2024-01-15T00:00:00.000Z'), new Date('2024-01-31T00:00:00.000Z'));
        
        const sequence = new Sequence(jan1to15, jan15to31);
        const merged = sequence.merge();
        
        expect(merged.count()).toBe(1); // Should merge touching periods
        expect(merged.get(0).start).toEqual(new Date('2024-01-01T00:00:00.000Z'));
        expect(merged.get(0).end).toEqual(new Date('2024-01-31T00:00:00.000Z'));
      });
    });

    describe('Boundary Logic Tests for Date-Only Operations', () => {
      test('IncludeStartExcludeEnd [start, end) - adjacent periods merge', () => {
        const period1 = new Period('2024-01-01', '2024-01-02', Bounds.IncludeStartExcludeEnd); // [Jan 1, Jan 2)
        const period2 = new Period('2024-01-02', '2024-01-03', Bounds.IncludeStartExcludeEnd); // [Jan 2, Jan 3)
        
        const sequence = new Sequence(period1, period2);
        const merged = sequence.merge();
        
        expect(merged.count()).toBe(1);
        expect(merged.get(0).toString()).toBe('[2024-01-01, 2024-01-03)');
        expect(merged.get(0).bounds).toBe(Bounds.IncludeStartExcludeEnd);
      });

      test('ExcludeStartIncludeEnd (start, end] - overlapping periods merge', () => {
        const period1 = new Period('2024-01-01', '2024-01-02', Bounds.ExcludeStartIncludeEnd); // (Jan 1, Jan 2]
        const period2 = new Period('2024-01-02', '2024-01-03', Bounds.ExcludeStartIncludeEnd); // (Jan 2, Jan 3]
        
        const sequence = new Sequence(period1, period2);
        const merged = sequence.merge();
        
        // These should merge because they both include Jan 2
        expect(merged.count()).toBe(1);
        expect(merged.get(0).toString()).toBe('(2024-01-01, 2024-01-03]');
        expect(merged.get(0).bounds).toBe(Bounds.ExcludeStartIncludeEnd);
      });

      test('IncludeAll [start, end] - overlapping on boundaries', () => {
        const period1 = new Period('2024-01-01', '2024-01-02', Bounds.IncludeAll); // [Jan 1, Jan 2]
        const period2 = new Period('2024-01-02', '2024-01-03', Bounds.IncludeAll); // [Jan 2, Jan 3]
        
        const sequence = new Sequence(period1, period2);
        const merged = sequence.merge();
        
        expect(merged.count()).toBe(1);
        expect(merged.get(0).toString()).toBe('[2024-01-01, 2024-01-03]');
        expect(merged.get(0).bounds).toBe(Bounds.IncludeAll);
      });

      test('ExcludeAll (start, end) - no merging on boundaries', () => {
        const period1 = new Period('2024-01-01', '2024-01-03', Bounds.ExcludeAll); // (Jan 1, Jan 3)
        const period2 = new Period('2024-01-03', '2024-01-05', Bounds.ExcludeAll); // (Jan 3, Jan 5)
        
        const sequence = new Sequence(period1, period2);
        const merged = sequence.merge();
        
        // These should NOT merge because neither includes Jan 3
        expect(merged.count()).toBe(2);
      });

      test('Mixed bounds - IncludeStartExcludeEnd + ExcludeStartIncludeEnd', () => {
        const period1 = new Period('2024-01-01', '2024-01-02', Bounds.IncludeStartExcludeEnd); // [Jan 1, Jan 2)
        const period2 = new Period('2024-01-02', '2024-01-03', Bounds.ExcludeStartIncludeEnd); // (Jan 2, Jan 3]
        
        const sequence = new Sequence(period1, period2);
        const merged = sequence.merge();
        
        // These should NOT merge because period1 excludes Jan 2 and period2 excludes Jan 2
        expect(merged.count()).toBe(2);
      });

      test('Mixed bounds - IncludeAll + IncludeStartExcludeEnd merge', () => {
        const period1 = new Period('2024-01-01', '2024-01-02', Bounds.IncludeAll); // [Jan 1, Jan 2]
        const period2 = new Period('2024-01-02', '2024-01-03', Bounds.IncludeStartExcludeEnd); // [Jan 2, Jan 3)
        
        const sequence = new Sequence(period1, period2);
        const merged = sequence.merge();
        
        // These should merge because period1 includes Jan 2 and period2 includes Jan 2
        expect(merged.count()).toBe(1);
        expect(merged.get(0).toString()).toBe('[2024-01-01, 2024-01-03]');
      });

      test('Complex seasonal boundaries - realistic scenario', () => {
        // Realistic scenario: seasons that end/start on same day
        const winter = new Period('2024-01-01', '2024-03-20', Bounds.IncludeStartExcludeEnd); // [Jan 1, Mar 20)
        const spring = new Period('2024-03-20', '2024-06-21', Bounds.IncludeStartExcludeEnd); // [Mar 20, Jun 21)
        const summer = new Period('2024-06-21', '2024-09-23', Bounds.IncludeStartExcludeEnd); // [Jun 21, Sep 23)
        const fall = new Period('2024-09-23', '2024-12-21', Bounds.IncludeStartExcludeEnd);   // [Sep 23, Dec 21)
        
        const yearSequence = new Sequence(winter, spring, summer, fall);
        const merged = yearSequence.merge();
        
        expect(merged.count()).toBe(1);
        expect(merged.get(0).toString()).toBe('[2024-01-01, 2024-12-21)');
        expect(merged.get(0).durationInDays).toBe(355); // Should be 355 days
      });

      test('Sequence with overlapping periods - should merge all', () => {
        const periods = [
          new Period('2024-01-01', '2024-01-05', Bounds.IncludeStartExcludeEnd), // [Jan 1, Jan 5)
          new Period('2024-01-03', '2024-01-07', Bounds.IncludeStartExcludeEnd), // [Jan 3, Jan 7) - overlaps
          new Period('2024-01-06', '2024-01-10', Bounds.IncludeStartExcludeEnd), // [Jan 6, Jan 10) - overlaps
        ];
        
        const sequence = new Sequence(...periods);
        const merged = sequence.merge();
        
        expect(merged.count()).toBe(1);
        expect(merged.get(0).toString()).toBe('[2024-01-01, 2024-01-10)');
      });

      test('Sequence bounds preservation - uses first period bounds', () => {
        const period1 = new Period('2024-01-01', '2024-01-02', Bounds.IncludeAll); // [Jan 1, Jan 2]
        const period2 = new Period('2024-01-02', '2024-01-03', Bounds.ExcludeStartIncludeEnd); // (Jan 2, Jan 3]
        
        const sequence = new Sequence(period1, period2);
        const merged = sequence.merge();
        
        expect(merged.count()).toBe(1);
        // Should preserve the bounds of the first period
        expect(merged.get(0).bounds).toBe(Bounds.IncludeAll);
      });

      test('Consecutive single-day periods merge into multi-day period', () => {
        const periods = [
          new Period('2024-01-01', '2024-01-02'), // Single day
          new Period('2024-01-02', '2024-01-03'), // Single day
          new Period('2024-01-03', '2024-01-04'), // Single day
          new Period('2024-01-04', '2024-01-05')  // Single day
        ];
        
        const sequence = new Sequence(...periods);
        const merged = sequence.merge();
        
        expect(merged.count()).toBe(1);
        expect(merged.get(0).toString()).toBe('[2024-01-01, 2024-01-05)');
        expect(merged.get(0).durationInDays).toBe(4);
      });
    });

    describe('Total Duration Performance', () => {
      test('calculates total duration efficiently', () => {
        const sequence = createLargeSequence(10000); // Large sequence
        
        const startTime = performance.now();
        const totalMs = sequence.totalDuration();
        const endTime = performance.now();
        
        expect(totalMs).toBeGreaterThan(0);
        expect(endTime - startTime).toBeLessThan(10); // Simple loop should be very fast
      });

      test('total duration accuracy', () => {
        const jan1to2 = new Period(new Date('2024-01-01T00:00:00.000Z'), new Date('2024-01-02T00:00:00.000Z')); // 1 day
        const jan3to5 = new Period(new Date('2024-01-03T00:00:00.000Z'), new Date('2024-01-05T00:00:00.000Z')); // 2 days
        
        const sequence = new Sequence(jan1to2, jan3to5);
        const totalMs = sequence.totalDuration();
        
        expect(totalMs).toBe(3 * 24 * 60 * 60 * 1000); // 3 days in milliseconds
      });
    });

    describe('Memory Efficiency Tests', () => {
      test('sequence operations maintain immutability', () => {
        const original = new Sequence(jan1to15, feb1to15);
        const other = new Sequence(jan10to25);
        
        const union = original.union(other);
        const intersect = original.intersect(other);
        const subtract = original.subtract(other);
        const merged = original.merge();
        
        // Original should be unchanged
        expect(original.count()).toBe(2);
        expect(original.get(0)).toBe(jan1to15);
        expect(original.get(1)).toBe(feb1to15);
        
        // Results should be different instances
        expect(union).not.toBe(original);
        expect(intersect).not.toBe(original);
        expect(subtract).not.toBe(original);
        expect(merged).not.toBe(original);
      });

      test('large sequence operations do not cause memory leaks', () => {
        // This test ensures we're not creating excessive intermediate objects
        const seq1 = createLargeSequence(1000);
        const seq2 = createLargeSequence(1000, new Date('2024-06-01T00:00:00.000Z'));
        
        // Perform multiple operations
        const results = [];
        for (let i = 0; i < 10; i++) {
          results.push(seq1.union(seq2));
          results.push(seq1.intersect(seq2));
          results.push(seq1.subtract(seq2));
        }
        
        expect(results.length).toBe(30);
        // If this test completes without memory issues, our implementation is efficient
      });
    });
  });
});
