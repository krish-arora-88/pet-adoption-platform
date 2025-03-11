window.onload = function () {
    document.getElementById("new_pet").addEventListener("submit", insertNewPet);
}

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
        fetchTableData();
    } else {
        messageElement.textContent = "An error occured";
    }
}


function fetchTableData() {
    fetchAndDisplayUsers();
}

// Fetches data from the demotable and displays it.
async function fetchAndDisplayUsers() {
    const tableElement = document.getElementById('new_pet');
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