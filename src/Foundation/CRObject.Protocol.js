/*
 * Module that specifies the CRObject protocol.
 */

const ProtocolSym = require("./Protocol"), Protocol = ProtocolSym.Protocol, ProtocolRegistry = ProtocolSym.ProtocolRegistry;

const CRObjectP = new Protocol('CRObject');
ProtocolRegistry.registerProtocol(CRObjectP);
CRObjectP.addSelector_isRequired_isClassMethod('class', true, true);
CRObjectP.addSelector_isRequired_isClassMethod('class', true, false);
CRObjectP.addProperty_isRequired_onClass('superclass', true, true);
CRObjectP.addProperty_isRequired_onClass('superclass', true, false);
CRObjectP.addSelector_isRequired_isClassMethod('isEqual:', true, true);
CRObjectP.addSelector_isRequired_isClassMethod('isEqual:', true, false);
CRObjectP.addProperty_isRequired_onClass('hash', true, true);
CRObjectP.addProperty_isRequired_onClass('hash', true, false);
CRObjectP.addSelector_isRequired_isClassMethod('self', true, true);
CRObjectP.addSelector_isRequired_isClassMethod('self', true, false);
CRObjectP.addSelector_isRequired_isClassMethod('isKindOfClass:', true, true);
CRObjectP.addSelector_isRequired_isClassMethod('isKindOfClass:', true, false);
CRObjectP.addSelector_isRequired_isClassMethod('isMemberOfClass:', true, false);
CRObjectP.addSelector_isRequired_isClassMethod('respondsToSelector:', true, true);
CRObjectP.addSelector_isRequired_isClassMethod('respondsToSelector:', true, false);
CRObjectP.addSelector_isRequired_isClassMethod('conformsToProtocol:', true, true);
CRObjectP.addSelector_isRequired_isClassMethod('conformsToProtocol:', true, false);
CRObjectP.addProperty_isRequired_onClass('description', true, true);
CRObjectP.addProperty_isRequired_onClass('description', true, false);
CRObjectP.addProperty_isRequired_onClass('debugDescription', false, true);
CRObjectP.addProperty_isRequired_onClass('debugDescription', false, false);
CRObjectP.addSelector_isRequired_isClassMethod('performSelector:', true, true);
CRObjectP.addSelector_isRequired_isClassMethod('performSelector:', true, false);
CRObjectP.addSelector_isRequired_isClassMethod('performSelector:withObject:', true, true);
CRObjectP.addSelector_isRequired_isClassMethod('performSelector:withObject:', true, false);
CRObjectP.addSelector_isRequired_isClassMethod('performSelector:withObject:withObject:', true, true);
CRObjectP.addSelector_isRequired_isClassMethod('performSelector:withObject:withObject:', true, false);
CRObjectP.addSelector_isRequired_isClassMethod('isProxy', true, false);
exports.CRObjectP = CRObjectP;
