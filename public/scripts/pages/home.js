import { apiFetch } from '../shared/api.js';

async function loadStats() {
    try {
        const [petsRes, adoptionsRes, centersRes] = await Promise.all([
            apiFetch('/pet-table'),
            apiFetch('/adoption-table'),
            apiFetch('/adoption-center-table')
        ]);
        const pets = await petsRes.json();
        const adoptions = await adoptionsRes.json();
        const centers = await centersRes.json();

        const statPets = document.getElementById('statPets');
        const statAdoptions = document.getElementById('statAdoptions');
        const statCenters = document.getElementById('statCenters');
        if (statPets) statPets.textContent = pets.data ? pets.data.length : 0;
        if (statAdoptions) statAdoptions.textContent = adoptions.data ? adoptions.data.length : 0;
        if (statCenters) statCenters.textContent = centers.data ? centers.data.length : 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadFeaturedPets() {
    const container = document.getElementById('featuredPets');
    if (!container) return;

    try {
        const response = await apiFetch('/pet-table');
        const { data } = await response.json();
        const featured = data.slice(0, 8);

        // Use DOM methods (not innerHTML) for security
        featured.forEach(([id, name, age, breed, gender, species]) => {
            const card = document.createElement('div');
            card.className = 'card pet-card';

            const header = document.createElement('div');
            header.className = 'pet-card-header';

            const speciesBadge = document.createElement('span');
            speciesBadge.className = 'badge badge-species';
            speciesBadge.textContent = species;

            const genderBadge = document.createElement('span');
            genderBadge.className = 'badge badge-gender';
            genderBadge.textContent = gender;

            header.appendChild(speciesBadge);
            header.appendChild(genderBadge);

            const nameEl = document.createElement('h3');
            nameEl.className = 'pet-card-name';
            nameEl.textContent = name;

            const breedEl = document.createElement('p');
            breedEl.className = 'pet-card-breed';
            breedEl.textContent = breed;

            const ageEl = document.createElement('p');
            ageEl.className = 'pet-card-age';
            ageEl.textContent = `${age} ${age === 1 ? 'year' : 'years'} old`;

            card.appendChild(header);
            card.appendChild(nameEl);
            card.appendChild(breedEl);
            card.appendChild(ageEl);

            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading featured pets:', error);
    }
}

loadStats();
loadFeaturedPets();
