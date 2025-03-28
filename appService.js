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
        } catch(err) {
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

module.exports = {
    testOracleConnection,
    // initiateDemotable, 
    // insertDemotable, 
    // updateNameDemotable, 
    // countDemotable,
    insertNewPet,
    fetchPetTableFromDb,
    initiateNewPet
};