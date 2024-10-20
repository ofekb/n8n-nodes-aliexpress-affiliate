"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToDateTime = void 0;
const luxon_1 = require("luxon");
const convertToDateTime = (value) => {
    let converted;
    if (typeof value === 'string') {
        converted = luxon_1.DateTime.fromJSDate(new Date(value));
        if (converted.invalidReason !== null) {
            return;
        }
    }
    else if (value instanceof Date) {
        converted = luxon_1.DateTime.fromJSDate(value);
    }
    else if (luxon_1.DateTime.isDateTime(value)) {
        converted = value;
    }
    return converted;
};
exports.convertToDateTime = convertToDateTime;
//# sourceMappingURL=utils.js.map