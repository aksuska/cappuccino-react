import {objj_propGuard, CPObject, CPString, CPSymbolStringEncoding, CPUTF8StringEncoding, CPUTF16StringEncoding, CPInvalidArgumentException} from '../src/Foundation/Foundation';

function testReadOnlyProperty(target, propName, setValue) {
	try {
	objj_propGuard(target, propName, [setValue]);
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.jsString).toBe(CPInvalidArgumentException.jsString);
		expect(e.reason.jsString).toBe("Assignment to readonly property");
	}
}

test("CPString shorthand creation using new", () => {
	const testString = "test", string = new CPString(testString);
	expect(string).toBeInstanceOf(CPString);
	expect(string.$jsString).toEqual(testString);
});

test("CPString -init creates empty string", () => {
	const string = CPString.alloc().init();
	expect(string).toBeInstanceOf(CPString);
	expect(string.$jsString).toEqual('');
});

test("CPString +string calls -init", () => {
	const mockFunc = jest.fn(), init = CPString.prototype.init;
	CPString.prototype.init = mockFunc;
	CPString.string();
	expect(mockFunc.mock.calls.length).toBe(1);
	expect(mockFunc.mock.calls[0]).toEqual([]);
	CPString.prototype.init = init;
});

test("CPString -initWithString: throws on null string", () => {
	try {
		CPString.alloc().initWithString_(null);
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.$jsString).toBe(CPInvalidArgumentException.$jsString);
		expect(e.reason.$jsString).toBe(`-[CPString initWithString:]: null argument`);
	}
});

test("CPString -initWithString: creates string with value", () => {
	const testString = new CPString("test"), string = CPString.alloc().initWithString_(testString);
	expect(string).toBeInstanceOf(CPString);
	expect(string.$jsString).toEqual(testString.$jsString);
});

test("CPString -initWithFormat:locale:arguments: throws on null format string", () => {
	try {
		CPString.alloc().initWithFormat_locale_arguments_(null, null, null);
		// this actually means the above failed to throw
		expect(true).toBe(false);
	}
	catch (e) {
		expect(e.name.$jsString).toBe(CPInvalidArgumentException.$jsString);
		expect(e.reason.$jsString).toBe(`-[CPString initWithFormat:locale:arguments:]: null argument`);
	}
});

test("CPString -initWithFormat:locale:arguments: creates string with value", () => {
	const object = new CPObject(), string = CPString.alloc().initWithFormat_locale_arguments_(new CPString("Object: %@ string: %s number: %d"), null, [object, "js-string", 9]);
	expect(string).toBeInstanceOf(CPString);
	expect(string.$jsString).toEqual(`Object: ${object.description.$jsString} string: js-string number: 9`);
});

test("CPString -initWithFormat: calls -initWithFormat:locale:arguments: with expected arguments", () => {
	const mockFunc = jest.fn(), string = CPString.alloc(), format = new CPString("Object: %@ string: %s number: %d"), args = [1, 2, 3];
	string.initWithFormat_locale_arguments_ = mockFunc;
	string.initWithFormat_(format, ...args);
	expect(mockFunc.mock.calls.length).toBe(1);
	expect(mockFunc.mock.calls[0]).toEqual([format, null, args]);
});

test("CPString -initWithFormat:arguments: calls -initWithFormat:locale:arguments: with expected arguments", () => {
	const string = CPString.alloc(), mockFunc = jest.fn(), format = new CPString("Object: %@ string: %s number: %d"), args = [1, 2, 3];
	string.initWithFormat_locale_arguments_ = mockFunc;
	string.initWithFormat_arguments_(format, args);
	expect(mockFunc.mock.calls.length).toBe(1);
	expect(mockFunc.mock.calls[0]).toEqual([format, null, args]);
});

test("CPString -initWithFormat:locale: calls -initWithFormat:locale:arguments: with expected arguments", () => {
	const string = CPString.alloc(), mockFunc = jest.fn(), format = new CPString("Object: %@ string: %s number: %d"), args = [1, 2, 3];
	string.initWithFormat_locale_arguments_ = mockFunc;
	string.initWithFormat_locale_(format, "CPLocale", ...args);
	expect(mockFunc.mock.calls.length).toBe(1);
	expect(mockFunc.mock.calls[0]).toEqual([format, "CPLocale", args]);
});

test("CPString +stringWithFormat: calls -initWithFormat:locale:arguments: with expected arguments", () => {
	const init = CPString.prototype.initWithFormat_locale_arguments_, mockFunc = jest.fn(), format = new CPString("Object: %@ string: %s number: %d"), args = [1, 2, 3];
	CPString.prototype.initWithFormat_locale_arguments_ = mockFunc;
	CPString.stringWithFormat_(format, ...args);
	expect(mockFunc.mock.calls.length).toBe(1);
	expect(mockFunc.mock.calls[0]).toEqual([format, null, args]);
	CPString.prototype.initWithFormat_locale_arguments_ = init;
});

test("CPString +localizedStringWithFormat: calls -initWithFormat:locale:arguments: with expected arguments", () => {
	const init = CPString.prototype.initWithFormat_locale_arguments_, mockFunc = jest.fn(), format = new CPString("Object: %@ string: %s number: %d"), args = [1, 2, 3];
	CPString.prototype.initWithFormat_locale_arguments_ = mockFunc;
	CPString.localizedStringWithFormat_(format, ...args);
	expect(mockFunc.mock.calls.length).toBe(1);
	expect(mockFunc.mock.calls[0]).toEqual([format, null, args]);
	CPString.prototype.initWithFormat_locale_arguments_ = init;
});

test("CPString +stringWithString: calls -initWithString: with expected arguments", () => {
	const init = CPString.prototype.initWithString_, mockFunc = jest.fn(), testString = new CPString("test string");
	CPString.prototype.initWithString_ = mockFunc;
	CPString.stringWithString_(testString);
	expect(mockFunc.mock.calls.length).toBe(1);
	expect(mockFunc.mock.calls[0]).toEqual([testString]);
	CPString.prototype.initWithString_ = init;
});

test("CPString -copyWithZone: returns self", () => {
	const string = CPString.new(), copy = string.copyWithZone_();
	expect(copy).toBe(string);
});

test("CPString -length returns expected value", () => {
	const testString = "test string", string = new CPString(testString);
	expect(string.length).toEqual(testString.length);
});

test("CPString -length is read-only", () => {
	testReadOnlyProperty(new CPString(''), 'length', 1);
});

test("CPString -lengthOfBytesUsingEncoding: returns 0 for unknown encoding", () => {
	const testString = "test string", string = new CPString(testString);
	expect(string.lengthOfBytesUsingEncoding_(CPSymbolStringEncoding)).toEqual(0);
});

test("CPString -lengthOfBytesUsingEncoding: returns expected length for passed encoding", () => {
	const testString = "test string", string = new CPString(testString);
	expect(string.lengthOfBytesUsingEncoding_(CPUTF16StringEncoding)).toEqual(testString.length*2+2);
	expect(string.lengthOfBytesUsingEncoding_(CPUTF8StringEncoding)).toEqual(testString.length);
});

test("CPString -maximumLengthOfBytesUsingEncoding: calls -lengthOfBytesUsingEncoding:", () => {
	const testString = "test string", string = new CPString(testString), mockFunc = jest.fn();
	string.lengthOfBytesUsingEncoding_ = mockFunc;
	string.maximumLengthOfBytesUsingEncoding_(CPUTF16StringEncoding);
	expect(mockFunc.mock.calls.length).toBe(1);
	expect(mockFunc.mock.calls[0]).toEqual([CPUTF16StringEncoding]);
});

test("CPString -jsString returns expected value", () => {
	const testString = "test string ", string = CPString.new(testString);
	expect(string.jsString).toBe(string.$jsString);
});

test("CPString -jsString is read-only", () => {
	testReadOnlyProperty(CPString.new(), 'jsString', "anything");
});

test("CPString -hash returns expected value", () => {
	const testString = "an especially long string to calculate some reasonable hash value ", string1 = new CPString(testString), string2 = new CPString(testString), string3 = CPString.new("an especially long string to calculate other some reasonable hash value ");
	expect(string1.hash).toBe(string2.hash);
	expect(string1.hash).not.toBe(string3.hash);
});

test("CPString -hash is read-only", () => {
	testReadOnlyProperty(CPString.new(), 'hash', 0);
});

test("CPString -description returns self", () => {
	const testString = "test string", string = new CPString(testString);
	expect(string.description.jsString).toEqual(testString);
});
