"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Period = exports.runPerformanceBenchmarks = exports.PerformanceBenchmarks = exports.PeriodConstructors = exports.Sequence = exports.DurationInterval = exports.BoundsUtils = exports.Bounds = exports.PeriodClass = void 0;
exports.createPeriod = createPeriod;
exports.getDuration = getDuration;
exports.periodsOverlap = periodsOverlap;
exports.formatPeriod = formatPeriod;
const Period_1 = require("./core/Period");
const PeriodConstructors_1 = require("./constructors/PeriodConstructors");
// Core exports
var Period_2 = require("./core/Period");
Object.defineProperty(exports, "PeriodClass", { enumerable: true, get: function () { return Period_2.Period; } });
var types_1 = require("./core/types");
Object.defineProperty(exports, "Bounds", { enumerable: true, get: function () { return types_1.Bounds; } });
Object.defineProperty(exports, "BoundsUtils", { enumerable: true, get: function () { return types_1.BoundsUtils; } });
var DurationInterval_1 = require("./duration/DurationInterval");
Object.defineProperty(exports, "DurationInterval", { enumerable: true, get: function () { return DurationInterval_1.DurationInterval; } });
var Sequence_1 = require("./sequence/Sequence");
Object.defineProperty(exports, "Sequence", { enumerable: true, get: function () { return Sequence_1.Sequence; } });
var PeriodConstructors_2 = require("./constructors/PeriodConstructors");
Object.defineProperty(exports, "PeriodConstructors", { enumerable: true, get: function () { return PeriodConstructors_2.PeriodConstructors; } });
// Performance utilities
var PerformanceBenchmarks_1 = require("./performance/PerformanceBenchmarks");
Object.defineProperty(exports, "PerformanceBenchmarks", { enumerable: true, get: function () { return PerformanceBenchmarks_1.PerformanceBenchmarks; } });
Object.defineProperty(exports, "runPerformanceBenchmarks", { enumerable: true, get: function () { return PerformanceBenchmarks_1.runPerformanceBenchmarks; } });
// Main Period class with static constructors
class Period extends Period_1.Period {
}
exports.Period = Period;
Period.fromMonth = PeriodConstructors_1.PeriodConstructors.fromMonth;
Period.fromYear = PeriodConstructors_1.PeriodConstructors.fromYear;
Period.fromDay = PeriodConstructors_1.PeriodConstructors.fromDay;
Period.fromWeek = PeriodConstructors_1.PeriodConstructors.fromWeek;
Period.fromQuarter = PeriodConstructors_1.PeriodConstructors.fromQuarter;
Period.after = PeriodConstructors_1.PeriodConstructors.after;
Period.before = PeriodConstructors_1.PeriodConstructors.before;
Period.around = PeriodConstructors_1.PeriodConstructors.around;
Period.fromISO8601 = PeriodConstructors_1.PeriodConstructors.fromISO8601;
// Utility functions
function createPeriod(start, end) {
    return new Period(start, end);
}
function getDuration(period) {
    return period.getDuration();
}
function periodsOverlap(period1, period2) {
    return period1.overlaps(period2);
}
function formatPeriod(period, format = 'short') {
    return period.format(format);
}
//# sourceMappingURL=index.js.map