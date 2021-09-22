const express = require('express');
const app = express();
const moment = require('moment');
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const RunningShift = require('./models/RunningShift.model');
const Shift = require('./models/Shift.model');
const Employee = require('./models/Employee.model');
const e = require('cors');

const { reportLiveStatus } = require('./utils/esp32.util');

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});


io.on('connection', async (socket) => {
    console.log('A station connected');

    // event name - report-live-status
    // data = {
    //     stationId: 'S1',
    //     tagId: 'nfklvks72y394inl',
    //     dateTime: '12-09-21 21:45',
    //     detected: true
    // }

    socket.on('report-live-status', (data) => {
        console.log(data);
        reportLiveStatus(data);
    });
});



server.listen(3000, () => {
    console.log('listening on *:3000');
});
