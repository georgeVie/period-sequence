/**
 * High-performance object pool for Period instances
 * Reduces GC pressure in high-frequency operations
 */
import { Period } from './Period';
import { Bounds } from './types';
export declare class PeriodPool {
    private static instance;
    private pool;
    private readonly maxSize;
    private hits;
    private misses;
    private constructor();
    static getInstance(): PeriodPool;
    /**
     * Get a Period instance from the pool or create new one
     * Ultra-fast object reuse for high-frequency operations
     */
    acquire(start: number | Date, end: number | Date, bounds?: Bounds): Period;
    /**
     * Return a Period instance to the pool for reuse
     * Call this for temporary Period objects to enable pooling
     */
    release(period: Period): void;
    /**
     * Get pool statistics for performance monitoring
     */
    getStats(): {
        hits: number;
        misses: number;
        poolSize: number;
        hitRate: number;
    };
    /**
     * Clear the pool and reset statistics
     */
    clear(): void;
}
/**
 * Convenience function for high-performance Period creation
 * Automatically uses object pooling for temporary calculations
 */
export declare function createPooledPeriod(start: number | Date, end: number | Date, bounds?: Bounds): Period;
/**
 * Release a Period back to the pool
 * Use this for temporary Period objects to enable reuse
 */
export declare function releasePooledPeriod(period: Period): void;
//# sourceMappingURL=PeriodPool.d.ts.map