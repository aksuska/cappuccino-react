/*
 * Module that contains NSRange struct emulation and related symbols.
 */

const CRStringSym = require("./CRString"), CRString = CRStringSym.CRString;

//! @typed CRInteger
const CRNotFound = -1;
exports.CRNotFound = CRNotFound;

//! @typed BOOL : CRRange, CRRange
function CREqualRanges(range1, range2) {
	return range1.location === range2.location && range1.length === range2.length;
}
exports.CREqualRanges = CREqualRanges;

//! @typed CRRange : CRRange, CRRange
function CRIntersectionRange(range1, range2) {
	if (range1.location < range2.location && CRMaxRange(range1) > range2.location) {
		return CRMakeRange(range2.location, range1.length - range2.location);
	}
	else if (range1.location > range2.location && CRMaxRange(range2) > range1.location) {
		return CRMakeRange(range1.location, range2.length - range1.location);
	}
	else if (range1.location === range2.location) {
		return CRMakeRange(range1.location, (range2.length >= range1.length ? range1.length : range2.length));
	}
	return CRMakeRange(undefined, 0);
}
exports.CRIntersectionRange = CRIntersectionRange;

//! @typed BOOL : CRUInteger, CRRange
function CRLocationInRange(loc, range) {
	return loc >= range.location && loc < CRMaxRange(range);
}
exports.CRLocationInRange = CRLocationInRange;

//! @typed CRRange : CRUInteger, CRUInteger
function CRMakeRange(loc, len) {
	return {location: loc, length: len};
}

//! @typed CRUInteger : CRRange
export function CRMaxRange(range) {
	return range.location + range.length;
}
exports.CRMakeRange = CRMakeRange;

//! @typed CRRange : CRString
export function CRRangeFromString(aString) {
	const numbers = aString.$jsString.match(/(\d+)/g);
	if (numbers === null)
		return CRMakeRange(0, 0);
	return CRMakeRange(parseInt(numbers[0], 10), (numbers.length > 1 ? parseInt(numbers[1], 10) : 0));
}
exports.CRRangeFromString = CRRangeFromString;

//! @typed CRString : CRRange
function CRStringFromRange(range) {
	return new CRString(`{${(new Uint32Array([range.location]))[0]}, ${(new Uint32Array([range.length]))[0]}}`);
}
exports.CRStringFromRange = CRStringFromRange;

//! @typed CRRange : CRRange, CRRange
function CRUnionRange(range1, range2) {
	const loc = (range1.location < range2.location ? range1.location : range2.location);
	const len = (CRMaxRange(range2) >= CRMaxRange(range1) ? CRMaxRange(range2) - range1.length : CRMaxRange(range1) - range2.length);
	return CRMakeRange(loc, len);
}
exports.CRUnionRange = CRUnionRange;
