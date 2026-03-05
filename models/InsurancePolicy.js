const mongoose = require('mongoose');

const insurancePolicySchema = new mongoose.Schema({
    insurancePolicyNumber: { type: Number, required: true, unique: true },
    policyLevel:           { type: String },
    coverageAmount:        { type: Number, required: true },
    insuranceStartDate:    { type: Date },
    insuranceExpiration:   { type: Date }
}, { collection: 'insurancePolicies' });

module.exports = mongoose.model('InsurancePolicy', insurancePolicySchema);
