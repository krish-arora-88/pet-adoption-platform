// pages/veterinarians.js — Veterenarians.html: checkbox projection for vet info
import { apiFetch } from '../shared/api.js';

// ------------------------------------------------------------------
// Functions
// ------------------------------------------------------------------

async function fetchAndDisplayVetTableProject(event) {
    event.preventDefault();

    const tableElement = document.querySelector('#vet_table');
    const tableHead = tableElement.querySelector('thead tr');
    const tableBody = tableElement.querySelector('tbody');
    let checkboxes = document.getElementsByName('vetInfo');
    let selected = '';

    tableHead.innerHTML = '';

    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            if (selected == '') {
                selected += checkboxes[i].value;
            } else {
                selected += ',' + checkboxes[i].value;
            }
            let headerCell = document.createElement('th');
            headerCell.innerText = (checkboxes[i].value);
            tableHead.appendChild(headerCell);
        }
    }

    if (!tableBody) return;
    console.log('Selected filters:', selected);

    try {
        const response = await apiFetch('/vet-table-project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                selectors: selected
            })
        });

        const responseData = await response.json();
        const demotableContent = responseData.data;

        if (tableBody) tableBody.innerHTML = '';
        demotableContent.forEach(rowData => {
            const row = tableBody.insertRow();
            rowData.forEach((field, index) => {
                const cell = row.insertCell(index);
                cell.textContent = field;
            });
        });
    } catch (error) {
        console.error('Error fetching vet table data:', error);
    }
}

// ------------------------------------------------------------------
// Event listeners
// ------------------------------------------------------------------

const projectVetInfoForm = document.getElementById('projectVetInfo');
if (projectVetInfoForm) {
    projectVetInfoForm.addEventListener('submit', fetchAndDisplayVetTableProject);
}
