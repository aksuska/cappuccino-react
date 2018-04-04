'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CPDictionary = exports.CPInvocation = exports.CPMethodSignature = exports.CPInvalidArgumentException = exports.CPException = exports.CPString = exports.CPObject = exports.CPStringFromSelector = exports.CPSelectorFromString = undefined;

var _CPObject = require('./CPObject');

Object.defineProperty(exports, 'CPObject', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_CPObject).default;
  }
});

var _CPException = require('./CPException');

Object.defineProperty(exports, 'CPException', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_CPException).default;
  }
});
Object.defineProperty(exports, 'CPInvalidArgumentException', {
  enumerable: true,
  get: function () {
    return _CPException.CPInvalidArgumentException;
  }
});

var _CPMethodSignature = require('./CPMethodSignature');

Object.defineProperty(exports, 'CPMethodSignature', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_CPMethodSignature).default;
  }
});

var _CPInvocation = require('./CPInvocation');

Object.defineProperty(exports, 'CPInvocation', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_CPInvocation).default;
  }
});

var _CPDictionary = require('./CPDictionary');

Object.defineProperty(exports, 'CPDictionary', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_CPDictionary).default;
  }
});

var _CPString = require('./CPString');

var _CPString2 = _interopRequireDefault(_CPString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const CPSelectorFromString = exports.CPSelectorFromString = selString => selString.jsString(); /**
                                                                                                * Single-point import for Foundation framework
                                                                                                **/

// we have to import these since we use them
const CPStringFromSelector = exports.CPStringFromSelector = selector => new _CPString2.default(selector);

/*
 * object exports
*/

exports.CPString = _CPString2.default;
//# sourceMappingURL=Foundation.js.map