/**
 * Single-point import for Foundation framework
 **/

// runtime imports
import objj_msgSend, {objj_propGuard} from '../Objective-J';
import Protocol from './Protocol';
// object imports
import CPObject, {objj_CPObject} from './CPObject';
import CPString, {CPASCIIStringEncoding, CPNEXTSTEPStringEncoding, CPJapaneseEUCStringEncoding, CPUTF8StringEncoding, CPISOLatin1StringEncoding, CPSymbolStringEncoding, CPNonLossyASCIIStringEncoding, CPShiftJISStringEncoding, CPISOLatin2StringEncoding, CPUnicodeStringEncoding, CPWindowsCP1251StringEncoding, CPWindowsCP1252StringEncoding, CPWindowsCP1253StringEncoding, CPWindowsCP1254StringEncoding, CPWindowsCP1250StringEncoding, CPISO2022JPStringEncoding, CPMacOSRomanStringEncoding, CPUTF16StringEncoding, CPUTF16BigEndianStringEncoding, CPUTF16LittleEndianStringEncoding, CPUTF32StringEncoding, CPUTF32BigEndianStringEncoding, CPUTF32LittleEndianStringEncoding} from './CPString';
import CPMethodSignature from './CPMethodSignature';
import CPInvocation from './CPInvocation';
import CPException, {CPInvalidArgumentException} from './CPException';
import CPDictionary from "./CPDictionary";
import CPArray from './CPArray';

/*
 * Objective-J Runtime Exports
*/

export {objj_msgSend, objj_propGuard};
export {Protocol};

/*
 * Object Exports
*/

export {objj_CPObject, CPObject, CPString, CPException, CPInvalidArgumentException, CPMethodSignature, CPInvocation, CPDictionary, CPArray};
export {CPASCIIStringEncoding, CPNEXTSTEPStringEncoding, CPJapaneseEUCStringEncoding, CPUTF8StringEncoding, CPISOLatin1StringEncoding, CPSymbolStringEncoding, CPNonLossyASCIIStringEncoding, CPShiftJISStringEncoding, CPISOLatin2StringEncoding, CPUnicodeStringEncoding, CPWindowsCP1251StringEncoding, CPWindowsCP1252StringEncoding, CPWindowsCP1253StringEncoding, CPWindowsCP1254StringEncoding, CPWindowsCP1250StringEncoding, CPISO2022JPStringEncoding, CPMacOSRomanStringEncoding, CPUTF16StringEncoding, CPUTF16BigEndianStringEncoding, CPUTF16LittleEndianStringEncoding, CPUTF32StringEncoding, CPUTF32BigEndianStringEncoding, CPUTF32LittleEndianStringEncoding};

/*
 * Selector Function Exports
 */

export const CPSelectorFromString = (selString) => selString.jsString();
export const CPStringFromSelector = (selector) => new CPString(selector);

