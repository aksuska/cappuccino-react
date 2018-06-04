const OBJJ = require('../src/Objective-J'), objj_propGuard = OBJJ.objj_propGuard;
const CRObjectSym = require('../src/Foundation/CPObject'), CRObject = CRObjectSym.CRObject;
const CRStringSym = require('../src/Foundation/CPString'), CRString = CRStringSym.CRString,
				CRSymbolStringEncoding = CRStringSym.CRSymbolStringEncoding, CRUTF8StringEncoding = CRStringSym.CRUTF8StringEncoding, CRUTF16StringEncoding = CRStringSym.CRUTF16StringEncoding,
				CRCaseInsensitiveSearch = CRStringSym.CRCaseInsensitiveSearch, CRAnchoredSearch = CRStringSym.CRAnchoredSearch, CRBackwardsSearch = CRStringSym.CRBackwardsSearch;
const CRExceptionSym = require("../src/Foundation/CPException"), CRInvalidArgumentException = CRExceptionSym.CRInvalidArgumentException, CRRangeException = CRExceptionSym.CRRangeException;
const CRRangeSym = require('../src/Foundation/CPRange'), CRMakeRange = CRRangeSym.CRMakeRange, CRNotFound = CRRangeSym.CRNotFound;

function testReadOnlyProperty(target, propName, setValue) {
	try {
	objj_propGuard(target, propName, [setValue]);
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CRInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe("Assignment to readonly property");
	}
}

test("CRString shorthand creation using new", () => {
	const testString = "test", string = new CRString(testString);
	expect(string).toBeInstanceOf(CRString);
	expect(string.$jsString).toEqual(testString);
});

test("CRString -init creates empty string", () => {
	const string = CRString.alloc().init();
	expect(string).toBeInstanceOf(CRString);
	expect(string.$jsString).toEqual('');
});

test("CRString +string calls -init", () => {
	const mockFunc = jest.fn(), init = CRString.prototype.init;
	CRString.prototype.init = mockFunc;
	CRString.string();
	expect(mockFunc.mock.calls.length).toBe(1);
	expect(mockFunc.mock.calls[0]).toEqual([]);
	CRString.prototype.init = init;
});

test("CRString -initWithString: throws on null string", () => {
	try {
		CRString.alloc().initWithString_(null);
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.$jsString).toBe(CRInvalidArgumentException.$jsString);
		expect(e.reason.$jsString).toBe(`-[CRString initWithString:]: nil argument`);
	}
});

test("CRString -initWithString: creates string with value", () => {
	const testString = new CRString("test"), string = CRString.alloc().initWithString_(testString);
	expect(string).toBeInstanceOf(CRString);
	expect(string.$jsString).toEqual(testString.$jsString);
});

test("CRString -initWithFormat:locale:arguments: throws on null format string", () => {
	try {
		CRString.alloc().initWithFormat_locale_arguments_(null, null, null);
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.$jsString).toBe(CRInvalidArgumentException.$jsString);
		expect(e.reason.$jsString).toBe(`-[CRString initWithFormat:locale:arguments:]: nil argument`);
	}
});

test("CRString -initWithFormat:locale:arguments: creates string with value", () => {
	const object = new CRObject(), string = CRString.alloc().initWithFormat_locale_arguments_(new CRString("Object: %@ string: %s number: %d"), null, [object, "js-string", 9]);
	expect(string).toBeInstanceOf(CRString);
	expect(string.$jsString).toEqual(`Object: ${object.description.$jsString} string: js-string number: 9`);
});

test("CRString -initWithFormat: calls -initWithFormat:locale:arguments: with expected arguments", () => {
	const mockFunc = jest.fn(), string = CRString.alloc(), format = new CRString("Object: %@ string: %s number: %d"), args = [1, 2, 3];
	string.initWithFormat_locale_arguments_ = mockFunc;
	string.initWithFormat_(format, ...args);
	expect(mockFunc.mock.calls.length).toBe(1);
	expect(mockFunc.mock.calls[0]).toEqual([format, null, args]);
});

test("CRString -initWithFormat:arguments: calls -initWithFormat:locale:arguments: with expected arguments", () => {
	const string = CRString.alloc(), mockFunc = jest.fn(), format = new CRString("Object: %@ string: %s number: %d"), args = [1, 2, 3];
	string.initWithFormat_locale_arguments_ = mockFunc;
	string.initWithFormat_arguments_(format, args);
	expect(mockFunc.mock.calls.length).toBe(1);
	expect(mockFunc.mock.calls[0]).toEqual([format, null, args]);
});

test("CRString -initWithFormat:locale: calls -initWithFormat:locale:arguments: with expected arguments", () => {
	const string = CRString.alloc(), mockFunc = jest.fn(), format = new CRString("Object: %@ string: %s number: %d"), args = [1, 2, 3];
	string.initWithFormat_locale_arguments_ = mockFunc;
	string.initWithFormat_locale_(format, "CRLocale", ...args);
	expect(mockFunc.mock.calls.length).toBe(1);
	expect(mockFunc.mock.calls[0]).toEqual([format, "CRLocale", args]);
});

test("CRString +stringWithFormat: calls -initWithFormat:locale:arguments: with expected arguments", () => {
	const init = CRString.prototype.initWithFormat_locale_arguments_, mockFunc = jest.fn(), format = new CRString("Object: %@ string: %s number: %d"), args = [1, 2, 3];
	CRString.prototype.initWithFormat_locale_arguments_ = mockFunc;
	CRString.stringWithFormat_(format, ...args);
	expect(mockFunc.mock.calls.length).toBe(1);
	expect(mockFunc.mock.calls[0]).toEqual([format, null, args]);
	CRString.prototype.initWithFormat_locale_arguments_ = init;
});

test("CRString +localizedStringWithFormat: calls -initWithFormat:locale:arguments: with expected arguments", () => {
	const init = CRString.prototype.initWithFormat_locale_arguments_, mockFunc = jest.fn(), format = new CRString("Object: %@ string: %s number: %d"), args = [1, 2, 3];
	CRString.prototype.initWithFormat_locale_arguments_ = mockFunc;
	CRString.localizedStringWithFormat_(format, ...args);
	expect(mockFunc.mock.calls.length).toBe(1);
	expect(mockFunc.mock.calls[0]).toEqual([format, null, args]);
	CRString.prototype.initWithFormat_locale_arguments_ = init;
});

test("CRString +stringWithString: calls -initWithString: with expected arguments", () => {
	const init = CRString.prototype.initWithString_, mockFunc = jest.fn(), testString = new CRString("test string");
	CRString.prototype.initWithString_ = mockFunc;
	CRString.stringWithString_(testString);
	expect(mockFunc.mock.calls.length).toBe(1);
	expect(mockFunc.mock.calls[0]).toEqual([testString]);
	CRString.prototype.initWithString_ = init;
});

test("CRString -copyWithZone: returns self", () => {
	const string = CRString.new(), copy = string.copyWithZone_();
	expect(copy).toBe(string);
});

test("CRString -length returns expected value", () => {
	const testString = "test string", string = new CRString(testString);
	expect(string.length).toEqual(testString.length);
});

test("CRString -length is read-only", () => {
	testReadOnlyProperty(new CRString(''), 'length', 1);
});

test("CRString -lengthOfBytesUsingEncoding: returns 0 for unknown encoding", () => {
	const testString = "test string", string = new CRString(testString);
	expect(string.lengthOfBytesUsingEncoding_(CRSymbolStringEncoding)).toEqual(0);
});

test("CRString -lengthOfBytesUsingEncoding: returns expected length for passed encoding", () => {
	const testString = "test string", string = new CRString(testString);
	expect(string.lengthOfBytesUsingEncoding_(CRUTF16StringEncoding)).toEqual(testString.length*2+2);
	expect(string.lengthOfBytesUsingEncoding_(CRUTF8StringEncoding)).toEqual(testString.length);
});

test("CRString -maximumLengthOfBytesUsingEncoding: calls -lengthOfBytesUsingEncoding:", () => {
	const testString = "test string", string = new CRString(testString), mockFunc = jest.fn();
	string.lengthOfBytesUsingEncoding_ = mockFunc;
	string.maximumLengthOfBytesUsingEncoding_(CRUTF16StringEncoding);
	expect(mockFunc.mock.calls.length).toBe(1);
	expect(mockFunc.mock.calls[0]).toEqual([CRUTF16StringEncoding]);
});

test("CRString -jsString returns expected value", () => {
	const testString = "test string ", string = CRString.new(testString);
	expect(string.jsString).toBe(string.$jsString);
});

test("CRString -jsString is read-only", () => {
	testReadOnlyProperty(CRString.new(), 'jsString', "anything");
});

test("CRString -hash returns expected value", () => {
	const testString = "an especially long string to calculate some reasonable hash value ", string1 = new CRString(testString), string2 = new CRString(testString), string3 = CRString.new("an especially long string to calculate other some reasonable hash value ");
	expect(string1.hash).toBe(string2.hash);
	expect(string1.hash).not.toBe(string3.hash);
});

test("CRString -hash is read-only", () => {
	testReadOnlyProperty(CRString.new(), 'hash', 0);
});

test("CRString -componentsSeparatedByString: throws on null string", () => {
	try {
		CRString.alloc().componentsSeparatedByString_(null);
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.$jsString).toBe(CRInvalidArgumentException.$jsString);
		expect(e.reason.$jsString).toBe(`-[CRString componentsSeparatedByString:]: nil argument`);
	}
});

test("CRString -componentsSeparatedByString: returns array of self when separator empty", () => {
	const testString = "test string", array = new CRString(testString).componentsSeparatedByString_(new CRString(''));
	expect(array.count).toBe(1);
	expect(array.$jsArray[0].$jsString).toEqual(testString);
});

test("CRString -componentsSeparatedByString: returns expected value", () => {
	const testString = "test string", array = new CRString(testString).componentsSeparatedByString_(new CRString(' '));
	expect(array.count).toBe(2);
	const jsStringArray = array.$jsArray.map((string) => string.$jsString);
	expect(jsStringArray).toEqual(["test", "string"]);
});

test("CRString -substringFromIndex: throws on index out of range", () => {
	const testString = new CRString("test string");
	try {
		testString.substringFromIndex_(-1);
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.$jsString).toBe(CRRangeException.$jsString);
		expect(e.reason.$jsString).toBe(`-[CRString substringFromIndex:]: Index 4294967295 out of bounds; string length ${testString.length}`);
	}
	try {
		testString.substringFromIndex_(testString.length);
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.$jsString).toBe(CRRangeException.$jsString);
		expect(e.reason.$jsString).toBe(`-[CRString substringFromIndex:]: Index ${testString.length} out of bounds; string length ${testString.length}`);
	}
});

test("CRString -substringFromIndex: returns expected value", () => {
	const testString = new CRString("test string");
	expect(testString.substringFromIndex_(3).$jsString).toEqual("t string");
});

test("CRString -substringWithRange: throws on out of range", () => {
	const testString = new CRString("test string");
	try {
		testString.substringWithRange_(CRMakeRange(testString.length, 3));
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.$jsString).toBe(CRRangeException.$jsString);
		expect(e.reason.$jsString).toBe(`-[CRString substringWithRange:]: Range {${testString.length}, 3} out of bounds; string length ${testString.length}`);
	}
	try {
		testString.substringWithRange_(CRMakeRange(3, 10));
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.$jsString).toBe(CRRangeException.$jsString);
		expect(e.reason.$jsString).toBe(`-[CRString substringWithRange:]: Range {3, 10} out of bounds; string length ${testString.length}`);
	}
	try {
		testString.substringWithRange_(CRMakeRange(-1, 5));
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.$jsString).toBe(CRRangeException.$jsString);
		expect(e.reason.$jsString).toBe(`-[CRString substringWithRange:]: Range {4294967295, 5} out of bounds; string length ${testString.length}`);
	}
	try {
		testString.substringWithRange_(CRMakeRange(3, -1));
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.$jsString).toBe(CRRangeException.$jsString);
		expect(e.reason.$jsString).toBe(`-[CRString substringWithRange:]: Range {3, 4294967295} out of bounds; string length ${testString.length}`);
	}
});

test("CRString -substringWithRange: returns expected value", () => {
	const testString = new CRString("test string");
	expect(testString.substringWithRange_(CRMakeRange(3, 5)).$jsString).toEqual("t str");
});

test("CRString -substringToIndex: throws on index out of range", () => {
	const testString = new CRString("test string");
	try {
		testString.substringToIndex_(-1);
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.$jsString).toBe(CRRangeException.$jsString);
		expect(e.reason.$jsString).toBe(`-[CRString substringToIndex:]: Index 4294967295 out of bounds; string length ${testString.length}`);
	}
	try {
		testString.substringToIndex_(15);
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.$jsString).toBe(CRRangeException.$jsString);
		expect(e.reason.$jsString).toBe(`-[CRString substringToIndex:]: Index 15 out of bounds; string length ${testString.length}`);
	}
});

test("CRString -substringToIndex: returns expected value", () => {
	const testString = new CRString("test string");
	expect(testString.substringToIndex_(6).$jsString).toEqual("test s");
});

test("CRString -rangeOfString:options:range:locale: throws on nil string", () => {
	try {
		CRString.alloc().rangeOfString_options_range_locale_(null, 0, CRMakeRange(0, 3), null);
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.$jsString).toBe(CRInvalidArgumentException.$jsString);
		expect(e.reason.$jsString).toBe(`-[CRString rangeOfString:options:range:locale:]: nil argument`);
	}
});

test("CRString -rangeOfString:options:range:locale: throws on out of range", () => {
	const testString = new CRString("test string");
	try {
		testString.rangeOfString_options_range_locale_(new CRString('string'), 0, CRMakeRange(testString.length, 3), null);
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.$jsString).toBe(CRRangeException.$jsString);
		expect(e.reason.$jsString).toBe(`-[CRString rangeOfString:options:range:locale:]: Range {${testString.length}, 3} out of bounds; string length ${testString.length}`);
	}
	try {
		testString.rangeOfString_options_range_locale_(new CRString('string'), 0, CRMakeRange(3, 10), null);
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.$jsString).toBe(CRRangeException.$jsString);
		expect(e.reason.$jsString).toBe(`-[CRString rangeOfString:options:range:locale:]: Range {3, 10} out of bounds; string length ${testString.length}`);
	}
	try {
		testString.rangeOfString_options_range_locale_(new CRString('string'), 0, CRMakeRange(-1, 5), null);
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.$jsString).toBe(CRRangeException.$jsString);
		expect(e.reason.$jsString).toBe(`-[CRString rangeOfString:options:range:locale:]: Range {4294967295, 5} out of bounds; string length ${testString.length}`);
	}
	try {
		testString.rangeOfString_options_range_locale_(new CRString('string'), 0, CRMakeRange(3, -1), null);
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.$jsString).toBe(CRRangeException.$jsString);
		expect(e.reason.$jsString).toBe(`-[CRString rangeOfString:options:range:locale:]: Range {3, 4294967295} out of bounds; string length ${testString.length}`);
	}
});

test("CRString -rangeOfString:options:range:locale: returns expected value (no options, full string range)", () => {
	const testString = new CRString("test string");
	expect(testString.rangeOfString_options_range_locale_(new CRString("bogus"), 0, CRMakeRange(0, testString.length), null)).toEqual(CRMakeRange(CRNotFound, 0));
	expect(testString.rangeOfString_options_range_locale_(new CRString("string"), 0, CRMakeRange(0, testString.length), null)).toEqual(CRMakeRange(5, 6));
});


test("CRString -rangeOfString:options:range:locale: returns expected value (case insensitive, partial string range)", () => {
	const testString = new CRString("test string");
	expect(testString.rangeOfString_options_range_locale_(new CRString("T"), 0, CRMakeRange(2, 6), null)).toEqual(CRMakeRange(CRNotFound, 0));
	expect(testString.rangeOfString_options_range_locale_(new CRString("T"), CRCaseInsensitiveSearch, CRMakeRange(2, 6), null)).toEqual(CRMakeRange(3, 1));
});

test("CRString -rangeOfString:options:range:locale: returns expected value (anchored, partial string range)", () => {
	const testString = new CRString("test string");
	expect(testString.rangeOfString_options_range_locale_(new CRString("t"), CRAnchoredSearch, CRMakeRange(2, 6), null)).toEqual(CRMakeRange(CRNotFound, 0));
	expect(testString.rangeOfString_options_range_locale_(new CRString("t"), CRAnchoredSearch, CRMakeRange(3, 6), null)).toEqual(CRMakeRange(3, 1));
	expect(testString.rangeOfString_options_range_locale_(new CRString("t"), CRAnchoredSearch|CRBackwardsSearch, CRMakeRange(2, 6), null)).toEqual(CRMakeRange(CRNotFound, 0));
	expect(testString.rangeOfString_options_range_locale_(new CRString("t"), CRAnchoredSearch|CRBackwardsSearch, CRMakeRange(2, 5), null)).toEqual(CRMakeRange(6, 1));
});

test("CRString -rangeOfString:options:range:locale: returns expected value (backwards search, full string range)", () => {
	const testString = new CRString("test string");
	expect(testString.rangeOfString_options_range_locale_(new CRString("t"), CRBackwardsSearch, CRMakeRange(0, testString.length), null)).toEqual(CRMakeRange(6, 1));
});

test("CRString -description returns self", () => {
	const testString = "test string", string = new CRString(testString);
	expect(string.description.jsString).toEqual(testString);
});

