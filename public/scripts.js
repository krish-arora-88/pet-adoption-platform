window.onload = function() {
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