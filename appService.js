const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

// ======================================================================
// =========== Pet (PetMicrochipID, Name, Age, Breed, Gender) ===========
// ======================================================================

async function fetchPetTableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM Pet');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function fetchPetTableFromDb(species) {
    return await withOracleDB(async (connection) => {
        let query = 'SELECT * FROM Pet';
        let params = [];

        if (species) {
            query = 'SELECT * FROM Pet WHERE SpeciesName = :species';
            params = [species];
        }

        const result = await connection.execute(query, params);
        return result.rows;
    }).catch((error) => {
        console.error("Database error:", error);
        return [];
    });
}

async function initiateNewPet() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE Pet CASCADE CONSTRAINTS`);
        } catch (err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE Pet (
                PetMicrochipID NUMBER(15) PRIMARY KEY,
                Name VARCHAR2(50),
                Age NUMBER(3),
                Breed VARCHAR2(50) NOT NULL,
                Gender CHAR(1) NOT NULL,
                SpeciesName VARCHAR2(50),
                CONSTRAINT fk_species FOREIGN KEY (SpeciesName) REFERENCES Species(speciesName)
                )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function insertNewPet(MicrochipID, Name, Age, Breed, Gender, SpeciesName) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO Pet (PetMicrochipID, Name, Age, Breed, Gender, SpeciesName) VALUES (:MicrochipID, :Name, :Age, :Breed, :Gender, :SpeciesName)`,
            [MicrochipID, Name, Age, Breed, Gender, SpeciesName],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

// ======================================================================
// =========== Client(ClientID:  INTEGER(10), FirstName: VARCHAR NOT NULL, 
// LastName: VARCHAR, Address: VARCHAR NOT NULL, ContactNumber: INTEGER)
// ======================================================================

async function fetchClientTableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM Client');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function initiateNewClient() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE Client`);
        } catch (err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE Client (
                ClientID NUMBER(10) PRIMARY KEY,
                FirstName VARCHAR2(100) NOT NULL,
                LastName VARCHAR2(100),
                ClientAddress VARCHAR2(100) NOT NULL,
                ClientContact NUMBER(20)
                )
            
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function insertNewClient(FirstName, LastName, ClientAddress, ClientContact) {

    return await withOracleDB(async (connection) => {

        // generates a number for you, increments it as you add a new one
        let id = await connection.execute(
            `SELECT NVL(MAX(ClientID), 0) + 1 AS NextID FROM Client`
        );
        id = id.rows[0][0];

        console.log(id);

        const result = await connection.execute(
            `INSERT INTO Client (ClientID, FirstName, LastName, ClientAddress, ClientContact) 
            VALUES (:id, :FirstName, :LastName, :ClientAddress, :ClientContact)`,
            [id, FirstName, LastName, ClientAddress, ClientContact],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0 ? id : false;
    }).catch(() => {
        return false;
    });
}

async function updateClient(clientId, FirstName, LastName, ClientAddress, ClientContact) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE Client
             SET FirstName = :FirstName,
                 LastName = :LastName,
                 ClientAddress = :ClientAddress,
                 ClientContact = :ClientContact
             WHERE ClientID = :clientId`,
            [FirstName, LastName, ClientAddress, ClientContact, clientId],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

// ===========================================================================================
// VeterinarianSpecializesInSpecies(VetLicenseNumber: INTEGER(10), SpeciesName: VARCHAR)
// Veterinarian(VetLicenseNumber: INTEGER(10), Name: VARCHAR NOT NULL, ClinicName: VARCHAR, 
// ContactNumber: INTEGER, EmailAddress: VARCHAR)
// ===========================================================================================

async function insertNewVet(VetLicenseNumber, Name, ClinicName, ContactNumber, EmailAddress) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO Veterinarian (VetLicenseNumber, Name, ClinicName, ContactNumber, EmailAddress) VALUES 
            (:VetLicenseNumber, :Name, :ClinicName, :ContactNumber, :EmailAddress)`,
            [VetLicenseNumber, Name, ClinicName, ContactNumber, EmailAddress],
            { autoCommit: true }
        );

        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function fetchVetTableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM Veterinarian');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function initiateNewVet() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE Veterinarian`);
        } catch (err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE Veterinarian (
                VetLicenseNumber NUMBER(10) PRIMARY KEY,
                Name VARCHAR2(100) NOT NULL,
                ClinicName VARCHAR2(100),
                ContactNumber NUMBER(20),
                EmailAddress VARCHAR2(100)
                )
            
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function updateVet(VetLicenseNumber, Name, ClinicName, ContactNumber, EmailAddress) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE Veterinarian
             SET Name = :Name,
                 ClinicName = :ClinicName,
                 ContactNumber = :ContactNumber,
                 EmailAddress = :EmailAddress
             WHERE VetLicenseNumber = :VetLicenseNumber`,
            [Name, ClinicName, ContactNumber, EmailAddress, VetLicenseNumber],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

// ======================================================================
// =========== AdoptionCenter(CenterLicenseNumber, CenterName, Address, AnimalCapacity)
// ======================================================================
async function fetchAdoptionCenterTableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute("SELECT * FROM AdoptionCenter");
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function insertNewAdoptionCenter(CenterLicenseNumber, CenterName, Address, AnimalCapacity) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO AdoptionCenter
          (CenterLicenseNumber, CenterName, Address, AnimalCapacity)
         VALUES (:CenterLicenseNumber, :CenterName, :Address, :AnimalCapacity)`,
            [CenterLicenseNumber, CenterName, Address, AnimalCapacity],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function initiateNewAdoptionCenter() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE AdoptionCenter`);
        } catch (err) {
            console.log('Table might not exist, proceeding to create...');
        }
        const result = await connection.execute(`
              CREATE TABLE AdoptionCenter (
                CenterLicenseNumber NUMBER(10) PRIMARY KEY,
                CenterName VARCHAR2(100),
                Address VARCHAR2(100),
                AnimalCapacity NUMBER(10)
              )`);
        return true;
    }).catch(() => {
        return false;
    });
}

async function updateAdoptionCenter(CenterLicenseNumber, CenterName, Address, AnimalCapacity) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `UPDATE AdoptionCenter
           SET CenterName = :CenterName,
               Address = :Address,
               AnimalCapacity = :AnimalCapacity
         WHERE CenterLicenseNumber = :CenterLicenseNumber`,
            [CenterName, Address, AnimalCapacity, CenterLicenseNumber],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

// ===========================================================================================
// ======== Species(SpeciesName, HousingSpaceRequired, GroomingRoutine, DietType) ============
// ===========================================================================================

async function initiateSpeciesTable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE Species`);
        } catch (error) {
            console.log('Species table did not exist.')
        }
        const result = await connection.execute(`
            CREATE TABLE Species (
                speciesName VARCHAR2(50) PRIMARY KEY,
                HousingSpaceRequired VARCHAR2(50), 
                GroomingRoutine VARCHAR2(50),
                DietType VARCHAR2 (50)
            )
        `);
        return true;
    }).catch((error) => {
        console.error("Error creating Species table:", error);
        return false;
    });
}

async function insertNewSpecies(speciesName, housingSpace, groomingRoutine, dietType) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO Species (speciesName, HousingSpaceRequired, GroomingRoutine, DietType)
            VALUES (:speciesName, :housingSpace, :groomingRoutine, :dietType)`,
            [speciesName, housingSpace, groomingRoutine, dietType],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch(() => {
        return false;
    });
}

async function fetchSpeciesList() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT speciesName AS "SpeciesName",
            HousingSpaceRequired AS "HousingSpaceRequired",
            GroomingRoutine AS "GroomingRoutine",
            DietType AS "DietType"
            FROM Species`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return result.rows;
    }).catch((error) => {
        console.error("Error in fetchSpeciesList:", error);
        return [];
    })
}

async function clearSpeciesTable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DELETE TABLE Species`);
            console.log("Species table cleared successfully.");
        } catch (error) {
            console.error("Error clearing Species table:", error);
            return false;
        }
        return true;
    }).catch((error) => {
        console.error("Error in clearSpeciesTable:", error);
        return false;
    });
}

// ========================================================================================================
// ============ Insurance Policies (InsurancePolicyNumber, PolicyHolderName, PolicyDetails) ===============
// ========================================================================================================

async function initiateInsurancePolicyTable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE InsurancePolicy`);
        } catch (error) {
            console.log('InsurancePolicy table did not exist, proceeding to create...');
        }
        await connection.execute(`
        CREATE TABLE InsurancePolicy (
            InsurancePolicyNumber NUMBER(20) PRIMARY KEY,
            PolicyLevel VARCHAR2(50),
            CoverageAmount NUMBER NOT NULL,
            InsuranceStartDate VARCHAR2(10) CHECK (REGEXP_LIKE(InsuranceStartDate, '^[0-9]{4}/[0-9]{2}/[0-9]{2}$')),
            InsuranceExpiration VARCHAR2(10) CHECK (REGEXP_LIKE(InsuranceExpiration, '^[0-9]{4}/[0-9]{2}/[0-9]{2}$'))
        )
      `);
        console.log("InsurancePolicy table created successfully.");
        return true;
    }).catch((error) => {
        console.error("Error creating InsurancePolicy table:", error);
        return false;
    });
}

async function insertNewInsurancePolicy(InsurancePolicyNumber, Level, CoverageAmount, InsuranceStartDate, InsuranceExpiration) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO InsurancePolicy 
           (InsurancePolicyNumber, PolicyLevel, CoverageAmount, InsuranceStartDate, InsuranceExpiration)
         VALUES 
           (:InsurancePolicyNumber, :PolicyLevel, :CoverageAmount, :InsuranceStartDate, :InsuranceExpiration)`,
            [InsurancePolicyNumber, Level, CoverageAmount, InsuranceStartDate, InsuranceExpiration],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.error("Error inserting new insurance policy:", error);
        return false;
    });
}

async function fetchInsurancePolicyList() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT 
           InsurancePolicyNumber, 
           PolicyLevel, 
           CoverageAmount,
           TO_CHAR(InsuranceStartDate, 'YYYY/MM/DD') AS "InsuranceStartDate",
           TO_CHAR(InsuranceExpiration, 'YYYY/MM/DD') AS "InsuranceExpiration"
         FROM InsurancePolicy`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return result.rows;
    }).catch((error) => {
        console.error("Error fetching insurance policies:", error);
        return [];
    });
}

// ======================================================================================================================================
// ============ MedicalRecord(PetMicrochipID, RecordID, InsurancePolicyNumber, VaccinationStatus, HealthCondition, VetNotes) ============
// ======================================================================================================================================

async function initiateMedicalRecordTable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE MedicalRecord`);
        } catch (error) {
            console.log('MedicalRecord table did not exist, proceeding to create...');
        }
        const result = await connection.execute(`
            CREATE TABLE MedicalRecord (
                PetMicrochipID NUMBER(15),
                InsurancePolicyNumber NUMBER(20),
                RecordID NUMBER(10),
                VaccinationStatus CHAR(1),
                HealthCondition VARCHAR2(200),
                VetNotes VARCHAR2(500),
                CONSTRAINT pk_medicalRecord PRIMARY KEY (PetMicrochipID, InsurancePolicyNumber),
                CONSTRAINT fk_medicalRecordPet FOREIGN KEY (PetMicrochipID) REFERENCES Pet(PetMicrochipID),
                CONSTRAINT fk_medicalRecordInsurance FOREIGN KEY (InsurancePolicyNumber) REFERENCES InsurancePolicy(InsurancePolicyNumber)
            )
        `);
        return true;
    }).catch((error) => {
        console.error("Error creating MedicalRecord table:", error);
        return false;
    });
}


async function fetchAdoptionTableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM Adoption');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

async function insertNewMedicalRecord(PetMicrochipID, RecordID, InsurancePolicyNumber, VaccinationStatus, HealthCondition, VetNotes) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO MedicalRecord
            (PetMicrochipID, RecordID, InsurancePolicyNumber, VaccinationStatus, HealthCondition, VetNotes)
            VALUES (:PetMicrochipID, :RecordID, :InsurancePolicyNumber, :VaccinationStatus, :HealthCondition, :VetNotes)`,
            [PetMicrochipID, RecordID, InsurancePolicyNumber, VaccinationStatus, HealthCondition, VetNotes],
            { autoCommit: true }
        );
        return result.rowsAffected && result.rowsAffected > 0;
    }).catch((error) => {
        console.error("Error inserting new medical record:", error);
        return false;
    });
}

async function fetchMedicalRecords() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT PetMicrochipID,
            RecordID,
            InsurancePolicyNumber,
            VaccinationStatus,
            HealthCondition,
            VetNotes
            FROM MedicalRecord`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return result.rows;
    }).catch((error) => {
        console.error("Error fetching medical records:", error);
        return [];
    })
}

// fetPetMedical
async function fetchPetMedical() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT PetMicrochipID,
            RecordID,
            InsurancePolicyNumber,
            VaccinationStatus,
            HealthCondition,
            VetNotes
            FROM MedicalRecord
            WHERE PetMicrochipID = :PetMicrochipID`,
            [PetMicrochipID],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
        return result.rows;
    }).catch((error) => {
        console.error("Error fetching medical records of pet:", error);
        return[];
    })
}

// Adoption

async function initiateNewAdoption() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE Adoption`);
        } catch (err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE Adoption (
                PetMicrochipID NUMBER(15),
                AdoptionDate DATE,
                ClientID NUMBER(10),
                CenterLicenseNumber NUMBER(10),
                PRIMARY KEY (PetMicrochipID),
                FOREIGN KEY (PetMicrochipID) REFERENCES Pet(PetMicrochipID),
                FOREIGN KEY (ClientID) REFERENCES Client(ClientID),
                FOREIGN KEY (CenterLicenseNumber) REFERENCES AdoptionCenter(CenterLicenseNumber)
            )
        `);

        return true;
    }).catch((err) => {
        console.error("Error creating Adoption table:", err);
        return false;
    });
}

async function insertNewAdoption(PetMicrochipID, AdoptionDate, ClientID, CenterLicenseNumber) {
    return await withOracleDB(async (connection) => {
        // Format date properly for Oracle
        let formattedDate;

        try {
            // Handle date in YYYYMMDD format
            if (AdoptionDate.length === 8) {
                const year = AdoptionDate.substring(0, 4);
                const month = AdoptionDate.substring(4, 6);
                const day = AdoptionDate.substring(6, 8);
                formattedDate = `${year}-${month}-${day}`;
            } else {
                // Assume it's already in proper format
                formattedDate = AdoptionDate;
            }

            const result = await connection.execute(
                `INSERT INTO Adoption (PetMicrochipID, AdoptionDate, ClientID, CenterLicenseNumber) 
                 VALUES (:PetMicrochipID, TO_DATE(:AdoptionDate, 'YYYY-MM-DD'), :ClientID, :CenterLicenseNumber)`,
                [PetMicrochipID, formattedDate, ClientID, CenterLicenseNumber],
                { autoCommit: true }
            );

            return result.rowsAffected && result.rowsAffected > 0;
        } catch (error) {
            console.error("Error inserting adoption:", error);
            return false;
        }
    }).catch(() => {
        return false;
    });
}

async function updateAdoption(PetMicrochipID, AdoptionDate, ClientID, CenterLicenseNumber) {
    return await withOracleDB(async (connection) => {
        // Format date properly for Oracle
        let formattedDate;

        try {
            // Handle date in YYYYMMDD format
            if (AdoptionDate.length === 8) {
                const year = AdoptionDate.substring(0, 4);
                const month = AdoptionDate.substring(4, 6);
                const day = AdoptionDate.substring(6, 8);
                formattedDate = `${year}-${month}-${day}`;
            } else {
                // Assume it's already in proper format
                formattedDate = AdoptionDate;
            }

            const result = await connection.execute(
                `UPDATE Adoption 
                 SET AdoptionDate = TO_DATE(:AdoptionDate, 'YYYY-MM-DD'), 
                     ClientID = :ClientID, 
                     CenterLicenseNumber = :CenterLicenseNumber
                 WHERE PetMicrochipID = :PetMicrochipID`,
                [formattedDate, ClientID, CenterLicenseNumber, PetMicrochipID],
                { autoCommit: true }
            );

            return result.rowsAffected && result.rowsAffected > 0;
        } catch (error) {
            console.error("Error updating adoption:", error);
            return false;
        }
    }).catch(() => {
        return false;
    });
}

module.exports = {
    testOracleConnection,
    // initiateDemotable, 
    // insertDemotable, 
    // updateNameDemotable, 
    // countDemotable,
    insertNewPet,
    fetchPetTableFromDb,
    initiateNewPet,
    insertNewClient,
    initiateNewClient,
    updateClient,
    fetchClientTableFromDb,
    insertNewVet,
    fetchVetTableFromDb,
    initiateNewVet,
    updateVet,
    fetchAdoptionCenterTableFromDb,
    insertNewAdoptionCenter,
    updateAdoptionCenter,
    initiateNewAdoptionCenter,
    initiateSpeciesTable,
    insertNewSpecies,
    fetchSpeciesList,
    clearSpeciesTable,
    initiateMedicalRecordTable,
    insertNewMedicalRecord,
    fetchMedicalRecords,
    initiateInsurancePolicyTable,
    insertNewInsurancePolicy,
    fetchInsurancePolicyList,
    fetchAdoptionTableFromDb,
    insertNewAdoption,
    updateAdoption,
    initiateNewAdoption,
    fetchPetMedical

};