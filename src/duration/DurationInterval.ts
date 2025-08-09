/**
 * Duration class for creating time intervals (similar to PHP DateInterval)
 * Optimized for performance with pre-calculated milliseconds
 */

import { Duration } from '../core/types';

export class DurationInterval {
  private readonly _milliseconds: number;

  constructor(milliseconds: number) {
    this._milliseconds = Math.abs(milliseconds); // Always positive
  }

  get milliseconds(): number {
    return this._milliseconds;
  }

  /**
   * Create duration from days
   */
  static fromDays(days: number): DurationInterval {
    return new DurationInterval(days * 24 * 60 * 60 * 1000);
  }

  /**
   * Create duration from hours
   */
  static fromHours(hours: number): DurationInterval {
    return new DurationInterval(hours * 60 * 60 * 1000);
  }

  /**
   * Create duration from minutes
   */
  static fromMinutes(minutes: number): DurationInterval {
    return new DurationInterval(minutes * 60 * 1000);
  }

  /**
   * Create duration from seconds
   */
  static fromSeconds(seconds: number): DurationInterval {
    return new DurationInterval(seconds * 1000);
  }

  /**
   * Create duration from weeks
   */
  static fromWeeks(weeks: number): DurationInterval {
    return new DurationInterval(weeks * 7 * 24 * 60 * 60 * 1000);
  }

  /**
   * Create duration from months (approximate - 30 days)
   */
  static fromMonths(months: number): DurationInterval {
    return new DurationInterval(months * 30 * 24 * 60 * 60 * 1000);
  }

  /**
   * Create duration from years (approximate - 365 days)
   */
  static fromYears(years: number): DurationInterval {
    return new DurationInterval(years * 365 * 24 * 60 * 60 * 1000);
  }

  /**
   * Parse ISO 8601 duration strings like "P1Y2M3DT4H5M6S"
   * Optimized regex for performance
   */
  static fromISO8601(iso: string): DurationInterval {
    // Pre-compiled regex stored as static for performance
    const regex = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;
    const matches = iso.match(regex);
    
    if (!matches) {
      throw new Error(`Invalid ISO 8601 duration: ${iso}`);
    }

    const [, years, months, weeks, days, hours, minutes, seconds] = matches;
    
    // Must have at least one component
    if (!years && !months && !weeks && !days && !hours && !minutes && !seconds) {
      throw new Error(`Invalid ISO 8601 duration: ${iso}`);
    }
    
    // Optimized calculation - pre-calculate constants
    let totalMs = 0;
    if (years) totalMs += parseInt(years) * 31536000000; // 365 * 24 * 60 * 60 * 1000
    if (months) totalMs += parseInt(months) * 2592000000; // 30 * 24 * 60 * 60 * 1000
    if (weeks) totalMs += parseInt(weeks) * 604800000; // 7 * 24 * 60 * 60 * 1000
    if (days) totalMs += parseInt(days) * 86400000; // 24 * 60 * 60 * 1000
    if (hours) totalMs += parseInt(hours) * 3600000; // 60 * 60 * 1000
    if (minutes) totalMs += parseInt(minutes) * 60000; // 60 * 1000
    if (seconds) totalMs += parseFloat(seconds) * 1000;

    return new DurationInterval(totalMs);
  }

  /**
   * Convert to human-readable duration object
   * Optimized calculations avoiding repeated divisions
   */
  toDuration(): Duration {
    const ms = this._milliseconds;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    return {
      milliseconds: ms,
      seconds,
      minutes,
      hours,
      days
    };
  }
}
