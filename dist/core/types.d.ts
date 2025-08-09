/**
 * Core types and interfaces for the Period library
 */
/**
 * Boundary types for period intervals
 * Using numeric enum for performance (faster than string unions)
 */
export declare enum Bounds {
    /** [start, end) - Include start, exclude end (default) */
    IncludeStartExcludeEnd = 0,
    /** (start, end] - Exclude start, include end */
    ExcludeStartIncludeEnd = 1,
    /** [start, end] - Include both start and end */
    IncludeAll = 2,
    /** (start, end) - Exclude both start and end */
    ExcludeAll = 3
}
/**
 * Duration representation in various units
 */
export interface Duration {
    readonly milliseconds: number;
    readonly seconds: number;
    readonly minutes: number;
    readonly hours: number;
    readonly days: number;
}
/**
 * Internal utility functions for performance optimizations
 */
export declare class BoundsUtils {
    /**
     * Fast inline check if bounds includes start
     * Optimized for hot paths - avoid function calls
     */
    static includesStart(bounds: Bounds): boolean;
    /**
     * Fast inline check if bounds includes end
     * Optimized for hot paths - avoid function calls
     */
    static includesEnd(bounds: Bounds): boolean;
    /**
     * Get boundary notation characters for formatting
     */
    static getBrackets(bounds: Bounds): [string, string];
}
//# sourceMappingURL=types.d.ts.map