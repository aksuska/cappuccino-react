/*
 * Module that contains NSRange struct emulation and related symbols.
 */

import CPString from "./CPString";

//! @typed CPInteger
export const CPNotFound = Number.POSITIVE_INFINITY;

//! @typed BOOL : CPRange, CPRange
export function CPEqualRanges(range1, range2) {
	return range1.location === range2.location && range1.length === range2.length;
}

//! @typed CPRange : CPRange, CPRange
export function CPIntersectionRange(range1, range2) {
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

//! @typed BOOL : CPUInteger, CPRange
export function CPLocationInRange(loc, range) {
	return loc >= range.location && loc < CPMaxRange(range);
}

//! @typed CPRange : CPUInteger, CPUInteger
export function CPMakeRange(loc, len) {
	return {location: loc, length: len};
}

//! @typed CPUInteger : CPRange
export function CPMaxRange(range) {
	return range.location + range.length;
}

//! @typed CPRange : CPString
export function CPRangeFromString(aString) {
	const numbers = aString.$jsString.match(/(\d+)/g);
	if (numbers === null)
		return CPMakeRange(0, 0);
	return CPMakeRange(parseInt(numbers[0], 10), (numbers.length > 1 ? parseInt(numbers[1], 10) : 0));
}

//! @typed CPString : CPRange
export function CPStringFromRange(range) {
	return new CPString(`{${(new Uint32Array([range.location]))[0]}, ${(new Uint32Array([range.length]))[0]}}`);
}

//! @typed CPRange : CPRange, CPRange
export function CPUnionRange(range1, range2) {
	const loc = (range1.location < range2.location ? range1.location : range2.location);
	const len = (CPMaxRange(range2) >= CPMaxRange(range1) ? CPMaxRange(range2) - range1.length : CPMaxRange(range1) - range2.length);
	return CPMakeRange(loc, len);
}
