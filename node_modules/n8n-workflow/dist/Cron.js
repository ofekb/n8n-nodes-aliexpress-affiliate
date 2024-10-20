"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCronExpression = void 0;
const randomSecond = () => Math.floor(Math.random() * 60).toString();
const toCronExpression = (item) => {
    if (item.mode === 'everyMinute')
        return `${randomSecond()} * * * * *`;
    if (item.mode === 'everyHour')
        return `${randomSecond()} ${item.minute} * * * *`;
    if (item.mode === 'everyX') {
        if (item.unit === 'minutes')
            return `${randomSecond()} */${item.value} * * * *`;
        if (item.unit === 'hours')
            return `${randomSecond()} 0 */${item.value} * * *`;
    }
    if (item.mode === 'everyDay')
        return `${randomSecond()} ${item.minute} ${item.hour} * * *`;
    if (item.mode === 'everyWeek')
        return `${randomSecond()} ${item.minute} ${item.hour} * * ${item.weekday}`;
    if (item.mode === 'everyMonth')
        return `${randomSecond()} ${item.minute} ${item.hour} ${item.dayOfMonth} * *`;
    return item.cronExpression.trim();
};
exports.toCronExpression = toCronExpression;
//# sourceMappingURL=Cron.js.map