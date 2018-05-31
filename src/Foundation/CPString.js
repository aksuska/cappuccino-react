/*
 * Module that contains NSString class emulation and related symbols. We maintain a has-a relationship with a native JS string.
 **/

const OBJJ = require('../Objective-J'), objj_propGuard = OBJJ.objj_propGuard, objj_initialize = OBJJ.objj_initialize;
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
			objj_initialize(CPException).raise_format_(CPInvalidArgumentException, new CPString("-[%@ initWithString:]: nil argument"), this.className);
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
			objj_initialize(CPException).raise_format_(CPInvalidArgumentException, new CPString("-[%@ initWithFormat:locale:arguments:]: nil argument"), this.className);
			return null;
		}

		// %@ will always be a string, so convert, but objects must change to description
		let formatString = format.jsString.replace(/%@/g, '%s');
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
		let source = this.$jsString, length = source.length, result = 2166136261;
		for (let i = 0; i < length; i++) {
			result = result ^ source.charCodeAt(i);
			result = result * 16777619;
		}
		// check--throw exception  if hash is NaN
		if (Number.isNaN(result))
			objj_initialize(CPException).raise_format_(CPInternalInconsistencyException, new CPString("-[%@ $generateHash]: hash result of '%@' is NaN"), this.className, this);
		this.$hashCode = (new Uint32Array([result]))[0];
	}

	//! @}

	//! @name Dividing Strings
	//! @{

	//! @typed CPArray<CPString> : CPString
	componentsSeparatedByString_(separator) {
		if (separator === null)
			objj_initialize(CPException).raise_format_(CPInvalidArgumentException, new CPString("-[%@ componentsSeparatedByString:]: nil argument"), this.className);

		// to imitate Cocoa behavior, we must return whole string if separator empty
		if (separator.length === 0)
			return new CPArray([this]);

		// otherwise use split with literal string
		const parts = this.$jsString.split(separator.$jsString);
		for (let i=0; i<parts.length; i++) {
			parts[i] = new CPString(parts[i]);
		}
		return new CPArray(parts);
	}

	//! @typed CPString : CPUInteger
	substringFromIndex_(from) {
		if (from >= this.length || from < 0)
			objj_initialize(CPException).raise_format_(CPRangeException, new CPString("-[%@ substringFromIndex:]: Index %d out of bounds; string length %d"), this.className, (new Uint32Array([from]))[0], this.length);

		return new CPString(this.$jsString.substr(from));
	}

	//! @typed CPString : CPRange
	substringWithRange_(range) {
		if (range.location >= this.length || CPMaxRange(range) > this.length || range.location < 0 || range.length < 0)
			objj_initialize(CPException).raise_format_(CPRangeException, new CPString("-[%@ substringWithRange:]: Range %@ out of bounds; string length %d"), this.className, CPStringFromRange(range), this.length);

		return new CPString(this.$jsString.substr(range.location, range.length));
	}

	//! @typed CPString : CPUInteger
	substringToIndex_(to) {
		if (to > this.length || to < 0)
			objj_initialize(CPException).raise_format_(CPRangeException, new CPString("-[%@ substringToIndex:]: Index %d out of bounds; string length %d"), this.className, (new Uint32Array([to]))[0], this.length);

		return new CPString(this.$jsString.substr(0, to));
	}

	//! @}

	//! @name Finding Characters and Substrings
	//! @{

	// TODO: CPLocale support?
	//! @typed CPRange : CPString, CPStringCompareOptions, CPRange, CPLocale
	rangeOfString_options_range_locale_(searchString, mask, rangeOfReceiverToSearch, locale) {
		if (searchString === null)
			objj_initialize(CPException).raise_format_(CPInvalidArgumentException, new CPString("-[%@ rangeOfString:options:range:locale:]: nil argument"), this.className);
		if (rangeOfReceiverToSearch.location >= this.length || CPMaxRange(rangeOfReceiverToSearch) > this.length || rangeOfReceiverToSearch.location < 0 || rangeOfReceiverToSearch.length < 0)
			objj_initialize(CPException).raise_format_(CPRangeException, new CPString("-[%@ rangeOfString:options:range:locale:]: Range %@ out of bounds; string length %d"), this.className, CPStringFromRange(rangeOfReceiverToSearch), this.$jsString.length);

		let candidate = this.substringWithRange_(rangeOfReceiverToSearch);
		if ((mask & CPCaseInsensitiveSearch) === CPCaseInsensitiveSearch) {
			searchString = searchString.lowercaseStringWithLocale_(locale);
			candidate = candidate.lowercaseStringWithLocale_(locale);
		}

		const range = CPMakeRange(CPNotFound, 0);
		candidate = candidate.$jsString;
		searchString = searchString.$jsString;

		if ((mask & CPAnchoredSearch) === CPAnchoredSearch) {
			if ((mask & CPBackwardsSearch) === CPBackwardsSearch) {
				if (candidate.endsWith(searchString)) {
					range.location = candidate.length - searchString.length;
					range.length = searchString.length;
				}
			}
			else {
				if (candidate.startsWith(searchString)) {
					range.location = 0;
					range.length = searchString.length;
				}
			}
		}
		else if ((mask & CPBackwardsSearch) === CPBackwardsSearch) {
			// basically we just look for the last occurrence
			let pos = 0;
			while ((pos = candidate.indexOf(searchString, pos)) !== CPNotFound) {
				range.location = pos;
				pos += searchString.length;
			}
			if (range.location !== CPNotFound)
				range.length = searchString.length;
		}
		else {
			const idx = candidate.indexOf(searchString);
			if (idx !== CPNotFound)
			{
				range.location = idx;
				range.length = searchString.length;
			}
		}

		// adjust range as it matches candidate rather than orig string
		if (range.location !== CPNotFound)
			range.location +=  rangeOfReceiverToSearch.location;

		return range;
	}

	//! @}

	//! @name Changing Case
	//! @{

	//! @property(readonly, copy) CPString lowercaseString
	get lowercaseString() {
		return new CPString(this.$jsString.toLowerCase());
	}

	//! @property(readonly, copy) CPString localizedLowercaseString
	get localizedLowercaseString() {
		return new CPString(this.$jsString.toLocaleLowerCase());
	}

	// TODO: CPLocale support?
	//! @typed CPString : CPLocale
	lowercaseStringWithLocale_(locale) {
		return new CPString(this.$jsString.toLocaleLowerCase());
	}

	//! @property(readonly, copy) CPString uppercaseString
	get uppercaseString() {
		return new CPString(this.$jsString.toUpperCase());
	}

	//! @property(readonly, copy) CPString localizedUppercaseString
	get localizedUppercaseString() {
		return new CPString(this.$jsString.toLocaleUpperCase());
	}

	// TODO: CPLocale support?
	//! @typed CPString : CPLocale
	uppercaseStringWithLocale_(locale) {
		return new CPString(this.$jsString.toLocaleUpperCase());
	}

	//! @property(readonly, copy) CPString capitalizedString
	get capitalizedString() {
		let string = this.$jsString.toLowerCase();
		string = string.replace(/(^|\s+)(\S)/, (match) => match.toUpperCase());
		return new CPString(string);
	}

	//! @property(readonly, copy) CPString localizedCapitalizedString
	get localizedCapitalizedString() {
		let string = this.$jsString.toLocaleLowerCase();
		string = string.replace(/(^|\s+)(\S)/, (match) => match.toLocaleUpperCase());
		return new CPString(string);
	}

	// TODO: CPLocale support?
	//! @typed CPString : CPLocale
	capitalizedStringWithLocale_(locale) {
		let string = this.$jsString.toLocaleLowerCase();
		string = string.replace(/(^|\s+)(\S)/, (match) => match.toLocaleUpperCase());
		return new CPString(string);
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
const CPExceptionSym =  require('./CPException'), CPException = CPExceptionSym.CPException, CPInvalidArgumentException = CPExceptionSym.CPInvalidArgumentException, CPRangeException = CPExceptionSym.CPRangeException, CPInternalInconsistencyException = CPExceptionSym.CPInternalInconsistencyException;
