import { initTabs } from '../shared/tabs.js';
import './adoptionCentres.js';
import './veterinarians.js';
import './vetPractice.js';
import './medicalRecords.js';
import './insurancePolicies.js';
import './centerPet.js';
import './centerEmployees.js';

initTabs('.tabs-container');

// Hash-based tab navigation
function activateTabFromHash() {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        const tabBtn = document.querySelector(`.tab-btn[data-tab="tab-${hash}"]`);
        if (tabBtn) tabBtn.click();
    }
}
activateTabFromHash();
window.addEventListener('hashchange', activateTabFromHash);
