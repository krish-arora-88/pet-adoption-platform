const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    clientID:      { type: Number, required: true, unique: true },
    firstName:     { type: String, required: true },
    lastName:      { type: String },
    clientAddress: { type: String, required: true },
    clientContact: { type: String }
}, { collection: 'clients' });

module.exports = mongoose.model('Client', clientSchema);
