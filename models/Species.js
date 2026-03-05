const mongoose = require('mongoose');

const speciesSchema = new mongoose.Schema({
    speciesName:          { type: String, required: true, unique: true },
    housingSpaceRequired: { type: String },
    groomingRoutine:      { type: String },
    dietType:             { type: String }
}, { collection: 'species' });

module.exports = mongoose.model('Species', speciesSchema);
