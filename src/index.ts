import { Period as PeriodClass } from './core/Period';
import { Duration as DurationType } from './core/types';
import { PeriodConstructors } from './constructors/PeriodConstructors';

// Core exports
export { Period as PeriodClass } from './core/Period';
export { Bounds, Duration, BoundsUtils } from './core/types';
export { DurationInterval } from './duration/DurationInterval';
export { Sequence } from './sequence/Sequence';
export { PeriodConstructors } from './constructors/PeriodConstructors';

// Performance utilities
export { PerformanceBenchmarks, runPerformanceBenchmarks } from './performance/PerformanceBenchmarks';
export type { BenchmarkResult, BenchmarkSuite } from './performance/PerformanceBenchmarks';

// Main Period class with static constructors
export class Period extends PeriodClass {
  // Basic constructors
  static fromDates = PeriodConstructors.fromDates;
  static fromTimestamps = PeriodConstructors.fromTimestamps;
  static fromDuration = PeriodConstructors.fromDuration;
  
  // Time-based constructors
  static fromMonth = PeriodConstructors.fromMonth;
  static fromYear = PeriodConstructors.fromYear;
  static fromDay = PeriodConstructors.fromDay;
  static fromWeek = PeriodConstructors.fromWeek;
  static fromQuarter = PeriodConstructors.fromQuarter;
  
  // Relative constructors
  static after = PeriodConstructors.after;
  static before = PeriodConstructors.before;
  static around = PeriodConstructors.around;
  static fromISO8601 = PeriodConstructors.fromISO8601;
  
  // Convenience constructors
  static today = PeriodConstructors.today;
  static thisWeek = PeriodConstructors.thisWeek;
  static thisMonth = PeriodConstructors.thisMonth;
  static thisYear = PeriodConstructors.thisYear;
  static now = PeriodConstructors.now;
}

// Utility functions
export function createPeriod(start: Date, end: Date): Period {
  return new Period(start, end);
}

export function getDuration(period: Period): DurationType {
  return period.getDuration();
}

export function periodsOverlap(period1: Period, period2: Period): boolean {
  return period1.overlaps(period2);
}

export function formatPeriod(period: Period, format: 'short' | 'long' = 'short'): string {
  return period.format(format);
}