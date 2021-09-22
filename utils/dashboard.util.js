const moment = require('moment');

const RunningShift = require('../models/RunningShift.model');
const Shift = require('../models/Shift.model');
const Employee = require('../models/Employee.model');

const {findRunningShift} = require('./shift.util');

const initalConnection = async (data) => {

    const runningShift = findRunningShift(getDateTime);

    return runningShift;

}


const getDateTime = () => {
    return moment();
}




module.exports = { initalConnection };