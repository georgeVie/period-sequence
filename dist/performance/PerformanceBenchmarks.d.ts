/**
 * Advanced performance benchmarking suite
 * Comprehensive testing of all optimization techniques
 */
export interface BenchmarkResult {
    name: string;
    operations: number;
    timeMs: number;
    opsPerSecond: number;
    memoryUsed?: number;
}
export interface BenchmarkSuite {
    name: string;
    results: BenchmarkResult[];
    totalTime: number;
    avgOpsPerSecond: number;
}
export declare class PerformanceBenchmarks {
    private results;
    /**
     * Run comprehensive performance benchmarks
     */
    runAll(): Promise<BenchmarkSuite[]>;
    /**
     * Benchmark Period operations
     */
    private benchmarkPeriodOperations;
    /**
     * Benchmark Sequence operations with optimizations
     */
    private benchmarkSequenceOperations;
    /**
     * Benchmark object pooling performance
     */
    private benchmarkObjectPooling;
    /**
     * Benchmark bitpacked bounds operations
     */
    private benchmarkBitpackedBounds;
    /**
     * Benchmark memory efficiency
     */
    private benchmarkMemoryEfficiency;
    /**
     * Create a large sequence for testing
     */
    private createLargeSequence;
    /**
     * Print benchmark summary
     */
    private printSummary;
}
/**
 * Run performance benchmarks
 */
export declare function runPerformanceBenchmarks(): Promise<BenchmarkSuite[]>;
//# sourceMappingURL=PerformanceBenchmarks.d.ts.map