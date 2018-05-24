/*
 * Module that contains NSRange struct emulation and related symbols.
 */

const CPStringSym = require("./CPString"), CPString = CPStringSym;

//! @typed CPInteger
const CPNotFound = -1;
exports.CPNotFound = CPNotFound;

//! @typed BOOL : CPRange, CPRange
function CPEqualRanges(range1, range2) {
	return range1.location === range2.location && range1.length === range2.length;
}
exports.CPEqualRanges = CPEqualRanges;

//! @typed CPRange : CPRange, CPRange
function CPIntersectionRange(range1, range2) {
	if (range1.location < range2.location && CPMaxRange(range1) > range2.location) {
		return CPMakeRange(range2.location, range1.length - range2.location);
	}
	else if (range1.location > range2.location && CPMaxRange(range2) > range1.location) {
		return CPMakeRange(range1.location, range2.length - range1.location);
	}
	else if (range1.location === range2.location) {
		return CPMakeRange(range1.location, (range2.length >= range1.length ? range1.length : range2.length));
	}
	return CPMakeRange(undefined, 0);
}
exports.CPIntersectionRange = CPIntersectionRange;

//! @typed BOOL : CPUInteger, CPRange
function CPLocationInRange(loc, range) {
	return loc >= range.location && loc < CPMaxRange(range);
}
exports.CPLocationInRange = CPLocationInRange;

//! @typed CPRange : CPUInteger, CPUInteger
function CPMakeRange(loc, len) {
	return {location: loc, length: len};
}

//! @typed CPUInteger : CPRange
export function CPMaxRange(range) {
	return range.location + range.length;
}
exports.CPMakeRange = CPMakeRange;

//! @typed CPRange : CPString
export function CPRangeFromString(aString) {
	const numbers = aString.$jsString.match(/(\d+)/g);
	if (numbers === null)
		return CPMakeRange(0, 0);
	return CPMakeRange(parseInt(numbers[0], 10), (numbers.length > 1 ? parseInt(numbers[1], 10) : 0));
}
exports.CPRangeFromString = CPRangeFromString;

//! @typed CPString : CPRange
function CPStringFromRange(range) {
	return new CPString(`{${(new Uint32Array([range.location]))[0]}, ${(new Uint32Array([range.length]))[0]}}`);
}
exports.CPStringFromRange = CPStringFromRange;

//! @typed CPRange : CPRange, CPRange
function CPUnionRange(range1, range2) {
	const loc = (range1.location < range2.location ? range1.location : range2.location);
	const len = (CPMaxRange(range2) >= CPMaxRange(range1) ? CPMaxRange(range2) - range1.length : CPMaxRange(range1) - range2.length);
	return CPMakeRange(loc, len);
}
exports.CPUnionRange = CPUnionRange;
