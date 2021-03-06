/*
 * Module that contains NSString class emulation and related symbols. We maintain a has-a relationship with a native JS string.
 **/

const OBJJ = require('../Objective-J'), objj_propGuard = OBJJ.objj_propGuard, objj_initialize = OBJJ.objj_initialize;
const CRObjectSym = require('./CRObject'), CRObject = CRObjectSym.CRObject;
const vsprintf = require("sprintf-js").vsprintf;
const iconv = require('iconv-lite');

//! NSString Cocoa Foundation class emulation
class CRString extends CRObject {

	$jsString = null;
	$hashCode = null;

	// we use this a convenience constructor so we can do shorthand conversions
	static new(jsString = '') {
		let object = this.alloc();
		object.init(jsString);
		return object;
	}

	//! @name Creating and Initializing Strings
	//! @{
	//! @typed instancetype : void
	static string() {
		return this.alloc().init();
	}

	//! @typed instancetype : void
	init(jsString = '') {
		const self = super.init();
		if (self) {
			if (jsString !== null)
				self.$jsString = jsString;
			else
				self.$jsString = '';
		}
		return self;
	}

	//! @typed instancetype : CRString
	initWithString_(aString) {
		if (aString === null) {
			objj_initialize(CRException).raise_format_(CRInvalidArgumentException, CRString.new("-[%@ initWithString:]: nil argument"), this.className);
			return null;
		}
		return this.init(aString.$jsString);
	}

	//! @typed instancetype : CRString, ...
	initWithFormat_(format, ...args) {
		return this.initWithFormat_locale_arguments_(format, null, args);
	}

	//! @typed instancetype : CRString, va_list
	initWithFormat_arguments_(format, args) {
		return this.initWithFormat_locale_arguments_(format, null, args);
	}

	// TODO: CRLocale support?
	//! @typed instancetype : CRString, CRLocale, ...
	initWithFormat_locale_(format, locale, ...args) {
		return this.initWithFormat_locale_arguments_(format, locale, args);
	}

	// TODO: CRLocale support?
	//! @typed instancetype : CRString, CRLocale, va_list
	initWithFormat_locale_arguments_(format, locale, args) {
		if (format === null) {
			objj_initialize(CRException).raise_format_(CRInvalidArgumentException, CRString.new("-[%@ initWithFormat:locale:arguments:]: nil argument"), this.className);
			return null;
		}

		// %@ will always be a string, so convert, but objects must change to description
		let formatString = format.jsString.replace(/%@/g, '%s');
		let values = args.map(element => element !== null && element !== undefined && element['$ISA'] === 'CRObject' ? objj_propGuard(element, 'description', 'jsString') : element);
		return this.initWithString_(CRString.new(vsprintf(formatString, values)));
	}

	//! @typed instancetype : CRString, ...
	static stringWithFormat_(format, ...args) {
		return this.alloc().initWithFormat_locale_arguments_(format, null, args);
	}

	// TODO: CRLocale support: method should call [CPLocale currentLocale]
	//! @typed instancetype : CRString, ...
	static localizedStringWithFormat_(format, ...args) {
		return this.alloc().initWithFormat_locale_arguments_(format, null, args);
	}

	//! @typed instancetype : CRString
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

	//! @property(readonly) CRUInteger length
	get length() {
		return this.$jsString.length;
	}

	//! @typed CRUInteger : CRStringEncoding
	lengthOfBytesUsingEncoding_(enc) {
		if (!iconv.encodingExists(enc.$jsString))
			return 0;

		const buf = iconv.encode(this.$jsString, enc.$jsString);
		return buf.length;
	}

	//! @typed CRUInteger : CRStringEncoding
	maximumLengthOfBytesUsingEncoding_(enc) {
		return this.lengthOfBytesUsingEncoding_(enc);
	}

	//! @}

	//! @name Identifying and Comparing Strings
	//! @{

	//! @property(readonly) CRUInteger hash
	get hash() {
		if (this.$hashCode === null) {
			let source = this.$jsString, length = source.length, result = 2166136261;
			for (let i = 0; i < length; i++) {
				result = result ^ source.charCodeAt(i);
				result = result * 16777619;
			}
			// check--throw exception  if hash is NaN
			if (Number.isNaN(result))
				objj_initialize(CRException).raise_format_(CRInternalInconsistencyException, CRString.new("-[%@ hash]: hash result of '%@' is NaN"), this.className, this);
			this.$hashCode = (new Uint32Array([result]))[0];
		}
		return this.$hashCode;
	}

	//! @}

	//! @name Dividing Strings
	//! @{

	//! @typed CRArray<CRString> : CRString
	componentsSeparatedByString_(separator) {
		if (separator === null)
			objj_initialize(CRException).raise_format_(CRInvalidArgumentException, CRString.new("-[%@ componentsSeparatedByString:]: nil argument"), this.className);

		// to imitate Cocoa behavior, we must return whole string if separator empty
		if (separator.length === 0)
			return CRArray.new([this]);

		// otherwise use split with literal string
		const parts = this.$jsString.split(separator.$jsString);
		for (let i=0; i<parts.length; i++) {
			parts[i] = CRString.new(parts[i]);
		}
		return CRArray.new(parts);
	}

	//! @typed CRString : CRUInteger
	substringFromIndex_(from) {
		if (from >= this.length || from < 0)
			objj_initialize(CRException).raise_format_(CRRangeException, CRString.new("-[%@ substringFromIndex:]: Index %d out of bounds; string length %d"), this.className, (new Uint32Array([from]))[0], this.length);

		return CRString.new(this.$jsString.substr(from));
	}

	//! @typed CRString : CRRange
	substringWithRange_(range) {
		if (range.location >= this.length || CRMaxRange(range) > this.length || range.location < 0 || range.length < 0)
			objj_initialize(CRException).raise_format_(CRRangeException, CRString.new("-[%@ substringWithRange:]: Range %@ out of bounds; string length %d"), this.className, CRStringFromRange(range), this.length);

		return CRString.new(this.$jsString.substr(range.location, range.length));
	}

	//! @typed CRString : CRUInteger
	substringToIndex_(to) {
		if (to > this.length || to < 0)
			objj_initialize(CRException).raise_format_(CRRangeException, CRString.new("-[%@ substringToIndex:]: Index %d out of bounds; string length %d"), this.className, (new Uint32Array([to]))[0], this.length);

		return CRString.new(this.$jsString.substr(0, to));
	}

	//! @}

	//! @name Finding Characters and Substrings
	//! @{

	// TODO: CRLocale support?
	//! @typed CRRange : CRString, CRStringCompareOptions, CRRange, CRLocale
	rangeOfString_options_range_locale_(searchString, mask, rangeOfReceiverToSearch, locale) {
		if (searchString === null)
			objj_initialize(CRException).raise_format_(CRInvalidArgumentException, CRString.new("-[%@ rangeOfString:options:range:locale:]: nil argument"), this.className);
		if (rangeOfReceiverToSearch.location >= this.length || CRMaxRange(rangeOfReceiverToSearch) > this.length || rangeOfReceiverToSearch.location < 0 || rangeOfReceiverToSearch.length < 0)
			objj_initialize(CRException).raise_format_(CRRangeException, CRString.new("-[%@ rangeOfString:options:range:locale:]: Range %@ out of bounds; string length %d"), this.className, CRStringFromRange(rangeOfReceiverToSearch), this.$jsString.length);

		let candidate = this.substringWithRange_(rangeOfReceiverToSearch);
		if ((mask & CRCaseInsensitiveSearch) === CRCaseInsensitiveSearch) {
			searchString = searchString.lowercaseStringWithLocale_(locale);
			candidate = candidate.lowercaseStringWithLocale_(locale);
		}

		const range = CRMakeRange(CRNotFound, 0);
		candidate = candidate.$jsString;
		searchString = searchString.$jsString;

		if ((mask & CRAnchoredSearch) === CRAnchoredSearch) {
			if ((mask & CRBackwardsSearch) === CRBackwardsSearch) {
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
		else if ((mask & CRBackwardsSearch) === CRBackwardsSearch) {
			// basically we just look for the last occurrence
			let pos = 0;
			while ((pos = candidate.indexOf(searchString, pos)) !== CRNotFound) {
				range.location = pos;
				pos += searchString.length;
			}
			if (range.location !== CRNotFound)
				range.length = searchString.length;
		}
		else {
			const idx = candidate.indexOf(searchString);
			if (idx !== CRNotFound)
			{
				range.location = idx;
				range.length = searchString.length;
			}
		}

		// adjust range as it matches candidate rather than orig string
		if (range.location !== CRNotFound)
			range.location +=  rangeOfReceiverToSearch.location;

		return range;
	}

	//! @}

	//! @name Changing Case
	//! @{

	//! @property(readonly, copy) CRString lowercaseString
	get lowercaseString() {
		return CRString.new(this.$jsString.toLowerCase());
	}

	//! @property(readonly, copy) CRString localizedLowercaseString
	get localizedLowercaseString() {
		return CRString.new(this.$jsString.toLocaleLowerCase());
	}

	// TODO: CRLocale support?
	//! @typed CRString : CRLocale
	lowercaseStringWithLocale_(locale) {
		return CRString.new(this.$jsString.toLocaleLowerCase());
	}

	//! @property(readonly, copy) CRString uppercaseString
	get uppercaseString() {
		return CRString.new(this.$jsString.toUpperCase());
	}

	//! @property(readonly, copy) CRString localizedUppercaseString
	get localizedUppercaseString() {
		return CRString.new(this.$jsString.toLocaleUpperCase());
	}

	// TODO: CRLocale support?
	//! @typed CRString : CRLocale
	uppercaseStringWithLocale_(locale) {
		return CRString.new(this.$jsString.toLocaleUpperCase());
	}

	//! @property(readonly, copy) CRString capitalizedString
	get capitalizedString() {
		let string = this.$jsString.toLowerCase();
		string = string.replace(/(^|\s+)(\S)/, (match) => match.toUpperCase());
		return CRString.new(string);
	}

	//! @property(readonly, copy) CRString localizedCapitalizedString
	get localizedCapitalizedString() {
		let string = this.$jsString.toLocaleLowerCase();
		string = string.replace(/(^|\s+)(\S)/, (match) => match.toLocaleUpperCase());
		return CRString.new(string);
	}

	// TODO: CRLocale support?
	//! @typed CRString : CRLocale
	capitalizedStringWithLocale_(locale) {
		let string = this.$jsString.toLocaleLowerCase();
		string = string.replace(/(^|\s+)(\S)/, (match) => match.toLocaleUpperCase());
		return CRString.new(string);
	}

	//! @}

	//! @name Working with Encodings
	//! @{

	//! @property(readonly, copy) CRString description
	get description() {return this;}

	//! @}

	//! @name Methods Not In Cocoa
	//! @{

	//! @property(readonly, copy) string jsString
	//! Returns the native JS string that backs the NSArray
	get jsString() {return this.$jsString;}

	//! @}
}
exports.CRString = CRString;

const CRArraySym = require("./CRArray"), CRArray = CRArraySym.CRArray;
const CRRangeSym = require('./CRRange'), CRMakeRange = CRRangeSym.CRMakeRange, CRMaxRange = CRRangeSym.CRMaxRange, CRNotFound = CRRangeSym.CRNotFound, CRStringFromRange = CRRangeSym.CRStringFromRange;
const CRExceptionSym =  require('./CRException'), CRException = CRExceptionSym.CRException, CRInvalidArgumentException = CRExceptionSym.CRInvalidArgumentException, CRRangeException = CRExceptionSym.CRRangeException, CRInternalInconsistencyException = CRExceptionSym.CRInternalInconsistencyException;

//! @name String Encoding Constants
//! We use iconv-lite https://github.com/ashtuchkin/iconv-lite for conversion handling, so a number of these encodings are not supported.
const CRASCIIStringEncoding  = CRString.new( 'ascii'),
	CRNEXTSTEPStringEncoding  = CRString.new( 'nextstep'),
	CRJapaneseEUCStringEncoding  = CRString.new( 'EUC-JP'),
	CRUTF8StringEncoding  = CRString.new( 'utf8'),
	CRISOLatin1StringEncoding  = CRString.new( 'ISO-8859-1'),
	CRSymbolStringEncoding  = CRString.new( 'Adobe Symbol'),
	CRNonLossyASCIIStringEncoding  = CRString.new( 'ascii'),
	CRShiftJISStringEncoding  = CRString.new( 'Shift_JIS'),
	CRISOLatin2StringEncoding  = CRString.new( 'ISO-8859-2'),
	CRUnicodeStringEncoding  = CRString.new( 'UTF-16'),
	CRWindowsCP1251StringEncoding  = CRString.new( 'CP1251'),
	CRWindowsCP1252StringEncoding  = CRString.new( 'CP1252'),
	CRWindowsCP1253StringEncoding  = CRString.new( 'CP1253'),
	CRWindowsCP1254StringEncoding  = CRString.new( 'CP1254'),
	CRWindowsCP1250StringEncoding  = CRString.new( 'CP1250'),
	CRISO2022JPStringEncoding  = CRString.new( 'ISO-2022-JP'),
	CRMacOSRomanStringEncoding  = CRString.new( 'macroman'),
	CRUTF16StringEncoding = CRUnicodeStringEncoding,
	CRUTF16BigEndianStringEncoding  = CRString.new( 'UTF16BigEndian'),
	CRUTF16LittleEndianStringEncoding  = CRString.new( 'UTF16LittleEndian'),
	CRUTF32StringEncoding  = CRString.new( 'UTF-32'),
	CRUTF32BigEndianStringEncoding  = CRString.new( 'UTF32BigEndian'),
	CRUTF32LittleEndianStringEncoding  = CRString.new( 'UTF32LittleEndian');
Object.assign(exports, {CRASCIIStringEncoding, CRNEXTSTEPStringEncoding, CRJapaneseEUCStringEncoding, CRUTF8StringEncoding, CRISOLatin1StringEncoding, CRSymbolStringEncoding, CRNonLossyASCIIStringEncoding, CRShiftJISStringEncoding, CRISOLatin2StringEncoding, CRUnicodeStringEncoding, CRWindowsCP1251StringEncoding, CRWindowsCP1252StringEncoding, CRWindowsCP1253StringEncoding, CRWindowsCP1254StringEncoding, CRWindowsCP1250StringEncoding, CRISO2022JPStringEncoding, CRMacOSRomanStringEncoding, CRUTF16StringEncoding, CRUTF16BigEndianStringEncoding, CRUTF16LittleEndianStringEncoding, CRUTF32StringEncoding, CRUTF32BigEndianStringEncoding, CRUTF32LittleEndianStringEncoding});

//! @name CRStringCompareOptions
const CRCaseInsensitiveSearch = 1,
	CRLiteralSearch = 2,
	CRBackwardsSearch = 4,
	CRAnchoredSearch = 8,
	CRNumericSearch = 64,
	CRDiacriticInsensitiveSearch = 128,
	CRWidthInsensitiveSearch = 256,
	CRForcedOrderingSearch = 512,
	CRRegularExpressionSearch = 1024;
Object.assign(exports, {CRCaseInsensitiveSearch, CRLiteralSearch, CRBackwardsSearch, CRAnchoredSearch, CRNumericSearch, CRDiacriticInsensitiveSearch, CRWidthInsensitiveSearch, CRForcedOrderingSearch, CRRegularExpressionSearch});
