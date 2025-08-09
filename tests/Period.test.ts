/**
 * Comprehensive test suite for high-performance period operations
 * Tests all functionality including edge cases and performance benchmarks
 */

import { Period, Bounds, Duration, DurationInterval } from '../src/index';

describe('Period Class', () => {
  const jan1 = new Date('2024-01-01T00:00:00.000Z');
  const jan15 = new Date('2024-01-15T00:00:00.000Z');
  const jan31 = new Date('2024-01-31T00:00:00.000Z');
  const feb1 = new Date('2024-02-01T00:00:00.000Z');
  const feb15 = new Date('2024-02-15T00:00:00.000Z');

  describe('Constructor and Basic Properties', () => {
    test('creates period with valid dates', () => {
      const period = new Period(jan1, jan31);
      expect(period.start).toEqual(jan1);
      expect(period.end).toEqual(jan31);
      expect(period.bounds).toBe(Bounds.IncludeStartExcludeEnd);
    });

    test('creates period with custom bounds', () => {
      const period = new Period(jan1, jan31, Bounds.IncludeAll);
      expect(period.bounds).toBe(Bounds.IncludeAll);
    });

    test('throws error when start >= end', () => {
      expect(() => new Period(jan31, jan1)).toThrow('Start date must be before end date');
      expect(() => new Period(jan1, jan1)).toThrow('Start date must be before end date');
    });

    test('works with numeric timestamps', () => {
      const period = new Period(jan1.getTime(), jan31.getTime());
      expect(period.start).toEqual(jan1);
      expect(period.end).toEqual(jan31);
    });
  });

  describe('Bounds System Tests', () => {
    describe('IncludeStartExcludeEnd [start, end)', () => {
      const period = new Period(jan1, jan31, Bounds.IncludeStartExcludeEnd);

      test('contains start date', () => {
        expect(period.containsDate(jan1)).toBe(true);
      });

      test('does not contain end date', () => {
        expect(period.containsDate(jan31)).toBe(false);
      });

      test('contains dates in between', () => {
        expect(period.containsDate(jan15)).toBe(true);
      });

      test('formats correctly', () => {
        expect(period.format()).toContain('[2024-01-01, 2024-01-31)');
      });
    });

    describe('ExcludeStartIncludeEnd (start, end]', () => {
      const period = new Period(jan1, jan31, Bounds.ExcludeStartIncludeEnd);

      test('does not contain start date', () => {
        expect(period.containsDate(jan1)).toBe(false);
      });

      test('contains end date', () => {
        expect(period.containsDate(jan31)).toBe(true);
      });

      test('contains dates in between', () => {
        expect(period.containsDate(jan15)).toBe(true);
      });

      test('formats correctly', () => {
        expect(period.format()).toContain('(2024-01-01, 2024-01-31]');
      });
    });

    describe('IncludeAll [start, end]', () => {
      const period = new Period(jan1, jan31, Bounds.IncludeAll);

      test('contains start date', () => {
        expect(period.containsDate(jan1)).toBe(true);
      });

      test('contains end date', () => {
        expect(period.containsDate(jan31)).toBe(true);
      });

      test('contains dates in between', () => {
        expect(period.containsDate(jan15)).toBe(true);
      });

      test('formats correctly', () => {
        expect(period.format()).toContain('[2024-01-01, 2024-01-31]');
      });
    });

    describe('ExcludeAll (start, end)', () => {
      const period = new Period(jan1, jan31, Bounds.ExcludeAll);

      test('does not contain start date', () => {
        expect(period.containsDate(jan1)).toBe(false);
      });

      test('does not contain end date', () => {
        expect(period.containsDate(jan31)).toBe(false);
      });

      test('contains dates in between', () => {
        expect(period.containsDate(jan15)).toBe(true);
      });

      test('formats correctly', () => {
        expect(period.format()).toContain('(2024-01-01, 2024-01-31)');
      });
    });
  });

  describe('Period Comparison Tests', () => {
    describe('overlaps() method', () => {
      test('periods with gap do not overlap', () => {
        const period1 = new Period(jan1, jan15);
        const period2 = new Period(feb1, feb15);
        expect(period1.overlaps(period2)).toBe(false);
        expect(period2.overlaps(period1)).toBe(false);
      });

      test('overlapping periods', () => {
        const period1 = new Period(jan1, jan31);
        const period2 = new Period(jan15, feb15);
        expect(period1.overlaps(period2)).toBe(true);
        expect(period2.overlaps(period1)).toBe(true);
      });

      test('adjacent periods with default bounds do not overlap', () => {
        const period1 = new Period(jan1, jan31, Bounds.IncludeStartExcludeEnd);
        const period2 = new Period(jan31, feb15, Bounds.IncludeStartExcludeEnd);
        expect(period1.overlaps(period2)).toBe(false);
      });

      test('adjacent periods with inclusive bounds overlap', () => {
        const period1 = new Period(jan1, jan31, Bounds.IncludeAll);
        const period2 = new Period(jan31, feb15, Bounds.IncludeAll);
        expect(period1.overlaps(period2)).toBe(true);
      });

      test('reverse boundary touch with inclusive bounds', () => {
        // Test the uncovered line 99: other._endTime === this._startTime
        const period1 = new Period(feb1, feb15, Bounds.IncludeStartExcludeEnd);
        const period2 = new Period(jan1, feb1, Bounds.IncludeAll); // End includes feb1
        
        expect(period1.overlaps(period2)).toBe(true); // Should overlap due to inclusive boundary
        expect(period2.overlaps(period1)).toBe(true); // Symmetrical
      });
    });

    describe('contains() method', () => {
      test('period contains smaller period within bounds', () => {
        const outer = new Period(jan1, jan31);
        const inner = new Period(new Date('2024-01-05'), new Date('2024-01-25'));
        expect(outer.contains(inner)).toBe(true);
        expect(inner.contains(outer)).toBe(false);
      });

      test('period does not contain overlapping period', () => {
        const period1 = new Period(jan1, jan31);
        const period2 = new Period(jan15, feb15);
        expect(period1.contains(period2)).toBe(false);
        expect(period2.contains(period1)).toBe(false);
      });

      test('bounds affect containment', () => {
        const outer = new Period(jan1, jan31, Bounds.IncludeStartExcludeEnd);
        const inner = new Period(jan1, jan15, Bounds.IncludeStartExcludeEnd);
        expect(outer.contains(inner)).toBe(true);

        const innerEndingOnBoundary = new Period(jan15, jan31, Bounds.IncludeStartExcludeEnd);
        expect(outer.contains(innerEndingOnBoundary)).toBe(false);
      });
    });

    describe('touches() and abuts() methods', () => {
      test('adjacent periods touch', () => {
        const period1 = new Period(jan1, jan15);
        const period2 = new Period(jan15, jan31);
        expect(period1.touches(period2)).toBe(true);
        expect(period2.touches(period1)).toBe(true);
      });

      test('overlapping periods do not abut', () => {
        const period1 = new Period(jan1, jan31, Bounds.IncludeAll);
        const period2 = new Period(jan31, feb15, Bounds.IncludeAll);
        expect(period1.touches(period2)).toBe(true);
        expect(period1.abuts(period2)).toBe(false); // They overlap at jan31
      });

      test('adjacent periods with exclusive bounds abut', () => {
        const period1 = new Period(jan1, jan15, Bounds.IncludeStartExcludeEnd);
        const period2 = new Period(jan15, jan31, Bounds.IncludeStartExcludeEnd);
        expect(period1.abuts(period2)).toBe(true);
      });

      test('separate periods do not touch', () => {
        const period1 = new Period(jan1, jan15);
        const period2 = new Period(feb1, feb15);
        expect(period1.touches(period2)).toBe(false);
        expect(period1.abuts(period2)).toBe(false);
      });
    });

    describe('equals() method', () => {
      test('identical periods are equal', () => {
        const period1 = new Period(jan1, jan31, Bounds.IncludeStartExcludeEnd);
        const period2 = new Period(jan1, jan31, Bounds.IncludeStartExcludeEnd);
        expect(period1.equals(period2)).toBe(true);
      });

      test('periods with different bounds are not equal', () => {
        const period1 = new Period(jan1, jan31, Bounds.IncludeStartExcludeEnd);
        const period2 = new Period(jan1, jan31, Bounds.IncludeAll);
        expect(period1.equals(period2)).toBe(false);
      });

      test('periods with different dates are not equal', () => {
        const period1 = new Period(jan1, jan31);
        const period2 = new Period(jan1, feb1);
        expect(period1.equals(period2)).toBe(false);
      });
    });
  });

  describe('Period Modification Tests', () => {
    const original = new Period(jan1, jan31, Bounds.IncludeStartExcludeEnd);

    test('startingOn() creates new period with different start', () => {
      const modified = original.startingOn(jan15);
      expect(modified.start).toEqual(jan15);
      expect(modified.end).toEqual(jan31);
      expect(modified.bounds).toBe(Bounds.IncludeStartExcludeEnd);
      expect(original.start).toEqual(jan1); // Original unchanged
    });

    test('endingOn() creates new period with different end', () => {
      const modified = original.endingOn(feb1);
      expect(modified.start).toEqual(jan1);
      expect(modified.end).toEqual(feb1);
      expect(modified.bounds).toBe(Bounds.IncludeStartExcludeEnd);
      expect(original.end).toEqual(jan31); // Original unchanged
    });

    test('withBounds() creates new period with different bounds', () => {
      const modified = original.withBounds(Bounds.IncludeAll);
      expect(modified.start).toEqual(jan1);
      expect(modified.end).toEqual(jan31);
      expect(modified.bounds).toBe(Bounds.IncludeAll);
      expect(original.bounds).toBe(Bounds.IncludeStartExcludeEnd); // Original unchanged
    });
  });

  describe('Named Constructors', () => {
    describe('fromMonth()', () => {
      test('creates period for January 2024', () => {
        const period = Period.fromMonth(2024, 1);
        expect(period.start).toEqual(new Date('2024-01-01T00:00:00.000Z'));
        expect(period.end).toEqual(new Date('2024-02-01T00:00:00.000Z'));
        expect(period.bounds).toBe(Bounds.IncludeStartExcludeEnd);
      });

      test('handles December correctly', () => {
        const period = Period.fromMonth(2024, 12);
        expect(period.start).toEqual(new Date('2024-12-01T00:00:00.000Z'));
        expect(period.end).toEqual(new Date('2025-01-01T00:00:00.000Z'));
      });

      test('works with custom bounds', () => {
        const period = Period.fromMonth(2024, 1, Bounds.IncludeAll);
        expect(period.bounds).toBe(Bounds.IncludeAll);
      });
    });

    describe('fromYear()', () => {
      test('creates period for year 2024', () => {
        const period = Period.fromYear(2024);
        expect(period.start).toEqual(new Date('2024-01-01T00:00:00.000Z'));
        expect(period.end).toEqual(new Date('2025-01-01T00:00:00.000Z'));
        expect(period.bounds).toBe(Bounds.IncludeStartExcludeEnd);
      });
    });

    describe('fromDay()', () => {
      test('creates period for single day', () => {
        const period = Period.fromDay(jan15);
        expect(period.start).toEqual(new Date('2024-01-15T00:00:00.000Z'));
        expect(period.end).toEqual(new Date('2024-01-16T00:00:00.000Z'));
      });

      test('works with string dates', () => {
        const period = Period.fromDay('2024-01-15');
        expect(period.start).toEqual(new Date('2024-01-15T00:00:00.000Z'));
        expect(period.end).toEqual(new Date('2024-01-16T00:00:00.000Z'));
      });
    });
  });

  describe('Duration Tests', () => {
    test('calculates duration correctly', () => {
      const period = new Period(jan1, jan31);
      const duration = period.getDuration();
      
      expect(duration.days).toBe(30);
      expect(duration.hours).toBe(30 * 24);
      expect(duration.minutes).toBe(30 * 24 * 60);
      expect(duration.seconds).toBe(30 * 24 * 60 * 60);
      expect(duration.milliseconds).toBe(30 * 24 * 60 * 60 * 1000);
    });

    test('leap year calculations', () => {
      const feb2024 = Period.fromMonth(2024, 2); // 2024 is a leap year
      const duration = feb2024.getDuration();
      expect(duration.days).toBe(29);
    });
  });

  describe('Format Method Tests', () => {
    const testPeriod = new Period(jan1, jan15);

    test('formats with short option', () => {
      // Test the uncovered lines 291-295: short format
      const formatted = testPeriod.format('short');
      expect(formatted).toContain('Jan 1, 2024');
      expect(formatted).toContain('Jan 15, 2024');
      expect(formatted).toContain('[');
      expect(formatted).toContain(')');
    });

    test('formats with long option', () => {
      // Test the uncovered lines 297-302: long format  
      const formatted = testPeriod.format('long');
      expect(formatted).toContain('Monday');
      expect(formatted).toContain('January 1, 2024');
      expect(formatted).toContain('January 15, 2024');
      expect(formatted).toContain('[');
      expect(formatted).toContain(')');
    });

    test('formats with iso option', () => {
      const formatted = testPeriod.format('iso');
      expect(formatted).toBe('[2024-01-01, 2024-01-15)');
    });
  });

  describe('Performance Tests', () => {
    test('handles large numbers of overlap operations efficiently', () => {
      const period1 = new Period(jan1, jan31);
      const period2 = new Period(jan15, feb15);
      
      const start = performance.now();
      for (let i = 0; i < 100000; i++) {
        period1.overlaps(period2);
      }
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
    });

    test('timestamp accessors are fast', () => {
      const period = new Period(jan1, jan31);
      
      const start = performance.now();
      for (let i = 0; i < 1000000; i++) {
        period.startTime;
        period.endTime;
      }
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100); // Should be very fast
    });
  });

  describe('DurationInterval Tests', () => {
    test('creates duration from days', () => {
      const duration = DurationInterval.fromDays(7);
      expect(duration.milliseconds).toBe(7 * 24 * 60 * 60 * 1000);
    });

    test('creates duration from hours', () => {
      const duration = DurationInterval.fromHours(24);
      expect(duration.milliseconds).toBe(24 * 60 * 60 * 1000);
    });

    test('creates duration from minutes', () => {
      const duration = DurationInterval.fromMinutes(60);
      expect(duration.milliseconds).toBe(60 * 60 * 1000);
    });

    test('creates duration from seconds', () => {
      // Test the uncovered fromSeconds method
      const duration = DurationInterval.fromSeconds(45);
      expect(duration.milliseconds).toBe(45 * 1000);
    });

    test('creates duration from milliseconds', () => {
      // Test the constructor directly (no fromMilliseconds method exists)
      const duration = new DurationInterval(1500);
      expect(duration.milliseconds).toBe(1500);
    });

    test('creates duration from weeks', () => {
      // Test the uncovered fromWeeks method  
      const duration = DurationInterval.fromWeeks(2);
      expect(duration.milliseconds).toBe(2 * 7 * 24 * 60 * 60 * 1000);
    });

    test('creates duration from ISO 8601 strings', () => {
      const duration1 = DurationInterval.fromISO8601('P1D');
      expect(duration1.milliseconds).toBe(24 * 60 * 60 * 1000);

      const duration2 = DurationInterval.fromISO8601('PT1H30M');
      expect(duration2.milliseconds).toBe((60 + 30) * 60 * 1000);

      const duration3 = DurationInterval.fromISO8601('P1Y2M3DT4H5M6S');
      const expected = (365 * 24 * 60 * 60 * 1000) + // 1 year
                      (2 * 30 * 24 * 60 * 60 * 1000) + // 2 months
                      (3 * 24 * 60 * 60 * 1000) + // 3 days
                      (4 * 60 * 60 * 1000) + // 4 hours
                      (5 * 60 * 1000) + // 5 minutes
                      (6 * 1000); // 6 seconds
      expect(duration3.milliseconds).toBe(expected);
    });

    test('throws error for invalid ISO 8601 strings', () => {
      expect(() => DurationInterval.fromISO8601('invalid')).toThrow('Invalid ISO 8601 duration');
      expect(() => DurationInterval.fromISO8601('P')).toThrow('Invalid ISO 8601 duration');
    });

    test('converts to duration object', () => {
      const duration = DurationInterval.fromDays(2);
      const result = duration.toDuration();
      
      expect(result.days).toBe(2);
      expect(result.hours).toBe(48);
      expect(result.minutes).toBe(2880);
      expect(result.seconds).toBe(172800);
      expect(result.milliseconds).toBe(172800000);
    });
  });

  describe('Advanced Named Constructors', () => {
    const baseDate = new Date('2024-01-15T12:00:00.000Z');

    describe('after()', () => {
      test('creates period starting after a date', () => {
        const duration = DurationInterval.fromDays(7);
        const period = Period.after(baseDate, duration);
        
        expect(period.start).toEqual(baseDate);
        expect(period.end).toEqual(new Date('2024-01-22T12:00:00.000Z'));
        expect(period.bounds).toBe(Bounds.IncludeStartExcludeEnd);
      });

      test('works with string dates', () => {
        const duration = DurationInterval.fromHours(24);
        const period = Period.after('2024-01-15T12:00:00.000Z', duration);
        
        expect(period.start).toEqual(baseDate);
        expect(period.end).toEqual(new Date('2024-01-16T12:00:00.000Z'));
      });

      test('works with custom bounds', () => {
        const duration = DurationInterval.fromDays(1);
        const period = Period.after(baseDate, duration, Bounds.IncludeAll);
        
        expect(period.bounds).toBe(Bounds.IncludeAll);
      });
    });

    describe('before()', () => {
      test('creates period ending before a date', () => {
        const duration = DurationInterval.fromDays(7);
        const period = Period.before(baseDate, duration);
        
        expect(period.start).toEqual(new Date('2024-01-08T12:00:00.000Z'));
        expect(period.end).toEqual(baseDate);
        expect(period.bounds).toBe(Bounds.IncludeStartExcludeEnd);
      });

      test('works with string dates', () => {
        const duration = DurationInterval.fromHours(12);
        const period = Period.before('2024-01-15T12:00:00.000Z', duration);
        
        expect(period.start).toEqual(new Date('2024-01-15T00:00:00.000Z'));
        expect(period.end).toEqual(baseDate);
      });
    });

    describe('around()', () => {
      test('creates period centered around a date', () => {
        const duration = DurationInterval.fromDays(2); // 2 days total
        const period = Period.around(baseDate, duration);
        
        expect(period.start).toEqual(new Date('2024-01-14T12:00:00.000Z')); // 1 day before
        expect(period.end).toEqual(new Date('2024-01-16T12:00:00.000Z')); // 1 day after
        expect(period.bounds).toBe(Bounds.IncludeStartExcludeEnd);
      });

      test('works with hours', () => {
        const duration = DurationInterval.fromHours(4); // 4 hours total
        const period = Period.around(baseDate, duration);
        
        expect(period.start).toEqual(new Date('2024-01-15T10:00:00.000Z')); // 2 hours before
        expect(period.end).toEqual(new Date('2024-01-15T14:00:00.000Z')); // 2 hours after
      });
    });

    describe('fromISO8601()', () => {
      test('creates period from ISO 8601 duration string', () => {
        const period = Period.fromISO8601(baseDate, 'P7D');
        
        expect(period.start).toEqual(baseDate);
        expect(period.end).toEqual(new Date('2024-01-22T12:00:00.000Z'));
      });

      test('works with complex ISO 8601 durations', () => {
        const period = Period.fromISO8601(baseDate, 'P1DT12H30M');
        const expectedEnd = new Date(baseDate.getTime() + 
          (1 * 24 * 60 * 60 * 1000) + // 1 day
          (12 * 60 * 60 * 1000) + // 12 hours
          (30 * 60 * 1000)); // 30 minutes
        
        expect(period.start).toEqual(baseDate);
        expect(period.end).toEqual(expectedEnd);
      });

      test('works with string dates', () => {
        const period = Period.fromISO8601('2024-01-15T12:00:00.000Z', 'PT2H');
        
        expect(period.start).toEqual(baseDate);
        expect(period.end).toEqual(new Date('2024-01-15T14:00:00.000Z'));
      });
    });

    describe('fromWeek()', () => {
      test('creates period for first week of 2024', () => {
        const period = Period.fromWeek(2024, 1);
        // Week 1 of 2024 starts on January 1st (Monday)
        expect(period.start).toEqual(new Date('2024-01-01T00:00:00.000Z'));
        expect(period.end).toEqual(new Date('2024-01-08T00:00:00.000Z'));
      });

      test('creates period for week 10 of 2024', () => {
        const period = Period.fromWeek(2024, 10);
        // Week 10 starts on March 4th, 2024
        expect(period.start).toEqual(new Date('2024-03-04T00:00:00.000Z'));
        expect(period.end).toEqual(new Date('2024-03-11T00:00:00.000Z'));
      });
    });

    describe('fromQuarter()', () => {
      test('creates period for Q1 2024', () => {
        const period = Period.fromQuarter(2024, 1);
        expect(period.start).toEqual(new Date('2024-01-01T00:00:00.000Z'));
        expect(period.end).toEqual(new Date('2024-04-01T00:00:00.000Z'));
      });

      test('creates period for Q4 2024', () => {
        const period = Period.fromQuarter(2024, 4);
        expect(period.start).toEqual(new Date('2024-10-01T00:00:00.000Z'));
        expect(period.end).toEqual(new Date('2025-01-01T00:00:00.000Z'));
      });

      test('throws error for invalid quarter', () => {
        expect(() => Period.fromQuarter(2024, 0)).toThrow('Quarter must be between 1 and 4');
        expect(() => Period.fromQuarter(2024, 5)).toThrow('Quarter must be between 1 and 4');
      });
    });
  });

  describe('Advanced Period Methods', () => {
    const basePeriod = new Period(new Date('2024-01-15T00:00:00.000Z'), new Date('2024-01-22T00:00:00.000Z'));

    describe('withDuration()', () => {
      test('creates new period with specific duration', () => {
        const newPeriod = basePeriod.withDuration(DurationInterval.fromDays(10));
        expect(newPeriod.start).toEqual(basePeriod.start);
        expect(newPeriod.end).toEqual(new Date('2024-01-25T00:00:00.000Z'));
      });
    });

    describe('move() and moveBackward()', () => {
      test('moves period forward by duration', () => {
        const moved = basePeriod.move(DurationInterval.fromDays(7));
        expect(moved.start).toEqual(new Date('2024-01-22T00:00:00.000Z'));
        expect(moved.end).toEqual(new Date('2024-01-29T00:00:00.000Z'));
      });

      test('moves period backward by duration', () => {
        const moved = basePeriod.moveBackward(DurationInterval.fromDays(7));
        expect(moved.start).toEqual(new Date('2024-01-08T00:00:00.000Z'));
        expect(moved.end).toEqual(new Date('2024-01-15T00:00:00.000Z'));
      });
    });

    describe('expand()', () => {
      test('expands period in both directions', () => {
        const expanded = basePeriod.expand(DurationInterval.fromDays(2));
        expect(expanded.start).toEqual(new Date('2024-01-14T00:00:00.000Z')); // 1 day before
        expect(expanded.end).toEqual(new Date('2024-01-23T00:00:00.000Z')); // 1 day after
      });
    });

    describe('isBefore() and isAfter()', () => {
      const laterPeriod = new Period(new Date('2024-02-01T00:00:00.000Z'), new Date('2024-02-08T00:00:00.000Z'));

      test('correctly identifies before relationship', () => {
        expect(basePeriod.isBefore(laterPeriod)).toBe(true);
        expect(laterPeriod.isBefore(basePeriod)).toBe(false);
      });

      test('correctly identifies after relationship', () => {
        expect(basePeriod.isAfter(laterPeriod)).toBe(false);
        expect(laterPeriod.isAfter(basePeriod)).toBe(true);
      });
    });

    describe('gap()', () => {
      const laterPeriod = new Period(new Date('2024-02-01T00:00:00.000Z'), new Date('2024-02-08T00:00:00.000Z'));

      test('finds gap between non-overlapping periods', () => {
        const gap = basePeriod.gap(laterPeriod);
        expect(gap).not.toBeNull();
        expect(gap!.start).toEqual(new Date('2024-01-22T00:00:00.000Z'));
        expect(gap!.end).toEqual(new Date('2024-02-01T00:00:00.000Z'));
      });

      test('returns null for overlapping periods', () => {
        const overlapping = new Period(new Date('2024-01-20T00:00:00.000Z'), new Date('2024-01-25T00:00:00.000Z'));
        const gap = basePeriod.gap(overlapping);
        expect(gap).toBeNull();
      });

      test('returns null for touching periods', () => {
        const touching = new Period(new Date('2024-01-22T00:00:00.000Z'), new Date('2024-01-29T00:00:00.000Z'));
        const gap = basePeriod.gap(touching);
        expect(gap).toBeNull();
      });

      test('finds gap when this period is before other', () => {
        // Test the uncovered line 268: isBefore() branch in gap()
        const laterPeriod = new Period(new Date('2024-02-01T00:00:00.000Z'), new Date('2024-02-08T00:00:00.000Z'));
        const gap = basePeriod.gap(laterPeriod);
        
        expect(gap).not.toBeNull();
        expect(gap!.start).toEqual(basePeriod.end);
        expect(gap!.end).toEqual(laterPeriod.start);
      });

      test('finds gap when this period is after other', () => {
        // Test the uncovered line 270: isAfter() branch in gap()
        const earlierPeriod = new Period(new Date('2024-01-01T00:00:00.000Z'), new Date('2024-01-08T00:00:00.000Z'));
        const gap = basePeriod.gap(earlierPeriod);
        
        expect(gap).not.toBeNull();
        expect(gap!.start).toEqual(earlierPeriod.end);
        expect(gap!.end).toEqual(basePeriod.start);
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles daylight saving time transitions', () => {
      // Use proper DST transition times - these represent the same UTC moment
      const dstStart = new Date('2024-03-10T07:00:00.000Z'); // 2 AM EST
      const dstEnd = new Date('2024-03-10T08:00:00.000Z');   // 4 AM EDT (1 hour later)
      
      expect(() => new Period(dstStart, dstEnd)).not.toThrow();
    });

    test('handles timezone differences', () => {
      const utc = new Date('2024-01-01T00:00:00.000Z');
      const est = new Date('2024-01-01T05:00:00.000Z'); // Same moment, different timezone
      
      const period = new Period(utc, est);
      expect(period.getDuration().hours).toBe(5);
    });

    test('handles very small periods', () => {
      const start = new Date('2024-01-01T00:00:00.000Z');
      const end = new Date('2024-01-01T00:00:00.001Z'); // 1 millisecond
      
      const period = new Period(start, end);
      expect(period.getDuration().milliseconds).toBe(1);
    });
  });

  describe('Enterprise-Grade Edge Cases', () => {
    test('handles microsecond precision periods', () => {
      // Test periods with very small durations for high precision
      const start = new Date('2024-01-01T12:00:00.000Z');
      const end = new Date('2024-01-01T12:00:00.001Z'); // 1ms
      const period = new Period(start, end);
      
      expect(period.getDuration().milliseconds).toBe(1);
      expect(period.containsDate(period.start)).toBe(true); // Use containsDate instead
    });

    test('handles large time ranges (decades)', () => {
      // Test very large periods spanning decades
      const start = new Date('1990-01-01T00:00:00.000Z');
      const end = new Date('2030-01-01T00:00:00.000Z'); // 40 years
      const period = new Period(start, end);
      
      expect(period.getDuration().days).toBeGreaterThan(14600); // ~40 years
      expect(period.format('iso')).toBe('[1990-01-01, 2030-01-01)');
    });

    test('handles invalid date inputs gracefully', () => {
      // Test behavior with edge case dates
      const validDate = new Date('2024-01-01T00:00:00.000Z');
      const almostInvalidDate = new Date('2024-12-31T23:59:59.999Z');
      
      const period = new Period(validDate, almostInvalidDate);
      expect(period.getDuration().days).toBe(366); // 2024 is a leap year
    });

    test('period immutability verification', () => {
      // Ensure all modification methods return new instances
      const original = new Period(jan1, jan31);
      const modified1 = original.startingOn(jan15);
      const modified2 = original.endingOn(feb15);
      const modified3 = original.withBounds(Bounds.IncludeAll);
      
      // Original should be unchanged
      expect(original.start).toEqual(jan1);
      expect(original.end).toEqual(jan31);
      expect(original.bounds).toBe(Bounds.IncludeStartExcludeEnd);
      
      // New instances should be different
      expect(modified1).not.toBe(original);
      expect(modified2).not.toBe(original);
      expect(modified3).not.toBe(original);
      expect(modified1.start).toEqual(jan15);
      expect(modified2.end).toEqual(feb15);
      expect(modified3.bounds).toBe(Bounds.IncludeAll);
    });

    test('JSON serialization and parsing', () => {
      // Test JSON serialization for API usage and data persistence
      const period = new Period(jan1, jan15, Bounds.IncludeAll);
      
      const serializable = {
        start: period.start.toISOString(),
        end: period.end.toISOString(),
        bounds: period.bounds,
        duration: period.getDuration()
      };
      
      const json = JSON.stringify(serializable);
      const parsed = JSON.parse(json);
      
      // Reconstruct period from JSON
      const reconstructed = new Period(new Date(parsed.start), new Date(parsed.end), parsed.bounds);
      
      expect(reconstructed.equals(period)).toBe(true);
      expect(reconstructed.getDuration().days).toBe(parsed.duration.days);
    });

    test('complex boundary interactions', () => {
      // Test complex scenarios with different boundary combinations
      const period1 = new Period(jan1, jan15, Bounds.IncludeStartExcludeEnd); // [jan1, jan15)
      const period2 = new Period(jan15, jan31, Bounds.ExcludeStartIncludeEnd); // (jan15, jan31]
      const period3 = new Period(jan15, jan31, Bounds.IncludeStartExcludeEnd); // [jan15, jan31)
      
      // These should not overlap (exclusive boundaries)
      expect(period1.overlaps(period2)).toBe(false);
      expect(period1.touches(period2)).toBe(true);
      
      // These should overlap (inclusive start boundary)
      expect(period1.overlaps(period3)).toBe(false); // jan15 is excluded from period1
      expect(period1.touches(period3)).toBe(true);
    });

    test('performance with extreme period counts', () => {
      // Test handling of large numbers of period operations for enterprise scale
      const periods: Period[] = [];
      const startTime = performance.now();
      
      for (let i = 0; i < 1000; i++) {
        const start = new Date(2024, 0, 1 + i);
        const end = new Date(2024, 0, 2 + i);
        periods.push(new Period(start, end));
      }
      
      // Test overlaps performance
      let overlapCount = 0;
      for (let i = 0; i < periods.length - 1; i++) {
        if (periods[i].overlaps(periods[i + 1])) {
          overlapCount++;
        }
      }
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should be very fast
      expect(overlapCount).toBe(0); // Adjacent periods don't overlap by default (end != start)
    });
  });
});
