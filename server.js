const express = require('express');
const appController = require('./appController');

// Load environment variables from .env file
// Ensure your .env file has the required database credentials.
const loadEnvFile = require('./utils/envUtil');
const envVariables = loadEnvFile('./.env');

const app = express();
const PORT = envVariables.PORT || 65534;  // Adjust the PORT if needed (e.g., if you encounter a "port already occupied" error)

// Middleware setup
app.use(express.static('public'));  // Serve static files from the 'public' directory
app.use(express.json());             // Parse incoming JSON payloads

// If you prefer some other file as default page other than 'index.html',
//      you can adjust and use the bellow line of code to
//      route to send 'DEFAULT_FILE_NAME.html' as default for root URL
// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/public/DEFAULT_FILE_NAME.html');
// });


// mount the router
app.use('/', appController);

app.get('/pages', (req, res) => {
    res.redirect('/');
});

// ----------------------------------------------------------
// Starting the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

// Species route 

const db = require('./appService');

app.get('/species-list', async (req, res) => {
    try {
        const rows = await db.fetchSpeciesList();
        res.json(rows);
    } catch (error) {
        console.error('Error fetching species:', error);
        res.status(500).json({ error: 'Error fetching species' });
    }
});

app.post('/insert-new-species', async (req, res) => {
    try {
        const { speciesName, housingSpace, groomingRoutine, dietType } = req.body;
        const success = await db.insertNewSpecies(speciesName, housingSpace, groomingRoutine, dietType);
        res.json({ success });
    } catch (error) {
        console.error('Error inserting new species:', error);
        res.status(500).json({ error: 'Error fetching species' });
    }
});

app.post('/initiateNewSpecies', async (req, res) => {
  try {
      const success = await db.initiateSpeciesTable();
      res.json({ success });
  } catch (error) {
      console.error("Error initiating species table:", error);
      res.status(500).json({ error: "Error initiating species table" });
  }
});

app.post('/clearSpeciesTable', async (req, res) => {
  try {
    const success = await db.clearSpeciesTable(); // Ensure you export clearSpeciesTable in your appService
    res.json({ success });
  } catch (error) {
    console.error("Error clearing species table:", error);
    res.status(500).json({ error: "Error clearing species table" });
  }
});


app.post('/insert-new-pet', async (req, res) => {
    try {
        console.log("Request body:", req.body);
        const { MicrochipID, Name, Age, Breed, Gender, SpeciesName } = req.body;
        const success = await db.insertNewPet(MicrochipID, Name, Age, Breed, Gender, SpeciesName);
        res.json({ success });
    } catch (error) {
        console.error('Error inserting new pet:', error);
        res.status(500).json({ error: 'Error inserting new pet' });
    }
});

// Insurance Policy Routing

app.post('/initiateNewInsurancePolicy', async (req, res) => {
    try {
      const success = await db.initiateInsurancePolicyTable();
      res.json({ success });
    } catch (error) {
      console.error("Error initiating insurance policy table:", error);
      res.status(500).json({ error: "Error initiating insurance policy table" });
    }
  });  
  
app.post('/insert-new-insurance-policy', async (req, res) => {
    try {
      console.log("Insurance Policy Insert Request Body:", req.body);
      const { InsurancePolicyNumber, PolicyLevel, CoverageAmount, InsuranceStartDate, InsuranceExpiration } = req.body;
      const success = await db.insertNewInsurancePolicy(
        InsurancePolicyNumber,
        PolicyLevel,
        CoverageAmount,
        InsuranceStartDate,
        InsuranceExpiration
      );
      res.json({ success });
    } catch (error) {
      console.error("Error inserting new insurance policy:", error);
      res.status(500).json({ error: "Error inserting new insurance policy" });
    }
  });
  
  
app.get('/insurance-policies', async (req, res) => {
    try {
      const rows = await db.fetchInsurancePolicyList();
      res.json(rows);
    } catch (error) {
      console.error("Error fetching insurance policies:", error);
      res.status(500).json({ error: "Error fetching insurance policies" });
    }
  });
  

// Medical Record Routing

app.post('/initiateNewMedicalRecord', async (req, res) => {
    try {
      const success = await db.initiateMedicalRecordTable();
      res.json({ success });
    } catch (error) {
      console.error("Error initiating medical record table:", error);
      res.status(500).json({ error: "Error initiating medical record table" });
    }
  });

  app.post('/insert-new-medical-record', async (req, res) => {
    try {
      console.log("Request body:", req.body);
      const { PetMicrochipID, RecordID, InsurancePolicyNumber, VaccinationStatus, HealthCondition, VetNotes } = req.body;
      const success = await db.insertNewMedicalRecord(PetMicrochipID, RecordID, InsurancePolicyNumber, VaccinationStatus, HealthCondition, VetNotes);
      res.json({ success });
    } catch (error) {
      console.error("Error inserting new medical record:", error);
      res.status(500).json({ error: "Error inserting new medical record" });
    }
  });

  app.get('/medical-records', async (req, res) => {
    try {
      const rows = await db.fetchMedicalRecords();
      res.json(rows);
    } catch (error) {
      console.error("Error fetching medical records:", error);
      res.status(500).json({ error: "Error fetching medical records" });
    }
  });
  
