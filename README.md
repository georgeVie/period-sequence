# @georgevie/period-sequence

**High-performance TypeScript library for date period manipulation with immutable design and enterprise-grade performance**

[![npm version](https://img.shields.io/npm/v/@georgevie/period-sequence.svg?style=flat-square)](https://www.npmjs.com/package/@georgevie/period-sequence)
[![npm downloads](https://img.shields.io/npm/dm/@georgevie/period-sequence.svg?style=flat-square)](https://www.npmjs.com/package/@georgevie/period-sequence)
[![license](https://img.shields.io/npm/l/@georgevie/period-sequence.svg?style=flat-square)](https://github.com/georgeVie/period-sequence/blob/main/LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/georgeVie/period-sequence/ci.yml?style=flat-square&label=CI)](https://github.com/georgeVie/period-sequence/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![GitHub Issues](https://img.shields.io/github/issues/georgeVie/period-sequence?style=flat-square)](https://github.com/georgeVie/period-sequence/issues)
[![GitHub Stars](https://img.shields.io/github/stars/georgeVie/period-sequence?style=flat-square&logo=github)](https://github.com/georgeVie/period-sequence)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/georgeVie/period-sequence/pulls)

## ✨ Features

- **🚀 Ultra-Fast Performance** - 148M+ operations/second with optimized algorithms
- **🔒 Immutable Design** - All operations return new instances for predictable behavior  
- **🎯 Type-Safe** - Full TypeScript support with comprehensive type definitions
- **📏 Advanced Bounds System** - Four boundary types: `[start, end)`, `(start, end]`, `[start, end]`, `(start, end)`
- **📦 Modular & Tree-shakable** - Import only what you need
- **⚡ Zero Configuration** - Maximum performance out of the box
- **🧪 Battle-Tested** - 166 comprehensive tests with 95%+ coverage

## 📦 Installation

```bash
npm install @georgevie/period-sequence
```

## 🎯 Quick Start

```typescript
import { Period, Sequence, Bounds, DurationInterval } from '@georgevie/period-sequence';

// Create date periods
const meeting = new Period('2024-01-15', '2024-01-16');
const vacation = Period.fromDay('2024-07-15');
const quarter = Period.fromQuarter(2024, 1);

// Check relationships
console.log(meeting.overlaps(vacation)); // false
console.log(quarter.contains(meeting)); // true
console.log(meeting.durationInDays); // 1

// Work with sequences
const schedule = new Sequence(meeting, vacation);
console.log(schedule.count()); // 2
console.log(schedule.totalDuration()); // 86400000 (1 day in ms)

// High-performance set operations
const conflicts = schedule1.intersect(schedule2);
const available = allDays.subtract(schedule);
```

## 📚 Core API

### Period Creation

```typescript
// Basic construction
const period = new Period('2024-01-01', '2024-01-31');

// Named constructors
Period.fromMonth(2024, 6);           // June 2024
Period.fromYear(2024);               // All of 2024
Period.fromDay('2024-06-15');        // Single day
Period.fromQuarter(2024, 2);         // Q2 2024
Period.fromWeek(2024, 25);           // ISO week 25

// Relative periods
Period.after('2024-01-01', DurationInterval.fromWeeks(2));
Period.before('2024-12-31', DurationInterval.fromDays(30));
Period.around('2024-06-15', DurationInterval.fromDays(3));
```

### Period Operations

```typescript
const period = Period.fromMonth(2024, 6);

// Comparisons
period.overlaps(other);      // Check for overlap
period.contains(other);      // Check containment
period.touches(other);       // Check adjacency
period.equals(other);        // Check equality

// Transformations (immutable)
period.startingOn('2024-06-01');     // New start date
period.endingOn('2024-06-30');       // New end date
period.move(DurationInterval.fromDays(7)); // Shift forward
period.expand(DurationInterval.fromDays(1)); // Extend both directions

// Analysis
period.isBefore(other);      // Positional check
period.gap(other);           // Find gap between periods

// Formatting options
period.toString();           // Date format: [2024-01-15, 2024-01-16)
period.toDateString();       // Date only: [2024-01-15, 2024-01-16)
period.toDisplayString();    // Human readable: "Jan 15, 2024 - Jan 16, 2024"
period.format('iso');        // Custom format control
```

### Sequence Operations

```typescript
const sequence = new Sequence(period1, period2, period3);

// Collection operations
sequence.count();           // Number of periods
sequence.isEmpty();         // Check if empty
sequence.boundaries();      // Overall time span
sequence.totalDuration();   // Sum of all periods

// Set operations
sequence.union(other);      // Combine sequences
sequence.intersect(other);  // Find overlaps
sequence.subtract(other);   // Remove overlaps
sequence.merge();           // Consolidate adjacent periods

// Analysis
sequence.gaps();            // Find gaps between periods
sequence.sort((a, b) => a.startTime - b.startTime);
```

## 🔧 Boundary Types

Control exactly which boundary points are included:

```typescript
// Default: [start, end) - includes start, excludes end
const period1 = new Period('2024-01-01', '2024-01-31');

// Custom boundaries
const inclusive = new Period('2024-01-01', '2024-01-31', Bounds.IncludeAll); // [start, end]
const exclusive = new Period('2024-01-01', '2024-01-31', Bounds.ExcludeAll); // (start, end)
```

## 🎨 Real-World Examples

### Date Scheduler
```typescript
const busyDays = [
  Period.fromDay('2024-01-15'),   // Monday
  Period.fromDay('2024-01-17'),   // Wednesday
];

const schedule = new Sequence(...busyDays);
const workWeek = new Period('2024-01-15', '2024-01-20'); // Mon-Fri

// Find available days
const availableDays = new Sequence(workWeek).subtract(schedule);
```

### Resource Allocation
```typescript
const bookings = new Sequence(
  Period.fromDay('2024-01-01'),
  Period.fromDay('2024-01-03')
);

const requested = Period.fromDay('2024-01-02');

if (bookings.intersect(new Sequence(requested)).isEmpty()) {
  console.log('Available!');
}
```

## ⚡ Performance

Built-in optimizations provide exceptional performance with zero configuration:

- **148M+ overlap operations/second** - Bitpacked boundary checking
- **8M+ sequence operations/second** - Pre-allocated arrays and optimized algorithms  
- **Sub-millisecond operations** for most use cases
- **Minimal memory footprint** - Smart caching and object pooling

## 📋 Requirements

- **Node.js**: ≥16.0.0
- **TypeScript**: ≥4.5.0 (for TypeScript projects)

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

---

## 📚 Complete API Reference

### Period Class

#### Constructors
```typescript
new Period(start: Date | number | string, end: Date | number | string, bounds?: Bounds)
Period.fromMonth(year: number, month: number): Period
Period.fromYear(year: number): Period  
Period.fromDay(date: Date | string): Period
Period.fromWeek(year: number, week: number): Period
Period.fromQuarter(year: number, quarter: number): Period
Period.after(start: Date | string, duration: DurationInterval): Period
Period.before(end: Date | string, duration: DurationInterval): Period
Period.around(center: Date | string, duration: DurationInterval): Period
Period.fromISO8601(isoPeriod: string): Period
```

#### Properties
```typescript
period.start: Date                    // Start date
period.end: Date                      // End date  
period.startTime: number              // Start timestamp (milliseconds)
period.endTime: number                // End timestamp (milliseconds)
period.bounds: Bounds                 // Boundary type
```

#### Comparison Methods
```typescript
period.overlaps(other: Period): boolean
period.contains(other: Period): boolean
period.containsDate(date: Date | string): boolean
period.touches(other: Period): boolean
period.abuts(other: Period): boolean
period.equals(other: Period): boolean
period.isBefore(other: Period): boolean
period.isAfter(other: Period): boolean
```

#### Modification Methods (Return New Instance)
```typescript
period.startingOn(start: Date | number): Period
period.endingOn(end: Date | number): Period
period.withBounds(bounds: Bounds): Period
period.withDuration(duration: DurationInterval): Period
period.move(duration: DurationInterval): Period
period.moveBackward(duration: DurationInterval): Period
period.expand(duration: DurationInterval): Period
```

#### Analysis Methods
```typescript
period.getDuration(): Duration
period.gap(other: Period): Period | null
```

#### Formatting Methods
```typescript
period.toString(): string
period.toDateString(): string
period.toDisplayString(): string
period.format(type: 'iso' | 'short' | 'long' | 'smart'): string
```

### Sequence Class

#### Constructors
```typescript
new Sequence(...periods: Period[])                    // Up to ~50K periods
new Sequence(periods: Period[], preserveOrder: boolean)
Sequence.fromArray(periods: Period[]): Sequence       // For large datasets
Sequence.empty(): Sequence
```

#### Collection Methods
```typescript
sequence.count(): number
sequence.isEmpty(): boolean
sequence.get(index: number): Period | undefined
sequence.first(): Period | undefined
sequence.last(): Period | undefined
sequence.toArray(): Period[]
```

#### Iteration
```typescript
for (const period of sequence) { }
sequence[Symbol.iterator](): Iterator<Period>
```

#### Analysis Methods
```typescript
sequence.boundaries(): Period | undefined
sequence.gaps(): Sequence
sequence.totalDuration(): number
```

#### Set Operations (Return New Sequence)
```typescript
sequence.union(other: Sequence): Sequence
sequence.intersect(other: Sequence): Sequence
sequence.subtract(other: Sequence): Sequence
sequence.merge(): Sequence
```

#### Sorting Methods (Return New Sequence)
```typescript
sequence.sort(compareFn?: (a: Period, b: Period) => number): Sequence
sequence.sortByStartDate(): Sequence
sequence.sortByDuration(): Sequence
```

#### Mutable-Style Methods (Immutable Behind Scenes)
```typescript
sequence.push(period: Period): Sequence              // Add to end
sequence.unshift(period: Period): Sequence           // Add to beginning  
sequence.insert(index: number, period: Period): Sequence  // Insert at index (supports negative)
sequence.remove(index: number): Period               // Remove and return period at index
sequence.set(index: number, period: Period): Sequence     // Replace period at index
sequence.clear(): Sequence                           // Return empty sequence
sequence.contains(period: Period): boolean           // Check if period exists
sequence.indexOf(period: Period): number | false     // Find period index
sequence.toList(): Period[]                          // Alias for toArray()
```

### DurationInterval Class

#### Constructors
```typescript
new DurationInterval(milliseconds: number)
DurationInterval.fromDays(days: number): DurationInterval
DurationInterval.fromHours(hours: number): DurationInterval
DurationInterval.fromMinutes(minutes: number): DurationInterval
DurationInterval.fromSeconds(seconds: number): DurationInterval
DurationInterval.fromWeeks(weeks: number): DurationInterval
DurationInterval.fromISO8601(duration: string): DurationInterval
```

#### Properties
```typescript
duration.milliseconds: number
duration.seconds: number
duration.minutes: number
duration.hours: number
duration.days: number
```

#### Methods
```typescript
duration.toString(): string
duration.toISO8601(): string
```

### Bounds Enum
```typescript
enum Bounds {
  IncludeStartExcludeEnd = 0,    // [start, end)
  ExcludeStartIncludeEnd = 1,    // (start, end]
  IncludeAll = 2,                // [start, end]
  ExcludeAll = 3                 // (start, end)
}
```

### BoundsUtils
```typescript
BoundsUtils.getBrackets(bounds: Bounds): [string, string]
BoundsUtils.isStartInclusive(bounds: Bounds): boolean
BoundsUtils.isEndInclusive(bounds: Bounds): boolean
```

### Duration Type
```typescript
interface Duration {
  milliseconds: number
  seconds: number
  minutes: number
  hours: number
  days: number
}
```

### Performance Utilities
```typescript
runPerformanceBenchmarks(): Promise<BenchmarkResult[]>
```

### Utility Functions
```typescript
createPeriod(start: Date | number | string, end: Date | number | string): Period
getDuration(period: Period): Duration
periodsOverlap(period1: Period, period2: Period): boolean
formatPeriod(period: Period, format?: 'short' | 'long'): string
```

## 📄 License

MIT © [georgeVie](LICENSE)

---

**@georgevie/period-sequence** - *When performance meets precision in date manipulation* 📅