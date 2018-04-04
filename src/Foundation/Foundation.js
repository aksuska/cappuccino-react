/**
 * Single-point import for Foundation framework
 **/

// we have to import these since we use them
import CPString from './CPString';


export const CPSelectorFromString = (selString) => selString.jsString();
export const CPStringFromSelector = (selector) => new CPString(selector);


/*
 * object exports
*/

export {default as CPObject} from './CPObject';
export {CPString};
export {default as CPException, CPInvalidArgumentException} from './CPException';
export {default as CPMethodSignature} from "./CPMethodSignature";
export {default as CPInvocation} from './CPInvocation';
export {default as CPDictionary} from "./CPDictionary";
