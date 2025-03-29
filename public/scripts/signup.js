window.onload = function () {
    document.getElementById("sign_up").addEventListener("submit", insertNewClient);
    document.getElementById("resetClient").addEventListener("click", resetClient);
    fetchAndDisplayClientTable()
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
        headers: {
            'Content-Type': 'application/json'
        },

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
        messageElement.textContent = `Account added! Your ClientID is ${responseData.clientID}. Keep this number for future login`;
        // fetchClientTableData();
    } else {
        messageElement.textContent = "An error occured";
    }
    fetchClientTableData();
}

function fetchClientTableData() {
    fetchAndDisplayClientTable();
}

// Fetches data from the demotable and displays it.
async function fetchAndDisplayClientTable() {
    const tableElement = document.getElementById('client_table');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/client-table', {
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
async function resetClient() {
    const response = await fetch("/initiateNewClient", {
        method: 'POST'
    });
    const responseData = await response.json();

    if (responseData.success) {
        const messageElement = document.getElementById('resetResultMsg');
        messageElement.textContent = "demotable initiated successfully!";
        fetchClientTableData();
    } else {
        alert("Error initiating table!");
    }
}