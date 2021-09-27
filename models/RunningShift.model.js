const mongoose = require('mongoose');

const Runningshift = mongoose.Schema({
    shiftId: mongoose.Schema.Types.ObjectId,
    date: String,
    employees: [
        {
            _id: String,
            name: String,
            stationId: String,
            activeTime: Number,
            awayTime: Number,
            idealTime: Number,
            reportedTime: String,
            status: Boolean
        }
    ]
});

module.exports = mongoose.model("runningShift", Runningshift);