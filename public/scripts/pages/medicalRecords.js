// pages/medicalRecords.js — VetMedicalRecord.html: medical record CRUD + table
import { apiFetch } from '../shared/api.js';

// ------------------------------------------------------------------
// Functions
// ------------------------------------------------------------------

async function insertNewMedicalRecord(event) {
    event.preventDefault();

    const petMicrochipID = document.getElementById('med_petMicrochipID').value;
    const recordID = document.getElementById('med_recordID').value;
    const insurancePolicyNumber = document.getElementById('med_insurancePolicyNumber').value;
    const vaccinationStatus = document.getElementById('med_vaccinationStatus').value;
    const healthCondition = document.getElementById('med_healthCondition').value;
    const vetNotes = document.getElementById('med_vetNotes').value;

    const response = await apiFetch('/insert-new-medical-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            PetMicrochipID: petMicrochipID,
            RecordID: recordID,
            InsurancePolicyNumber: insurancePolicyNumber,
            VaccinationStatus: vaccinationStatus,
            HealthCondition: healthCondition,
            VetNotes: vetNotes
        })
    });

    const data = await response.json();
    if (data.success) {
        fetchAndDisplayMedicalRecordTable();
    } else {
        const messageElem = document.getElementById('medical_record_form_message');
        if (messageElem) messageElem.textContent = 'Error adding Medical Record. It may already exist.';
    }
}

async function fetchAndDisplayMedicalRecordTable() {
    const tableBody = document.getElementById('medicalRecordTableBody');
    if (!tableBody) return;

    while (tableBody.firstChild) tableBody.removeChild(tableBody.firstChild);

    try {
        const response = await apiFetch('/medical-records', { method: 'GET' });
        const records = await response.json();

        if (!records || records.length === 0) {
            const row = tableBody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 6;
            cell.className = 'table-empty';
            cell.textContent = 'No medical records found.';
            return;
        }

        records.forEach(record => {
            const row = tableBody.insertRow();
            const cellPetID = row.insertCell(0);
            const cellRecordID = row.insertCell(1);
            const cellInsurance = row.insertCell(2);
            const cellVaccination = row.insertCell(3);
            const cellHealth = row.insertCell(4);
            const cellVetNotes = row.insertCell(5);

            cellPetID.textContent = record.PETMICROCHIPID;
            cellRecordID.textContent = record.RECORDID;
            cellInsurance.textContent = record.INSURANCEPOLICYNUMBER;
            cellVaccination.textContent = record.VACCINATIONSTATUS;
            cellHealth.textContent = record.HEALTHCONDITION;
            cellVetNotes.textContent = record.VETNOTES;
        });

    } catch (error) {
        console.error('Error fetching medical records:', error);
    }
}

async function resetMedicalRecordTable() {
    try {
        const response = await apiFetch('/initiateNewMedicalRecord', { method: 'POST' });
        const data = await response.json();
        if (data.success) {
            fetchAndDisplayMedicalRecordTable();
        } else {
            alert('Error resetting medical record table!');
        }
    } catch (error) {
        console.error('Error resetting medical record table:', error);
    }
}

async function fetchAndDisplayMedicalRecordTablePet(event) {
    event.preventDefault();

    const petMicrochipID = document.getElementById('petMicrochipMedical').value;

    const tableBody = document.getElementById('petRecordTableBody');
    if (!tableBody) return;

    while (tableBody.firstChild) tableBody.removeChild(tableBody.firstChild);

    try {
        const response = await apiFetch('/view-pet-medical', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                PetMicrochipID: petMicrochipID,
            })
        });

        const data = await response.json();

        if (!data.data || data.data.length === 0) {
            const row = tableBody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 6;
            cell.className = 'table-empty';
            cell.textContent = 'No records found for this pet.';
            document.getElementById('petRecordTable').style.visibility = 'visible';
            return;
        }

        data.data.forEach(record => {
            const row = tableBody.insertRow();
            const cellPetID = row.insertCell(0);
            const cellRecordID = row.insertCell(1);
            const cellInsurance = row.insertCell(2);
            const cellVaccination = row.insertCell(3);
            const cellHealth = row.insertCell(4);
            const cellVetNotes = row.insertCell(5);

            cellPetID.textContent = record.PETMICROCHIPID;
            cellRecordID.textContent = record.RECORDID;
            cellInsurance.textContent = record.INSURANCEPOLICYNUMBER;
            cellVaccination.textContent = record.VACCINATIONSTATUS;
            cellHealth.textContent = record.HEALTHCONDITION;
            cellVetNotes.textContent = record.VETNOTES;
        });

    } catch (error) {
        console.error('Error fetching medical records:', error);
    }

    document.getElementById('petRecordTable').style.visibility = 'visible';
}

// ------------------------------------------------------------------
// Event listeners
// ------------------------------------------------------------------

const medicalRecordForm = document.getElementById('medicalRecordForm');
if (medicalRecordForm) {
    medicalRecordForm.addEventListener('submit', insertNewMedicalRecord);
}

const resetMedicalBtn = document.getElementById('resetMedicalRecordTable');
if (resetMedicalBtn) {
    resetMedicalBtn.addEventListener('click', resetMedicalRecordTable);
}

if (document.getElementById('medicalRecordTable')) {
    fetchAndDisplayMedicalRecordTable();
}

const accessPetMedicalForm = document.getElementById('accessPetMedical');
if (accessPetMedicalForm) {
    accessPetMedicalForm.addEventListener('submit', fetchAndDisplayMedicalRecordTablePet);
}
