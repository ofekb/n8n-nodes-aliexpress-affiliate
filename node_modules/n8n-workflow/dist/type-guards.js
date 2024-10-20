"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidResourceLocatorParameterValue = exports.isINodePropertyCollectionList = exports.isINodePropertyOptionsList = exports.isINodePropertiesList = exports.isINodePropertyCollection = exports.isINodePropertyOptions = exports.isINodeProperties = void 0;
const isINodeProperties = (item) => 'name' in item && 'type' in item && !('value' in item);
exports.isINodeProperties = isINodeProperties;
const isINodePropertyOptions = (item) => 'value' in item && 'name' in item && !('displayName' in item);
exports.isINodePropertyOptions = isINodePropertyOptions;
const isINodePropertyCollection = (item) => 'values' in item && 'name' in item && 'displayName' in item;
exports.isINodePropertyCollection = isINodePropertyCollection;
const isINodePropertiesList = (items) => Array.isArray(items) && items.every(exports.isINodeProperties);
exports.isINodePropertiesList = isINodePropertiesList;
const isINodePropertyOptionsList = (items) => Array.isArray(items) && items.every(exports.isINodePropertyOptions);
exports.isINodePropertyOptionsList = isINodePropertyOptionsList;
const isINodePropertyCollectionList = (items) => {
    return Array.isArray(items) && items.every(exports.isINodePropertyCollection);
};
exports.isINodePropertyCollectionList = isINodePropertyCollectionList;
const isValidResourceLocatorParameterValue = (value) => {
    if (typeof value === 'object') {
        if (typeof value.value === 'number') {
            return true;
        }
        return !!value.value;
    }
    else {
        return !!value;
    }
};
exports.isValidResourceLocatorParameterValue = isValidResourceLocatorParameterValue;
//# sourceMappingURL=type-guards.js.map