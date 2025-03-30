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
// =========== Pet (PetMicrochipID, Name, Age, Breed, Gender) ===========
// ======================================================================

async function insertNewPet(event) {
    event.preventDefault();

    const microchip = document.getElementById("MicrochipID").value;
    const petname = document.getElementById("petName").value;
    const petAge = document.getElementById("petAge").value;
    const breed = document.getElementById("breed").value;
    const gender = document.getElementById("gender").value;

    const response = await fetch('/insert-new-pet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            MicrochipID: microchip,
            Name: petname,
            Age: petAge,
            Breed: breed,
            Gender: gender
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