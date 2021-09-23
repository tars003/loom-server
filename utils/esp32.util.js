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
    const date = dateTimeString.split(' ')[0];
    const time = dateTimeString.split(' ')[1];
    let Emp = await Employee.find({ tagId: tagId });
    Emp = Emp[0];
    // console.log('Emp', Emp);
    let employeesObj = [];
    let employees = [];
    let employee = {};
    let empIndex = -1;
    let runningShiftObj = {};
    let shiftObj = {};
    
    const foundShift = await findShift(time);
    console.log('found shift', foundShift);
    const runningShift = await RunningShift.find({ date: date, shiftId: foundShift.id });
    console.log('running shift', runningShift);
    // RUNNING SHIFT FOUND
    if (runningShift.length > 0) {
        runningShiftObj = runningShift[0];
        employeesObj = runningShiftObj.employees;
        // console.log('runningshiftobj', runningShiftObj);
        // console.log('employees', employeesObj);
        employees = employeesObj.map(emp => {
            return emp.id;
        });
    }
    // RUNNING SHIFT NOT FOUND
    else {
        const empList = foundShift.employees.map(empId => {
            const empData = {
                _id: empId,
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
            shiftId: foundShift.id,
            employees: empList
        });
        employees = shiftObj.employees;
        employeesObj = empList;
    }

    // Filtering out employee object from shift list
    employee = employeesObj.filter(emp => emp.id == Emp.id);
    employee = employee[0];
    console.log('employeeObj', employeesObj);
    console.log('employee', employee);
    // IF FOUND UPDATING THE VALUES
    if (employee) {
        if (detected) {
            employee['activeTime'] += 10;
            employee['status'] = true;
        } else {
            employee['awayTime'] += 10;
            employee['status'] = false;
        }
        const newList =  employeesObj.map(emp => {
            console.log('emp.id', emp.id);
            console.log('employee.id', employee.id);
            if(emp.id == employee.id) return employee;
            else return emp;
        });
        console.log('empObject', employeesObj);
        console.log('newList', newList);
        const newRunningShift = await RunningShift.findById(runningShiftObj.id);
        newRunningShift['employees'] = newList;
        await newRunningShift.save();

        return employee;
    }
}

module.exports = { reportLiveStatus };