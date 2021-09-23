const express = require('express');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const RunningShift = require('./models/RunningShift.model');
const Shift = require('./models/Shift.model');
const Employee = require('./models/Employee.model');

const { reportLiveStatus } = require('./utils/esp32.util');
const { initialConnection, updateDashboard } = require('./utils/dashboard.util');
const { init, update } = require('./models/RunningShift.model');

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});
const app = express();
const moment = require('moment');
const http = require('http');


io.on('connection', async (socket) => {
    console.log('A station connected');

    // event name -> report-live-status
    // data = {
    //     stationId: 'S1',
    //     tagId: 'nfklvks72y394inl',
    //     dateTime: '12-09-21 21:45',
    //     detected: true
    // }
    socket.on('report-live-status', (data) => {
        console.log(data);
        const empData = reportLiveStatus(data);

        updateDash(empData);
    });

    // event name -> initial-connection-dashboard
    // data = {
    //     clientId: 'KJVKLBLSK89'
    // }
    socket.on('initial-connection-dashboard', (data) => {
        console.log(data);
        initialConnection(data);
    })
});

// UPDATES DASH WITH EMPLOYEE DATA INCOMING FROM ESP32
const updateDash = (data) => {
    io.emit('dashboard-update', data);
}

server.listen(3000, () => {
    console.log('listening on *:3000');
});
