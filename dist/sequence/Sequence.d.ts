/**
 * High-performance Sequence class for managing collections of Period instances
 * Optimized for large datasets with efficient gap analysis and set operations
 */
import { Period } from '../core/Period';
export declare class Sequence implements Iterable<Period> {
    private readonly _periods;
    private readonly _sorted;
    private _boundaries?;
    private _gaps?;
    private _totalDuration?;
    private _sortedByStart?;
    private _sortedByEnd?;
    private _sortedByDuration?;
    private _isEmpty?;
    private _count?;
    private _cacheHash?;
    constructor(periods: Period[], preserveOrder: boolean);
    constructor(...periods: Period[]);
    /**
     * Create sequence from array of periods
     * Optimized constructor for better performance with large arrays
     */
    static fromArray(periods: Period[]): Sequence;
    /**
     * Create empty sequence
     * Optimized for common use case
     */
    static empty(): Sequence;
    /**
     * Number of periods in the sequence (cached)
     * O(1) operation with memoization
     */
    count(): number;
    /**
     * Check if sequence is empty (cached)
     * O(1) operation with memoization
     */
    isEmpty(): boolean;
    /**
     * Get period by index
     * O(1) operation with bounds checking
     */
    get(index: number): Period;
    /**
     * Get first period
     * O(1) operation
     */
    first(): Period | undefined;
    /**
     * Get last period
     * O(1) operation
     */
    last(): Period | undefined;
    /**
     * Convert to array
     * Returns a copy to maintain immutability
     */
    toArray(): Period[];
    /**
     * Iterator implementation for for...of loops
     * Enables: for (const period of sequence) { ... }
     */
    [Symbol.iterator](): IterableIterator<Period>;
    /**
     * Get boundaries of the entire sequence
     * Returns a period that spans from the earliest start to the latest end
     * Cached for performance
     */
    boundaries(): Period | undefined;
    /**
     * Find gaps between non-overlapping periods
     * Returns a new Sequence containing the gap periods
     * Highly optimized algorithm with O(n) complexity
     */
    gaps(): Sequence;
    /**
     * Filter periods based on predicate
     * Returns new Sequence with matching periods
     */
    filter(predicate: (period: Period, index: number) => boolean): Sequence;
    /**
     * Map periods to new values
     * Returns array of mapped values
     */
    map<T>(mapper: (period: Period, index: number) => T): T[];
    /**
     * Check if any period matches the predicate
     */
    some(predicate: (period: Period, index: number) => boolean): boolean;
    /**
     * Check if all periods match the predicate
     */
    every(predicate: (period: Period, index: number) => boolean): boolean;
    /**
     * Find first period matching predicate
     */
    find(predicate: (period: Period, index: number) => boolean): Period | undefined;
    /**
     * Sort sequence by custom comparator
     * Returns new Sequence with sorted periods
     */
    sort(compareFn?: (a: Period, b: Period) => number): Sequence;
    /**
     * Sort by start date (already optimized as default)
     * Returns this sequence if already sorted by start date
     */
    sortByStartDate(): Sequence;
    /**
     * Sort by duration (shortest first)
     * Returns new Sequence sorted by duration
     */
    sortByDuration(): Sequence;
    /**
     * Check if this sequence equals another sequence
     * Compares all periods for equality
     */
    equals(other: Sequence): boolean;
    /**
     * String representation of the sequence
     * Shows count and boundaries for debugging
     */
    toString(): string;
    /**
     * Create a union of this sequence with another sequence
     * Combines all periods from both sequences, removing duplicates
     * @param other - The sequence to union with
     * @returns A new sequence containing all unique periods from both sequences
     */
    union(other: Sequence): Sequence;
    /**
     * Find intersections with another sequence
     * Returns periods that overlap between this sequence and another
     * @param other - The sequence to intersect with
     * @returns A new sequence containing only overlapping periods
     */
    intersect(other: Sequence): Sequence;
    /**
     * Subtract operation - remove overlapping periods
     * High-performance implementation with early termination
     * Complexity: O(n * m) but optimized with early breaks
     */
    subtract(other: Sequence): Sequence;
    /**
     * Merge overlapping periods within this sequence
     * High-performance algorithm for consolidating adjacent/overlapping periods
     * Complexity: O(n) since periods are already sorted
     */
    merge(): Sequence;
    /**
     * Get the total duration of all periods in the sequence (cached)
     * Ultra-optimized calculation with memoization
     */
    totalDuration(): number;
    /**
     * Add a period to the end of the sequence
     * Returns a new Sequence instance (immutable design)
     */
    push(period: Period): Sequence;
    /**
     * Add a period to the beginning of the sequence
     * Returns a new Sequence instance (immutable design)
     */
    unshift(period: Period): Sequence;
    /**
     * Insert a period at the specified index
     * Returns a new Sequence instance (immutable design)
     * @param index - Zero-based index (supports negative indexing)
     * @param period - Period to insert
     */
    insert(index: number, period: Period): Sequence;
    /**
     * Remove and return the period at the specified index
     * Returns the removed period, and updates this sequence to a new instance
     * @param index - Zero-based index (supports negative indexing)
     */
    remove(index: number): Period;
    /**
     * Replace the period at the specified index
     * Returns a new Sequence instance (immutable design)
     * @param index - Zero-based index (supports negative indexing)
     * @param period - New period to set
     */
    set(index: number, period: Period): Sequence;
    /**
     * Remove all periods from the sequence
     * Returns a new empty Sequence instance (immutable design)
     */
    clear(): Sequence;
    /**
     * Check if the sequence contains a specific period
     * @param period - Period to search for
     */
    contains(period: Period): boolean;
    /**
     * Find the index of a specific period in the sequence
     * @param period - Period to search for
     * @returns Index of the period, or false if not found
     */
    indexOf(period: Period): number | false;
    /**
     * Convert sequence to array (alias for toArray for compatibility)
     */
    toList(): Period[];
}
//# sourceMappingURL=Sequence.d.ts.map