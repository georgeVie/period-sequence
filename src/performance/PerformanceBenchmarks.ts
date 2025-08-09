/**
 * Advanced performance benchmarking suite
 * Comprehensive testing of all optimization techniques
 */

import { Period, Sequence, Bounds } from '../index';
import { PeriodPool } from '../core/PeriodPool';
import { FastBounds } from '../core/FastBounds';

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

export class PerformanceBenchmarks {
  private results: BenchmarkResult[] = [];

  /**
   * Run comprehensive performance benchmarks
   */
  async runAll(): Promise<BenchmarkSuite[]> {
    console.log('🚀 Running Advanced Performance Benchmarks...\n');
    
    const suites: BenchmarkSuite[] = [
      await this.benchmarkPeriodOperations(),
      await this.benchmarkSequenceOperations(),
      await this.benchmarkObjectPooling(),
      await this.benchmarkBitpackedBounds(),
      await this.benchmarkMemoryEfficiency()
    ];

    this.printSummary(suites);
    return suites;
  }

  /**
   * Benchmark Period operations
   */
  private async benchmarkPeriodOperations(): Promise<BenchmarkSuite> {
    const results: BenchmarkResult[] = [];
    const operations = 1000000;

    // Period creation benchmark
    const start1 = performance.now();
    for (let i = 0; i < operations; i++) {
      new Period(new Date(2024, 0, 1), new Date(2024, 0, 2));
    }
    const end1 = performance.now();
    results.push({
      name: 'Period Creation',
      operations,
      timeMs: end1 - start1,
      opsPerSecond: operations / ((end1 - start1) / 1000)
    });

    // Overlap operations benchmark
    const period1 = new Period(new Date(2024, 0, 1), new Date(2024, 0, 15));
    const period2 = new Period(new Date(2024, 0, 10), new Date(2024, 0, 25));
    
    const start2 = performance.now();
    for (let i = 0; i < operations; i++) {
      period1.overlaps(period2);
    }
    const end2 = performance.now();
    results.push({
      name: 'Overlap Detection',
      operations,
      timeMs: end2 - start2,
      opsPerSecond: operations / ((end2 - start2) / 1000)
    });

    return {
      name: 'Period Operations',
      results,
      totalTime: results.reduce((sum, r) => sum + r.timeMs, 0),
      avgOpsPerSecond: results.reduce((sum, r) => sum + r.opsPerSecond, 0) / results.length
    };
  }

  /**
   * Benchmark Sequence operations with optimizations
   */
  private async benchmarkSequenceOperations(): Promise<BenchmarkSuite> {
    const results: BenchmarkResult[] = [];
    const sequenceSize = 10000;

    // Create test sequences
    const seq1 = this.createLargeSequence(sequenceSize);
    const seq2 = this.createLargeSequence(sequenceSize, new Date(2024, 5, 1));

    // Union operation benchmark
    const start1 = performance.now();
    const union = seq1.union(seq2);
    const end1 = performance.now();
    results.push({
      name: 'Sequence Union (10K periods)',
      operations: sequenceSize * 2,
      timeMs: end1 - start1,
      opsPerSecond: (sequenceSize * 2) / ((end1 - start1) / 1000)
    });

    // Intersect operation benchmark
    const start2 = performance.now();
    const intersect = seq1.intersect(seq2);
    const end2 = performance.now();
    results.push({
      name: 'Sequence Intersect (10K periods)',
      operations: sequenceSize * 2,
      timeMs: end2 - start2,
      opsPerSecond: (sequenceSize * 2) / ((end2 - start2) / 1000)
    });

    // Total duration calculation (cached)
    const start3 = performance.now();
    for (let i = 0; i < 1000; i++) {
      seq1.totalDuration(); // Should hit cache after first call
    }
    const end3 = performance.now();
    results.push({
      name: 'Cached Total Duration (1K calls)',
      operations: 1000,
      timeMs: end3 - start3,
      opsPerSecond: 1000 / ((end3 - start3) / 1000)
    });

    return {
      name: 'Sequence Operations',
      results,
      totalTime: results.reduce((sum, r) => sum + r.timeMs, 0),
      avgOpsPerSecond: results.reduce((sum, r) => sum + r.opsPerSecond, 0) / results.length
    };
  }

  /**
   * Benchmark object pooling performance
   */
  private async benchmarkObjectPooling(): Promise<BenchmarkSuite> {
    const results: BenchmarkResult[] = [];
    const operations = 100000;
    const pool = PeriodPool.getInstance();
    pool.clear();

    // Without pooling (baseline)
    const start1 = performance.now();
    const periods1: Period[] = [];
    for (let i = 0; i < operations; i++) {
      periods1.push(new Period(new Date(2024, 0, 1), new Date(2024, 0, 2)));
    }
    const end1 = performance.now();
    results.push({
      name: 'Without Object Pooling',
      operations,
      timeMs: end1 - start1,
      opsPerSecond: operations / ((end1 - start1) / 1000)
    });

    // With pooling
    const start2 = performance.now();
    const periods2: Period[] = [];
    for (let i = 0; i < operations; i++) {
      const period = pool.acquire(new Date(2024, 0, 1), new Date(2024, 0, 2));
      periods2.push(period);
      if (i % 2 === 0) pool.release(period); // Simulate some reuse
    }
    const end2 = performance.now();
    
    const stats = pool.getStats();
    results.push({
      name: `With Object Pooling (${(stats.hitRate * 100).toFixed(1)}% hit rate)`,
      operations,
      timeMs: end2 - start2,
      opsPerSecond: operations / ((end2 - start2) / 1000)
    });

    return {
      name: 'Object Pooling',
      results,
      totalTime: results.reduce((sum, r) => sum + r.timeMs, 0),
      avgOpsPerSecond: results.reduce((sum, r) => sum + r.opsPerSecond, 0) / results.length
    };
  }

  /**
   * Benchmark bitpacked bounds operations
   */
  private async benchmarkBitpackedBounds(): Promise<BenchmarkSuite> {
    const results: BenchmarkResult[] = [];
    const operations = 1000000;
    const bounds = [Bounds.IncludeStartExcludeEnd, Bounds.IncludeAll, Bounds.ExcludeAll];

    // Standard bounds checking
    const start1 = performance.now();
    for (let i = 0; i < operations; i++) {
      const bound = bounds[i % bounds.length];
      const isStart = bound === Bounds.IncludeStartExcludeEnd || bound === Bounds.IncludeAll;
      const isEnd = bound === Bounds.ExcludeStartIncludeEnd || bound === Bounds.IncludeAll;
    }
    const end1 = performance.now();
    results.push({
      name: 'Standard Bounds Checking',
      operations,
      timeMs: end1 - start1,
      opsPerSecond: operations / ((end1 - start1) / 1000)
    });

    // Bitpacked bounds checking
    const start2 = performance.now();
    for (let i = 0; i < operations; i++) {
      const bound = bounds[i % bounds.length];
      FastBounds.isStartInclusive(bound);
      FastBounds.isEndInclusive(bound);
    }
    const end2 = performance.now();
    results.push({
      name: 'Bitpacked Bounds Checking',
      operations,
      timeMs: end2 - start2,
      opsPerSecond: operations / ((end2 - start2) / 1000)
    });

    return {
      name: 'Bounds Operations',
      results,
      totalTime: results.reduce((sum, r) => sum + r.timeMs, 0),
      avgOpsPerSecond: results.reduce((sum, r) => sum + r.opsPerSecond, 0) / results.length
    };
  }

  /**
   * Benchmark memory efficiency
   */
  private async benchmarkMemoryEfficiency(): Promise<BenchmarkSuite> {
    const results: BenchmarkResult[] = [];
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const memBefore = process.memoryUsage();
    
    // Create large sequences and perform operations
    const startTime = performance.now();
    const sequences: Sequence[] = [];
    
    for (let i = 0; i < 100; i++) {
      const seq = this.createLargeSequence(1000);
      sequences.push(seq);
      
      // Perform operations to test memory efficiency
      seq.totalDuration();
      seq.boundaries();
      if (i > 0) {
        sequences[i - 1].union(seq);
      }
    }
    
    const endTime = performance.now();
    const memAfter = process.memoryUsage();
    
    results.push({
      name: 'Memory Efficiency Test (100K periods)',
      operations: 100000,
      timeMs: endTime - startTime,
      opsPerSecond: 100000 / ((endTime - startTime) / 1000),
      memoryUsed: (memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024 // MB
    });

    return {
      name: 'Memory Efficiency',
      results,
      totalTime: results.reduce((sum, r) => sum + r.timeMs, 0),
      avgOpsPerSecond: results.reduce((sum, r) => sum + r.opsPerSecond, 0) / results.length
    };
  }

  /**
   * Create a large sequence for testing
   */
  private createLargeSequence(count: number, startDate: Date = new Date(2024, 0, 1)): Sequence {
    const periods: Period[] = [];
    for (let i = 0; i < count; i++) {
      const start = new Date(startDate.getTime() + i * 86400000);
      const end = new Date(start.getTime() + 86400000); // 1 day duration instead of 12 hours
      periods.push(new Period(start, end));
    }
    return new Sequence(...periods);
  }

  /**
   * Print benchmark summary
   */
  private printSummary(suites: BenchmarkSuite[]): void {
    console.log('\n📊 Performance Benchmark Results\n');
    console.log('═'.repeat(80));
    
    for (const suite of suites) {
      console.log(`\n🎯 ${suite.name}`);
      console.log('─'.repeat(60));
      
      for (const result of suite.results) {
        const opsPerSec = (result.opsPerSecond / 1000000).toFixed(2);
        const timeMs = result.timeMs.toFixed(2);
        const memInfo = result.memoryUsed ? ` (${result.memoryUsed.toFixed(2)}MB)` : '';
        
        console.log(`  ${result.name.padEnd(35)} ${opsPerSec.padStart(8)}M ops/sec in ${timeMs.padStart(8)}ms${memInfo}`);
      }
      
      console.log(`  ${'AVERAGE'.padEnd(35)} ${(suite.avgOpsPerSecond / 1000000).toFixed(2).padStart(8)}M ops/sec`);
    }
    
    console.log('\n═'.repeat(80));
    console.log('🚀 All benchmarks completed successfully!\n');
  }
}

/**
 * Run performance benchmarks
 */
export async function runPerformanceBenchmarks(): Promise<BenchmarkSuite[]> {
  const benchmarks = new PerformanceBenchmarks();
  return await benchmarks.runAll();
}
