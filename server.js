const express = require('express');
const http = require('http');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: '*' }, allowEIO3: true });
const moment = require('moment');
var mqtt = require('mqtt');

// MQTT CLIENT CONFIG
const host = '192.168.1.23'
const port = '1883'
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;

const connectUrl = `mqtt://${host}:${port}`
const mainTopic = '/nodejs/mqtt'
const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    username: 'emqx',
    password: 'public',
    reconnectPeriod: 1000,
});

const RunningShift = require('./models/RunningShift.model');
const Shift = require('./models/Shift.model');
const Employee = require('./models/Employee.model');
const map = require('./utils/constants');

const { reportLiveStatus } = require('./utils/esp32.util');
const { initialConnection, updateDashboard } = require('./utils/dashboard.util');
const { init, update } = require('./models/RunningShift.model');


const connectDB = require('./utils/db');
const e = require('express');
connectDB();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

app.post('/report-live-status', async (req, res) => {
    try {
        const data = req.body;
        console.log(data);
        const runningShift = await reportLiveStatus(data);
        updateDash(runningShift);
        return res.status(200).json({
            success: true,
        });
    } catch (err) {
        console.log(err);
        return res.status(503).json({
            success: false
        });
    }
});

// // MQTT CONFIG
client.on('connect', () => {
    console.log('Connected')
    client.subscribe([mainTopic], () => {
        console.log(`Subscribe to topic '${topic}'`)
    })
})
client.on('message', (topic, payload) => {
    let inStr = payload.toString().replaceAll("'", "\"");
    console.log('Received Message:', topic, JSON.parse(inStr));

    if(topic == mainTopic) {
        const { time, stationId, tags } = JSON.parse(inStr);
        let tag = tags.map(tag => {
            if(tag.tagId == map[stationId]) return tag;
        });
        tag = tag[0];
        const { tagId, rssi } = tag;
        let detected;
        if(Math.abs(rssi) < map['threshold']) detected = true;
        else false;
        // const newTime = 

        const data = {
            dateTimeString : time,
            stationId : stationId,
            tagId : tagId,
            detected : detected,
            rssi: rssi
        }

        const runningShift = await reportLiveStatus(data);
        updateDash(runningShift);
    }
});

// UPDATES DASH WITH EMPLOYEE DATA INCOMING FROM ESP32
const updateDash = (runningShift) => {
    io.emit('dashboard-update', { 'runningShift': runningShift });
}

server.listen(process.env.PORT || 3000, () => {
    console.log('listening on *:3000');
});


// SOCKET CONFIG
io.on('connection', async (socket) => {
    console.log('A station connected');

    socket.on('error', console.error);

    // event name -> report-live-status
    // data = {
    //     stationId: 'STATION1',
    //     tagId: 'nfklvks72y394inl',
    //     dateTime: '12-09-21 21:45:10',
    //     detected: true,
    //     rssi: 90,
    // }
    socket.on('report-live-status', (data) => {
        updateDash(data);
        const empData = reportLiveStatus(data);
    });


    // event name -> initial-connection-dashboard
    // data = {
    //     clientId: 'KJVKLBLSK89'
    // }
    socket.on('initial-connection-dashboard', async (data) => {
        console.log(data);

        socket.join(data.clientId);

        const runningShift = await initialConnection(data);

        io.to(data.clientId).emit('running-shift-data', { 'runningShift': runningShift });
    });


    socket.on('test-conn', (data) => {
        console.log(data);
    });

    socket.on('disconnect', () => {
        console.log('station disconnected');
    })


});

// {
//     "stationId" : "STATION1",
//     "time": "12-11-2021-11:24:12",
//     "tags": [
//         {
//             "tagId": "TAG 1",
//             "rssi": 81
//         },
//         {
//             "tagId": "TAG 2",
//             "rssi": 40
//         },
//     ]
// }