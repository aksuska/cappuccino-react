/*
 * Module that contains NSString class emulation and related symbols. We maintain a has-a relationship with a native JS string.
 **/

const OBJJ = require('../Objective-J'), objj_propGuard = OBJJ.objj_propGuard, objj_throw_arg = OBJJ.objj_throw_arg, objj_throw = OBJJ.objj_throw;
const CPObjectSym = require('./CPObject'), CPObject = CPObjectSym.CPObject;
const CPArraySym = require("./CPArray"), CPArray = CPArraySym.CPArray;
const vsprintf = require("sprintf-js").vsprintf;
const iconv = require('iconv-lite');

//! @name String Encoding Constants
//! We use iconv-lite https://github.com/ashtuchkin/iconv-lite for conversion handling, so a number of these encodings are not supported.
const CPASCIIStringEncoding = 'ascii',
			CPNEXTSTEPStringEncoding = 'nextstep',
			CPJapaneseEUCStringEncoding = 'EUC-JP',
			CPUTF8StringEncoding = 'utf8',
			CPISOLatin1StringEncoding = 'ISO-8859-1',
			CPSymbolStringEncoding = 'Adobe Symbol',
			CPNonLossyASCIIStringEncoding = 'ascii',
			CPShiftJISStringEncoding = 'Shift_JIS',
			CPISOLatin2StringEncoding = 'ISO-8859-2',
			CPUnicodeStringEncoding = 'UTF-16',
			CPWindowsCP1251StringEncoding = 'CP1251',
			CPWindowsCP1252StringEncoding = 'CP1252',
			CPWindowsCP1253StringEncoding = 'CP1253',
			CPWindowsCP1254StringEncoding = 'CP1254',
			CPWindowsCP1250StringEncoding = 'CP1250',
			CPISO2022JPStringEncoding = 'ISO-2022-JP',
			CPMacOSRomanStringEncoding = 'macroman',
			CPUTF16StringEncoding = CPUnicodeStringEncoding,
			CPUTF16BigEndianStringEncoding = 'UTF16BigEndian',
			CPUTF16LittleEndianStringEncoding = 'UTF16LittleEndian',
			CPUTF32StringEncoding = 'UTF-32',
			CPUTF32BigEndianStringEncoding = 'UTF32BigEndian',
			CPUTF32LittleEndianStringEncoding = 'UTF32LittleEndian';
Object.assign(exports, {CPASCIIStringEncoding, CPNEXTSTEPStringEncoding, CPJapaneseEUCStringEncoding, CPUTF8StringEncoding, CPISOLatin1StringEncoding, CPSymbolStringEncoding, CPNonLossyASCIIStringEncoding, CPShiftJISStringEncoding, CPISOLatin2StringEncoding, CPUnicodeStringEncoding, CPWindowsCP1251StringEncoding, CPWindowsCP1252StringEncoding, CPWindowsCP1253StringEncoding, CPWindowsCP1254StringEncoding, CPWindowsCP1250StringEncoding, CPISO2022JPStringEncoding, CPMacOSRomanStringEncoding, CPUTF16StringEncoding, CPUTF16BigEndianStringEncoding, CPUTF16LittleEndianStringEncoding, CPUTF32StringEncoding, CPUTF32BigEndianStringEncoding, CPUTF32LittleEndianStringEncoding});

//! @name CPStringCompareOptions
const CPCaseInsensitiveSearch = 1,
			CPLiteralSearch = 2,
			CPBackwardsSearch = 4,
			CPAnchoredSearch = 8,
			CPNumericSearch = 64,
			CPDiacriticInsensitiveSearch = 128,
			CPWidthInsensitiveSearch = 256,
			CPForcedOrderingSearch = 512,
			CPRegularExpressionSearch = 1024;
Object.assign(exports, {CPCaseInsensitiveSearch, CPLiteralSearch, CPBackwardsSearch, CPAnchoredSearch, CPNumericSearch, CPDiacriticInsensitiveSearch, CPWidthInsensitiveSearch, CPForcedOrderingSearch, CPRegularExpressionSearch});

//! NSString Cocoa Foundation class emulation
class CPString extends CPObject {

	$jsString = null;
	$hashCode = null;

	// we use this a convenience constructor so we can do shorthand conversions
	constructor(jsString) {
		super();
		if (jsString !== null && jsString !== undefined)
		{
			this.$jsString = jsString;
			this.$generateHash();
		}
	}

	//! @name Creating and Initializing Strings
	//! @{
	//! @typed instancetype : void
	static string() {
		return this.alloc().init();
	}

	//! @typed instancetype : void
	init() {
		let self = super.init();
		if (self) {
			self.$jsString = '';
			self.$generateHash();
		}
		return self;
	}

	//! @typed instancetype : CPString
	initWithString_(aString) {
		if (aString === null) {
			objj_throw_arg("-[%@ initWithString:]: null argument", this.className);
			return null;
		}

		let self = super.init();
		if (self) {
			self.$jsString = aString.$jsString;
			self.$generateHash();
		}
		return self;
	}

	//! @typed instancetype : CPString, ...
	initWithFormat_(format, ...args) {
		return this.initWithFormat_locale_arguments_(format, null, args);
	}

	//! @typed instancetype : CPString, va_list
	initWithFormat_arguments_(format, args) {
		return this.initWithFormat_locale_arguments_(format, null, args);
	}

	// TODO: CPLocale support?
	//! @typed instancetype : CPString, CPLocale, ...
	initWithFormat_locale_(format, locale, ...args) {
		return this.initWithFormat_locale_arguments_(format, locale, args);
	}

	// TODO: CPLocale support?
	//! @typed instancetype : CPString, CPLocale, va_list
	initWithFormat_locale_arguments_(format, locale, args) {
		if (format === null) {
			objj_throw_arg("-[%@ initWithFormat:locale:arguments:]: null argument", this.className);
			return null;
		}

		// %@ will always be a string, so convert, but objects must change to description
		let formatString = format.jsString.replace(/%@/, '%s');
		let values = args.map(element => element !== null && element !== undefined && element['$ISA'] === 'CPObject' ? objj_propGuard(element, 'description', 'jsString') : element);
		return this.initWithString_(new CPString(vsprintf(formatString, values)));
	}

	//! @typed instancetype : CPString, ...
	static stringWithFormat_(format, ...args) {
		return this.alloc().initWithFormat_locale_arguments_(format, null, args);
	}

	// TODO: CPLocale support: method should call [CPLocale currentLocale]
	//! @typed instancetype : CPString, ...
	static localizedStringWithFormat_(format, ...args) {
		return this.alloc().initWithFormat_locale_arguments_(format, null, args);
	}

	//! @typed instancetype : CPString
	static stringWithString_(aString) {
		return this.alloc().initWithString_(aString);
	}

	//! @typed id : null
	copyWithZone_(zone) {
		// cocoa just returns the same object, so we'll do the same
		return this;
	}

	//! @}

	//! @name Getting a String’s Length
	//! @{

	//! @property(readonly) CPUInteger length
	get length() {
		return this.$jsString.length;
	}

	//! @typed CPUInteger : CPStringEncoding
	lengthOfBytesUsingEncoding_(enc) {
		if (!iconv.encodingExists(enc))
			return 0;

		const buf = iconv.encode(this.jsString, enc);
		return buf.length;
	}

	//! @typed CPUInteger : CPStringEncoding
	maximumLengthOfBytesUsingEncoding_(enc) {
		return this.lengthOfBytesUsingEncoding_(enc);
	}

	//! @}

	//! @name Identifying and Comparing Strings
	//! @{

	//! @property(readonly, copy) string jsString
	//! Returns the native JS string that backs the NSArray
	get jsString() {return this.$jsString;}

	//! @property(readonly) CPUInteger hash
	get hash() {return this.$hashCode;}

	$generateHash() {
		let source = this.$jsString, length = source.length, result = length;
		if (result <= 96) {
			// First count in fours
			for (let i = 0; i < length; i += 4) {
				result = result * 67503105 + source.charCodeAt(i) * 16974593 + source.charCodeAt(i + 1) * 66049 + source.charCodeAt(i + 2) * 257 + source.charCodeAt(i + 3);
			}
			// Then for the last <4 chars, count in ones...
			const left = length % 4;
			for (let i = length - left; i < length; i++) {
				result = result * 257 + source.charCodeAt(i);
			}
		}
		else {
			// larger strings we only use the first, middle, and last 32 characters
			for (let i = 0; i < 32; i += 4) {
				result = result * 67503105 + source.charCodeAt(i) * 16974593 + source.charCodeAt(i + 1) * 66049 + source.charCodeAt(i + 2) * 257 + source.charCodeAt(i + 3);
			}
			for (let i = (length >> 1) - 16; i < (length >> 1) + 16; i += 4) {
				result = result * 67503105 + source.charCodeAt(i) * 16974593 + source.charCodeAt(i + 1) * 66049 + source.charCodeAt(i + 2) * 257 + source.charCodeAt(i + 3);
			}
			for (let i = length - 32; i < length; i += 4) {
				result = result * 67503105 + source.charCodeAt(i) * 16974593 + source.charCodeAt(i + 1) * 66049 + source.charCodeAt(i + 2) * 257 + source.charCodeAt(i + 3);
			}
		}
		this.$hashCode = result + (result << (length & 31));
	}

	//! @}

	//! @name Working with Encodings
	//! @{

	//! @property(readonly, copy) CPString description
	get description() {return this;}

	//! @}
}
exports.CPString = CPString;

const CPRangeSym = require('./CPRange'), CPMakeRange = CPRangeSym.CPMakeRange, CPMaxRange = CPRangeSym.CPMaxRange, CPNotFound = CPRangeSym.CPNotFound, CPStringFromRange = CPRangeSym.CPStringFromRange;
const CPExceptionSym =  require('./CPException'), CPRangeException = CPExceptionSym.CPRangeException;
