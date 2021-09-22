const mongoose = require('mongoose');

const ShiftSchema = mongoose.Schema({
    name: String,
    startTime: String,
    endTime: String,
    employees: [mongoose.Schema.Types.ObjectId,]
});

module.exports = mongoose.model("shift", ShiftSchema);