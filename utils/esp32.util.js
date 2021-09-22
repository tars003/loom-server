const moment = require('moment');

const RunningShift = require('../models/RunningShift.model');
const Shift = require('../models/Shift.model');
const Employee = require('../models/Employee.model');
const e = require('cors');


const reportLiveStatus = async (data) => {
    console.log(data);
    const {
        dateTimeString,
        stationId,
        tagId,
        detected
    } = data;
    const dateTime = moment('DD-MM-YY HH:mm', dateTimeString);
    const date = dateTime.split(' ')[0];
    const time = dateTime.split(' ')[1];
    const Emp = await Employee.find({ tagId: tagId });
    let employeesObj = [];
    let employees = [];
    let employee = {};
    let empIndex = -1;
    let runningShiftObj = {};
    let shiftObj = {};

    const runningShifts = await RunningShift.find({ date: date });
    const foundShifts = runningShifts.map(async (rs) => {
        const shift = await Shift.findById(rs.shiftId);
        if (isShiftValid(shift.startTime, shiftendTime, time)) {
            shiftObj = shift;
            return rs;
        }
    });
    // RUNNING SHIFT FOUND
    if (foundShifts.length > 0) {
        runningShiftObj = foundShifts[0];
        employeesObj = runningShiftObj.employees;
        employees = employeesObj.map(emp => {
            return emp.id;
        });
    }
    // RUNNING SHIFT NOT FOUND
    else {
        const empList = shiftObj.employees.map(empId => {
            const empData = {
                activeTime: 0,
                awayTime: 0,
                idealTime: 0,
                reportedTime: 'NA',
                status: false
            };
            return empData;
        })
        runningShiftObj = await RunningShift.create({
            date: date,
            shiftId: findShift(time),
            employees: empList
        });
        employees = shiftObj.employees;
        employeesObj = empList;
    }

    // employee = employeesObj.filter(emp => emp.id == Emp.id);
    employee = employeesObj.map((emp, index) => {
        if (emp.id == Emp.id) {
            empIndex = index;
            return emp;
        }
    });
    employee = employee[0];
    if (employee.length > 0) {
        if (detected) {
            employee['activeTime'] += 10;
            employee['status'] = true;
        } else {
            employee['awayTime'] += 10;
            employee['status'] = false;
        }
        employeesObj[empIndex] = employee;
        const newRunningShift = await RunningShift.findById(runningShiftObj.id);
        newRunningShift['employees'] = employeesObj;
        await newRunningShift.save();
    }
}


const isShiftValid = async(startTime, endTime, time) => {
    var start = moment('HH:mm', startTime);
    var end = moment('HH:mm', endTime);
    var time = moment('HH:mm', time);

    if(time.diff(start) > 0 && time.diff(end) < 0) {
        return true
    }
    else return false;
}

const findShift = async (time) => {
    const shifts = await Shift.find();
    const foundShift = shifts.map(shift => {
        if(time.diff(shift.startTime) > 0 && time.diff(shift.endTime) < 0) 
            return shift
    })
    return foundShift[0];
}

module.exports = { reportLiveStatus };