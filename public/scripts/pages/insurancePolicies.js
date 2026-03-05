// pages/insurancePolicies.js — insurancePolicies.html: insurance policy CRUD + table
import { apiFetch } from '../shared/api.js';
import { populateTableFromObjects } from '../shared/table.js';

// ------------------------------------------------------------------
// Functions
// ------------------------------------------------------------------

async function insertNewInsurancePolicy(event) {
    event.preventDefault();

    const insurancePolicyNumber = document.getElementById('insurancePolicyNumber').value;
    const policyLevel = document.getElementById('policyLevel').value;
    const coverageAmount = document.getElementById('coverageAmount').value;
    const insuranceStartDate = document.getElementById('insuranceStartDate').value.replace(/-/g, '/');
    const insuranceExpiration = document.getElementById('insuranceExpiration').value.replace(/-/g, '/');

    const response = await apiFetch('/insert-new-insurance-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            InsurancePolicyNumber: insurancePolicyNumber,
            PolicyLevel: policyLevel,
            CoverageAmount: coverageAmount,
            InsuranceStartDate: insuranceStartDate,
            InsuranceExpiration: insuranceExpiration
        })
    });

    const data = await response.json();
    const messageElem = document.getElementById('insurance_form_message');

    if (data.success) {
        if (messageElem) messageElem.textContent = 'Insurance policy added successfully.';
        fetchAndDisplayInsurancePolicies();
    } else {
        if (messageElem) messageElem.textContent = 'Error adding insurance policy.';
    }
}

async function fetchAndDisplayInsurancePolicies() {
    const tableBody = document.getElementById('insuranceTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    try {
        const response = await apiFetch('/insurance-policies', { method: 'GET' });
        const policies = await response.json();

        policies.forEach(policy => {
            const row = tableBody.insertRow();
            const cellNumber = row.insertCell(0);
            const cellLevel = row.insertCell(1);
            const cellCoverage = row.insertCell(2);
            const cellStart = row.insertCell(3);
            const cellExpiration = row.insertCell(4);

            cellNumber.textContent = policy.InsurancePolicyNumber || policy.INSURANCEPOLICYNUMBER;
            cellLevel.textContent = policy.PolicyLevel || policy.POLICYLEVEL;
            cellCoverage.textContent = policy.CoverageAmount || policy.COVERAGEAMOUNT;
            cellStart.textContent = policy.InsuranceStartDate || policy.INSURANCESTARTDATE;
            cellExpiration.textContent = policy.InsuranceExpiration || policy.INSURANCEEXPIRATION;
        });
    } catch (error) {
        console.error('Error fetching insurance policies:', error);
    }
}

async function resetInsuranceTable() {
    try {
        const response = await apiFetch('/initiateNewInsurancePolicy', { method: 'POST' });
        const data = await response.json();
        if (data.success) {
            fetchAndDisplayInsurancePolicies();
        } else {
            alert('Error resetting insurance table!');
        }
    } catch (error) {
        console.error('Error resetting insurance table:', error);
    }
}

// ------------------------------------------------------------------
// Event listeners
// ------------------------------------------------------------------

const insuranceForm = document.getElementById('insuranceForm');
if (insuranceForm) {
    insuranceForm.addEventListener('submit', insertNewInsurancePolicy);
}

const resetInsuranceBtn = document.getElementById('resetInsuranceTable');
if (resetInsuranceBtn) {
    resetInsuranceBtn.addEventListener('click', resetInsuranceTable);
}

if (document.getElementById('insuranceTable')) {
    fetchAndDisplayInsurancePolicies();
}
