// pages/pets.js — Browse Pets page: pet table, filtering, stats, pet registration
import { apiFetch } from '../shared/api.js';
import { populateTableFromArrays } from '../shared/table.js';

// ------------------------------------------------------------------
// Functions (merged from pets.js + managePets.js)
// ------------------------------------------------------------------

async function fetchAndDisplayPetTable() {
    const tableElement = document.getElementById('pet_table');
    if (!tableElement) return;

    try {
        const response = await apiFetch('/pet-table', { method: 'GET' });
        const responseData = await response.json();
        populateTableFromArrays('pet_table', responseData.data);
    } catch (error) {
        console.error('Error fetching pet table data:', error);
    }
}

function fetchPetTableData() {
    fetchAndDisplayPetTable();
}

async function applyPetFilters() {
    const speciesFilter = document.getElementById('speciesFilter').value;
    const ageMinFilter = document.getElementById('ageMinFilter').value;
    const ageMaxFilter = document.getElementById('ageMaxFilter').value;

    try {
        const params = new URLSearchParams();
        if (speciesFilter !== 'all') {
            params.append('species', speciesFilter);
        }
        if (ageMinFilter) {
            params.append('minAge', ageMinFilter);
        }
        if (ageMaxFilter) {
            params.append('maxAge', ageMaxFilter);
        }

        const url = `/pet-table?${params.toString()}`;
        const response = await apiFetch(url, { method: 'GET' });
        const responseData = await response.json();
        populateTableFromArrays('pet_table', responseData.data);
    } catch (error) {
        console.error('Error filtering pet table data:', error);
    }
}

function resetPetFilters() {
    document.getElementById('speciesFilter').value = 'all';
    document.getElementById('ageMinFilter').value = '';
    document.getElementById('ageMaxFilter').value = '';
    fetchPetTableData();
}

async function filterPetsBySpecies() {
    const speciesFilter = document.getElementById('speciesFilter').value;

    try {
        let url = '/pet-table';
        if (speciesFilter !== 'all') {
            url = `/pet-table?species=${speciesFilter}`;
        }

        const response = await apiFetch(url, { method: 'GET' });
        const responseData = await response.json();
        populateTableFromArrays('pet_table', responseData.data);
    } catch (error) {
        console.error('Error filtering pet table data:', error);
    }
}

async function viewOldesPets(event) {
    event.preventDefault();

    const tableElement = document.querySelector('#petStatsTable');
    const tableBody = tableElement.querySelector('tbody');

    try {
        const response = await apiFetch('/get-pet-stats', { method: 'GET' });
        const responseData = await response.json();
        const demotableContent = responseData.data;

        // Clear existing rows safely
        while (tableBody.firstChild) {
            tableBody.removeChild(tableBody.firstChild);
        }

        demotableContent.forEach(rowData => {
            const row = tableBody.insertRow();
            rowData.forEach((field, index) => {
                const cell = row.insertCell(index);
                cell.textContent = field;
            });
        });
    } catch (error) {
        console.error('Error fetching pet stats:', error);
    }
}

async function fetchSpeciesAgeStats() {
    try {
        const response = await apiFetch('/species-age-stats');
        const { data } = await response.json();

        const tbody = document.querySelector('#speciesStatsTable tbody');

        // Clear existing rows safely
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }

        data.forEach(row => {
            const tr = document.createElement('tr');

            const speciesCell = document.createElement('td');
            speciesCell.textContent = row[0];
            tr.appendChild(speciesCell);

            const ageCell = document.createElement('td');
            ageCell.textContent = row[1].toFixed(1);
            tr.appendChild(ageCell);

            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error fetching species age stats:', error);
    }
}

async function resetPetTable() {
    try {
        const response = await apiFetch('/initiateNewPet', { method: 'POST' });
        const responseData = await response.json();

        if (responseData.success) {
            const messageElement = document.getElementById('resetResultMsg');
            if (messageElement) messageElement.textContent = 'Table initiated successfully!';
            fetchPetTableData();
        } else {
            alert('Error initiating table!');
        }
    } catch (error) {
        console.error('Error resetting pet table:', error);
    }
}

// --- From managePets.js ---

async function insertNewPet(event) {
    event.preventDefault();

    const microchip = document.getElementById('MicrochipID').value;
    const petname = document.getElementById('petName').value;
    const petAge = document.getElementById('petAge').value;
    const breed = document.getElementById('breed').value;
    const gender = document.getElementById('gender').value;
    const speciesName = document.getElementById('speciesSelect').value;

    try {
        const response = await apiFetch('/insert-new-pet', {
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
        const messageElement = document.getElementById('new_pet_message');

        if (responseData.success) {
            if (messageElement) {
                messageElement.textContent = 'Pet registered successfully!';
                messageElement.className = 'message message-success';
            }
            fetchPetTableData();
        } else {
            if (messageElement) {
                messageElement.textContent = 'An error occurred while registering the pet.';
                messageElement.className = 'message message-error';
            }
        }
    } catch (error) {
        console.error('Error inserting new pet:', error);
        const messageElement = document.getElementById('new_pet_message');
        if (messageElement) {
            messageElement.textContent = 'Network error — please try again.';
            messageElement.className = 'message message-error';
        }
    }
}

async function populateSpeciesDropdown() {
    const speciesSelect = document.getElementById('speciesSelect');
    if (!speciesSelect) return;

    try {
        const response = await apiFetch('/species-list', { method: 'GET' });
        const speciesData = await response.json();

        // Clear existing options safely
        while (speciesSelect.firstChild) {
            speciesSelect.removeChild(speciesSelect.firstChild);
        }

        const placeHolder = document.createElement('option');
        placeHolder.value = '';
        placeHolder.textContent = '-- Select Species --';
        speciesSelect.appendChild(placeHolder);

        speciesData.forEach(species => {
            const option = document.createElement('option');
            option.value = species.SpeciesName;
            option.textContent = species.SpeciesName;
            speciesSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching species for dropdown:', error);
    }
}

// ------------------------------------------------------------------
// Expandable panel toggle
// ------------------------------------------------------------------

function initExpandablePanels() {
    const triggers = document.querySelectorAll('.expandable-trigger');
    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const panel = trigger.closest('.expandable-panel');
            if (panel) {
                panel.classList.toggle('open');
            }
        });
    });
}

// ------------------------------------------------------------------
// Event listeners
// ------------------------------------------------------------------

const speciesFilterElem = document.getElementById('speciesFilter');
if (speciesFilterElem) {
    speciesFilterElem.addEventListener('change', filterPetsBySpecies);
}

const petStatsTable = document.getElementById('petStatsTable');
if (petStatsTable) {
    document.getElementById('viewPetStats').addEventListener('click', viewOldesPets);
}

const applyFiltersBtn = document.getElementById('applyFilters');
if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', applyPetFilters);
}

const resetFiltersBtn = document.getElementById('resetFilters');
if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', resetPetFilters);
}

const speciesAgeStatsBtn = document.getElementById('speciesAgeStats');
if (speciesAgeStatsBtn) {
    speciesAgeStatsBtn.addEventListener('click', fetchSpeciesAgeStats);
}

const resetPetTableBtn = document.getElementById('resetPetTable');
if (resetPetTableBtn) {
    resetPetTableBtn.addEventListener('click', resetPetTable);
}

const seePetsBtn = document.getElementById('see_pets');
if (seePetsBtn) {
    seePetsBtn.addEventListener('click', fetchPetTableData);
}

const newPetForm = document.getElementById('new_pet');
if (newPetForm) {
    newPetForm.addEventListener('submit', insertNewPet);
}

// ------------------------------------------------------------------
// Auto-load on page init
// ------------------------------------------------------------------

initExpandablePanels();
populateSpeciesDropdown();
fetchPetTableData();
