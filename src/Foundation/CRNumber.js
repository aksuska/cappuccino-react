/*
 * Module that contains NSNumber class emulation and related symbols. We maintain a has-a relationship with a native JS number primitive.
 **/

const OBJJ = require('../Objective-J'), objj_propGuard = OBJJ.objj_propGuard, objj_initialize = OBJJ.objj_initialize;
const CRObjectSym = require('./CRObject'), CRObject = CRObjectSym.CRObject;

const kCRTypeFormatSpecifiers = {B: '%d', D: '%0.16g', F: '%0.7g', I: '%i', L: '%li', LL: '%lli', S: '%hi', U: '%u', UL: '%lu', ULL: '%llu', US: '%hu'};

//! NSString Cocoa Foundation class emulation
class CRNumber extends CRObject {

	$jsNumber = null;
	$type = null;

	constructor(value, type = 'I') {
		super();
		if (value !== null && value !== undefined)
		{
			if (typeof value === 'string') {
				value  = value.charCodeAt(0);
				if (isNaN(value)) value = 0;
			}
			else if (typeof value === 'boolean')
				type = 'B';
			else if (value.toString().includes('.'))
				type = 'D';
			this.$jsNumber = value;
			this.$type = type.toUpperCase();
		}
	}

}

