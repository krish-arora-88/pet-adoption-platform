const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
    petMicrochipID:        { type: Number, required: true },
    recordID:              { type: Number, required: true },
    insurancePolicyNumber: { type: Number },
    vaccinationStatus:     { type: String },
    healthCondition:       { type: String },
    vetNotes:              { type: String }
}, { collection: 'medicalRecords' });

medicalRecordSchema.index({ petMicrochipID: 1, recordID: 1 }, { unique: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
