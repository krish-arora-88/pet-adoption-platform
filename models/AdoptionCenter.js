const mongoose = require('mongoose');

const adoptionCenterSchema = new mongoose.Schema({
    centerLicenseNumber: { type: Number, required: true, unique: true },
    centerName:          { type: String },
    address:             { type: String },
    animalCapacity:      { type: Number }
}, { collection: 'adoptionCenters' });

module.exports = mongoose.model('AdoptionCenter', adoptionCenterSchema);
