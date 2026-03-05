const { z } = require('zod');

// Helper: coerce empty strings to undefined for optional numbers
const optionalNumber = z.preprocess(
    val => (val === '' || val === null || val === undefined) ? undefined : val,
    z.coerce.number().optional()
);

// --- Pet ---
const insertPetSchema = z.object({
    MicrochipID: z.coerce.number({ required_error: 'MicrochipID is required' }),
    Name: z.string().optional(),
    Age: optionalNumber,
    Breed: z.string().min(1, 'Breed is required'),
    Gender: z.string().optional(),
    SpeciesName: z.string().optional()
});

// --- Client ---
const insertClientSchema = z.object({
    FirstName: z.string().min(1, 'FirstName is required'),
    LastName: z.string().optional(),
    ClientAddress: z.string().min(1, 'ClientAddress is required'),
    ClientContact: z.string().optional()
});

const updateClientSchema = z.object({
    clientId: z.coerce.number({ required_error: 'clientId is required' }),
    FirstName: z.string().optional(),
    LastName: z.string().optional(),
    ClientAddress: z.string().optional(),
    ClientContact: z.string().optional()
});

// --- Veterinarian ---
const insertVetSchema = z.object({
    VetLicenseNumber: z.coerce.number({ required_error: 'VetLicenseNumber is required' }),
    Name: z.string().min(1, 'Name is required'),
    ClinicName: z.string().optional(),
    ContactNumber: z.string().optional(),
    EmailAddress: z.string().email('Invalid email address').optional().or(z.literal(''))
});

const updateVetSchema = z.object({
    VetLicenseNumber: z.coerce.number({ required_error: 'VetLicenseNumber is required' }),
    Name: z.string().optional(),
    ClinicName: z.string().optional(),
    ContactNumber: z.string().optional(),
    EmailAddress: z.string().email('Invalid email address').optional().or(z.literal(''))
});

// --- Adoption Center ---
const insertAdoptionCenterSchema = z.object({
    CenterLicenseNumber: z.coerce.number({ required_error: 'CenterLicenseNumber is required' }),
    CenterName: z.string().optional(),
    Address: z.string().optional(),
    AnimalCapacity: optionalNumber
});

const updateAdoptionCenterSchema = z.object({
    CenterLicenseNumber: z.coerce.number({ required_error: 'CenterLicenseNumber is required' }),
    CenterName: z.string().optional(),
    Address: z.string().optional(),
    AnimalCapacity: optionalNumber
});

// --- Adoption ---
const insertAdoptionSchema = z.object({
    PetMicrochipID: z.coerce.number({ required_error: 'PetMicrochipID is required' }),
    AdoptionDate: z.string().optional(),
    ClientID: optionalNumber,
    CenterLicenseNumber: optionalNumber
});

const updateAdoptionSchema = z.object({
    PetMicrochipID: z.coerce.number({ required_error: 'PetMicrochipID is required' }),
    AdoptionDate: z.string().optional(),
    ClientID: optionalNumber,
    CenterLicenseNumber: optionalNumber
});

// --- Species ---
const insertSpeciesSchema = z.object({
    speciesName: z.string().min(1, 'speciesName is required'),
    housingSpace: z.string().optional(),
    groomingRoutine: z.string().optional(),
    dietType: z.string().optional()
});

const updateSpeciesSchema = z.object({
    speciesName: z.string().min(1, 'speciesName is required'),
    housingSpace: z.string().optional(),
    groomingRoutine: z.string().optional(),
    dietType: z.string().optional()
});

const deleteSpeciesSchema = z.object({
    speciesName: z.string().min(1, 'speciesName is required')
});

// --- Insurance Policy ---
const insertInsurancePolicySchema = z.object({
    InsurancePolicyNumber: z.coerce.number({ required_error: 'InsurancePolicyNumber is required' }),
    PolicyLevel: z.string().optional(),
    CoverageAmount: z.coerce.number({ required_error: 'CoverageAmount is required' }),
    InsuranceStartDate: z.string().optional(),
    InsuranceExpiration: z.string().optional()
});

// --- Medical Record ---
const insertMedicalRecordSchema = z.object({
    PetMicrochipID: z.coerce.number({ required_error: 'PetMicrochipID is required' }),
    RecordID: z.coerce.number({ required_error: 'RecordID is required' }),
    InsurancePolicyNumber: optionalNumber,
    VaccinationStatus: z.string().optional(),
    HealthCondition: z.string().optional(),
    VetNotes: z.string().optional()
});

// --- View/Query endpoints ---
const viewPetMedicalSchema = z.object({
    PetMicrochipID: z.coerce.number({ required_error: 'PetMicrochipID is required' })
});

const vetTableProjectSchema = z.object({
    selectors: z.string().min(1, 'selectors is required')
});

// --- Auth ---
const registerSchema = z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['user', 'admin']).optional()
});

const loginSchema = z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(1, 'Password is required')
});

// --- GET query param schemas ---
const petTableQuerySchema = z.object({
    species: z.string().optional(),
    minAge: z.coerce.number().optional(),
    maxAge: z.coerce.number().optional()
}).passthrough();

const querySpeciesQuerySchema = z.object({
    minCount: z.coerce.number().optional()
}).passthrough();

module.exports = {
    insertPetSchema, insertClientSchema, updateClientSchema,
    insertVetSchema, updateVetSchema,
    insertAdoptionCenterSchema, updateAdoptionCenterSchema,
    insertAdoptionSchema, updateAdoptionSchema,
    insertSpeciesSchema, updateSpeciesSchema, deleteSpeciesSchema,
    insertInsurancePolicySchema, insertMedicalRecordSchema,
    viewPetMedicalSchema, vetTableProjectSchema,
    registerSchema, loginSchema,
    petTableQuerySchema, querySpeciesQuerySchema
};
