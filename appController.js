const express = require('express');
const appService = require('./appService');
const { requireAuth, requireAdmin } = require('./middleware/auth');
const { validate } = require('./middleware/validate');
const schemas = require('./validation/schemas');

const router = express.Router();

// ----------------------------------------------------------
// Database Connection
// ----------------------------------------------------------

router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testConnection();
    if (isConnect) {
        res.send('Connected');
    } else {
        res.send('unable to connect');
    }
});

// ----------------------------------------------------------
// Pet (PetMicrochipID, Name, Age, Breed, Gender, SpeciesName)
// ----------------------------------------------------------

router.get('/pet-table', validate(schemas.petTableQuerySchema, 'query'), async (req, res) => {
    const species = req.query.species;
    const minAge = req.query.minAge;
    const maxAge = req.query.maxAge;
    const tableContent = await appService.fetchPetTableFromDb(species, minAge, maxAge);
    res.json({ data: tableContent });
});

router.get('/get-pet-stats', async (req, res) => {
    const tableContent = await appService.fetchPetMaxAges();
    res.json({ data: tableContent });
});

router.post("/initiateNewPet", requireAuth, requireAdmin, async (req, res) => {
    const initiateResult = await appService.initiateNewPet();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-new-pet", validate(schemas.insertPetSchema), requireAuth, async (req, res) => {
    try {
        const { MicrochipID, Name, Age, Breed, Gender, SpeciesName } = req.body;
        const success = await appService.insertNewPet(MicrochipID, Name, Age, Breed, Gender, SpeciesName);
        res.json({ success });
    } catch (error) {
        console.error('Error inserting new pet:', error);
        res.status(500).json({ error: 'Error inserting new pet' });
    }
});

router.get('/species-age-stats', async (req, res) => {
    try {
        const data = await appService.fetchSpeciesAgeStats();
        res.json({ data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ----------------------------------------------------------
// Client (ClientID, FirstName, LastName, ClientAddress, ClientContact)
// ----------------------------------------------------------

router.get('/client-table', async (req, res) => {
    const tableContent = await appService.fetchClientTableFromDb();
    res.json({ data: tableContent });
});

router.post("/initiateNewClient", requireAuth, requireAdmin, async (req, res) => {
    const initiateResult = await appService.initiateNewClient();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-new-client", validate(schemas.insertClientSchema), requireAuth, async (req, res) => {
    const { FirstName, LastName, ClientAddress, ClientContact } = req.body;
    const insertResult = await appService.insertNewClient(FirstName, LastName, ClientAddress, ClientContact);
    if (insertResult !== false) {
        res.json({
            success: true,
            clientID: insertResult
        });
    } else {
        res.status(500).json({
            success: false,
            message: "Failed to create account"
        });
    }
});

router.post("/update-client", validate(schemas.updateClientSchema), requireAuth, async (req, res) => {
    const { clientId, FirstName, LastName, ClientAddress, ClientContact } = req.body;
    const updateResult = await appService.updateClient(clientId, FirstName, LastName, ClientAddress, ClientContact);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// ----------------------------------------------------------
// Veterinarian (VetLicenseNumber, Name, ClinicName, ContactNumber, EmailAddress)
// ----------------------------------------------------------

router.post("/insert-new-vet", validate(schemas.insertVetSchema), requireAuth, async (req, res) => {
    const { VetLicenseNumber, Name, ClinicName, ContactNumber, EmailAddress } = req.body;
    const insertResult = await appService.insertNewVet(VetLicenseNumber, Name, ClinicName, ContactNumber, EmailAddress);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, message: "Failed to register veterinarian" });
    }
});

router.get('/vet-table', async (req, res) => {
    const tableContent = await appService.fetchVetTableFromDb();
    res.json({ data: tableContent });
});

router.post("/initiateNewVet", requireAuth, requireAdmin, async (req, res) => {
    const initiateResult = await appService.initiateNewVet();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/update-vet", validate(schemas.updateVetSchema), requireAuth, async (req, res) => {
    const { VetLicenseNumber, Name, ClinicName, ContactNumber, EmailAddress } = req.body;
    const updateResult = await appService.updateVet(VetLicenseNumber, Name, ClinicName, ContactNumber, EmailAddress);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/view-pet-medical", validate(schemas.viewPetMedicalSchema), requireAuth, async (req, res) => {
    const { PetMicrochipID } = req.body;
    const tableContent = await appService.fetchPetMedical(PetMicrochipID);
    res.json({ data: tableContent });
});

router.post("/vet-table-project", validate(schemas.vetTableProjectSchema), requireAuth, async (req, res) => {
    const { selectors } = req.body;
    const tableContent = await appService.fetchVetProject(selectors);
    res.json({ data: tableContent });
});

// ----------------------------------------------------------
// Adoption Center (CenterLicenseNumber, CenterName, Address, AnimalCapacity)
// ----------------------------------------------------------

router.post("/initiateNewAdoptionCenter", requireAuth, requireAdmin, async (req, res) => {
    const initiateResult = await appService.initiateNewAdoptionCenter();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get("/adoption-center-table", async (req, res) => {
    const tableContent = await appService.fetchAdoptionCenterTableFromDb();
    res.json({ data: tableContent });
});

router.post("/insert-new-adoption-center", validate(schemas.insertAdoptionCenterSchema), requireAuth, async (req, res) => {
    const { CenterLicenseNumber, CenterName, Address, AnimalCapacity } = req.body;
    const insertResult = await appService.insertNewAdoptionCenter(CenterLicenseNumber, CenterName, Address, AnimalCapacity);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, message: "Failed to create adoption center" });
    }
});

router.post("/update-adoption-center", validate(schemas.updateAdoptionCenterSchema), requireAuth, async (req, res) => {
    const { CenterLicenseNumber, CenterName, Address, AnimalCapacity } = req.body;
    const updateResult = await appService.updateAdoptionCenter(CenterLicenseNumber, CenterName, Address, AnimalCapacity);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// ----------------------------------------------------------
// Adoption (PetMicrochipID, AdoptionDate, ClientID, CenterLicenseNumber)
// ----------------------------------------------------------

router.get('/adoption-table', async (req, res) => {
    const tableContent = await appService.fetchAdoptionTableFromDb();
    res.json({ data: tableContent });
});

router.post("/initiateNewAdoption", requireAuth, requireAdmin, async (req, res) => {
    const initiateResult = await appService.initiateNewAdoption();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-new-adoption", validate(schemas.insertAdoptionSchema), requireAuth, async (req, res) => {
    const { PetMicrochipID, AdoptionDate, ClientID, CenterLicenseNumber } = req.body;
    const insertResult = await appService.insertNewAdoption(PetMicrochipID, AdoptionDate, ClientID, CenterLicenseNumber);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false, message: "Failed to create adoption record" });
    }
});

router.post("/update-adoption", validate(schemas.updateAdoptionSchema), requireAuth, async (req, res) => {
    const { PetMicrochipID, AdoptionDate, ClientID, CenterLicenseNumber } = req.body;
    const updateResult = await appService.updateAdoption(PetMicrochipID, AdoptionDate, ClientID, CenterLicenseNumber);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/query-species', validate(schemas.querySpeciesQuerySchema, 'query'), async (req, res) => {
    const minCount = parseInt(req.query.minCount, 10) || 0;
    try {
        const rows = await appService.getSpeciesWithMinPets(minCount);
        res.json({ data: rows });
    } catch (error) {
        console.error("Error executing aggregation query:", error);
        res.status(500).json({ error: "Error executing query" });
    }
});

// ----------------------------------------------------------
// Species (speciesName, HousingSpaceRequired, GroomingRoutine, DietType)
// ----------------------------------------------------------

router.get('/species-list', async (req, res) => {
    try {
        const rows = await appService.fetchSpeciesList();
        res.json(rows);
    } catch (error) {
        console.error('Error fetching species:', error);
        res.status(500).json({ error: 'Error fetching species' });
    }
});

router.post('/insert-new-species', validate(schemas.insertSpeciesSchema), requireAuth, async (req, res) => {
    try {
        const { speciesName, housingSpace, groomingRoutine, dietType } = req.body;
        const success = await appService.insertNewSpecies(speciesName, housingSpace, groomingRoutine, dietType);
        res.json({ success });
    } catch (error) {
        console.error('Error inserting new species:', error);
        res.status(500).json({ error: 'Error inserting species' });
    }
});

router.post('/initiateNewSpecies', requireAuth, requireAdmin, async (req, res) => {
    try {
        const success = await appService.initiateSpeciesTable();
        res.json({ success });
    } catch (error) {
        console.error("Error initiating species table:", error);
        res.status(500).json({ error: "Error initiating species table" });
    }
});

router.post('/clearSpeciesTable', requireAuth, requireAdmin, async (req, res) => {
    try {
        const success = await appService.clearSpeciesTable();
        res.json({ success });
    } catch (error) {
        console.error("Error clearing species table:", error);
        res.status(500).json({ error: "Error clearing species table" });
    }
});

router.post('/update-species', validate(schemas.updateSpeciesSchema), requireAuth, async (req, res) => {
    try {
        const { speciesName, housingSpace, groomingRoutine, dietType } = req.body;
        const success = await appService.updateSpecies(speciesName, housingSpace, groomingRoutine, dietType);
        res.json({ success });
    } catch (error) {
        console.error("Error updating species:", error);
        res.status(500).json({ error: "Error updating species" });
    }
});

router.post('/delete-species', validate(schemas.deleteSpeciesSchema), requireAuth, async (req, res) => {
    try {
        const { speciesName } = req.body;
        const success = await appService.deleteSpecies(speciesName);
        res.json({ success });
    } catch (error) {
        console.error("Error deleting species:", error);
        res.status(500).json({ error: "Error deleting species" });
    }
});

// ----------------------------------------------------------
// Insurance Policy
// ----------------------------------------------------------

router.post('/initiateNewInsurancePolicy', requireAuth, requireAdmin, async (req, res) => {
    try {
        const success = await appService.initiateInsurancePolicyTable();
        res.json({ success });
    } catch (error) {
        console.error("Error initiating insurance policy table:", error);
        res.status(500).json({ error: "Error initiating insurance policy table" });
    }
});

router.post('/insert-new-insurance-policy', validate(schemas.insertInsurancePolicySchema), requireAuth, async (req, res) => {
    try {
        const { InsurancePolicyNumber, PolicyLevel, CoverageAmount, InsuranceStartDate, InsuranceExpiration } = req.body;
        const success = await appService.insertNewInsurancePolicy(
            InsurancePolicyNumber, PolicyLevel, CoverageAmount, InsuranceStartDate, InsuranceExpiration
        );
        res.json({ success });
    } catch (error) {
        console.error("Error inserting new insurance policy:", error);
        res.status(500).json({ error: "Error inserting new insurance policy" });
    }
});

router.get('/insurance-policies', async (req, res) => {
    try {
        const rows = await appService.fetchInsurancePolicyList();
        res.json(rows);
    } catch (error) {
        console.error("Error fetching insurance policies:", error);
        res.status(500).json({ error: "Error fetching insurance policies" });
    }
});

// ----------------------------------------------------------
// Medical Record
// ----------------------------------------------------------

router.post('/initiateNewMedicalRecord', requireAuth, requireAdmin, async (req, res) => {
    try {
        const success = await appService.initiateMedicalRecordTable();
        res.json({ success });
    } catch (error) {
        console.error("Error initiating medical record table:", error);
        res.status(500).json({ error: "Error initiating medical record table" });
    }
});

router.post('/insert-new-medical-record', validate(schemas.insertMedicalRecordSchema), requireAuth, async (req, res) => {
    try {
        const { PetMicrochipID, RecordID, InsurancePolicyNumber, VaccinationStatus, HealthCondition, VetNotes } = req.body;
        const success = await appService.insertNewMedicalRecord(PetMicrochipID, RecordID, InsurancePolicyNumber, VaccinationStatus, HealthCondition, VetNotes);
        res.json({ success });
    } catch (error) {
        console.error("Error inserting new medical record:", error);
        res.status(500).json({ error: "Error inserting new medical record" });
    }
});

router.get('/medical-records', async (req, res) => {
    try {
        const rows = await appService.fetchMedicalRecords();
        res.json(rows);
    } catch (error) {
        console.error("Error fetching medical records:", error);
        res.status(500).json({ error: "Error fetching medical records" });
    }
});

module.exports = router;
