// pages/adoptions.js — adoptions page: adoption records + client accounts (merged)
import { initTabs } from '../shared/tabs.js';
import { apiFetch } from '../shared/api.js';
import { populateTableFromArrays } from '../shared/table.js';

// ------------------------------------------------------------------
// Tab initialisation
// ------------------------------------------------------------------
initTabs('.tabs-container');

// ==================================================================
// TAB 1 — Adoption Records
// ==================================================================

async function fetchAndDisplayAdoptionTable() {
    const tableElement = document.getElementById('adoption_table');
    if (!tableElement) return;

    try {
        const response = await apiFetch('/adoption-table', { method: 'GET' });
        const responseData = await response.json();
        populateTableFromArrays('adoption_table', responseData.data);
    } catch (error) {
        console.error('Error fetching adoption table data:', error);
    }
}

async function insertNewAdoption(event) {
    event.preventDefault();

    const petMicrochipID = document.getElementById('petMicrochipID').value;
    const adoptionDate = document.getElementById('adoptionDate').value;
    const clientID = document.getElementById('clientID').value;
    const centerLicenseNumber = document.getElementById('centerLicenseNumber').value;

    const response = await apiFetch('/insert-new-adoption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            PetMicrochipID: petMicrochipID,
            AdoptionDate: adoptionDate,
            ClientID: clientID,
            CenterLicenseNumber: centerLicenseNumber
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('new_adoption_message');

    if (responseData.success) {
        if (messageElement) {
            messageElement.textContent = 'Adoption record added successfully!';
        }
        fetchAndDisplayAdoptionTable();
    } else {
        if (messageElement) messageElement.textContent = 'Error occurred while adding the adoption record.';
    }
}

async function updateAdoption(event) {
    event.preventDefault();

    const petMicrochipID = document.getElementById('petMicrochipID_update').value;
    const adoptionDate = document.getElementById('adoptionDate_update').value;
    const clientID = document.getElementById('clientID_update').value;
    const centerLicenseNumber = document.getElementById('centerLicenseNumber_update').value;

    const response = await apiFetch('/update-adoption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            PetMicrochipID: petMicrochipID,
            AdoptionDate: adoptionDate,
            ClientID: clientID,
            CenterLicenseNumber: centerLicenseNumber
        })
    });

    const responseData = await response.json();
    const updateStatusElem = document.getElementById('adoption_update_status');

    if (responseData.success) {
        updateStatusElem.textContent = 'Adoption record updated successfully!';
        fetchAndDisplayAdoptionTable();
    } else {
        updateStatusElem.textContent = 'Error updating adoption record.';
    }
}

async function initializeAdoptionTable() {
    try {
        const response = await apiFetch('/initiateNewAdoption', { method: 'POST' });
        const responseData = await response.json();
        if (responseData.success) {
            const messageElement = document.getElementById('resetAdoptionResultMsg');
            if (messageElement) messageElement.textContent = 'Adoption table initiated successfully!';
            fetchAndDisplayAdoptionTable();
        } else {
            alert('Error initiating adoption table!');
        }
    } catch (error) {
        console.error('Error resetting adoption table:', error);
    }
}

// ==================================================================
// TAB 2 — Client Accounts
// ==================================================================

async function insertNewClient(event) {
    event.preventDefault();

    const ClientFirstName = document.getElementById('ClientFirstName').value;
    const ClientLastName = document.getElementById('ClientLastName').value;
    const ClientAddress = document.getElementById('ClientAddress').value;
    const ClientContact = document.getElementById('ClientContact').value;

    const response = await apiFetch('/insert-new-client', {
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
    const messageElement = document.getElementById('sign_up_status');

    if (responseData.success) {
        if (messageElement) {
            messageElement.textContent = `Account added! Your ClientID is ${responseData.clientID}. Keep this number for future login`;
        }
    } else {
        if (messageElement) messageElement.textContent = 'An error occurred';
    }
    fetchAndDisplayClientTable();
}

async function fetchAndDisplayClientTable() {
    const tableElement = document.getElementById('client_table');
    if (!tableElement) return;

    try {
        const response = await apiFetch('/client-table', { method: 'GET' });
        const responseData = await response.json();
        populateTableFromArrays('client_table', responseData.data);
    } catch (error) {
        console.error('Error fetching client table data:', error);
    }
}

async function updateClient(event) {
    event.preventDefault();

    const clientId = parseInt(document.getElementById('ClientNumber').value, 10);
    const updatedFirstName = document.getElementById('ClientFirstName_update').value;
    const updatedLastName = document.getElementById('ClientLastName_update').value;
    const updatedAddress = document.getElementById('ClientAddress_update').value;
    const updatedContact = document.getElementById('ClientContact_update').value;

    const payload = {
        clientId,
        FirstName: updatedFirstName,
        LastName: updatedLastName,
        ClientAddress: updatedAddress,
        ClientContact: updatedContact
    };

    try {
        const response = await apiFetch('/update-client', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const responseData = await response.json();
        const updateStatusElem = document.getElementById('update_status');

        if (responseData.success) {
            updateStatusElem.textContent = 'Account updated successfully!';
            fetchAndDisplayClientTable();
        } else {
            updateStatusElem.textContent = 'Error updating account.';
        }
    } catch (error) {
        console.error('Error updating account:', error);
        const updateStatusElem = document.getElementById('update_status');
        if (updateStatusElem) updateStatusElem.textContent = 'Error updating account.';
    }
}

async function resetClient() {
    try {
        const response = await apiFetch('/initiateNewClient', { method: 'POST' });
        const responseData = await response.json();

        if (responseData.success) {
            const messageElement = document.getElementById('resetResultMsg');
            if (messageElement) messageElement.textContent = 'Client table initiated successfully!';
            fetchAndDisplayClientTable();
        } else {
            alert('Error initiating client table!');
        }
    } catch (error) {
        console.error('Error resetting client table:', error);
    }
}

// ------------------------------------------------------------------
// Event listeners — Adoption Records
// ------------------------------------------------------------------

const newAdoptionForm = document.getElementById('new_adoption');
if (newAdoptionForm) {
    newAdoptionForm.addEventListener('submit', insertNewAdoption);
}

const adoptionUpdateForm = document.getElementById('adoption_update');
if (adoptionUpdateForm) {
    adoptionUpdateForm.addEventListener('submit', updateAdoption);
}

const resetAdoptionBtn = document.getElementById('resetAdoptionTable');
if (resetAdoptionBtn) {
    resetAdoptionBtn.addEventListener('click', initializeAdoptionTable);
}

// ------------------------------------------------------------------
// Event listeners — Client Accounts
// ------------------------------------------------------------------

const signUpForm = document.getElementById('sign_up');
if (signUpForm) {
    signUpForm.addEventListener('submit', insertNewClient);
}

const clientUpdateForm = document.getElementById('client_update');
if (clientUpdateForm) {
    clientUpdateForm.addEventListener('submit', updateClient);
}

const resetClientBtn = document.getElementById('resetClient');
if (resetClientBtn) {
    resetClientBtn.addEventListener('click', resetClient);
}

// ------------------------------------------------------------------
// Auto-load data on page init
// ------------------------------------------------------------------
fetchAndDisplayAdoptionTable();
fetchAndDisplayClientTable();
