// pages/vetPractice.js — VetPractice.html: vet CRUD + table display
import { apiFetch } from '../shared/api.js';
import { populateTableFromArrays } from '../shared/table.js';

// ------------------------------------------------------------------
// Functions
// ------------------------------------------------------------------

async function insertNewVet(event) {
    event.preventDefault();
    document.getElementById('vet_species_status').textContent = 'submit clicked';
    console.log('inserting new vet');

    const vetID = document.getElementById('vetID').value;
    const vetName = document.getElementById('vetName').value;
    const clinicName = document.getElementById('clinicName').value;
    const vetContact = document.getElementById('vetContact').value;
    const vetEmail = document.getElementById('vetEmail').value;
    const vetSpecialty = document.getElementsByName('vetSpecialty').value;

    const response = await apiFetch('/insert-new-vet', {
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
    const messageElement = document.getElementById('vet_register_status');

    if (responseData.success) {
        if (messageElement) {
            messageElement.textContent = 'Practice Registered!';
        }
    } else {
        if (messageElement) messageElement.textContent = 'An error occurred';
    }

    // vet_species_status // TODO - add species selection to vetSpecializes table.

    fetchClientTableData();
}

function fetchClientTableData() {
    fetchAndDisplayVetTable();
}

async function resetVet() {
    try {
        const response = await apiFetch('/initiateNewVet', { method: 'POST' });
        const responseData = await response.json();

        if (responseData.success) {
            const messageElement = document.getElementById('resetResultMsg');
            if (messageElement) messageElement.textContent = 'Vet table initiated successfully!';
            fetchClientTableData();
        } else {
            alert('Error initiating vet table!');
        }
    } catch (error) {
        console.error('Error resetting vet table:', error);
    }
}

async function updateVet(event) {
    event.preventDefault();

    // Get updated values from the form fields
    const vetLicense = document.getElementById('vetLicense_update').value;
    const vetName = document.getElementById('vetName_update').value;
    const clinicName = document.getElementById('clinicName_update').value;
    const vetContact = document.getElementById('vetContact_update').value;
    const vetEmail = document.getElementById('vetEmail_update').value;

    const payload = {
        VetLicenseNumber: vetLicense,
        Name: vetName,
        ClinicName: clinicName,
        ContactNumber: vetContact,
        EmailAddress: vetEmail
    };

    try {
        const response = await apiFetch('/update-vet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const responseData = await response.json();
        const updateStatusElem = document.getElementById('vet_update_status');

        if (responseData.success) {
            updateStatusElem.textContent = 'Vet updated successfully!';
            fetchAndDisplayVetTable();
        } else {
            updateStatusElem.textContent = 'Error updating vet.';
        }
    } catch (error) {
        console.error('Error updating vet:', error);
        const updateStatusElem = document.getElementById('vet_update_status');
        if (updateStatusElem) updateStatusElem.textContent = 'Error updating vet.';
    }
}

async function fetchAndDisplayVetTable() {
    const tableElement = document.getElementById('vet_table');
    if (!tableElement) return;

    try {
        const response = await apiFetch('/vet-table', { method: 'GET' });
        const responseData = await response.json();
        populateTableFromArrays('vet_table', responseData.data);
    } catch (error) {
        console.error('Error fetching vet table data:', error);
    }
}

// ------------------------------------------------------------------
// Event listeners
// ------------------------------------------------------------------

const registerVetForm = document.getElementById('registerVet');
if (registerVetForm) {
    registerVetForm.addEventListener('submit', insertNewVet);
}

const resetVetBtn = document.getElementById('resetVet');
if (resetVetBtn) {
    resetVetBtn.addEventListener('click', resetVet);
}

const vetUpdateForm = document.getElementById('vet_update');
if (vetUpdateForm) {
    vetUpdateForm.addEventListener('submit', updateVet);
}

// Auto-load vet table if present
if (document.getElementById('vet_table')) {
    fetchAndDisplayVetTable();
}
