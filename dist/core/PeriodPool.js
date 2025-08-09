"use strict";
/**
 * High-performance object pool for Period instances
 * Reduces GC pressure in high-frequency operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeriodPool = void 0;
exports.createPooledPeriod = createPooledPeriod;
exports.releasePooledPeriod = releasePooledPeriod;
const Period_1 = require("./Period");
const types_1 = require("./types");
class PeriodPool {
    constructor() {
        this.pool = [];
        this.maxSize = 1000;
        this.hits = 0;
        this.misses = 0;
    }
    static getInstance() {
        if (!PeriodPool.instance) {
            PeriodPool.instance = new PeriodPool();
        }
        return PeriodPool.instance;
    }
    /**
     * Get a Period instance from the pool or create new one
     * Ultra-fast object reuse for high-frequency operations
     */
    acquire(start, end, bounds = types_1.Bounds.IncludeStartExcludeEnd) {
        if (this.pool.length > 0) {
            const period = this.pool.pop();
            this.hits++;
            // Reset the period with new values (internal method)
            period._reset(start, end, bounds);
            return period;
        }
        this.misses++;
        return new Period_1.Period(start, end, bounds);
    }
    /**
     * Return a Period instance to the pool for reuse
     * Call this for temporary Period objects to enable pooling
     */
    release(period) {
        if (this.pool.length < this.maxSize) {
            // Clear any cached values before pooling
            period._clearCache();
            this.pool.push(period);
        }
    }
    /**
     * Get pool statistics for performance monitoring
     */
    getStats() {
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
    clear() {
        this.pool.length = 0;
        this.hits = 0;
        this.misses = 0;
    }
}
exports.PeriodPool = PeriodPool;
/**
 * Convenience function for high-performance Period creation
 * Automatically uses object pooling for temporary calculations
 */
function createPooledPeriod(start, end, bounds) {
    return PeriodPool.getInstance().acquire(start, end, bounds);
}
/**
 * Release a Period back to the pool
 * Use this for temporary Period objects to enable reuse
 */
function releasePooledPeriod(period) {
    PeriodPool.getInstance().release(period);
}
//# sourceMappingURL=PeriodPool.js.map