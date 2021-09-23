const moment = require('moment');

const RunningShift = require('../models/RunningShift.model');
const Shift = require('../models/Shift.model');
const Employee = require('../models/Employee.model');

// time -> HH:mm  startTime -> HH:mm endTime -> HH:mm
const isShiftValid = async (startTime, endTime, time) => {
    var start = moment('HH:mm', startTime);
    var end = moment('HH:mm', endTime);
    var time = moment('HH:mm', time);

    if (time.diff(start) > 0 && time.diff(end) < 0) {
        return true
    }
    else return false;
}

// time -> HH:mm
const findShift = async (time) => {
    const shifts = await Shift.find();
    const foundShift = shifts.map(shift => {
        if (time.diff(shift.startTime) > 0 && time.diff(shift.endTime) < 0)
            return shift
    })
    return foundShift[0];
}

// time -> moment()
const findRunningShift = async (time) => {
    var dateTime = moment('DD-MM-YY HH:mm', time);
    var date = dateTime.split(' ')[0];
    var time = dateTime.split(' ')[1];

    const shift = findShift(time);
    const runningShift = await RunningShift.find({ date: date, shiftId: shift.id });

    return runningShift;

} 

module.exports = { isShiftValid, findShift }