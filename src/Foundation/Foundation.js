/**
 * Single-point import for Foundation framework
 **/

// runtime imports
import objj_msgSend, {objj_propGuard} from '../Objective-J';
import Protocol from './Protocol';
// object imports
import CPObject from './CPObject';
import CPString from './CPString';
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

export {CPObject, CPString, CPException, CPInvalidArgumentException, CPMethodSignature, CPInvocation, CPDictionary, CPArray};

/*
 * Selector Function Exports
 */

export const CPSelectorFromString = (selString) => selString.jsString();
export const CPStringFromSelector = (selector) => new CPString(selector);

