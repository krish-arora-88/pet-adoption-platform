const mongoose = require('mongoose');

const veterinarianSchema = new mongoose.Schema({
    vetLicenseNumber: { type: Number, required: true, unique: true },
    name:             { type: String, required: true },
    clinicName:       { type: String },
    contactNumber:    { type: String },
    emailAddress:     { type: String }
}, { collection: 'veterinarians' });

module.exports = mongoose.model('Veterinarian', veterinarianSchema);
