const mongoose = require('mongoose');

const adoptionSchema = new mongoose.Schema({
    petMicrochipID:      { type: Number, required: true, unique: true },
    adoptionDate:        { type: Date },
    clientID:            { type: Number },
    centerLicenseNumber: { type: Number }
}, { collection: 'adoptions' });

module.exports = mongoose.model('Adoption', adoptionSchema);
