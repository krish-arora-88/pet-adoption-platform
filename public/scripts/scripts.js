window.onload = function () {
    checkDbConnection();
    document.getElementById("new_pet").addEventListener("submit", insertNewPet);
    document.getElementById("resetPetTable").addEventListener("click", resetPetTable);
    document.getElementById("see_pets").addEventListener("click", fetchPetTableData);
    fetchPetTableData();
}

// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus'); // I THINK THIS STUFF IS THE ISSUE
    const loadingGifElem = document.getElementById('loadingGif');

    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    // Hide the loading GIF once the response is received.
    loadingGifElem.style.display = 'none';
    // Display the statusElem's text in the placeholder.
    statusElem.style.display = 'inline';

    response.text()
        .then((text) => {
            statusElem.textContent = text;
        })
        .catch((error) => {
            statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
        });
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
        headers: {
            'Content-Type': 'application/json'
        },

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
        messageElement.textContent = "Success!";
        fetchPetTableData();
    } else {
        messageElement.textContent = "An error occured";
    }
}


function fetchPetTableData() {
    fetchAndDisplayPetTable();
}

// Fetches data from the demotable and displays it.
async function fetchAndDisplayPetTable() {
    const tableElement = document.getElementById('pet_table');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/pet-table', {
        method: 'GET'
    });

    const responseData = await response.json();
    const demotableContent = responseData.data;

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    demotableContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

// This function resets or initializes the demotable.
async function resetPetTable() {
    const response = await fetch("/initiateNewPet", {
        method: 'POST'
    });
    const responseData = await response.json();

    if (responseData.success) {
        const messageElement = document.getElementById('resetResultMsg');
        messageElement.textContent = "demotable initiated successfully!";
        fetchPetTableData();
    } else {
        alert("Error initiating table!");
    }
}