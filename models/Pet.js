const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    petMicrochipID: { type: Number, required: true, unique: true },
    name:           { type: String },
    age:            { type: Number },
    breed:          { type: String, required: true },
    gender:         { type: String },
    speciesName:    { type: String }
}, { collection: 'pets' });

petSchema.index({ speciesName: 1 });

module.exports = mongoose.model('Pet', petSchema);
