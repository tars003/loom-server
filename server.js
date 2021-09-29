const express = require('express');
const http = require('http');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: '*' }, allowEIO3: true });
const moment = require('moment');

app.use(cors());

const RunningShift = require('./models/RunningShift.model');
const Shift = require('./models/Shift.model');
const Employee = require('./models/Employee.model');

const { reportLiveStatus } = require('./utils/esp32.util');
const { initialConnection, updateDashboard } = require('./utils/dashboard.util');
const { init, update } = require('./models/RunningShift.model');


const connectDB = require('./utils/db');
connectDB();

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});


io.on('connection', async (socket) => {
    console.log('A station connected');

    io.emit('initial-message', "Connected !");

    socket.on('error', console.error);

    // event name -> report-live-status
    // data = {
    //     stationId: 'S1',
    //     tagId: 'nfklvks72y394inl',
    //     dateTime: '12-09-21 21:45:10',
    //     detected: true
    // }

    socket.on('message', data => console.log(data))

    socket.on('report-live-status', (data) => {
        console.log('Hello');
        console.log(data);

        updateDash(data);

        const empData = reportLiveStatus(data);

        // updateDash(empData);
    });

    // event name -> initial-connection-dashboard
    // data = {
    //     clientId: 'KJVKLBLSK89'
    // }
    socket.on('initial-connection-dashboard', async (data) => {
        console.log(data);

        socket.join(data.clientId);

        const runningShift = await initialConnection(data);

        io.to(data.clientId).emit('running-shift-data', {'runningShift' : runningShift});
    });

    // event name -> initial-connection-dashboard
    // data = {
    //     clientId: 'KJVKLBLSK89'
    // }
    socket.on('test-conn', (data) => {
        console.log(data);
    });


});

// UPDATES DASH WITH EMPLOYEE DATA INCOMING FROM ESP32
const updateDash = (data) => {
    io.emit('dashboard-update', data);
}

server.listen(process.env.PORT || 3000, () => {
    console.log('listening on *:3000');
});
