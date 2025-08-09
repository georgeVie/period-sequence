import { Period as PeriodClass } from './core/Period';
import { Duration as DurationType } from './core/types';
import { PeriodConstructors } from './constructors/PeriodConstructors';
export { Period as PeriodClass } from './core/Period';
export { Bounds, Duration, BoundsUtils } from './core/types';
export { DurationInterval } from './duration/DurationInterval';
export { Sequence } from './sequence/Sequence';
export { PeriodConstructors } from './constructors/PeriodConstructors';
export { PerformanceBenchmarks, runPerformanceBenchmarks } from './performance/PerformanceBenchmarks';
export type { BenchmarkResult, BenchmarkSuite } from './performance/PerformanceBenchmarks';
export declare class Period extends PeriodClass {
    static fromMonth: typeof PeriodConstructors.fromMonth;
    static fromYear: typeof PeriodConstructors.fromYear;
    static fromDay: typeof PeriodConstructors.fromDay;
    static fromWeek: typeof PeriodConstructors.fromWeek;
    static fromQuarter: typeof PeriodConstructors.fromQuarter;
    static after: typeof PeriodConstructors.after;
    static before: typeof PeriodConstructors.before;
    static around: typeof PeriodConstructors.around;
    static fromISO8601: typeof PeriodConstructors.fromISO8601;
}
export declare function createPeriod(start: Date, end: Date): Period;
export declare function getDuration(period: Period): DurationType;
export declare function periodsOverlap(period1: Period, period2: Period): boolean;
export declare function formatPeriod(period: Period, format?: 'short' | 'long'): string;
//# sourceMappingURL=index.d.ts.map