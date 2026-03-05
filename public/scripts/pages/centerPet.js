// pages/centerPet.js — CenterPet.html: species CRUD, species table, aggregation query, species dropdown
import { apiFetch } from '../shared/api.js';

// ------------------------------------------------------------------
// Functions
// ------------------------------------------------------------------

async function handleInsertSpecies(event) {
    event.preventDefault();
    const speciesNameElem = document.getElementById('speciesName');
    const speciesName = speciesNameElem.value;
    const housingSpace = document.getElementById('housingSpace').value;
    const groomingRoutine = document.getElementById('groomingRoutine').value;
    const dietType = document.getElementById('dietType').value;
    const messageElem = document.getElementById('species_form_message');

    try {
        let response, data;
        if (speciesNameElem.readOnly) {
            console.log('Update branch: updating species', speciesName, housingSpace, groomingRoutine, dietType);
            response = await apiFetch('/update-species', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ speciesName, housingSpace, groomingRoutine, dietType })
            });
            console.log('Response from update-species:', response);
            data = await response.json();
            console.log('Parsed update response:', data);
            if (data.success) {
                messageElem.textContent = 'Species updated successfully.';
            } else {
                messageElem.textContent = 'Error updating species.';
            }
            speciesNameElem.readOnly = false;
            document.querySelector('#speciesForm button').textContent = 'Add Species';
        } else {
            console.log('Insert branch: inserting species', speciesName, housingSpace, groomingRoutine, dietType);
            response = await apiFetch('/insert-new-species', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ speciesName, housingSpace, groomingRoutine, dietType })
            });
            data = await response.json();
            if (data.success) {
                messageElem.textContent = 'Species added successfully.';
            } else {
                messageElem.textContent = 'Error adding species. It may already exist.';
            }
        }
        await fetchAndDisplaySpeciesTable();
        await populateSpeciesDropdown();
        document.getElementById('speciesForm').reset();
    } catch (error) {
        console.error('Error in handleInsertSpecies:', error);
        messageElem.textContent = 'Error processing species.';
    }
}

async function fetchAndDisplaySpeciesTable() {
    const speciesTableBody = document.getElementById('speciesTableBody');
    if (!speciesTableBody) return;

    while (speciesTableBody.firstChild) speciesTableBody.removeChild(speciesTableBody.firstChild);

    try {
        const response = await apiFetch('/species-list', { method: 'GET' });
        const speciesData = await response.json();

        if (!speciesData || speciesData.length === 0) {
            const row = speciesTableBody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 6;
            cell.className = 'table-empty';
            cell.textContent = 'No species found.';
            return;
        }

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

            const cellEdit = row.insertCell(4);
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => populateSpeciesForm(species));
            cellEdit.appendChild(editButton);

            const cellDelete = row.insertCell(5);
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => deleteSpeciesEntry(species.SpeciesName));
            cellDelete.appendChild(deleteButton);
        });
    } catch (error) {
        console.error('Error fetching species table:', error);
    }
}

async function resetSpeciesTable() {
    try {
        const response = await apiFetch('/clearSpeciesTable', { method: 'POST' });
        const data = await response.json();
        if (data.success) {
            alert('Species table cleared.');
            fetchAndDisplaySpeciesTable();
        } else {
            alert('Error clearing species table.');
        }
    } catch (error) {
        console.error('Error clearing species table:', error);
    }
}

async function populateSpeciesDropdown() {
    const speciesSelect = document.getElementById('speciesSelect');
    if (!speciesSelect) return;

    try {
        const response = await apiFetch('/species-list', { method: 'GET' });
        const speciesData = await response.json();

        while (speciesSelect.firstChild) speciesSelect.removeChild(speciesSelect.firstChild);

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

function populateSpeciesForm(species) {
    document.getElementById('speciesName').value = species.SpeciesName;
    document.getElementById('housingSpace').value = species.HousingSpaceRequired;
    document.getElementById('groomingRoutine').value = species.GroomingRoutine;
    document.getElementById('dietType').value = species.DietType;

    const submitButton = document.querySelector('#speciesForm button');
    submitButton.textContent = 'Update Species';

    document.getElementById('speciesName').readOnly = true;
}

async function deleteSpeciesEntry(speciesName) {
    try {
        const response = await apiFetch('/delete-species', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ speciesName })
        });
        const data = await response.json();
        if (data.success) {
            alert('Species deleted successfully.');
            fetchAndDisplaySpeciesTable();
            populateSpeciesDropdown();
        } else {
            alert('Error deleting species.');
        }
    } catch (error) {
        console.error('Error deleting species:', error);
        alert('Error deleting species.');
    }
}

// ------------------------------------------------------------------
// Event listeners
// ------------------------------------------------------------------

const speciesForm = document.getElementById('speciesForm');
if (speciesForm) {
    speciesForm.addEventListener('submit', handleInsertSpecies);
}

const resetSpeciesBtn = document.getElementById('resetSpeciesTable');
if (resetSpeciesBtn) {
    resetSpeciesBtn.addEventListener('click', resetSpeciesTable);
}

if (document.getElementById('speciesTable')) {
    fetchAndDisplaySpeciesTable();
}

if (document.getElementById('speciesSelect')) {
    populateSpeciesDropdown();
}

// Aggregation query: species with at least N pets
const querySpeciesBtn = document.getElementById('querySpecies');
if (querySpeciesBtn) {
    querySpeciesBtn.addEventListener('click', async function () {
        const minCount = document.getElementById('minPetCount').value;

        try {
            const response = await apiFetch(`/query-species?minCount=${minCount}`, {
                method: 'GET'
            });

            const result = await response.json();

            const tableBody = document.getElementById('aggregationResultTableBody');
            while (tableBody.firstChild) tableBody.removeChild(tableBody.firstChild);

            if (result.data && result.data.length > 0) {
                result.data.forEach(row => {
                    const tr = document.createElement('tr');
                    const tdSpecies = document.createElement('td');
                    tdSpecies.textContent = row.SPECIESNAME;
                    const tdCount = document.createElement('td');
                    tdCount.textContent = row.NUMPETS || row.NumPets;
                    tr.appendChild(tdSpecies);
                    tr.appendChild(tdCount);
                    tableBody.appendChild(tr);
                });

            } else {

                const tr = document.createElement('tr');
                const td = document.createElement('td');
                td.setAttribute('colspan', '2');
                td.className = 'table-empty';
                td.textContent = 'No species found meeting this criteria.';
                tr.appendChild(td);
                tableBody.appendChild(tr);
            }
        } catch (error) {
            console.error('Error executing aggregation query:', error);
        }
    });
}
