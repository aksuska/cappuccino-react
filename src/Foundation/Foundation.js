/**
 * Single-point import for Foundation framework
 **/

// runtime imports
import objj_msgSend, {objj_propGuard} from '../Objective-J';
import Protocol from './Protocol';
// object imports
import CRObject, {objj_CRObject} from './CRObject';
import CRString, {
	CRASCIIStringEncoding,
	CRNEXTSTEPStringEncoding,
	CRJapaneseEUCStringEncoding,
	CRUTF8StringEncoding,
	CRISOLatin1StringEncoding,
	CRSymbolStringEncoding,
	CRNonLossyASCIIStringEncoding,
	CRShiftJISStringEncoding,
	CRISOLatin2StringEncoding,
	CRUnicodeStringEncoding,
	CRWindowsCP1251StringEncoding,
	CRWindowsCP1252StringEncoding,
	CRWindowsCP1253StringEncoding,
	CRWindowsCP1254StringEncoding,
	CRWindowsCP1250StringEncoding,
	CRISO2022JPStringEncoding,
	CRMacOSRomanStringEncoding,
	CRUTF16StringEncoding,
	CRUTF16BigEndianStringEncoding,
	CRUTF16LittleEndianStringEncoding,
	CRUTF32StringEncoding,
	CRUTF32BigEndianStringEncoding,
	CRUTF32LittleEndianStringEncoding,
	CRCaseInsensitiveSearch,
	CRLiteralSearch,
	CRBackwardsSearch,
	CRAnchoredSearch,
	CRNumericSearch,
	CRDiacriticInsensitiveSearch,
	CRWidthInsensitiveSearch,
	CRForcedOrderingSearch,
	CRRegularExpressionSearch
} from './CRString';
import CRMethodSignature from './CRMethodSignature';
import CRInvocation from './CRInvocation';
import CRException, {CRInvalidArgumentException} from './CRException';
import CRDictionary from "./CRDictionary";
import CRArray from './CRArray';
// foundation types import
import {CRNotFound, CREqualRanges, CRIntersectionRange, CRLocationInRange, CRMakeRange, CRMaxRange, CRRangeFromString, CRStringFromRange, CRUnionRange} from './CRRange';
/*
 * Objective-J Runtime Exports
*/

export {objj_msgSend, objj_propGuard};
export {Protocol};

/*
 * Object Exports
*/

export {objj_CRObject, CRObject, CRString, CRException, CRInvalidArgumentException, CRMethodSignature, CRInvocation, CRDictionary, CRArray};
export {CRASCIIStringEncoding, CRNEXTSTEPStringEncoding, CRJapaneseEUCStringEncoding, CRUTF8StringEncoding, CRISOLatin1StringEncoding, CRSymbolStringEncoding, CRNonLossyASCIIStringEncoding, CRShiftJISStringEncoding, CRISOLatin2StringEncoding, CRUnicodeStringEncoding, CRWindowsCP1251StringEncoding, CRWindowsCP1252StringEncoding, CRWindowsCP1253StringEncoding, CRWindowsCP1254StringEncoding, CRWindowsCP1250StringEncoding, CRISO2022JPStringEncoding, CRMacOSRomanStringEncoding, CRUTF16StringEncoding, CRUTF16BigEndianStringEncoding, CRUTF16LittleEndianStringEncoding, CRUTF32StringEncoding, CRUTF32BigEndianStringEncoding, CRUTF32LittleEndianStringEncoding};
export {CRCaseInsensitiveSearch, CRLiteralSearch, CRBackwardsSearch, CRAnchoredSearch, CRNumericSearch, CRDiacriticInsensitiveSearch, CRWidthInsensitiveSearch, CRForcedOrderingSearch, CRRegularExpressionSearch};

/*
 * Selector Function Exports
 */

export const CRSelectorFromString = (selString) => selString.jsString();
export const CRStringFromSelector = (selector) => new CRString(selector);

/*
 * CRRange Declaration and Function Exports
 */

export {CRNotFound, CREqualRanges, CRIntersectionRange, CRLocationInRange, CRMakeRange, CRMaxRange, CRRangeFromString, CRStringFromRange, CRUnionRange};
