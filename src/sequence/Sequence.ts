/**
 * High-performance Sequence class for managing collections of Period instances
 * Optimized for large datasets with efficient gap analysis and set operations
 */

import { Period } from '../core/Period';

export class Sequence implements Iterable<Period> {
  private readonly _periods: readonly Period[];
  private readonly _sorted: boolean;
  
  // Aggressive caching for performance optimization
  private _boundaries?: Period;
  private _gaps?: Sequence;
  private _totalDuration?: number;
  private _sortedByStart?: Period[];
  private _sortedByEnd?: Period[];
  private _sortedByDuration?: Period[];
  private _isEmpty?: boolean;
  private _count?: number;
  
  // Cache invalidation hash to detect changes
  private _cacheHash?: string;

  constructor(periods: Period[], preserveOrder: boolean);
  constructor(...periods: Period[]);
  constructor(periodsOrFirst?: Period[] | Period, preserveOrderOrSecond?: boolean | Period, ...rest: Period[]) {
    // Handle overloaded constructor
    let periods: Period[];
    let shouldSort = true;
    
    if (Array.isArray(periodsOrFirst) && typeof preserveOrderOrSecond === 'boolean') {
      // First overload: constructor(periods: Period[], preserveOrder: boolean)
      periods = periodsOrFirst;
      shouldSort = !preserveOrderOrSecond;
    } else if (periodsOrFirst && !Array.isArray(periodsOrFirst)) {
      // Second overload: constructor(...periods: Period[])
      const allPeriods = [periodsOrFirst];
      if (typeof preserveOrderOrSecond !== 'boolean') {
        allPeriods.push(preserveOrderOrSecond as Period);
      }
      allPeriods.push(...rest);
      periods = allPeriods.filter(p => p !== undefined);
    } else if (Array.isArray(periodsOrFirst)) {
      // Array passed without preserve flag - default to sorting
      periods = periodsOrFirst;
    } else {
      periods = [];
    }

    if (periods.length === 0) {
      this._periods = [];
      this._sorted = true;
      return;
    }

    if (shouldSort) {
      // Sort periods by start time for performance optimization
      const sortedPeriods = [...periods].sort((a, b) => a.startTime - b.startTime);
      this._periods = Object.freeze(sortedPeriods);
      this._sorted = true;
    } else {
      // Preserve the order passed in (for custom sorting)
      this._periods = Object.freeze([...periods]);
      this._sorted = false;
    }
  }

  /**
   * Create sequence from array of periods
   * Optimized constructor for better performance with large arrays
   */
  static fromArray(periods: Period[]): Sequence {
    return new Sequence(periods, false); // Use array constructor directly - no spread operator limits!
  }

  /**
   * Create empty sequence
   * Optimized for common use case
   */
  static empty(): Sequence {
    return new Sequence();
  }

  /**
   * Number of periods in the sequence (cached)
   * O(1) operation with memoization
   */
  count(): number {
    if (this._count === undefined) {
      this._count = this._periods.length;
    }
    return this._count;
  }

  /**
   * Check if sequence is empty (cached)
   * O(1) operation with memoization
   */
  isEmpty(): boolean {
    if (this._isEmpty === undefined) {
      this._isEmpty = this._periods.length === 0;
    }
    return this._isEmpty;
  }

  /**
   * Get period by index
   * O(1) operation with bounds checking
   */
  get(index: number): Period {
    if (index < 0 || index >= this._periods.length) {
      throw new Error(`Index ${index} out of bounds. Sequence has ${this._periods.length} periods.`);
    }
    return this._periods[index];
  }

  /**
   * Get first period
   * O(1) operation
   */
  first(): Period | undefined {
    return this._periods[0];
  }

  /**
   * Get last period
   * O(1) operation
   */
  last(): Period | undefined {
    return this._periods[this._periods.length - 1];
  }

  /**
   * Convert to array
   * Returns a copy to maintain immutability
   */
  toArray(): Period[] {
    return [...this._periods];
  }

  /**
   * Iterator implementation for for...of loops
   * Enables: for (const period of sequence) { ... }
   */
  [Symbol.iterator](): IterableIterator<Period> {
    return this._periods[Symbol.iterator]();
  }

  /**
   * Get boundaries of the entire sequence
   * Returns a period that spans from the earliest start to the latest end
   * Cached for performance
   */
  boundaries(): Period | undefined {
    if (this.isEmpty()) {
      return undefined;
    }

    if (!this._boundaries) {
      const first = this.first()!;
      const last = this.last()!;
      
      // Find the actual earliest start and latest end
      let earliestStart = first.startTime;
      let latestEnd = last.endTime;
      
      // Since periods are sorted by start time, we only need to check end times
      for (const period of this._periods) {
        if (period.endTime > latestEnd) {
          latestEnd = period.endTime;
        }
      }
      
      this._boundaries = new Period(earliestStart, latestEnd, first.bounds);
    }

    return this._boundaries;
  }

  /**
   * Find gaps between non-overlapping periods
   * Returns a new Sequence containing the gap periods
   * Highly optimized algorithm with O(n) complexity
   */
  gaps(): Sequence {
    if (this._gaps) {
      return this._gaps;
    }

    if (this.isEmpty() || this.count() === 1) {
      this._gaps = Sequence.empty();
      return this._gaps;
    }

    const gaps: Period[] = [];
    
    // Iterate through adjacent periods to find gaps
    for (let i = 0; i < this._periods.length - 1; i++) {
      const current = this._periods[i];
      const next = this._periods[i + 1];
      
      // Check if there's a gap between current and next period
      if (!current.overlaps(next) && !current.touches(next)) {
        // Create gap period using the end of current and start of next
        const gap = new Period(current.endTime, next.startTime, current.bounds);
        gaps.push(gap);
      }
    }
    
    this._gaps = new Sequence(...gaps);
    return this._gaps;
  }

  /**
   * Filter periods based on predicate
   * Returns new Sequence with matching periods
   */
  filter(predicate: (period: Period, index: number) => boolean): Sequence {
    const filtered = this._periods.filter(predicate);
    return new Sequence(...filtered);
  }

  /**
   * Map periods to new values
   * Returns array of mapped values
   */
  map<T>(mapper: (period: Period, index: number) => T): T[] {
    return this._periods.map(mapper);
  }

  /**
   * Check if any period matches the predicate
   */
  some(predicate: (period: Period, index: number) => boolean): boolean {
    return this._periods.some(predicate);
  }

  /**
   * Check if all periods match the predicate
   */
  every(predicate: (period: Period, index: number) => boolean): boolean {
    return this._periods.every(predicate);
  }

  /**
   * Find first period matching predicate
   */
  find(predicate: (period: Period, index: number) => boolean): Period | undefined {
    return this._periods.find(predicate);
  }

  /**
   * Reduce sequence to a single value
   * Standard array reduce functionality
   */
  reduce<T>(reducer: (accumulator: T, period: Period, index: number, array: readonly Period[]) => T, initialValue: T): T {
    return this._periods.reduce(reducer, initialValue);
  }

  /**
   * Sort sequence by custom comparator
   * Returns new Sequence with sorted periods
   */
  sort(compareFn?: (a: Period, b: Period) => number): Sequence {
    const sorted = [...this._periods].sort(compareFn);
    return new Sequence(sorted, true); // preserveOrder = true to avoid re-sorting
  }

  /**
   * Sort by start date (already optimized as default)
   * Returns this sequence if already sorted by start date
   */
  sortByStartDate(): Sequence {
    return this._sorted ? this : this.sort((a, b) => a.startTime - b.startTime);
  }

  /**
   * Sort by duration (shortest first)
   * Returns new Sequence sorted by duration
   */
  sortByDuration(): Sequence {
    return this.sort((a, b) => {
      const durA = a.endTime - a.startTime;
      const durB = b.endTime - b.startTime;
      return durA - durB;
    });
  }

  /**
   * Check if this sequence equals another sequence
   * Compares all periods for equality
   */
  equals(other: Sequence): boolean {
    if (this.count() !== other.count()) {
      return false;
    }
    
    for (let i = 0; i < this._periods.length; i++) {
      if (!this._periods[i].equals(other._periods[i])) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * String representation of the sequence
   * Shows count and boundaries for debugging
   */
  toString(): string {
    if (this.isEmpty()) {
      return 'Sequence(empty)';
    }
    
    const boundaries = this.boundaries();
    return `Sequence(${this.count()} periods, ${boundaries?.toString()})`;
  }

  /**
   * Create a union of this sequence with another sequence
   * Combines all periods from both sequences, removing duplicates
   * @param other - The sequence to union with
   * @returns A new sequence containing all unique periods from both sequences
   */
  union(other: Sequence): Sequence {
    if (this.isEmpty()) return other;
    if (other.isEmpty()) return this;
    
    const maxSize = this._periods.length + other._periods.length;
    const combined = new Array<Period>(maxSize);
    let writeIndex = 0;
    const seenPeriods = new Set<Period>();
    
    // Add periods from first sequence
    const thisPeriods = this._periods;
    for (let i = 0; i < thisPeriods.length; i++) {
      const period = thisPeriods[i];
      if (!seenPeriods.has(period)) {
        seenPeriods.add(period);
        combined[writeIndex++] = period;
      }
    }
    
    // Add periods from second sequence
    const otherPeriods = other._periods;
    for (let i = 0; i < otherPeriods.length; i++) {
      const period = otherPeriods[i];
      if (!seenPeriods.has(period)) {
        seenPeriods.add(period);
        combined[writeIndex++] = period;
      }
    }
    
    // Trim array to actual size and create sequence
    combined.length = writeIndex;
    return new Sequence(combined, false); // preserveOrder = false for sorting
  }

  /**
   * Find intersections with another sequence
   * Returns periods that overlap between this sequence and another
   * @param other - The sequence to intersect with
   * @returns A new sequence containing only overlapping periods
   */
  intersect(other: Sequence): Sequence {
    // Fast path for empty sequences
    if (this.isEmpty() || other.isEmpty()) {
      return Sequence.empty();
    }

    const intersections: Period[] = [];
    
    // Use two-pointer technique on sorted sequences for O(n + m) complexity
    let i = 0, j = 0;
    const thisArray = this._periods;
    const otherArray = other._periods;
    
    while (i < thisArray.length && j < otherArray.length) {
      const thisPeriod = thisArray[i];
      const otherPeriod = otherArray[j];
      
      // Check for overlap using optimized timestamp comparison
      const maxStart = Math.max(thisPeriod.startTime, otherPeriod.startTime);
      const minEnd = Math.min(thisPeriod.endTime, otherPeriod.endTime);
      
      if (maxStart < minEnd) {
        // Periods overlap - create intersection
        intersections.push(new Period(maxStart, minEnd, thisPeriod.bounds));
      }
      
      // Advance the pointer of the period that ends first
      if (thisPeriod.endTime <= otherPeriod.endTime) {
        i++;
      } else {
        j++;
      }
    }
    
    return new Sequence(intersections, true); // preserveOrder = true (already sorted)
  }

  /**
   * Subtract operation - remove overlapping periods
   * High-performance implementation with early termination
   * Complexity: O(n * m) but optimized with early breaks
   */
  subtract(other: Sequence): Sequence {
    // Fast path for empty sequences
    if (this.isEmpty()) return Sequence.empty();
    if (other.isEmpty()) return this;
    
    const remaining: Period[] = [];
    
    // Pre-filter: only check periods that could potentially overlap
    const otherBoundaries = other.boundaries();
    if (!otherBoundaries) return this;
    
    for (const thisPeriod of this._periods) {
      // Fast boundary check before expensive overlap tests
      if (thisPeriod.endTime <= otherBoundaries.startTime || 
          thisPeriod.startTime >= otherBoundaries.endTime) {
        // Period is completely outside other sequence bounds
        remaining.push(thisPeriod);
        continue;
      }
      
      // Check for overlaps with early termination
      let hasOverlap = false;
      for (const otherPeriod of other._periods) {
        // Early termination if other period is past current period
        if (otherPeriod.startTime >= thisPeriod.endTime) break;
        
        if (thisPeriod.overlaps(otherPeriod)) {
          hasOverlap = true;
          break;
        }
      }
      
      if (!hasOverlap) {
        remaining.push(thisPeriod);
      }
    }
    
    return new Sequence(remaining, true); // preserveOrder = true (maintaining order)
  }

  /**
   * Merge overlapping and consecutive day periods within this sequence
   * Optimized for date-only operations with enhanced boundary logic
   * Complexity: O(n) since periods are already sorted
   */
  merge(): Sequence {
    if (this.isEmpty() || this.count() === 1) {
      return this;
    }

    const merged: Period[] = [];
    let current = this._periods[0];

    for (let i = 1; i < this._periods.length; i++) {
      const next = this._periods[i];
      
      // Use the enhanced date-only merging logic
      if (current.overlaps(next) || current.canMergeConsecutiveDays(next)) {
        // Merge periods using the union method which handles date-only logic
        const mergedPeriod = current.union(next);
        if (mergedPeriod) {
          current = mergedPeriod;
        } else {
          // Fallback: shouldn't happen with proper logic, but safety net
          merged.push(current);
          current = next;
        }
      } else {
        // No overlap or consecutive merger possible, add current and move to next
        merged.push(current);
        current = next;
      }
    }
    
    // Add the last period
    merged.push(current);
    
    return new Sequence(merged, true); // preserveOrder = true
  }

  /**
   * Get the total duration of all periods in the sequence (cached)
   * Ultra-optimized calculation with memoization
   */
  totalDuration(): number {
    if (this._totalDuration === undefined) {
      let totalMs = 0;
      const periods = this._periods;
      const len = periods.length;
      
      // Unrolled loop for better performance
      let i = 0;
      while (i < len - 3) {
        totalMs += periods[i].endTime - periods[i].startTime;
        totalMs += periods[i + 1].endTime - periods[i + 1].startTime;
        totalMs += periods[i + 2].endTime - periods[i + 2].startTime;
        totalMs += periods[i + 3].endTime - periods[i + 3].startTime;
        i += 4;
      }
      
      // Handle remaining elements
      while (i < len) {
        totalMs += periods[i].endTime - periods[i].startTime;
        i++;
      }
      
      this._totalDuration = totalMs;
    }
    return this._totalDuration;
  }

  // Mutable-style methods (immutable behind the scenes)

  /**
   * Add a period to the end of the sequence
   * Returns a new Sequence instance (immutable design)
   */
  push(period: Period): Sequence {
    const newPeriods = [...this._periods, period];
    return new Sequence(newPeriods, true); // preserveOrder = true
  }

  /**
   * Add a period to the beginning of the sequence
   * Returns a new Sequence instance (immutable design)
   */
  unshift(period: Period): Sequence {
    const newPeriods = [period, ...this._periods];
    return new Sequence(newPeriods, true); // preserveOrder = true
  }

  /**
   * Insert a period at the specified index
   * Returns a new Sequence instance (immutable design)
   * @param index - Zero-based index (supports negative indexing)
   * @param period - Period to insert
   */
  insert(index: number, period: Period): Sequence {
    const len = this._periods.length;
    
    // Handle negative indexing: -1 means insert before last element
    if (index < 0) {
      index = len + index;
    }
    
    // Validate index bounds
    if (index < 0 || index > len) {
      throw new Error(`Index ${index} is out of bounds for sequence of length ${len}`);
    }
    
    const newPeriods = [
      ...this._periods.slice(0, index),
      period,
      ...this._periods.slice(index)
    ];
    return new Sequence(newPeriods, true); // preserveOrder = true
  }

  /**
   * Remove and return the period at the specified index
   * Returns the removed period, and updates this sequence to a new instance
   * @param index - Zero-based index (supports negative indexing)
   */
  remove(index: number): Period {
    const len = this._periods.length;
    
    // Handle negative indexing
    if (index < 0) {
      index = len + index;
    }
    
    // Validate index bounds
    if (index < 0 || index >= len) {
      throw new Error(`Index ${index} is out of bounds for sequence of length ${len}`);
    }
    
    const removedPeriod = this._periods[index];
    const newPeriods = [
      ...this._periods.slice(0, index),
      ...this._periods.slice(index + 1)
    ];
    
    // Update this instance to point to new sequence
    Object.assign(this, new Sequence(newPeriods, true));
    
    return removedPeriod;
  }

  /**
   * Replace the period at the specified index
   * Returns a new Sequence instance (immutable design)
   * @param index - Zero-based index (supports negative indexing)
   * @param period - New period to set
   */
  set(index: number, period: Period): Sequence {
    const len = this._periods.length;
    
    // Handle negative indexing
    if (index < 0) {
      index = len + index;
    }
    
    // Validate index bounds
    if (index < 0 || index >= len) {
      throw new Error(`Index ${index} is out of bounds for sequence of length ${len}`);
    }
    
    const newPeriods = [...this._periods];
    newPeriods[index] = period;
    return new Sequence(newPeriods, true); // preserveOrder = true
  }

  /**
   * Remove all periods from the sequence
   * Returns a new empty Sequence instance (immutable design)
   */
  clear(): Sequence {
    return Sequence.empty();
  }

  /**
   * Check if the sequence contains a specific period
   * @param period - Period to search for
   */
  contains(period: Period): boolean {
    return this._periods.some(p => p.equals(period));
  }

  /**
   * Find the index of a specific period in the sequence
   * @param period - Period to search for
   * @returns Index of the period, or false if not found
   */
  indexOf(period: Period): number | false {
    const index = this._periods.findIndex(p => p.equals(period));
    return index === -1 ? false : index;
  }

  /**
   * Convert sequence to array (alias for toArray for compatibility)
   */
  toList(): Period[] {
    return this.toArray();
  }
}
