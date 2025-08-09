"use strict";
/**
 * Core types and interfaces for the Period library
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BoundsUtils = exports.Bounds = void 0;
/**
 * Boundary types for period intervals
 * Using numeric enum for performance (faster than string unions)
 */
var Bounds;
(function (Bounds) {
    /** [start, end) - Include start, exclude end (default) */
    Bounds[Bounds["IncludeStartExcludeEnd"] = 0] = "IncludeStartExcludeEnd";
    /** (start, end] - Exclude start, include end */
    Bounds[Bounds["ExcludeStartIncludeEnd"] = 1] = "ExcludeStartIncludeEnd";
    /** [start, end] - Include both start and end */
    Bounds[Bounds["IncludeAll"] = 2] = "IncludeAll";
    /** (start, end) - Exclude both start and end */
    Bounds[Bounds["ExcludeAll"] = 3] = "ExcludeAll";
})(Bounds || (exports.Bounds = Bounds = {}));
/**
 * Internal utility functions for performance optimizations
 */
class BoundsUtils {
    /**
     * Fast inline check if bounds includes start
     * Optimized for hot paths - avoid function calls
     */
    static includesStart(bounds) {
        return bounds === Bounds.IncludeStartExcludeEnd || bounds === Bounds.IncludeAll;
    }
    /**
     * Fast inline check if bounds includes end
     * Optimized for hot paths - avoid function calls
     */
    static includesEnd(bounds) {
        return bounds === Bounds.ExcludeStartIncludeEnd || bounds === Bounds.IncludeAll;
    }
    /**
     * Get boundary notation characters for formatting
     */
    static getBrackets(bounds) {
        const startBracket = BoundsUtils.includesStart(bounds) ? '[' : '(';
        const endBracket = BoundsUtils.includesEnd(bounds) ? ']' : ')';
        return [startBracket, endBracket];
    }
}
exports.BoundsUtils = BoundsUtils;
//# sourceMappingURL=types.js.map