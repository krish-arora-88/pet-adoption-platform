const mongoose = require('mongoose');
const { Species, Pet, Client, Counter, Veterinarian, AdoptionCenter, Adoption, InsurancePolicy, MedicalRecord } = require('./models');

// ----------------------------------------------------------
// Helpers
// ----------------------------------------------------------

function docsToArrays(docs, fields) {
    return docs.map(doc => fields.map(f => doc[f] !== undefined ? doc[f] : null));
}

async function getNextSequence(name) {
    const counter = await Counter.findOneAndUpdate(
        { _id: name },
        { $inc: { sequence: 1 } },
        { new: true, upsert: true }
    );
    return counter.sequence;
}

function parseInsuranceDate(dateStr) {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('/');
    return new Date(Number(year), Number(month) - 1, Number(day));
}

function formatInsuranceDate(date) {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

function parseAdoptionDate(dateStr) {
    if (!dateStr) return null;
    let year, month, day;
    if (dateStr.length === 8) {
        year = dateStr.substring(0, 4);
        month = dateStr.substring(4, 6);
        day = dateStr.substring(6, 8);
    } else {
        [year, month, day] = dateStr.split('-');
    }
    return new Date(Number(year), Number(month) - 1, Number(day));
}

function formatAdoptionDate(date) {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

// ----------------------------------------------------------
// Connection test
// ----------------------------------------------------------

async function testConnection() {
    return mongoose.connection.readyState === 1;
}

// ----------------------------------------------------------
// Pet functions
// ----------------------------------------------------------

async function fetchPetTableFromDb(species, minAge, maxAge) {
    try {
        const filter = {};
        if (species) filter.speciesName = species;
        if (minAge || maxAge) {
            filter.age = {};
            if (minAge) filter.age.$gte = Number(minAge);
            if (maxAge) filter.age.$lte = Number(maxAge);
        }

        const pets = await Pet.find(filter).lean();
        return docsToArrays(pets, ['petMicrochipID', 'name', 'age', 'breed', 'gender', 'speciesName']);
    } catch (error) {
        console.error("Database error:", error);
        return [];
    }
}

async function fetchPetMaxAges() {
    try {
        const result = await Pet.aggregate([
            { $group: { _id: '$speciesName', avgAge: { $avg: '$age' } } },
            { $project: { _id: 0, speciesName: '$_id', avgAge: 1 } }
        ]);
        return result.map(r => [r.speciesName, r.avgAge]);
    } catch (error) {
        console.error("Error fetching pet stats:", error);
        return [];
    }
}

async function initiateNewPet() {
    try {
        await Pet.deleteMany({});
        return true;
    } catch (error) {
        console.error("Error resetting Pet collection:", error);
        return false;
    }
}

async function insertNewPet(MicrochipID, Name, Age, Breed, Gender, SpeciesName) {
    try {
        await Pet.create({
            petMicrochipID: MicrochipID,
            name: Name,
            age: Age,
            breed: Breed,
            gender: Gender,
            speciesName: SpeciesName
        });
        return true;
    } catch (error) {
        console.error("Error inserting pet:", error);
        return false;
    }
}

async function fetchSpeciesAgeStats() {
    try {
        const allAvgs = await Pet.aggregate([
            { $group: { _id: '$speciesName', avgAge: { $avg: '$age' } } }
        ]);

        if (allAvgs.length === 0) return [];

        const minAvg = Math.min(...allAvgs.map(r => r.avgAge));

        return allAvgs
            .filter(r => r.avgAge > minAvg)
            .map(r => [r._id, r.avgAge]);
    } catch (error) {
        console.error("Error fetching species age stats:", error);
        return [];
    }
}

// ----------------------------------------------------------
// Client functions
// ----------------------------------------------------------

async function fetchClientTableFromDb() {
    try {
        const clients = await Client.find({}).lean();
        return docsToArrays(clients, ['clientID', 'firstName', 'lastName', 'clientAddress', 'clientContact']);
    } catch (error) {
        console.error("Error fetching clients:", error);
        return [];
    }
}

async function initiateNewClient() {
    try {
        await Client.deleteMany({});
        await Counter.deleteOne({ _id: 'clientID' });
        return true;
    } catch (error) {
        console.error("Error resetting Client collection:", error);
        return false;
    }
}

async function insertNewClient(FirstName, LastName, ClientAddress, ClientContact) {
    try {
        const id = await getNextSequence('clientID');
        await Client.create({
            clientID: id,
            firstName: FirstName,
            lastName: LastName,
            clientAddress: ClientAddress,
            clientContact: ClientContact
        });
        return id;
    } catch (error) {
        console.error("Error inserting client:", error);
        return false;
    }
}

async function updateClient(clientId, FirstName, LastName, ClientAddress, ClientContact) {
    try {
        const result = await Client.updateOne(
            { clientID: Number(clientId) },
            { $set: { firstName: FirstName, lastName: LastName, clientAddress: ClientAddress, clientContact: ClientContact } }
        );
        return result.modifiedCount > 0;
    } catch (error) {
        console.error("Error updating client:", error);
        return false;
    }
}

// ----------------------------------------------------------
// Veterinarian functions
// ----------------------------------------------------------

const VET_FIELD_MAP = {
    'VetLicenseNumber': 'vetLicenseNumber',
    'Name': 'name',
    'ClinicName': 'clinicName',
    'ContactNumber': 'contactNumber',
    'EmailAddress': 'emailAddress'
};

async function insertNewVet(VetLicenseNumber, Name, ClinicName, ContactNumber, EmailAddress) {
    try {
        await Veterinarian.create({
            vetLicenseNumber: VetLicenseNumber,
            name: Name,
            clinicName: ClinicName,
            contactNumber: ContactNumber,
            emailAddress: EmailAddress
        });
        return true;
    } catch (error) {
        console.error("Error inserting vet:", error);
        return false;
    }
}

async function fetchVetTableFromDb() {
    try {
        const vets = await Veterinarian.find({}).lean();
        return docsToArrays(vets, ['vetLicenseNumber', 'name', 'clinicName', 'contactNumber', 'emailAddress']);
    } catch (error) {
        console.error("Error fetching vets:", error);
        return [];
    }
}

async function fetchVetProject(selectors) {
    try {
        const requestedFields = selectors.split(',').map(s => s.trim());
        const validFields = requestedFields
            .map(f => VET_FIELD_MAP[f])
            .filter(f => f !== undefined);

        if (validFields.length === 0) return [];

        const projection = { _id: 0 };
        validFields.forEach(f => { projection[f] = 1; });

        const docs = await Veterinarian.find({}, projection).lean();
        return docs.map(doc => validFields.map(f => doc[f] !== undefined ? doc[f] : null));
    } catch (error) {
        console.error("Error fetching vet projection:", error);
        return [];
    }
}

async function initiateNewVet() {
    try {
        await Veterinarian.deleteMany({});
        return true;
    } catch (error) {
        console.error("Error resetting Veterinarian collection:", error);
        return false;
    }
}

async function updateVet(VetLicenseNumber, Name, ClinicName, ContactNumber, EmailAddress) {
    try {
        const result = await Veterinarian.updateOne(
            { vetLicenseNumber: Number(VetLicenseNumber) },
            { $set: { name: Name, clinicName: ClinicName, contactNumber: ContactNumber, emailAddress: EmailAddress } }
        );
        return result.modifiedCount > 0;
    } catch (error) {
        console.error("Error updating vet:", error);
        return false;
    }
}

// ----------------------------------------------------------
// Adoption Center functions
// ----------------------------------------------------------

async function fetchAdoptionCenterTableFromDb() {
    try {
        const centers = await AdoptionCenter.find({}).lean();
        return docsToArrays(centers, ['centerLicenseNumber', 'centerName', 'address', 'animalCapacity']);
    } catch (error) {
        console.error("Error fetching adoption centers:", error);
        return [];
    }
}

async function insertNewAdoptionCenter(CenterLicenseNumber, CenterName, Address, AnimalCapacity) {
    try {
        await AdoptionCenter.create({
            centerLicenseNumber: CenterLicenseNumber,
            centerName: CenterName,
            address: Address,
            animalCapacity: AnimalCapacity
        });
        return true;
    } catch (error) {
        console.error("Error inserting adoption center:", error);
        return false;
    }
}

async function initiateNewAdoptionCenter() {
    try {
        await AdoptionCenter.deleteMany({});
        return true;
    } catch (error) {
        console.error("Error resetting AdoptionCenter collection:", error);
        return false;
    }
}

async function updateAdoptionCenter(CenterLicenseNumber, CenterName, Address, AnimalCapacity) {
    try {
        const result = await AdoptionCenter.updateOne(
            { centerLicenseNumber: Number(CenterLicenseNumber) },
            { $set: { centerName: CenterName, address: Address, animalCapacity: AnimalCapacity } }
        );
        return result.modifiedCount > 0;
    } catch (error) {
        console.error("Error updating adoption center:", error);
        return false;
    }
}

// ----------------------------------------------------------
// Species functions
// ----------------------------------------------------------

async function initiateSpeciesTable() {
    try {
        await Species.deleteMany({});
        return true;
    } catch (error) {
        console.error("Error resetting Species collection:", error);
        return false;
    }
}

async function insertNewSpecies(speciesName, housingSpace, groomingRoutine, dietType) {
    try {
        await Species.create({
            speciesName,
            housingSpaceRequired: housingSpace,
            groomingRoutine,
            dietType
        });
        return true;
    } catch (error) {
        console.error("Error inserting species:", error);
        return false;
    }
}

async function fetchSpeciesList() {
    try {
        const species = await Species.find({}).lean();
        return species.map(s => ({
            SpeciesName: s.speciesName,
            HousingSpaceRequired: s.housingSpaceRequired,
            GroomingRoutine: s.groomingRoutine,
            DietType: s.dietType
        }));
    } catch (error) {
        console.error("Error fetching species list:", error);
        return [];
    }
}

async function clearSpeciesTable() {
    try {
        await Species.deleteMany({});
        return true;
    } catch (error) {
        console.error("Error clearing species:", error);
        return false;
    }
}

async function updateSpecies(speciesName, housingSpace, groomingRoutine, dietType) {
    try {
        const result = await Species.updateOne(
            { speciesName },
            { $set: { housingSpaceRequired: housingSpace, groomingRoutine, dietType } }
        );
        return result.modifiedCount > 0;
    } catch (error) {
        console.error("Error updating species:", error);
        return false;
    }
}

async function deleteSpecies(speciesName) {
    try {
        await Pet.deleteMany({ speciesName });
        const result = await Species.deleteOne({ speciesName });
        return result.deletedCount > 0;
    } catch (error) {
        console.error("Error deleting species:", error);
        return false;
    }
}

async function getSpeciesWithMinPets(minCount) {
    try {
        const result = await Pet.aggregate([
            { $group: { _id: '$speciesName', NumPets: { $sum: 1 } } },
            { $match: { NumPets: { $gte: minCount } } },
            { $project: { _id: 0, SPECIESNAME: '$_id', NUMPETS: '$NumPets' } }
        ]);
        return result;
    } catch (error) {
        console.error("Error fetching species by pet count:", error);
        return [];
    }
}

// ----------------------------------------------------------
// Insurance Policy functions
// ----------------------------------------------------------

async function initiateInsurancePolicyTable() {
    try {
        await InsurancePolicy.deleteMany({});
        return true;
    } catch (error) {
        console.error("Error resetting InsurancePolicy collection:", error);
        return false;
    }
}

async function insertNewInsurancePolicy(InsurancePolicyNumber, Level, CoverageAmount, InsuranceStartDate, InsuranceExpiration) {
    try {
        await InsurancePolicy.create({
            insurancePolicyNumber: InsurancePolicyNumber,
            policyLevel: Level,
            coverageAmount: CoverageAmount,
            insuranceStartDate: parseInsuranceDate(InsuranceStartDate),
            insuranceExpiration: parseInsuranceDate(InsuranceExpiration)
        });
        return true;
    } catch (error) {
        console.error("Error inserting insurance policy:", error);
        return false;
    }
}

async function fetchInsurancePolicyList() {
    try {
        const policies = await InsurancePolicy.find({}).lean();
        return policies.map(p => ({
            InsurancePolicyNumber: p.insurancePolicyNumber,
            PolicyLevel: p.policyLevel,
            CoverageAmount: p.coverageAmount,
            InsuranceStartDate: formatInsuranceDate(p.insuranceStartDate),
            InsuranceExpiration: formatInsuranceDate(p.insuranceExpiration)
        }));
    } catch (error) {
        console.error("Error fetching insurance policies:", error);
        return [];
    }
}

// ----------------------------------------------------------
// Medical Record functions
// ----------------------------------------------------------

async function initiateMedicalRecordTable() {
    try {
        await MedicalRecord.deleteMany({});
        return true;
    } catch (error) {
        console.error("Error resetting MedicalRecord collection:", error);
        return false;
    }
}

async function insertNewMedicalRecord(PetMicrochipID, RecordID, InsurancePolicyNumber, VaccinationStatus, HealthCondition, VetNotes) {
    try {
        await MedicalRecord.create({
            petMicrochipID: PetMicrochipID,
            recordID: RecordID,
            insurancePolicyNumber: InsurancePolicyNumber,
            vaccinationStatus: VaccinationStatus,
            healthCondition: HealthCondition,
            vetNotes: VetNotes
        });
        return true;
    } catch (error) {
        console.error("Error inserting medical record:", error);
        return false;
    }
}

async function fetchMedicalRecords() {
    try {
        const records = await MedicalRecord.find({}).lean();
        return records.map(r => ({
            PETMICROCHIPID: r.petMicrochipID,
            RECORDID: r.recordID,
            INSURANCEPOLICYNUMBER: r.insurancePolicyNumber,
            VACCINATIONSTATUS: r.vaccinationStatus,
            HEALTHCONDITION: r.healthCondition,
            VETNOTES: r.vetNotes
        }));
    } catch (error) {
        console.error("Error fetching medical records:", error);
        return [];
    }
}

async function fetchPetMedical(PetMicrochipID) {
    if (!PetMicrochipID || isNaN(PetMicrochipID)) {
        console.error("Invalid PetMicrochipID: must be a valid number");
        return [];
    }

    try {
        const records = await MedicalRecord.find({ petMicrochipID: Number(PetMicrochipID) }).lean();
        return records.map(r => ({
            PETMICROCHIPID: r.petMicrochipID,
            RECORDID: r.recordID,
            INSURANCEPOLICYNUMBER: r.insurancePolicyNumber,
            VACCINATIONSTATUS: r.vaccinationStatus,
            HEALTHCONDITION: r.healthCondition,
            VETNOTES: r.vetNotes
        }));
    } catch (error) {
        console.error("Error fetching medical records of pet:", error);
        return [];
    }
}

// ----------------------------------------------------------
// Adoption functions
// ----------------------------------------------------------

async function fetchAdoptionTableFromDb() {
    try {
        const adoptions = await Adoption.find({}).lean();
        return adoptions.map(a => [
            a.petMicrochipID,
            formatAdoptionDate(a.adoptionDate),
            a.clientID,
            a.centerLicenseNumber
        ]);
    } catch (error) {
        console.error("Error fetching adoptions:", error);
        return [];
    }
}

async function initiateNewAdoption() {
    try {
        await Adoption.deleteMany({});
        return true;
    } catch (error) {
        console.error("Error resetting Adoption collection:", error);
        return false;
    }
}

async function insertNewAdoption(PetMicrochipID, AdoptionDate, ClientID, CenterLicenseNumber) {
    try {
        await Adoption.create({
            petMicrochipID: PetMicrochipID,
            adoptionDate: parseAdoptionDate(AdoptionDate),
            clientID: ClientID,
            centerLicenseNumber: CenterLicenseNumber
        });
        return true;
    } catch (error) {
        console.error("Error inserting adoption:", error);
        return false;
    }
}

async function updateAdoption(PetMicrochipID, AdoptionDate, ClientID, CenterLicenseNumber) {
    try {
        const result = await Adoption.updateOne(
            { petMicrochipID: Number(PetMicrochipID) },
            { $set: {
                adoptionDate: parseAdoptionDate(AdoptionDate),
                clientID: ClientID,
                centerLicenseNumber: CenterLicenseNumber
            }}
        );
        return result.modifiedCount > 0;
    } catch (error) {
        console.error("Error updating adoption:", error);
        return false;
    }
}

// ----------------------------------------------------------
// Exports
// ----------------------------------------------------------

module.exports = {
    testConnection,
    insertNewPet,
    fetchPetTableFromDb,
    initiateNewPet,
    fetchPetMaxAges,
    fetchSpeciesAgeStats,
    insertNewClient,
    initiateNewClient,
    updateClient,
    fetchClientTableFromDb,
    insertNewVet,
    fetchVetTableFromDb,
    initiateNewVet,
    updateVet,
    fetchVetProject,
    fetchAdoptionCenterTableFromDb,
    insertNewAdoptionCenter,
    updateAdoptionCenter,
    initiateNewAdoptionCenter,
    initiateSpeciesTable,
    insertNewSpecies,
    fetchSpeciesList,
    clearSpeciesTable,
    updateSpecies,
    deleteSpecies,
    getSpeciesWithMinPets,
    initiateMedicalRecordTable,
    insertNewMedicalRecord,
    fetchMedicalRecords,
    fetchPetMedical,
    initiateInsurancePolicyTable,
    insertNewInsurancePolicy,
    fetchInsurancePolicyList,
    fetchAdoptionTableFromDb,
    insertNewAdoption,
    updateAdoption,
    initiateNewAdoption
};
