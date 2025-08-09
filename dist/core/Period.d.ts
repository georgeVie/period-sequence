/**
 * High-performance Period class using numeric timestamps internally
 * Immutable value object optimized for large-scale operations
 */
import { Bounds, Duration } from './types';
export declare class Period {
    private readonly _startTime;
    private readonly _endTime;
    private readonly _bounds;
    constructor(start: Date | number, end: Date | number, bounds?: Bounds);
    /**
     * Get start date (creates new Date object only when needed)
     */
    get start(): Date;
    /**
     * Get end date (creates new Date object only when needed)
     */
    get end(): Date;
    /**
     * Get bounds type
     */
    get bounds(): Bounds;
    /**
     * Get start timestamp (high performance accessor)
     */
    get startTime(): number;
    /**
     * Get end timestamp (high performance accessor)
     */
    get endTime(): number;
    /**
     * Calculate duration with optimized calculations
     * Using pre-calculated constants for performance
     */
    getDuration(): Duration;
    /**
     * Check if this period overlaps with another period
     * Two periods overlap if they share any point in time
     * @param other - The period to check for overlap
     * @returns True if periods overlap, false otherwise
     */
    overlaps(other: Period): boolean;
    /**
     * Check if this period contains another period
     * Optimized for performance with inlined bounds awareness
     */
    contains(other: Period): boolean;
    /**
     * Check if this period contains a specific date
     * High-performance timestamp comparison with inlined bounds checking
     */
    containsDate(date: Date | number): boolean;
    /**
     * Check if periods touch (adjacent with no gap)
     * Optimized for performance
     */
    touches(other: Period): boolean;
    /**
     * Check if periods abut (touch at exactly one point)
     * Optimized with early returns
     */
    abuts(other: Period): boolean;
    /**
     * Fast equality check using timestamps and bounds
     * Optimized with early returns
     */
    equals(other: Period): boolean;
    /**
     * Create new period with different start date
     * Optimized constructor call
     */
    startingOn(start: Date | number): Period;
    /**
     * Create new period with different end date
     * Optimized constructor call
     */
    endingOn(end: Date | number): Period;
    /**
     * Create new period with different bounds
     * Optimized constructor call
     */
    withBounds(bounds: Bounds): Period;
    /**
     * Internal method for object pooling - reset period with new values
     * @internal
     */
    _reset(start: Date | number, end: Date | number, bounds: Bounds): void;
    /**
     * Internal method for object pooling - clear cached values
     * @internal
     */
    _clearCache(): void;
    /**
     * Create new period with specific duration from start
     * Optimized with direct timestamp calculation
     */
    withDuration(duration: import('../duration/DurationInterval').DurationInterval): Period;
    /**
     * Move period by shifting both start and end by duration
     * Optimized with direct timestamp operations
     */
    move(duration: import('../duration/DurationInterval').DurationInterval): Period;
    /**
     * Move period backward by duration
     * Convenience method for negative movement
     */
    moveBackward(duration: import('../duration/DurationInterval').DurationInterval): Period;
    /**
     * Expand period by duration in both directions
     * Optimized with single calculation
     */
    expand(duration: import('../duration/DurationInterval').DurationInterval): Period;
    /**
     * Check if period is entirely before another period
     * High-performance comparison
     */
    isBefore(other: Period): boolean;
    /**
     * Check if period is entirely after another period
     * High-performance comparison
     */
    isAfter(other: Period): boolean;
    /**
     * Get the gap between this period and another (if any)
     * Returns null if periods overlap or touch
     */
    gap(other: Period): Period | null;
    /**
     * Format period with bounds notation
     * Optimized string operations and caching
     */
    format(dateFormat?: 'iso' | 'short' | 'long' | 'datetime' | 'smart'): string;
    /**
     * Create string representation with smart formatting
     * Shows time when relevant (short periods or non-midnight times)
     */
    toString(): string;
    /**
     * Format as date only (no time component)
     * Example: [2024-01-15, 2024-01-16)
     */
    toDateString(): string;
    /**
     * Format with full date and time
     * Example: [2024-01-15T09:00, 2024-01-15T10:00)
     */
    toDateTimeString(): string;
    /**
     * Format for human readability
     * Example: "Jan 15, 2024 9:00 AM - 10:00 AM" or "Jan 15 - 16, 2024"
     */
    toDisplayString(): string;
}
//# sourceMappingURL=Period.d.ts.map