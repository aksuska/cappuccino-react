/*
 * Module that specifies the CPObject protocol.
 */

const ProtocolSym = require("./Protocol"), Protocol = ProtocolSym;

const CPObjectP = new Protocol('CPObject');

CPObjectP.addSelector_isRequired_isClassMethod('class', true, true);
CPObjectP.addSelector_isRequired_isClassMethod('class', true, false);
CPObjectP.addProperty_isRequired_onClass('superclass', true, true);
CPObjectP.addProperty_isRequired_onClass('superclass', true, false);
CPObjectP.addSelector_isRequired_isClassMethod('isEqual:', true, true);
CPObjectP.addSelector_isRequired_isClassMethod('isEqual:', true, false);
CPObjectP.addProperty_isRequired_onClass('hash', true, true);
CPObjectP.addProperty_isRequired_onClass('hash', true, false);
CPObjectP.addSelector_isRequired_isClassMethod('self', true, true);
CPObjectP.addSelector_isRequired_isClassMethod('self', true, false);
CPObjectP.addSelector_isRequired_isClassMethod('isKindOfClass:', true, true);
CPObjectP.addSelector_isRequired_isClassMethod('isKindOfClass:', true, false);
CPObjectP.addSelector_isRequired_isClassMethod('isMemberOfClass:', true, false);
CPObjectP.addSelector_isRequired_isClassMethod('respondsToSelector:', true, true);
CPObjectP.addSelector_isRequired_isClassMethod('respondsToSelector:', true, false);
CPObjectP.addSelector_isRequired_isClassMethod('conformsToProtocol:', true, true);
CPObjectP.addSelector_isRequired_isClassMethod('conformsToProtocol:', true, false);
CPObjectP.addProperty_isRequired_onClass('description', true, true);
CPObjectP.addProperty_isRequired_onClass('description', true, false);
CPObjectP.addProperty_isRequired_onClass('debugDescription', false, true);
CPObjectP.addProperty_isRequired_onClass('debugDescription', false, false);
CPObjectP.addSelector_isRequired_isClassMethod('performSelector:', true, true);
CPObjectP.addSelector_isRequired_isClassMethod('performSelector:', true, false);
CPObjectP.addSelector_isRequired_isClassMethod('performSelector:withObject:', true, true);
CPObjectP.addSelector_isRequired_isClassMethod('performSelector:withObject:', true, false);
CPObjectP.addSelector_isRequired_isClassMethod('performSelector:withObject:withObject:', true, true);
CPObjectP.addSelector_isRequired_isClassMethod('performSelector:withObject:withObject:', true, false);
CPObjectP.addSelector_isRequired_isClassMethod('isProxy', true, false);
exports.CPObjectP = CPObjectP;
