/*!
 * Module that contains NSString class emulation and related symbols. We maintain a has-a relationship with a native JS string.
 **/

import {objj_propGuard, objj_throw_arg} from '../Objective-J';
import CPObject from './CPObject';
const vsprintf = require("sprintf-js").vsprintf;

//! NSString Cocoa Foundation class emulation
export default class CPString extends CPObject {

	$$jsString = '';
	$$hashCode = 0;

	// we use this a convenience constructor so we can do shorthand conversions
	constructor(jsString) {
		super();
		if (jsString !== null && jsString !== undefined)
		{
			this.$$jsString = jsString;
			this.$generateHash();
		}
	}

	//! @property(readonly) CPUInteger hash
	get hash() {return this.$$hashCode;}

	//! @property(readonly, copy) CPString description
	get description() {return this;}

	//! @property(readonly, copy) string jsString
	get jsString() {return this.$$jsString;}

	//! @typed instancetype : void
	static string() {
		return this.alloc().initWithString_(new CPString(""));
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

	$generateHash() {
		let source = this.$$jsString, length = source.length, result = length;
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
		this.$$hashCode = result + (result << (length & 31));
	}

	//! @typed instancetype : CPString
	initWithString_(aString) {
		if (aString === null) {
			objj_throw_arg("-[%@ initWithString:]: null argument", this.className);
			return null;
		}

		let self = super.init();
		if (self) {
			self.$$jsString = aString.$$jsString;
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
		return this.initWithFormat_locale_arguments_(format, null, args);
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
		let values = args.map(element => element instanceof CPObject ? objj_propGuard(element, 'description', 'jsString') : element);
		return this.initWithString_(new CPString(vsprintf(formatString, values)));
	}

	//! @typed id : @ignored
	copyWithZone_(zone) {
		// cocoa just returns the same object, so we'll do the same
		return this;
	}
}
