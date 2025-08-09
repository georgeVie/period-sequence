/**
 * Duration class for creating time intervals (similar to PHP DateInterval)
 * Optimized for performance with pre-calculated milliseconds
 */
import { Duration } from '../core/types';
export declare class DurationInterval {
    private readonly _milliseconds;
    constructor(milliseconds: number);
    get milliseconds(): number;
    /**
     * Create duration from days
     */
    static fromDays(days: number): DurationInterval;
    /**
     * Create duration from hours
     */
    static fromHours(hours: number): DurationInterval;
    /**
     * Create duration from minutes
     */
    static fromMinutes(minutes: number): DurationInterval;
    /**
     * Create duration from seconds
     */
    static fromSeconds(seconds: number): DurationInterval;
    /**
     * Create duration from weeks
     */
    static fromWeeks(weeks: number): DurationInterval;
    /**
     * Create duration from months (approximate - 30 days)
     */
    static fromMonths(months: number): DurationInterval;
    /**
     * Create duration from years (approximate - 365 days)
     */
    static fromYears(years: number): DurationInterval;
    /**
     * Parse ISO 8601 duration strings like "P1Y2M3DT4H5M6S"
     * Optimized regex for performance
     */
    static fromISO8601(iso: string): DurationInterval;
    /**
     * Convert to human-readable duration object
     * Optimized calculations avoiding repeated divisions
     */
    toDuration(): Duration;
}
//# sourceMappingURL=DurationInterval.d.ts.map