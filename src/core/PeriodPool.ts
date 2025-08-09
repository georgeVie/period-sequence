/**
 * High-performance object pool for Period instances
 * Reduces GC pressure in high-frequency operations
 */

import { Period } from './Period';
import { Bounds } from './types';

export class PeriodPool {
  private static instance: PeriodPool;
  private pool: Period[] = [];
  private readonly maxSize: number = 1000;
  private hits: number = 0;
  private misses: number = 0;

  private constructor() {}

  static getInstance(): PeriodPool {
    if (!PeriodPool.instance) {
      PeriodPool.instance = new PeriodPool();
    }
    return PeriodPool.instance;
  }

  /**
   * Get a Period instance from the pool or create new one
   * Ultra-fast object reuse for high-frequency operations
   */
  acquire(start: number | Date, end: number | Date, bounds: Bounds = Bounds.IncludeStartExcludeEnd): Period {
    if (this.pool.length > 0) {
      const period = this.pool.pop()!;
      this.hits++;
      
      // Reset the period with new values (internal method)
      (period as any)._reset(start, end, bounds);
      return period;
    }
    
    this.misses++;
    return new Period(start, end, bounds);
  }

  /**
   * Return a Period instance to the pool for reuse
   * Call this for temporary Period objects to enable pooling
   */
  release(period: Period): void {
    if (this.pool.length < this.maxSize) {
      // Clear any cached values before pooling
      (period as any)._clearCache();
      this.pool.push(period);
    }
  }

  /**
   * Get pool statistics for performance monitoring
   */
  getStats(): { hits: number; misses: number; poolSize: number; hitRate: number } {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      poolSize: this.pool.length,
      hitRate: total > 0 ? this.hits / total : 0
    };
  }

  /**
   * Clear the pool and reset statistics
   */
  clear(): void {
    this.pool.length = 0;
    this.hits = 0;
    this.misses = 0;
  }
}

/**
 * Convenience function for high-performance Period creation
 * Automatically uses object pooling for temporary calculations
 */
export function createPooledPeriod(start: number | Date, end: number | Date, bounds?: Bounds): Period {
  return PeriodPool.getInstance().acquire(start, end, bounds);
}

/**
 * Release a Period back to the pool
 * Use this for temporary Period objects to enable reuse
 */
export function releasePooledPeriod(period: Period): void {
  PeriodPool.getInstance().release(period);
}
