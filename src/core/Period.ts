/**
 * High-performance Period class for date period handling
 * Immutable value object representing time spans at day-level precision
 */

import { Bounds, Duration, BoundsUtils } from './types';
import { FastBounds } from './FastBounds';

export class Period {
  // Store as midnight UTC timestamps for consistent day-level operations
  private readonly _startTime: number;
  private readonly _endTime: number;
  private readonly _bounds: Bounds;

  constructor(start: Date | number | string, end: Date | number | string, bounds: Bounds = Bounds.IncludeStartExcludeEnd) {
    // Normalize all inputs to midnight UTC
    const startTime = this._normalizeDateToMidnightUTC(start);
    const endTime = this._normalizeDateToMidnightUTC(end);

    if (startTime >= endTime) {
      throw new Error('Start date must be before end date');
    }

    this._startTime = startTime;
    this._endTime = endTime;
    this._bounds = bounds;
  }

  /**
   * Normalize any date input to midnight UTC for consistent day-level operations
   */
  private _normalizeDateToMidnightUTC(input: Date | number | string): number {
    let date: Date;
    
    if (typeof input === 'string') {
      date = new Date(input);
    } else if (typeof input === 'number') {
      date = new Date(input);
    } else {
      date = input;
    }
    
    // Extract date components and create midnight UTC
    const normalized = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    
    // Development warning for sub-day precision inputs
    if (process.env.NODE_ENV === 'development' && date.getTime() !== normalized) {
      console.warn(`Period: Time component normalized to midnight UTC. Input: ${date.toISOString()} -> Output: ${new Date(normalized).toISOString()}`);
    }
    
    return normalized;
  }

  /**
   * Get start date (creates new Date object only when needed)
   */
  get start(): Date {
    return new Date(this._startTime);
  }

  /**
   * Get end date (creates new Date object only when needed)
   */
  get end(): Date {
    return new Date(this._endTime);
  }

  /**
   * Get bounds type
   */
  get bounds(): Bounds {
    return this._bounds;
  }

  /**
   * Get start timestamp (high performance accessor)
   */
  get startTime(): number {
    return this._startTime;
  }

  /**
   * Get end timestamp (high performance accessor)
   */
  get endTime(): number {
    return this._endTime;
  }

  /**
   * Get duration in days (optimized for date-only operations)
   * Much faster than getDuration().days for simple day calculations
   */
  get durationInDays(): number {
    return (this._endTime - this._startTime) / 86400000;
  }

  /**
   * Calculate duration with day-level precision
   */
  getDuration(): Duration {
    const milliseconds = this._endTime - this._startTime;
    const days = Math.floor(milliseconds / 86400000);
    const hours = days * 24;
    const minutes = hours * 60;
    const seconds = minutes * 60;

    return {
      milliseconds,
      seconds,
      minutes,
      hours,
      days
    };
  }

  /**
   * Check if this period overlaps with another period
   * Periods overlap if they share any common date, with boundary rules applied
   * @param other - The period to check for overlap
   * @returns True if periods overlap, false otherwise
   */
  overlaps(other: Period): boolean {
    // Fast path: check if periods are completely separate (no touching)
    if (this._endTime < other._startTime || other._endTime < this._startTime) {
      return false;
    }

    // Check if periods are adjacent (consecutive days)
    if (this._endTime === other._startTime) {
      // For date-only operations, adjacent periods can overlap based on bounds
      const thisEndInclusive = FastBounds.isEndInclusive(this._bounds);
      const otherStartInclusive = FastBounds.isStartInclusive(other._bounds);
      return thisEndInclusive && otherStartInclusive;
    }
    
    if (other._endTime === this._startTime) {
      const otherEndInclusive = FastBounds.isEndInclusive(other._bounds);
      const thisStartInclusive = FastBounds.isStartInclusive(this._bounds);
      return otherEndInclusive && thisStartInclusive;
    }

    // If they're not just touching, they must overlap
    return true;
  }

  /**
   * Check if this period contains another period
   * Optimized for performance with inlined bounds awareness
   */
  contains(other: Period): boolean {
    // Inline bounds checking for performance
    const thisStartValid = (this._bounds === Bounds.IncludeStartExcludeEnd || this._bounds === Bounds.IncludeAll)
      ? this._startTime <= other._startTime
      : this._startTime < other._startTime;

    const thisEndValid = (this._bounds === Bounds.ExcludeStartIncludeEnd || this._bounds === Bounds.IncludeAll)
      ? this._endTime >= other._endTime
      : this._endTime > other._endTime;

    return thisStartValid && thisEndValid;
  }

  /**
   * Check if this period contains a specific date
   * High-performance timestamp comparison with inlined bounds checking
   */
  containsDate(date: Date | number): boolean {
    const timestamp = typeof date === 'number' ? date : date.getTime();

    // Inline bounds checking for maximum performance
    const startValid = (this._bounds === Bounds.IncludeStartExcludeEnd || this._bounds === Bounds.IncludeAll)
      ? this._startTime <= timestamp
      : this._startTime < timestamp;

    const endValid = (this._bounds === Bounds.ExcludeStartIncludeEnd || this._bounds === Bounds.IncludeAll)
      ? this._endTime >= timestamp
      : this._endTime > timestamp;

    return startValid && endValid;
  }

  /**
   * Check if periods touch (adjacent with no gap) - date-only version
   * For date-only periods, this means consecutive days
   */
  touches(other: Period): boolean {
    return (this._endTime === other._startTime) || (other._endTime === this._startTime);
  }



  /**
   * Check if periods abut (touch at exactly one point)
   * Optimized with early returns
   */
  abuts(other: Period): boolean {
    // Fast path: if they don't touch, they can't abut
    if (this._endTime !== other._startTime && other._endTime !== this._startTime) {
      return false;
    }
    
    // Check if they touch but don't overlap
    return !this.overlaps(other);
  }

  /**
   * Fast equality check using timestamps and bounds
   * Optimized with early returns
   */
  equals(other: Period): boolean {
    return this._startTime === other._startTime && 
           this._endTime === other._endTime && 
           this._bounds === other._bounds;
  }

  /**
   * Create new period with different start date
   * Optimized constructor call
   */
  startingOn(start: Date | number): Period {
    return new Period(start, this._endTime, this._bounds);
  }

  /**
   * Create new period with different end date
   * Optimized constructor call
   */
  endingOn(end: Date | number): Period {
    return new Period(this._startTime, end, this._bounds);
  }

  /**
   * Create new period with different bounds
   * Optimized constructor call
   */
  withBounds(bounds: Bounds): Period {
    return new Period(this._startTime, this._endTime, bounds);
  }

  /**
   * Internal method for object pooling - reset period with new values
   * @internal
   */
  _reset(start: Date | number | string, end: Date | number | string, bounds: Bounds): void {
    const startTime = this._normalizeDateToMidnightUTC(start);
    const endTime = this._normalizeDateToMidnightUTC(end);

    if (startTime >= endTime) {
      throw new Error('Start date must be before end date');
    }

    (this as any)._startTime = startTime;
    (this as any)._endTime = endTime;
    (this as any)._bounds = bounds;
    
    // Clear any cached values
    this._clearCache();
  }

  /**
   * Internal method for object pooling - clear cached values
   * @internal
   */
  _clearCache(): void {
    // Currently no cached values in Period, but method exists for future use
    // This could clear cached duration, formatted strings, etc.
  }

  /**
   * Create new period with specific duration from start
   * Optimized with direct timestamp calculation
   */
  withDuration(duration: import('../duration/DurationInterval').DurationInterval): Period {
    const endTime = this._startTime + duration.milliseconds;
    return new Period(this._startTime, endTime, this._bounds);
  }

  /**
   * Move period by shifting both start and end by duration
   * Optimized with direct timestamp operations
   */
  move(duration: import('../duration/DurationInterval').DurationInterval): Period {
    const startTime = this._startTime + duration.milliseconds;
    const endTime = this._endTime + duration.milliseconds;
    return new Period(startTime, endTime, this._bounds);
  }

  /**
   * Move period backward by duration
   * Convenience method for negative movement
   */
  moveBackward(duration: import('../duration/DurationInterval').DurationInterval): Period {
    const startTime = this._startTime - duration.milliseconds;
    const endTime = this._endTime - duration.milliseconds;
    return new Period(startTime, endTime, this._bounds);
  }

  /**
   * Expand period by duration in both directions
   * Optimized with single calculation
   */
  expand(duration: import('../duration/DurationInterval').DurationInterval): Period {
    const halfDuration = duration.milliseconds * 0.5;
    const startTime = this._startTime - halfDuration;
    const endTime = this._endTime + halfDuration;
    return new Period(startTime, endTime, this._bounds);
  }

  /**
   * Check if period is entirely before another period
   * High-performance comparison
   */
  isBefore(other: Period): boolean {
    return this._endTime <= other._startTime;
  }

  /**
   * Check if period is entirely after another period
   * High-performance comparison  
   */
  isAfter(other: Period): boolean {
    return this._startTime >= other._endTime;
  }

  /**
   * Get the gap between this period and another (if any)
   * Returns null if periods overlap or touch
   */
  gap(other: Period): Period | null {
    if (this.overlaps(other) || this.touches(other)) {
      return null;
    }
    
    if (this.isBefore(other)) {
      return new Period(this._endTime, other._startTime, this._bounds);
    } else if (this.isAfter(other)) {
      return new Period(other._endTime, this._startTime, this._bounds);
    }
    
    return null;
  }

  /**
   * Format period with bounds notation for date-only display
   * All formats show dates only - no time components
   */
  format(dateFormat: 'iso' | 'short' | 'long' | 'smart' = 'iso'): string {
    const [startBracket, endBracket] = BoundsUtils.getBrackets(this._bounds);

    let startStr: string, endStr: string;

    // Smart formatting defaults to ISO for date-only operations
    if (dateFormat === 'smart') {
      dateFormat = 'iso';
    }

    switch (dateFormat) {
      case 'iso':
        startStr = new Date(this._startTime).toISOString().slice(0, 10); // Date only (YYYY-MM-DD)
        endStr = new Date(this._endTime).toISOString().slice(0, 10);
        break;
      case 'short':
        const shortOptions: Intl.DateTimeFormatOptions = { 
          month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'
        };
        startStr = new Date(this._startTime).toLocaleDateString('en-US', shortOptions);
        endStr = new Date(this._endTime).toLocaleDateString('en-US', shortOptions);
        break;
      case 'long':
        const longOptions: Intl.DateTimeFormatOptions = { 
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
        };
        startStr = new Date(this._startTime).toLocaleDateString('en-US', longOptions);
        endStr = new Date(this._endTime).toLocaleDateString('en-US', longOptions);
        break;
      default:
        // Fallback to ISO for any unrecognized format
        startStr = new Date(this._startTime).toISOString().slice(0, 10);
        endStr = new Date(this._endTime).toISOString().slice(0, 10);
        break;
    }

    return `${startBracket}${startStr}, ${endStr}${endBracket}`;
  }

  /**
   * Create string representation with date-only formatting
   * Always shows dates only in ISO format
   */
  toString(): string {
    return this.format('iso');
  }

  /**
   * Format as date only (same as toString for date-only periods)
   * Example: [2024-01-15, 2024-01-16)
   */
  toDateString(): string {
    return this.format('iso');
  }

  /**
   * Calculate intersection with another period
   * Returns the overlapping period, or null if no overlap
   */
  intersection(other: Period): Period | null {
    if (!this.overlaps(other)) {
      return null;
    }
    
    const startTime = Math.max(this._startTime, other._startTime);
    const endTime = Math.min(this._endTime, other._endTime);
    
    // Use the more restrictive bounds
    const bounds = this._bounds;
    return new Period(startTime, endTime, bounds);
  }

  /**
   * Merge with another period if they touch or overlap (date-only optimized)
   * For date-only operations, consecutive days can be merged based on bounds
   * Returns combined period, or null if they can't be merged
   */
  union(other: Period): Period | null {
    // Check if they overlap or are consecutive days that should merge
    if (!this.overlaps(other) && !this.canMergeConsecutiveDays(other)) {
      return null;
    }
    
    const startTime = Math.min(this._startTime, other._startTime);
    const endTime = Math.max(this._endTime, other._endTime);
    
    // Use this period's bounds
    return new Period(startTime, endTime, this._bounds);
  }

  /**
   * Check if two consecutive day periods can be merged based on their bounds
   */
  canMergeConsecutiveDays(other: Period): boolean {
    if (!this.touches(other)) {
      return false;
    }
    
    // For consecutive days to merge, the touching boundaries must both be inclusive
    // or we need inclusive bounds that create continuity
    if (this._endTime === other._startTime) {
      const thisEndInclusive = FastBounds.isEndInclusive(this._bounds);
      const otherStartInclusive = FastBounds.isStartInclusive(other._bounds);
      return thisEndInclusive || otherStartInclusive; // Either can create continuity
    }
    
    if (other._endTime === this._startTime) {
      const otherEndInclusive = FastBounds.isEndInclusive(other._bounds);
      const thisStartInclusive = FastBounds.isStartInclusive(this._bounds);
      return otherEndInclusive || thisStartInclusive; // Either can create continuity
    }
    
    return false;
  }

  /**
   * Format for human readability with date-only display
   * Example: "Jan 15, 2024", "Jan 15 - 20, 2024" or "Jan 15, 2024 - Feb 2, 2024"
   */
  toDisplayString(): string {
    const startDate = new Date(this._startTime);
    const endDate = new Date(this._endTime);
    
    // For date-only periods, check if start and end are consecutive days (1-day period)
    const daysDiff = Math.floor((this._endTime - this._startTime) / 86400000);
    
    if (daysDiff === 1) {
      // Single day period: "Jan 15, 2024"
      return startDate.toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'
      });
    } else {
      // Multi-day periods: format based on date ranges
      const startMonth = startDate.getUTCMonth();
      const endMonth = endDate.getUTCMonth();
      const startYear = startDate.getUTCFullYear();
      const endYear = endDate.getUTCFullYear();
      
      if (startYear === endYear && startMonth === endMonth) {
        // Same month: "Jan 15 - 20, 2024"
        const monthStr = startDate.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
        return `${monthStr} ${startDate.getUTCDate()} - ${endDate.getUTCDate()}, ${startYear}`;
      } else if (startYear === endYear) {
        // Same year: "Jan 15 - Feb 20, 2024"
        const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
        const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
        return `${startStr} - ${endStr}, ${startYear}`;
      } else {
        // Different years: "Dec 15, 2023 - Jan 20, 2024"
        const startStr = startDate.toLocaleDateString('en-US', { 
          month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'
        });
        const endStr = endDate.toLocaleDateString('en-US', { 
          month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'
        });
        return `${startStr} - ${endStr}`;
      }
    }
  }
}
