/**
 * Core types and interfaces for the Period library
 */

/**
 * Boundary types for period intervals
 * Using numeric enum for performance (faster than string unions)
 */
export enum Bounds {
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
 * Duration representation for time periods
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
export class BoundsUtils {
  /**
   * Fast inline check if bounds includes start
   * Optimized for hot paths - avoid function calls
   */
  static includesStart(bounds: Bounds): boolean {
    return bounds === Bounds.IncludeStartExcludeEnd || bounds === Bounds.IncludeAll;
  }

  /**
   * Fast inline check if bounds includes end
   * Optimized for hot paths - avoid function calls
   */
  static includesEnd(bounds: Bounds): boolean {
    return bounds === Bounds.ExcludeStartIncludeEnd || bounds === Bounds.IncludeAll;
  }

  /**
   * Get boundary notation characters for formatting
   */
  static getBrackets(bounds: Bounds): [string, string] {
    const startBracket = BoundsUtils.includesStart(bounds) ? '[' : '(';
    const endBracket = BoundsUtils.includesEnd(bounds) ? ']' : ')';
    return [startBracket, endBracket];
  }
}
