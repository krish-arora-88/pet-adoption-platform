// pages/adoptionCentres.js — adoptioncentres.html: adoption centre CRUD + table
import { apiFetch } from '../shared/api.js';
import { populateTableFromArrays } from '../shared/table.js';

// ------------------------------------------------------------------
// Functions
// ------------------------------------------------------------------

async function fetchAndDisplayACTable() {
    const tableElement = document.getElementById('adoption_center_table');
    if (!tableElement) return;

    try {
        const response = await apiFetch('/adoption-center-table', { method: 'GET' });
        const responseData = await response.json();
        populateTableFromArrays('adoption_center_table', responseData.data);
    } catch (error) {
        console.error('Error fetching Adoption Centre table data:', error);
    }
}

async function insertNewAdoptionCentre(event) {
    event.preventDefault();

    const centerLicenseNumber = document.getElementById('centerLicenseNumber').value;
    const centerName = document.getElementById('centerName').value;
    const address = document.getElementById('address').value;
    const animalCapacity = document.getElementById('animalCapacity').value;

    const response = await apiFetch('/insert-new-adoption-center', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            CenterLicenseNumber: centerLicenseNumber,
            CenterName: centerName,
            Address: address,
            AnimalCapacity: animalCapacity
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('new_adoption_center_message');

    if (responseData.success) {
        if (messageElement) {
            messageElement.textContent = 'Adoption Center added successfully!';
        }
    } else {
        if (messageElement) messageElement.textContent = 'Error occurred while adding the Center.';
    }

    fetchAndDisplayACTable();
}

async function updateAdoptionCenter(event) {
    event.preventDefault();
    const centerLicenseNumber = document.getElementById('centerLicenseNumber_update').value;
    const centerName = document.getElementById('centerName_update').value;
    const address = document.getElementById('address_update').value;
    const animalCapacity = document.getElementById('animalCapacity_update').value;

    const response = await apiFetch('/update-adoption-center', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            CenterLicenseNumber: centerLicenseNumber,
            CenterName: centerName,
            Address: address,
            AnimalCapacity: animalCapacity
        })
    });

    const responseData = await response.json();
    const updateStatusElem = document.getElementById('adoption_update_status');
    if (responseData.success) {
        updateStatusElem.textContent = 'Adoption Center updated successfully!';
        // Refresh table
        fetchAndDisplayACTable();
    } else {
        updateStatusElem.textContent = 'Error updating Adoption Center.';
    }
}

async function initializeAdoptionCenterTable() {
    try {
        const response = await apiFetch('/initiateNewAdoptionCenter', { method: 'POST' });
        const data = await response.json();
        console.log('Table initialization result:', data.success);
    } catch (error) {
        console.error('Error initializing AdoptionCenter table:', error);
    }
}

// ------------------------------------------------------------------
// Event listeners
// ------------------------------------------------------------------

if (document.getElementById('adoption_center_table')) {
    fetchAndDisplayACTable();
}

const newACForm = document.getElementById('new_adoption_center');
if (newACForm) {
    newACForm.addEventListener('submit', insertNewAdoptionCentre);
}

const acUpdateForm = document.getElementById('adoption_center_update');
if (acUpdateForm) {
    acUpdateForm.addEventListener('submit', updateAdoptionCenter);
}

const resetACBtn = document.getElementById('resetACTable');
if (resetACBtn) {
    resetACBtn.addEventListener('click', initializeAdoptionCenterTable);
}
