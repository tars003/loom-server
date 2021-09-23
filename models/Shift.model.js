const mongoose = require('mongoose');

const ShiftSchema = mongoose.Schema({
    name: String,
    startTime: String,
    endTime: String,
    employees: [String,]
});

module.exports = mongoose.model("shift", ShiftSchema);