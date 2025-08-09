"use strict";
/**
 * Named constructors for Period creation
 * Optimized for performance and convenience
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeriodConstructors = void 0;
const Period_1 = require("../core/Period");
const types_1 = require("../core/types");
const DurationInterval_1 = require("../duration/DurationInterval");
var PeriodConstructors;
(function (PeriodConstructors) {
    /**
     * Create period from month (high performance, timezone-aware)
     * Pre-calculated for common use case
     */
    function fromMonth(year, month, bounds = types_1.Bounds.IncludeStartExcludeEnd) {
        // Use UTC to avoid timezone issues - fastest approach
        const startTime = Date.UTC(year, month - 1, 1);
        const endTime = Date.UTC(year, month, 1);
        return new Period_1.Period(startTime, endTime, bounds);
    }
    PeriodConstructors.fromMonth = fromMonth;
    /**
     * Create period from year (timezone-aware)
     * Optimized with direct UTC calculations
     */
    function fromYear(year, bounds = types_1.Bounds.IncludeStartExcludeEnd) {
        const startTime = Date.UTC(year, 0, 1);
        const endTime = Date.UTC(year + 1, 0, 1);
        return new Period_1.Period(startTime, endTime, bounds);
    }
    PeriodConstructors.fromYear = fromYear;
    /**
     * Create period from day (timezone-aware)
     * Optimized with direct UTC calculations
     */
    function fromDay(date, bounds = types_1.Bounds.IncludeStartExcludeEnd) {
        const day = typeof date === 'string' ? new Date(date) : date;
        // Use UTC to avoid timezone interpretation issues
        const startTime = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate());
        const endTime = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate() + 1);
        return new Period_1.Period(startTime, endTime, bounds);
    }
    PeriodConstructors.fromDay = fromDay;
    /**
     * Create period starting after a specific date/time
     * Optimized with direct timestamp operations
     */
    function after(start, duration, bounds = types_1.Bounds.IncludeStartExcludeEnd) {
        const startTime = typeof start === 'string' ? new Date(start).getTime() : start.getTime();
        const endTime = startTime + duration.milliseconds;
        return new Period_1.Period(startTime, endTime, bounds);
    }
    PeriodConstructors.after = after;
    /**
     * Create period ending before a specific date/time
     * Optimized with direct timestamp operations
     */
    function before(end, duration, bounds = types_1.Bounds.IncludeStartExcludeEnd) {
        const endTime = typeof end === 'string' ? new Date(end).getTime() : end.getTime();
        const startTime = endTime - duration.milliseconds;
        return new Period_1.Period(startTime, endTime, bounds);
    }
    PeriodConstructors.before = before;
    /**
     * Create period centered around a specific date/time
     * Optimized with single division and direct calculations
     */
    function around(center, duration, bounds = types_1.Bounds.IncludeStartExcludeEnd) {
        const centerTime = typeof center === 'string' ? new Date(center).getTime() : center.getTime();
        const halfDuration = duration.milliseconds * 0.5; // Faster than / 2
        const startTime = centerTime - halfDuration;
        const endTime = centerTime + halfDuration;
        return new Period_1.Period(startTime, endTime, bounds);
    }
    PeriodConstructors.around = around;
    /**
     * Create period from ISO 8601 duration string starting at date
     * Combines parsing and construction for efficiency
     */
    function fromISO8601(start, isoDuration, bounds = types_1.Bounds.IncludeStartExcludeEnd) {
        const duration = DurationInterval_1.DurationInterval.fromISO8601(isoDuration);
        return after(start, duration, bounds);
    }
    PeriodConstructors.fromISO8601 = fromISO8601;
    /**
     * Create period from ISO week (yyyy-Www format)
     * Optimized with direct UTC calculations
     */
    function fromWeek(year, week, bounds = types_1.Bounds.IncludeStartExcludeEnd) {
        // ISO week calculation
        // Week 1 is the first week with 4 or more days in the new year
        const jan4 = new Date(Date.UTC(year, 0, 4));
        const jan4Day = jan4.getUTCDay() || 7; // Sunday = 7, Monday = 1
        // Start of week 1 (Monday)
        const week1Start = new Date(jan4.getTime() - (jan4Day - 1) * 86400000);
        // Calculate the target week
        const weekStart = new Date(week1Start.getTime() + (week - 1) * 7 * 86400000);
        const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
        return new Period_1.Period(weekStart.getTime(), weekEnd.getTime(), bounds);
    }
    PeriodConstructors.fromWeek = fromWeek;
    /**
     * Create period from quarter (1-4)
     * Optimized with direct UTC calculations
     */
    function fromQuarter(year, quarter, bounds = types_1.Bounds.IncludeStartExcludeEnd) {
        if (quarter < 1 || quarter > 4) {
            throw new Error('Quarter must be between 1 and 4');
        }
        const startMonth = (quarter - 1) * 3;
        const startTime = Date.UTC(year, startMonth, 1);
        const endTime = Date.UTC(year, startMonth + 3, 1);
        return new Period_1.Period(startTime, endTime, bounds);
    }
    PeriodConstructors.fromQuarter = fromQuarter;
})(PeriodConstructors || (exports.PeriodConstructors = PeriodConstructors = {}));
//# sourceMappingURL=PeriodConstructors.js.map