/**
 * Named constructors for Period creation
 * Optimized for performance and convenience
 */
import { Period } from '../core/Period';
import { Bounds } from '../core/types';
import { DurationInterval } from '../duration/DurationInterval';
export declare namespace PeriodConstructors {
    /**
     * Create period from month (high performance, timezone-aware)
     * Pre-calculated for common use case
     */
    function fromMonth(year: number, month: number, bounds?: Bounds): Period;
    /**
     * Create period from year (timezone-aware)
     * Optimized with direct UTC calculations
     */
    function fromYear(year: number, bounds?: Bounds): Period;
    /**
     * Create period from day (timezone-aware)
     * Optimized with direct UTC calculations
     */
    function fromDay(date: Date | string, bounds?: Bounds): Period;
    /**
     * Create period starting after a specific date/time
     * Optimized with direct timestamp operations
     */
    function after(start: Date | string, duration: DurationInterval, bounds?: Bounds): Period;
    /**
     * Create period ending before a specific date/time
     * Optimized with direct timestamp operations
     */
    function before(end: Date | string, duration: DurationInterval, bounds?: Bounds): Period;
    /**
     * Create period centered around a specific date/time
     * Optimized with single division and direct calculations
     */
    function around(center: Date | string, duration: DurationInterval, bounds?: Bounds): Period;
    /**
     * Create period from ISO 8601 duration string starting at date
     * Combines parsing and construction for efficiency
     */
    function fromISO8601(start: Date | string, isoDuration: string, bounds?: Bounds): Period;
    /**
     * Create period from ISO week (yyyy-Www format)
     * Optimized with direct UTC calculations
     */
    function fromWeek(year: number, week: number, bounds?: Bounds): Period;
    /**
     * Create period from quarter (1-4)
     * Optimized with direct UTC calculations
     */
    function fromQuarter(year: number, quarter: number, bounds?: Bounds): Period;
}
//# sourceMappingURL=PeriodConstructors.d.ts.map