const moment = require('moment');

const RunningShift = require('../models/RunningShift.model');
const Shift = require('../models/Shift.model');
const Employee = require('../models/Employee.model');

const { isShiftValid, findShift } = require('./shift.util');


// returns -> running shift employees object
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
        
        return employee;
    }
}




module.exports = { reportLiveStatus };