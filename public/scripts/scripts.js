window.onload = function () {
    // Pet Management
    if (document.getElementById("dbStatus")) {
        checkDbConnection();
    }
    if (document.getElementById("new_pet")) {
        document.getElementById("new_pet").addEventListener("submit", insertNewPet);
    }
    if (document.getElementById("resetPetTable")) {
        document.getElementById("resetPetTable").addEventListener("click", resetPetTable);
    }
    if (document.getElementById("see_pets")) {
        document.getElementById("see_pets").addEventListener("click", fetchPetTableData);
        fetchPetTableData();
    }

    if (document.getElementById("speciesFilter")) {
        document.getElementById("speciesFilter").addEventListener("change", filterPetsBySpecies);
    }

    // Client Sign Up
    if (document.getElementById("sign_up")) {
        document.getElementById("sign_up").addEventListener("submit", insertNewClient);
    }
    if (document.getElementById("resetClient")) {
        document.getElementById("resetClient").addEventListener("click", resetClient);
    }
    if (document.getElementById("client_table")) {
        fetchAndDisplayClientTable();
    }
    if (document.getElementById("client_update")) {
        document.getElementById("client_update").addEventListener("submit", updateClient);
    }

    // vet practice registration

    if (document.getElementById("registerVet")) {
        document.getElementById("registerVet").addEventListener("submit", insertNewVet);
    }
    if (document.getElementById("resetVet")) {
        document.getElementById("resetVet").addEventListener("click", resetVet);
    }

    if (document.getElementById("vet_update")) {
        document.getElementById("vet_update").addEventListener("submit", updateVet);
    }

    if (document.getElementById("projectVetInfo")) {
        document.getElementById("projectVetInfo").addEventListener("submit", fetchAndDisplayVetTableProject);
    }



    //adoption centre registration

    if (document.getElementById("adoption_center_table")) {
        fetchAndDisplayACTable();
    }
    if (document.getElementById("new_adoption_center")) {
        document.getElementById("new_adoption_center").addEventListener("submit", insertNewAdoptionCentre);
    }

    if (document.getElementById("adoption_center_update")) {
        document.getElementById("adoption_center_update").addEventListener("submit", updateAdoptionCenter);
    }

    if (document.getElementById("resetACTable")) {
        document.getElementById("resetACTable").addEventListener("click", initializeAdoptionCenterTable);
    }

    // populate species table

    if (document.getElementById("speciesSelect")) {
        populateSpeciesDropdown();
    }

    if (document.getElementById("speciesForm")) {
        document.getElementById("speciesForm").addEventListener("submit", handleInsertSpecies);
    }

    if (document.getElementById("resetSpeciesTable")) {
        document.getElementById("resetSpeciesTable").addEventListener("click", resetSpeciesTable);
    }

    if (document.getElementById("speciesTable")) {
        fetchAndDisplaySpeciesTable();
    }

    // Insurance Policies

    if (document.getElementById("insuranceForm")) {
        document.getElementById("insuranceForm").addEventListener("submit", insertNewInsurancePolicy);
    }

    if (document.getElementById("resetInsuranceTable")) {
        document.getElementById("resetInsuranceTable").addEventListener("click", resetInsuranceTable);
    }

    if (document.getElementById("insuranceTable")) {
        fetchAndDisplayInsurancePolicies();
    }

    // Pet Medical Records

    if (document.getElementById("medicalRecordForm")) {
        document.getElementById("medicalRecordForm").addEventListener("submit", insertNewMedicalRecord);
    }

    if (document.getElementById("resetMedicalRecordTable")) {
        document.getElementById("resetMedicalRecordTable").addEventListener("click", resetMedicalRecordTable);
    }

    if (document.getElementById("medicalRecordTable")) {
        fetchAndDisplayMedicalRecordTable();
    }

    if (document.getElementById("accessPetMedical")) {
        document.getElementById("accessPetMedical").addEventListener("submit", fetchAndDisplayMedicalRecordTablePet);
    }

    // Adoption Management
    if (document.getElementById("adoption_table")) {
        fetchAndDisplayAdoptionTable();
    }

    if (document.getElementById("new_adoption")) {
        document.getElementById("new_adoption").addEventListener("submit", insertNewAdoption);
    }

    if (document.getElementById("adoption_update")) {
        document.getElementById("adoption_update").addEventListener("submit", updateAdoption);
    }

    if (document.getElementById("resetAdoptionTable")) {
        document.getElementById("resetAdoptionTable").addEventListener("click", initializeAdoptionTable);
    }

};

async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    try {
        const response = await fetch('/check-db-connection', { method: "GET" });
        // Hide the loading GIF once the response is received.
        if (loadingGifElem) loadingGifElem.style.display = 'none';
        if (statusElem) statusElem.style.display = 'inline';

        const text = await response.text();
        statusElem.textContent = text;
    } catch (error) {
        if (statusElem) statusElem.textContent = 'connection timed out';
    }
}

// ======================================================================
// =========== Pet (PetMicrochipID, Name, Age, Breed, Gender, SpeciesName) ===========
// ======================================================================

async function insertNewPet(event) {
    event.preventDefault();

    const microchip = document.getElementById("MicrochipID").value;
    const petname = document.getElementById("petName").value;
    const petAge = document.getElementById("petAge").value;
    const breed = document.getElementById("breed").value;
    const gender = document.getElementById("gender").value;
    const speciesName = document.getElementById("speciesSelect").value;

    console.log("Selected species:", speciesName);

    const response = await fetch('/insert-new-pet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            MicrochipID: microchip,
            Name: petname,
            Age: petAge,
            Breed: breed,
            Gender: gender,
            SpeciesName: speciesName
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById("new_pet_message");

    if (responseData.success) {
        if (messageElement) messageElement.textContent = "Success!";
        fetchPetTableData();
    } else {
        if (messageElement) messageElement.textContent = "An error occurred";
    }
}

function fetchPetTableData() {
    fetchAndDisplayPetTable();
}

async function filterPetsBySpecies() {
    const speciesFilter = document.getElementById("speciesFilter").value;

    try {
        let url = '/pet-table';
        if (speciesFilter !== 'all') {
            url = `/pet-table?species=${speciesFilter}`;
        }

        const response = await fetch(url, { method: 'GET' });
        const responseData = await response.json();
        const tableData = responseData.data;

        // Update table with filtered data
        const tableBody = document.getElementById('pet_table').querySelector('tbody');
        tableBody.innerHTML = '';

        // Populate table with filtered data
        tableData.forEach(rowData => {
            const row = tableBody.insertRow();
            rowData.forEach((field, index) => {
                const cell = row.insertCell(index);
                cell.textContent = field;
            });
        });
    } catch (error) {
        console.error("Error filtering pet table data:", error);
    }
}

async function fetchAndDisplayPetTable() {
    const tableElement = document.getElementById('pet_table');
    if (!tableElement) return;

    const tableBody = tableElement.querySelector('tbody');
    try {
        const response = await fetch('/pet-table', { method: 'GET' });
        const responseData = await response.json();
        const demotableContent = responseData.data;

        // Clear old data
        if (tableBody) tableBody.innerHTML = '';

        // Populate table with new data
        demotableContent.forEach(rowData => {
            const row = tableBody.insertRow();
            rowData.forEach((field, index) => {
                const cell = row.insertCell(index);
                cell.textContent = field;
            });
        });
    } catch (error) {
        console.error("Error fetching pet table data:", error);
    }
}

async function resetPetTable() {
    try {
        const response = await fetch("/initiateNewPet", { method: 'POST' });
        const responseData = await response.json();

        if (responseData.success) {
            const messageElement = document.getElementById('resetResultMsg');
            if (messageElement) messageElement.textContent = "Table initiated successfully!";
            fetchPetTableData();
        } else {
            alert("Error initiating table!");
        }
    } catch (error) {
        console.error("Error resetting pet table:", error);
    }
}

// ======================================================================
// =========== Client(ClientID:  INTEGER(10), FirstName: VARCHAR NOT NULL, 
// LastName: VARCHAR, Address: VARCHAR NOT NULL, ContactNumber: INTEGER)
// ======================================================================

async function insertNewClient(event) {
    event.preventDefault();
    console.log("inserting new client");

    const ClientFirstName = document.getElementById("ClientFirstName").value;
    const ClientLastName = document.getElementById("ClientLastName").value;
    const ClientAddress = document.getElementById("ClientAddress").value;
    const ClientContact = document.getElementById("ClientContact").value;

    const response = await fetch('/insert-new-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            FirstName: ClientFirstName,
            LastName: ClientLastName,
            ClientAddress: ClientAddress,
            ClientContact: ClientContact
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById("sign_up_status");

    if (responseData.success) {
        if (messageElement) {
            messageElement.textContent = `Account added! Your ClientID is ${responseData.clientID}. Keep this number for future login`;
        }
    } else {
        if (messageElement) messageElement.textContent = "An error occurred";
    }
    fetchClientTableData();
}

function fetchClientTableData() {
    fetchAndDisplayClientTable();
}

async function fetchAndDisplayClientTable() {
    const tableElement = document.getElementById('client_table');
    if (!tableElement) return;

    const tableBody = tableElement.querySelector('tbody');
    try {
        const response = await fetch('/client-table', { method: 'GET' });
        const responseData = await response.json();
        const demotableContent = responseData.data;

        // Clear old data
        if (tableBody) tableBody.innerHTML = '';

        // Populate table with new data
        demotableContent.forEach(rowData => {
            const row = tableBody.insertRow();
            rowData.forEach((field, index) => {
                const cell = row.insertCell(index);
                cell.textContent = field;
            });
        });
    } catch (error) {
        console.error("Error fetching client table data:", error);
    }
}

async function updateClient(event) {
    event.preventDefault();

    // Retrieve values from the update form
    const clientId = parseInt(document.getElementById("ClientNumber").value, 10);
    const updatedFirstName = document.getElementById("ClientFirstName_update").value;
    const updatedLastName = document.getElementById("ClientLastName_update").value;
    const updatedAddress = document.getElementById("ClientAddress_update").value;
    const updatedContact = document.getElementById("ClientContact_update").value;

    // Create the payload for updating the client
    const payload = {
        clientId,
        FirstName: updatedFirstName,
        LastName: updatedLastName,
        ClientAddress: updatedAddress,
        ClientContact: updatedContact
    };

    try {
        const response = await fetch('/update-client', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const responseData = await response.json();
        const updateStatusElem = document.getElementById("update_status");

        if (responseData.success) {
            updateStatusElem.textContent = "Account updated successfully!";
            fetchClientTableData();
        } else {
            updateStatusElem.textContent = "Error updating account.";
        }
    } catch (error) {
        console.error("Error updating account:", error);
        const updateStatusElem = document.getElementById("update_status");
        if (updateStatusElem) updateStatusElem.textContent = "Error updating account.";
    }
}

async function resetClient() {
    try {
        const response = await fetch("/initiateNewClient", { method: 'POST' });
        const responseData = await response.json();

        if (responseData.success) {
            const messageElement = document.getElementById('resetResultMsg');
            if (messageElement) messageElement.textContent = "Client table initiated successfully!";
            fetchClientTableData();
        } else {
            alert("Error initiating client table!");
        }
    } catch (error) {
        console.error("Error resetting client table:", error);
    }
}

// ======================================================================
// =========== CenterEmployee (First Name, Last Name, Role, Salary) =====
// ======================================================================

if (document.getElementById("employeeForm")) {
    document.getElementById("employeeForm").addEventListener("submit", addEmployee);
}

function addEmployee(event) {
    event.preventDefault();

    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const role = document.getElementById("role").value;
    const salary = document.getElementById("salary").value;

    const tableBody = document.getElementById("employeeTableBody");
    const row = document.createElement("tr");

    row.innerHTML = `
    <td>${firstName}</td>
    <td>${lastName}</td>
    <td>${role}</td>
    <td>${salary}</td>
    <td><button onclick="this.parentNode.parentNode.remove()">Delete</button></td>
    `;

    tableBody.appendChild(row);
    document.getElementById("employeeForm").reset();
}


// ===========================================================================================
// VeterinarianSpecializesInSpecies(VetLicenseNumber: INTEGER(10), SpeciesName: VARCHAR)
// Veterinarian(VetLicenseNumber: INTEGER(10), Name: VARCHAR NOT NULL, ClinicName: VARCHAR, 
// ContactNumber: INTEGER, EmailAddress: VARCHAR)
// ===========================================================================================


async function insertNewVet(event) {
    event.preventDefault();
    document.getElementById("vet_species_status").textContent = "submit clicked";
    console.log("inserting new vet");


    const vetID = document.getElementById("vetID").value;
    const vetName = document.getElementById("vetName").value;
    const clinicName = document.getElementById("clinicName").value;
    const vetContact = document.getElementById("vetContact").value;
    const vetEmail = document.getElementById("vetEmail").value;
    const vetSpecialty = document.getElementsByName("vetSpecialty").value;


    const response = await fetch('/insert-new-vet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            VetLicenseNumber: vetID,
            Name: vetName,
            ClinicName: clinicName,
            ContactNumber: vetContact,
            EmailAddress: vetEmail
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById("vet_register_status");

    if (responseData.success) {
        if (messageElement) {
            messageElement.textContent = `Practice Registered!`;
        }
    } else {
        if (messageElement) messageElement.textContent = "An error occurred";
    }

    // vet_species_status // TODO - add species selection to vetSpecializes table.


    fetchClientTableData();
}

async function resetVet() {
    try {
        const response = await fetch("/initiateNewVet", { method: 'POST' });
        const responseData = await response.json();

        if (responseData.success) {
            const messageElement = document.getElementById('resetResultMsg');
            if (messageElement) messageElement.textContent = "Vet table initiated successfully!";
            fetchClientTableData();
        } else {
            alert("Error initiating vet table!");
        }
    } catch (error) {
        console.error("Error resetting vet table:", error);
    }
}


async function updateVet(event) {
    event.preventDefault();

    // Get updated values from the form fields
    const vetLicense = document.getElementById("vetLicense_update").value;
    const vetName = document.getElementById("vetName_update").value;
    const clinicName = document.getElementById("clinicName_update").value;
    const vetContact = document.getElementById("vetContact_update").value;
    const vetEmail = document.getElementById("vetEmail_update").value;

    const payload = {
        VetLicenseNumber: vetLicense,
        Name: vetName,
        ClinicName: clinicName,
        ContactNumber: vetContact,
        EmailAddress: vetEmail
    };

    try {
        const response = await fetch('/update-vet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const responseData = await response.json();
        const updateStatusElem = document.getElementById("vet_update_status");

        if (responseData.success) {
            updateStatusElem.textContent = "Vet updated successfully!";
            fetchAndDisplayVetTable();
        } else {
            updateStatusElem.textContent = "Error updating vet.";
        }
    } catch (error) {
        console.error("Error updating vet:", error);
        const updateStatusElem = document.getElementById("vet_update_status");
        if (updateStatusElem) updateStatusElem.textContent = "Error updating vet.";
    }
}

async function fetchAndDisplayVetTable() {
    const tableElement = document.getElementById('vet_table');
    if (!tableElement) return;
    const tableBody = tableElement.querySelector('tbody');
    try {
        const response = await fetch('/vet-table', { method: 'GET' });
        const responseData = await response.json();
        const demotableContent = responseData.data;
        if (tableBody) tableBody.innerHTML = '';
        demotableContent.forEach(rowData => {
            const row = tableBody.insertRow();
            rowData.forEach((field, index) => {
                const cell = row.insertCell(index);
                cell.textContent = field;
            });
        });
    } catch (error) {
        console.error("Error fetching vet table data:", error);
    }
}

async function fetchAndDisplayVetTableProject() {
    event.preventDefault();
    
    const tableElement = document.querySelector('#vet_table');
    const tableHead = tableElement.querySelector("thead tr");
    const tableBody = tableElement.querySelector("tbody");
    let checkboxes = document.getElementsByName('vetInfo');
    let selected = ""

    tableHead.innerHTML = '';

    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            if (selected == "") {
                selected += checkboxes[i].value;
            } else {
                selected += "," + checkboxes[i].value;
            }
            let headerCell = document.createElement("th");
            headerCell.innerText=(checkboxes[i].value);
            tableHead.appendChild(headerCell);
        }
    }

    if (!tableBody) return;
    console.log("Selected filters:", selected);
    
    try {
        const response = await fetch('/vet-table-project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                selectors: selected
            })
        });


        const responseData = await response.json();
        const demotableContent = responseData.data;

        if (tableBody) tableBody.innerHTML = '';
        demotableContent.forEach(rowData => {
            const row = tableBody.insertRow();
            rowData.forEach((field, index) => {
                const cell = row.insertCell(index);
                cell.textContent = field;
            });
        });
    } catch (error) {
        console.error("Error fetching vet table data:", error);
    }
}
// ======================================================================
// AdoptionCenter(CenterLicenseNumber NUMBER(10) PRIMARY KEY,
// CenterName VARCHAR2(100), Address VARCHAR2(100), AnimalCapacity NUMBER(10))
// ======================================================================

async function fetchAndDisplayACTable() {
    const tableElement = document.getElementById('adoption_center_table');
    if (!tableElement) return;
    const tableBody = tableElement.querySelector('tbody');
    try {
        const response = await fetch('/adoption-center-table', { method: 'GET' });
        const responseData = await response.json();
        const demotableContent = responseData.data;
        if (tableBody) tableBody.innerHTML = '';
        demotableContent.forEach(rowData => {
            const row = tableBody.insertRow();
            rowData.forEach((field, index) => {
                const cell = row.insertCell(index);
                cell.textContent = field;
            });
        });
    } catch (error) {
        console.error("Error fetching Adoption Centre table data:", error);
    }
}

async function insertNewAdoptionCentre(event) {
    event.preventDefault();

    const centerLicenseNumber = document.getElementById("centerLicenseNumber").value;
    const centerName = document.getElementById("centerName").value;
    const address = document.getElementById("address").value;
    const animalCapacity = document.getElementById("animalCapacity").value;

    const response = await fetch("/insert-new-adoption-center", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            CenterLicenseNumber: centerLicenseNumber,
            CenterName: centerName,
            Address: address,
            AnimalCapacity: animalCapacity
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById("new_adoption_center_message");

    if (responseData.success) {
        if (messageElement) {
            messageElement.textContent = `Adoption Center added successfully!`;
        }
    } else {
        if (messageElement) messageElement.textContent = "Error occurred while adding the Center.";
    }

    fetchAndDisplayACTable();
}

async function updateAdoptionCenter(event) {
    event.preventDefault();
    const centerLicenseNumber = document.getElementById("centerLicenseNumber_update").value;
    const centerName = document.getElementById("centerName_update").value;
    const address = document.getElementById("address_update").value;
    const animalCapacity = document.getElementById("animalCapacity_update").value;

    const response = await fetch("/update-adoption-center", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            CenterLicenseNumber: centerLicenseNumber,
            CenterName: centerName,
            Address: address,
            AnimalCapacity: animalCapacity
        })
    });

    const responseData = await response.json();
    const updateStatusElem = document.getElementById("adoption_update_status");
    if (responseData.success) {
        updateStatusElem.textContent = "Adoption Center updated successfully!";
        // Refresh table
        fetchAndDisplayACTable();
    } else {
        updateStatusElem.textContent = "Error updating Adoption Center.";
    }
}

async function initializeAdoptionCenterTable() {
    try {
        const response = await fetch('/initiateNewAdoptionCenter', { method: 'POST' });
        const data = await response.json();
        console.log("Table initialization result:", data.success);
    } catch (error) {
        console.error("Error initializing AdoptionCenter table:", error);
    }
}

// ===========================================================================================
// ======== Species(SpeciesName, HousingSpaceRequired, GroomingRoutine, DietType) ============
// ===========================================================================================

async function handleInsertSpecies(event) {
    event.preventDefault();

    const speciesName = document.getElementById("speciesName").value;
    const housingSpace = document.getElementById("housingSpace").value;
    const groomingRoutine = document.getElementById("groomingRoutine").value;
    const dietType = document.getElementById("dietType").value;

    try {
        const response = await fetch('/insert-new-species', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                speciesName: speciesName,
                housingSpace: housingSpace,
                groomingRoutine: groomingRoutine,
                dietType: dietType
            })
        });

        const data = await response.json();
        const messageElem = document.getElementById("species_form_message");

        if (data.success) {
            messageElem.textContent = "Species added successfully.";
            fetchAndDisplaySpeciesTable();
            populateSpeciesDropdown();
        } else {
            messageElem.textContent = "Error adding species. It may already exist.";
        }
    } catch (error) {
        console.error("Error in handleInsertSpecies:", error);
        document.getElementById("species_form_message").textContent = "Error adding species.";
    }
}


async function fetchAndDisplaySpeciesTable() {
    const speciesTableBody = document.getElementById("speciesTableBody");
    if (!speciesTableBody) return;

    speciesTableBody.innerHTML = "";

    try {
        const response = await fetch('/species-list', { method: 'GET' });
        const speciesData = await response.json();

        speciesData.forEach(species => {
            const row = speciesTableBody.insertRow();

            const cellName = row.insertCell(0);
            const cellHousing = row.insertCell(1);
            const cellGrooming = row.insertCell(2);
            const cellDiet = row.insertCell(3);

            cellName.textContent = species.SpeciesName;
            cellHousing.textContent = species.HousingSpaceRequired;
            cellGrooming.textContent = species.GroomingRoutine;
            cellDiet.textContent = species.DietType;
        });

    } catch (error) {
        console.error("Error fetching species table:", error);
    }
}

async function resetSpeciesTable() {
    try {
        const response = await fetch('/initiateNewSpecies', { method: 'POST' });
        const data = await response.json();
        if (data.success) {
            alert("Species table reset.");
            fetchAndDisplaySpeciesTable();

        } else {
            alert("Error resetting species table.");
        }
    } catch (error) {
        console.error("Error resetting species table:", error);
    }
}

// populates speciesSelect with species for inserting new pets

async function populateSpeciesDropdown() {
    const speciesSelect = document.getElementById("speciesSelect");
    if (!speciesSelect) return;

    try {
        const response = await fetch('/species-list', { method: 'GET' });
        const speciesData = await response.json();

        speciesSelect.innerHTML = "";

        const placeHolder = document.createElement("option");
        placeHolder.value = "";
        placeHolder.textContent = "-- Select Species --";
        speciesSelect.appendChild(placeHolder);

        speciesData.forEach(species => {
            const option = document.createElement("option");
            option.value = species.SpeciesName;
            option.textContent = species.SpeciesName;
            speciesSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error fetching species for dropdown:", error);
    }
}

async function resetSpeciesTable() {
    try {
        const response = await fetch('/clearSpeciesTable', { method: 'POST' });
        const data = await response.json();
        if (data.success) {
            alert("Species table cleared.");
            fetchAndDisplaySpeciesTable();
        } else {
            alert("Error clearing species table.");
        }
    } catch (error) {
        console.error("Error clearing species table:", error);
    }
}



// =========================================================================================================================
// ======== InsurancePolicy(InsurancePolicyNumber, Level, CoverageAmount, InsuranceStartDate, InsuranceExpiration) =========
// =========================================================================================================================

async function insertNewInsurancePolicy(event) {
    event.preventDefault();

    const insurancePolicyNumber = document.getElementById("insurancePolicyNumber").value;
    const policyLevel = document.getElementById("policyLevel").value;
    const coverageAmount = document.getElementById("coverageAmount").value;
    const insuranceStartDate = document.getElementById("insuranceStartDate").value;
    const insuranceExpiration = document.getElementById("insuranceExpiration").value;

    const response = await fetch('/insert-new-insurance-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            InsurancePolicyNumber: insurancePolicyNumber,
            PolicyLevel: policyLevel,
            CoverageAmount: coverageAmount,
            InsuranceStartDate: insuranceStartDate,
            InsuranceExpiration: insuranceExpiration
        })
    });

    const data = await response.json();
    const messageElem = document.getElementById("insurance_form_message");

    if (data.success) {
        if (messageElem) messageElem.textContent = "Insurance policy added successfully.";
        fetchAndDisplayInsurancePolicies();
    } else {
        if (messageElem) messageElem.textContent = "Error adding insurance policy.";
    }
}

async function fetchAndDisplayInsurancePolicies() {
    const tableBody = document.getElementById("insuranceTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    try {
        const response = await fetch('/insurance-policies', { method: 'GET' });
        const policies = await response.json();

        policies.forEach(policy => {
            const row = tableBody.insertRow();
            const cellNumber = row.insertCell(0);
            const cellLevel = row.insertCell(1);
            const cellCoverage = row.insertCell(2);
            const cellStart = row.insertCell(3);
            const cellExpiration = row.insertCell(4);

            cellNumber.textContent = policy.InsurancePolicyNumber || policy.INSURANCEPOLICYNUMBER;
            cellLevel.textContent = policy.PolicyLevel || policy.POLICYLEVEL;
            cellCoverage.textContent = policy.CoverageAmount || policy.COVERAGEAMOUNT;
            cellStart.textContent = policy.InsuranceStartDate || policy.INSURANCESTARTDATE;
            cellExpiration.textContent = policy.InsuranceExpiration || policy.INSURANCEEXPIRATION;
        });
    } catch (error) {
        console.error("Error fetching insurance policies:", error);
    }
}

async function resetInsuranceTable() {
    try {
        const response = await fetch('/initiateNewInsurancePolicy', { method: 'POST' });
        const data = await response.json();
        if (data.success) {
            fetchAndDisplayInsurancePolicies();
        } else {
            alert("Error resetting insurance table!");
        }
    } catch (error) {
        console.error("Error resetting insurance table:", error);
    }
}

async function initializeInsurancePolicyTable() {
    try {
        const response = await fetch('/initiateNewInsurancePolicy', { method: 'POST' });
        const data = await response.json();
        console.log("InsurancePolicy table initialization result:", data.success);
    } catch (error) {
        console.error("Error initializing InsurancePolicy table:", error);
    }
}


// ======================================================================================================================================
// ============ MedicalRecord(PetMicrochipID, RecordID, InsurancePolicyNumber, VaccinationStatus, HealthCondition, VetNotes) ============
// ======================================================================================================================================

async function insertNewMedicalRecord(event) {
    event.preventDefault();

    const petMicrochipID = document.getElementById("petMicrochipID").value;
    const recordID = document.getElementById("recordID").value;
    const insurancePolicyNumber = document.getElementById("insurancePolicyNumber").value;
    const vaccinationStatus = document.getElementById("vaccinationStatus").value;
    const healthCondition = document.getElementById("healthCondition").value;
    const vetNotes = document.getElementById("vetNotes").value;

    const response = await fetch('/insert-new-medical-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            PetMicrochipID: petMicrochipID,
            RecordID: recordID,
            InsurancePolicyNumber: insurancePolicyNumber,
            VaccinationStatus: vaccinationStatus,
            HealthCondition: healthCondition,
            VetNotes: vetNotes
        })
    });

    const data = await response.json();
    if (data.success) {
        fetchAndDisplayMedicalRecordTable();
    } else {
        messageElem.textContent = "Error adding Medical Record. It may already exist.";
    }
}

async function fetchAndDisplayMedicalRecordTable() {
    const tableBody = document.getElementById("medicalRecordTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    try {
        const response = await fetch('/medical-records', { method: 'GET' });
        const records = await response.json();

        records.forEach(record => {
            const row = tableBody.insertRow();
            const cellPetID = row.insertCell(0);
            const cellRecordID = row.insertCell(1);
            const cellInsurance = row.insertCell(2);
            const cellVaccination = row.insertCell(3);
            const cellHealth = row.insertCell(4);
            const cellVetNotes = row.insertCell(5);

            cellPetID.textContent = record.PETMICROCHIPID;
            cellRecordID.textContent = record.RECORDID;
            cellInsurance.textContent = record.INSURANCEPOLICYNUMBER;
            cellVaccination.textContent = record.VACCINATIONSTATUS;
            cellHealth.textContent = record.HEALTHCONDITION;
            cellVetNotes.textContent = record.VETNOTES;
        });

    } catch (error) {
        console.error("Error fetching medical records:", error);
    }
}

async function resetMedicalRecordTable() {
    try {
        const response = await fetch("/initiateNewMedicalRecord", { method: 'POST' });
        const data = await response.json();
        if (data.success) {
            fetchAndDisplayMedicalRecordTable();
        } else {
            alert("Error resetting medical record table!");
        }
    } catch (error) {
        console.error("Error resetting medical record table:", error);
    }
}

async function initializeMedicalRecordTable() {
    try {
        const response = await fetch('/initiateNewMedicalRecord', { method: 'POST' });
        const data = await response.json();
        console.log("MedicalRecord table initialization result:", data.success);
    } catch (error) {
        console.error("Error initializing MedicalRecord table:", error);
    }
}

async function fetchAndDisplayMedicalRecordTablePet(event){
    event.preventDefault();

    const petMicrochipID = document.getElementById("petMicrochipMedical").value;

    const tableBody = document.getElementById("petRecordTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    try {
        const response = await fetch('/view-pet-medical', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                PetMicrochipID: petMicrochipID,
            })
        });
    
        const data = await response.json();

        data.data.forEach(record => {
            const row = tableBody.insertRow();
            const cellPetID = row.insertCell(0);
            const cellRecordID = row.insertCell(1);
            const cellInsurance = row.insertCell(2);
            const cellVaccination = row.insertCell(3);
            const cellHealth = row.insertCell(4);
            const cellVetNotes = row.insertCell(5);

            cellPetID.textContent = record.PETMICROCHIPID;
            cellRecordID.textContent = record.RECORDID;
            cellInsurance.textContent = record.INSURANCEPOLICYNUMBER;
            cellVaccination.textContent = record.VACCINATIONSTATUS;
            cellHealth.textContent = record.HEALTHCONDITION;
            cellVetNotes.textContent = record.VETNOTES;
        });

    } catch (error) {
        console.error("Error fetching medical records:", error);
    }

    document.getElementById("petRecordTable").style.visibility = "visible";
}

// Adoption

async function fetchAndDisplayAdoptionTable() {
    const tableElement = document.getElementById('adoption_table');
    if (!tableElement) return;
    const tableBody = tableElement.querySelector('tbody');
    try {
        const response = await fetch('/adoption-table', { method: 'GET' });
        const responseData = await response.json();
        const adoptionTableContent = responseData.data;
        // Clear old data
        if (tableBody) tableBody.innerHTML = '';
        // Populate table with new data
        adoptionTableContent.forEach(rowData => {
            const row = tableBody.insertRow();
            rowData.forEach((field, index) => {
                const cell = row.insertCell(index);
                cell.textContent = field;
            });
        });
    } catch (error) {
        console.error("Error fetching adoption table data:", error);
    }
}

async function insertNewAdoption(event) {
    event.preventDefault();

    const petMicrochipID = document.getElementById("petMicrochipID").value;
    const adoptionDate = document.getElementById("adoptionDate").value;
    const clientID = document.getElementById("clientID").value;
    const centerLicenseNumber = document.getElementById("centerLicenseNumber").value;

    const response = await fetch("/insert-new-adoption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            PetMicrochipID: petMicrochipID,
            AdoptionDate: adoptionDate,
            ClientID: clientID,
            CenterLicenseNumber: centerLicenseNumber
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById("new_adoption_message");

    if (responseData.success) {
        if (messageElement) {
            messageElement.textContent = "Adoption record added successfully!";
        }
        fetchAndDisplayAdoptionTable();
    } else {
        if (messageElement) messageElement.textContent = "Error occurred while adding the adoption record.";
    }
}

async function updateAdoption(event) {
    event.preventDefault();

    const petMicrochipID = document.getElementById("petMicrochipID_update").value;
    const adoptionDate = document.getElementById("adoptionDate_update").value;
    const clientID = document.getElementById("clientID_update").value;
    const centerLicenseNumber = document.getElementById("centerLicenseNumber_update").value;

    const response = await fetch("/update-adoption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            PetMicrochipID: petMicrochipID,
            AdoptionDate: adoptionDate,
            ClientID: clientID,
            CenterLicenseNumber: centerLicenseNumber
        })
    });

    const responseData = await response.json();
    const updateStatusElem = document.getElementById("adoption_update_status");

    if (responseData.success) {
        updateStatusElem.textContent = "Adoption record updated successfully!";
        fetchAndDisplayAdoptionTable();
    } else {
        updateStatusElem.textContent = "Error updating adoption record.";
    }
}

async function initializeAdoptionTable() {
    try {
        const response = await fetch("/initiateNewAdoption", { method: 'POST' });
        const responseData = await response.json();
        if (responseData.success) {
            const messageElement = document.getElementById('resetAdoptionResultMsg');
            if (messageElement) messageElement.textContent = "Adoption table initiated successfully!";
            fetchAndDisplayAdoptionTable();
        } else {
            alert("Error initiating adoption table!");
        }
    } catch (error) {
        console.error("Error resetting adoption table:", error);
    }
}