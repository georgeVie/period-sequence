/**
 * High-performance Period class using numeric timestamps internally
 * Immutable value object optimized for large-scale operations
 */

import { Bounds, Duration, BoundsUtils } from './types';
import { FastBounds } from './FastBounds';

export class Period {
  // Store as numeric timestamps for maximum performance
  private readonly _startTime: number;
  private readonly _endTime: number;
  private readonly _bounds: Bounds;

  constructor(start: Date | number, end: Date | number, bounds: Bounds = Bounds.IncludeStartExcludeEnd) {
    const startTime = typeof start === 'number' ? start : start.getTime();
    const endTime = typeof end === 'number' ? end : end.getTime();

    if (startTime >= endTime) {
      throw new Error('Start date must be before end date');
    }

    this._startTime = startTime;
    this._endTime = endTime;
    this._bounds = bounds;
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
   * Calculate duration with optimized calculations
   * Using pre-calculated constants for performance
   */
  getDuration(): Duration {
    const milliseconds = this._endTime - this._startTime;
    const seconds = Math.floor(milliseconds * 0.001); // Faster than / 1000
    const minutes = Math.floor(seconds * 0.0166667); // Faster than / 60
    const hours = Math.floor(minutes * 0.0166667); // Faster than / 60
    const days = Math.floor(hours * 0.0416667); // Faster than / 24

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
   * Two periods overlap if they share any point in time
   * @param other - The period to check for overlap
   * @returns True if periods overlap, false otherwise
   */
  overlaps(other: Period): boolean {
    // Handle boundary conditions for touching periods
    const thisStartInclusive = FastBounds.isStartInclusive(this._bounds);
    const thisEndInclusive = FastBounds.isEndInclusive(this._bounds);
    const otherStartInclusive = FastBounds.isStartInclusive(other._bounds);
    const otherEndInclusive = FastBounds.isEndInclusive(other._bounds);

    // Check boundary edge cases first
    if (this._endTime === other._startTime) {
      return thisEndInclusive && otherStartInclusive;
    }
    if (other._endTime === this._startTime) {
      return otherEndInclusive && thisStartInclusive;
    }

    // Fast path: check if periods are completely separate (no touching)
    if (this._endTime < other._startTime || other._endTime < this._startTime) {
      return false;
    }

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
   * Check if periods touch (adjacent with no gap)
   * Optimized for performance
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
  _reset(start: Date | number, end: Date | number, bounds: Bounds): void {
    const startTime = typeof start === 'number' ? start : start.getTime();
    const endTime = typeof end === 'number' ? end : end.getTime();

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
   * Format period with bounds notation
   * Optimized string operations and caching
   */
  format(dateFormat: 'iso' | 'short' | 'long' | 'datetime' | 'smart' = 'smart'): string {
    const [startBracket, endBracket] = BoundsUtils.getBrackets(this._bounds);

    let startStr: string, endStr: string;

    // Smart formatting: show time if period is less than a day or has non-midnight times
    const periodDuration = this._endTime - this._startTime;
    const hasTime = this._startTime % 86400000 !== 0 || this._endTime % 86400000 !== 0; // Check if not midnight
    const isShortPeriod = periodDuration < 86400000; // Less than 24 hours
    
    if (dateFormat === 'smart') {
      dateFormat = (hasTime || isShortPeriod) ? 'datetime' : 'iso';
    }

    switch (dateFormat) {
      case 'iso':
        startStr = new Date(this._startTime).toISOString().slice(0, 10); // Date only
        endStr = new Date(this._endTime).toISOString().slice(0, 10);
        break;
      case 'datetime':
        startStr = new Date(this._startTime).toISOString().slice(0, 16); // Date + time (YYYY-MM-DDTHH:MM)
        endStr = new Date(this._endTime).toISOString().slice(0, 16);
        break;
      case 'short':
        const shortOptions: Intl.DateTimeFormatOptions = { 
          month: 'short', day: 'numeric', year: 'numeric' 
        };
        startStr = new Date(this._startTime).toLocaleDateString('en-US', shortOptions);
        endStr = new Date(this._endTime).toLocaleDateString('en-US', shortOptions);
        break;
      case 'long':
        const longOptions: Intl.DateTimeFormatOptions = { 
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        };
        startStr = new Date(this._startTime).toLocaleDateString('en-US', longOptions);
        endStr = new Date(this._endTime).toLocaleDateString('en-US', longOptions);
        break;
    }

    return `${startBracket}${startStr}, ${endStr}${endBracket}`;
  }

  /**
   * Create string representation with smart formatting
   * Shows time when relevant (short periods or non-midnight times)
   */
  toString(): string {
    return this.format('smart');
  }

  /**
   * Format as date only (no time component)
   * Example: [2024-01-15, 2024-01-16)
   */
  toDateString(): string {
    return this.format('iso');
  }

  /**
   * Format with full date and time
   * Example: [2024-01-15T09:00, 2024-01-15T10:00)
   */
  toDateTimeString(): string {
    return this.format('datetime');
  }

  /**
   * Format for human readability
   * Example: "Jan 15, 2024 9:00 AM - 10:00 AM" or "Jan 15 - 16, 2024"
   */
  toDisplayString(): string {
    const startDate = new Date(this._startTime);
    const endDate = new Date(this._endTime);
    
    // Check if it's the same day
    const sameDay = startDate.toDateString() === endDate.toDateString();
    
    // Check if it has specific times (not midnight)
    const hasTime = this._startTime % 86400000 !== 0 || this._endTime % 86400000 !== 0;
    const isShortPeriod = (this._endTime - this._startTime) < 86400000;
    
    if (sameDay && (hasTime || isShortPeriod)) {
      // Same day with times: "Jan 15, 2024 9:00 AM - 10:00 AM"
      const dateStr = startDate.toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric' 
      });
      const startTime = startDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', minute: '2-digit', hour12: true 
      });
      const endTime = endDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', minute: '2-digit', hour12: true 
      });
      return `${dateStr} ${startTime} - ${endTime}`;
    } else if (sameDay) {
      // Same day, no specific times: "Jan 15, 2024"
      return startDate.toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric' 
      });
    } else {
      // Different days: "Jan 15 - 20, 2024" or "Jan 15, 2024 - Feb 2, 2024"
      const startMonth = startDate.getMonth();
      const endMonth = endDate.getMonth();
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();
      
      if (startYear === endYear && startMonth === endMonth) {
        // Same month: "Jan 15 - 20, 2024"
        const monthStr = startDate.toLocaleDateString('en-US', { month: 'short' });
        return `${monthStr} ${startDate.getDate()} - ${endDate.getDate()}, ${startYear}`;
      } else if (startYear === endYear) {
        // Same year: "Jan 15 - Feb 20, 2024"
        const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `${startStr} - ${endStr}, ${startYear}`;
      } else {
        // Different years: "Dec 15, 2023 - Jan 20, 2024"
        const startStr = startDate.toLocaleDateString('en-US', { 
          month: 'short', day: 'numeric', year: 'numeric' 
        });
        const endStr = endDate.toLocaleDateString('en-US', { 
          month: 'short', day: 'numeric', year: 'numeric' 
        });
        return `${startStr} - ${endStr}`;
      }
    }
  }
}
