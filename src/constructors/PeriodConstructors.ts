/**
 * Named constructors for Period creation
 * Optimized for performance and convenience
 */

import { Period } from '../core/Period';
import { Bounds } from '../core/types';
import { DurationInterval } from '../duration/DurationInterval';

export namespace PeriodConstructors {
  /**
   * Create period from start and end dates (most common constructor)
   * Optimized for direct date input
   */
  export function fromDates(start: Date, end: Date, bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    return new Period(start, end, bounds);
  }

  /**
   * Create period from month (high performance, timezone-aware)
   * Pre-calculated for common use case
   */
  export function fromMonth(year: number, month: number, bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    // Use UTC to avoid timezone issues - fastest approach
    const startTime = Date.UTC(year, month - 1, 1);
    const endTime = Date.UTC(year, month, 1);
    return new Period(startTime, endTime, bounds);
  }

  /**
   * Create period from year (timezone-aware)
   * Optimized with direct UTC calculations
   */
  export function fromYear(year: number, bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    const startTime = Date.UTC(year, 0, 1);
    const endTime = Date.UTC(year + 1, 0, 1);
    return new Period(startTime, endTime, bounds);
  }

  /**
   * Create period from day (timezone-aware)
   * Optimized with direct UTC calculations
   */
  export function fromDay(date: Date | string, bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    const day = typeof date === 'string' ? new Date(date) : date;
    // Use UTC to avoid timezone interpretation issues
    const startTime = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate());
    const endTime = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate() + 1);
    return new Period(startTime, endTime, bounds);
  }

  /**
   * Create period starting after a specific date/time
   * Optimized with direct timestamp operations
   */
  export function after(start: Date | string, duration: DurationInterval, bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    const startTime = typeof start === 'string' ? new Date(start).getTime() : start.getTime();
    const endTime = startTime + duration.milliseconds;
    return new Period(startTime, endTime, bounds);
  }

  /**
   * Create period ending before a specific date/time
   * Optimized with direct timestamp operations
   */
  export function before(end: Date | string, duration: DurationInterval, bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    const endTime = typeof end === 'string' ? new Date(end).getTime() : end.getTime();
    const startTime = endTime - duration.milliseconds;
    return new Period(startTime, endTime, bounds);
  }

  /**
   * Create period centered around a specific date/time
   * Optimized with single division and direct calculations
   */
  export function around(center: Date | string, duration: DurationInterval, bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    const centerTime = typeof center === 'string' ? new Date(center).getTime() : center.getTime();
    const halfDuration = duration.milliseconds * 0.5; // Faster than / 2
    const startTime = centerTime - halfDuration;
    const endTime = centerTime + halfDuration;
    return new Period(startTime, endTime, bounds);
  }

  /**
   * Create period from ISO 8601 duration string starting at date
   * Combines parsing and construction for efficiency
   */
  export function fromISO8601(start: Date | string, isoDuration: string, bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    const duration = DurationInterval.fromISO8601(isoDuration);
    return after(start, duration, bounds);
  }

  /**
   * Create period from ISO week (yyyy-Www format)
   * Optimized with direct UTC calculations
   */
  export function fromWeek(year: number, week: number, bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    // ISO week calculation
    // Week 1 is the first week with 4 or more days in the new year
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const jan4Day = jan4.getUTCDay() || 7; // Sunday = 7, Monday = 1
    
    // Start of week 1 (Monday)
    const week1Start = new Date(jan4.getTime() - (jan4Day - 1) * 86400000);
    
    // Calculate the target week
    const weekStart = new Date(week1Start.getTime() + (week - 1) * 7 * 86400000);
    const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
    
    return new Period(weekStart.getTime(), weekEnd.getTime(), bounds);
  }

  /**
   * Create period from quarter (1-4)
   * Optimized with direct UTC calculations
   */
  export function fromQuarter(year: number, quarter: number, bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    if (quarter < 1 || quarter > 4) {
      throw new Error('Quarter must be between 1 and 4');
    }
    
    const startMonth = (quarter - 1) * 3;
    const startTime = Date.UTC(year, startMonth, 1);
    const endTime = Date.UTC(year, startMonth + 3, 1);
    
    return new Period(startTime, endTime, bounds);
  }

  /**
   * Create period from millisecond timestamps
   * Optimized for working with numeric timestamps
   */
  export function fromTimestamps(startMs: number, endMs: number, bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    return new Period(startMs, endMs, bounds);
  }

  /**
   * Create period representing today (current date)
   * Uses local timezone for "today" calculation
   */
  export function today(bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    const now = new Date();
    const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endTime = startTime + 86400000; // 24 hours in milliseconds
    return new Period(startTime, endTime, bounds);
  }

  /**
   * Create period representing this week (Monday to Sunday)
   * Uses ISO week calculation
   */
  export function thisWeek(bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    const now = new Date();
    const currentDay = now.getDay() || 7; // Sunday = 7, Monday = 1
    const monday = new Date(now.getTime() - (currentDay - 1) * 86400000);
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday.getTime() + 7 * 86400000);
    return new Period(monday.getTime(), sunday.getTime(), bounds);
  }

  /**
   * Create period representing this month
   * Uses current date's month
   */
  export function thisMonth(bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    const now = new Date();
    return fromMonth(now.getFullYear(), now.getMonth() + 1, bounds);
  }

  /**
   * Create period representing this year
   * Uses current date's year
   */
  export function thisYear(bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    const now = new Date();
    return fromYear(now.getFullYear(), bounds);
  }

  /**
   * Create period starting now with specified duration
   * Convenient for "from now" scenarios
   */
  export function now(duration: DurationInterval, bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    const startTime = Date.now();
    const endTime = startTime + duration.milliseconds;
    return new Period(startTime, endTime, bounds);
  }

  /**
   * Create period with specified duration starting from given time
   * Alias for 'after' with clearer naming
   */
  export function fromDuration(start: Date | string | number, duration: DurationInterval, bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    const startTime = typeof start === 'number' ? start : 
                      typeof start === 'string' ? new Date(start).getTime() : start.getTime();
    const endTime = startTime + duration.milliseconds;
    return new Period(startTime, endTime, bounds);
  }
}
