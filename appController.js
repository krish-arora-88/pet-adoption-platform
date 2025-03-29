const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('Connected');
    } else {
        res.send('unable to connect');
    }
});

// ======================================================================
// =========== Pet (PetMicrochipID, Name, Age, Breed, Gender) ===========
// ======================================================================

router.get('/pet-table', async (req, res) => {
    const tableContent = await appService.fetchPetTableFromDb();
    res.json({data: tableContent});
});



router.post("/initiateNewPet", async (req, res) => {
    const initiateResult = await appService.initiateNewPet();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-new-pet", async (req, res) => {
    const { MicrochipID, Name, Age, Breed, Gender } = req.body;
    const insertResult = await appService.insertNewPet(MicrochipID, Name, Age, Breed, Gender);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// ======================================================================
// =========== Client(ClientID:  INTEGER(10), FirstName: VARCHAR NOT NULL, 
// LastName: VARCHAR, Address: VARCHAR NOT NULL, ContactNumber: INTEGER)
// ======================================================================

router.post("/initiateNewClient", async (req, res) => {
    const initiateResult = await appService.initiateNewPet();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-new-client", async (req, res) => {
    const {FirstName, LastName, ClientAddress, ClientContact} = req.body;
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



// Demotable, not used in app but here for reference
router.post("/update-name-demotable", async (req, res) => {
    const { oldName, newName } = req.body;
    const updateResult = await appService.updateNameDemotable(oldName, newName);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/count-demotable', async (req, res) => {
    const tableCount = await appService.countDemotable();
    if (tableCount >= 0) {
        res.json({
            success: true,
            count: tableCount
        });
    } else {
        res.status(500).json({
            success: false,
            count: tableCount
        });
    }
});

router.post("/initiate-demotable", async (req, res) => {
    const initiateResult = await appService.initiateDemotable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});


module.exports = router;