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

async function initiateNewPet() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE Pet`);
        } catch (err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE Pet (
                PetMicrochipID NUMBER(15) PRIMARY KEY,
                Name VARCHAR2(50),
                Age NUMBER(3),
                Breed VARCHAR2(50) NOT NULL,
                Gender CHAR(1) NOT NULL
                )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}

async function insertNewPet(MicrochipID, Name, Age, Breed, Gender) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `INSERT INTO Pet (PetMicrochipID, Name, Age, Breed, Gender) VALUES (:MicrochipID, :Name, :Age, :Breed, :Gender)`,
            [MicrochipID, Name, Age, Breed, Gender],
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
    initiateNewAdoptionCenter

};