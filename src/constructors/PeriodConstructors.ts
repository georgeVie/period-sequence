/**
 * Named constructors for Period creation optimized for date-only operations
 * All constructors work with day-level precision and normalize to midnight UTC
 */

import { Period } from '../core/Period';
import { Bounds } from '../core/types';
import { DurationInterval } from '../duration/DurationInterval';

export namespace PeriodConstructors {
  /**
   * Create period from start and end dates (most common constructor)
   * Dates are automatically normalized to midnight UTC for date-only operations
   */
  export function fromDates(start: Date, end: Date, bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    return new Period(start, end, bounds);
  }

  /**
   * Create period from month (optimized for date-only operations)
   * Returns period covering the entire month at day-level precision
   */
  export function fromMonth(year: number, month: number, bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    // Optimization: Use timestamps directly (already midnight UTC)
    const startTime = Date.UTC(year, month - 1, 1);
    const endTime = Date.UTC(year, month, 1);
    return new Period(startTime, endTime, bounds);
  }

  /**
   * Create period from year (optimized for date-only operations)
   * Returns period covering the entire year at day-level precision
   */
  export function fromYear(year: number, bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    // Optimization: Use timestamps directly (already midnight UTC)
    const startTime = Date.UTC(year, 0, 1);
    const endTime = Date.UTC(year + 1, 0, 1);
    return new Period(startTime, endTime, bounds);
  }

  /**
   * Create period from a single day (optimized for date-only operations)
   * Returns a 1-day period for the specified date
   */
  export function fromDay(date: Date | string, bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    const day = typeof date === 'string' ? new Date(date) : date;
    // Optimization: Use timestamps directly (already midnight UTC)
    const startTime = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate());
    const endTime = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate() + 1);
    return new Period(startTime, endTime, bounds);
  }

  /**
   * Create period starting after a specific date (date-only operations)
   * Duration is applied at day-level precision, minimum 1 day
   */
  export function after(start: Date | string, duration: DurationInterval, bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    const startDate = typeof start === 'string' ? new Date(start) : start;
    // Ensure minimum 1-day duration for date-only operations
    const durationDays = Math.max(1, Math.ceil(duration.milliseconds / 86400000));
    const endTime = startDate.getTime() + (durationDays * 86400000);
    const endDate = new Date(endTime);
    return new Period(startDate, endDate, bounds);
  }

  /**
   * Create period ending before a specific date (date-only operations)
   * Duration is applied at day-level precision, minimum 1 day
   */
  export function before(end: Date | string, duration: DurationInterval, bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    const endDate = typeof end === 'string' ? new Date(end) : end;
    // Ensure minimum 1-day duration for date-only operations
    const durationDays = Math.max(1, Math.ceil(duration.milliseconds / 86400000));
    const startTime = endDate.getTime() - (durationDays * 86400000);
    const startDate = new Date(startTime);
    return new Period(startDate, endDate, bounds);
  }

  /**
   * Create period centered around a specific date (date-only operations)
   * Duration is split evenly around the center date, minimum 1 day each side
   */
  export function around(center: Date | string, duration: DurationInterval, bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    const centerDate = typeof center === 'string' ? new Date(center) : center;
    // For date-only operations, ensure at least 1 day on each side
    const durationDays = Math.max(2, Math.ceil(duration.milliseconds / 86400000)); // Minimum 2 days total
    const halfDurationDays = Math.floor(durationDays / 2);
    
    const startTime = centerDate.getTime() - (halfDurationDays * 86400000);
    const endTime = centerDate.getTime() + (halfDurationDays * 86400000);
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    return new Period(startDate, endDate, bounds);
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
   * Create period from millisecond timestamps (date-only operations)
   * Timestamps are normalized to midnight UTC for consistent behavior
   */
  export function fromTimestamps(startMs: number, endMs: number, bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    // Optimization: Pass timestamps directly (will be normalized by Period constructor)
    return new Period(startMs, endMs, bounds);
  }

  /**
   * Create period representing today (current date in local timezone)
   * Returns a 1-day period for today at date-only precision
   */
  export function today(bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return new Period(startDate, endDate, bounds);
  }

  /**
   * Create period representing this week (Monday to Sunday)
   * Uses ISO week calculation with date-only precision
   */
  export function thisWeek(bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    const now = new Date();
    const currentDay = now.getDay() || 7; // Sunday = 7, Monday = 1
    const monday = new Date(now.getTime() - (currentDay - 1) * 86400000);
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday.getTime() + 7 * 86400000);
    return new Period(monday, sunday, bounds);
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
   * Create period starting from today with specified duration (date-only operations)
   * Uses current date as starting point, duration rounded up to whole days
   */
  export function fromToday(duration: DurationInterval, bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    const startDate = new Date();
    const durationDays = Math.max(1, Math.ceil(duration.milliseconds / 86400000));
    const endTime = startDate.getTime() + (durationDays * 86400000);
    const endDate = new Date(endTime);
    return new Period(startDate, endDate, bounds);
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
