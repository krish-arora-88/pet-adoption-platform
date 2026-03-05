# Full Site Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the Pet Adoption Platform frontend into a portfolio-grade warm & organic design. Consolidate 13 pages into 5 core pages + 2 auth pages. Modularize JS. Preserve all existing API integrations and response format handling exactly.

**Architecture:** Replace `public/styles/styles.css` with a new design-system CSS. Rewrite HTML pages (index.html, pets.html, adoptions.html, new admin.html, login.html, register.html). Reuse existing modular JS files in `scripts/pages/` and `scripts/shared/` — they already use ES6 modules with `apiFetch` and table helpers. Add `main.js` for shared sidebar/nav and `tabs.js` for tab components.

**Tech Stack:** Vanilla HTML/CSS/JS, ES6 modules (`type="module"`), Google Fonts (Fraunces + DM Sans), CSS custom properties, CSS animations.

**Critical Constraints:**
- All API calls and response format handling in existing JS modules MUST be preserved exactly.
- The doggy CSS animation MUST be preserved on the "Create Account" button (moves to the Adoptions page, Client Accounts tab).
- **Security:** Use `textContent` and DOM methods (createElement, insertCell, etc.) to render API data — never `innerHTML` with untrusted content. Follow the same safe patterns already used in the existing JS modules.

---

### Task 1: Design System CSS

**Files:**
- Rewrite: `public/styles/styles.css`

**What to build:**
Complete CSS design system with CSS custom properties, typography, component styles, animations, and the preserved doggy animation CSS.

**Step 1: Write the new `public/styles/styles.css`**

Must include these sections in order:

1. **Google Fonts import** — Fraunces (variable, with opsz and wonk axes) + DM Sans
2. **CSS custom properties** on `:root` — all design tokens from the design doc (colors, shadows, radii, font families, font sizes)
3. **CSS reset / base styles** — box-sizing, margin reset, body background/font
4. **Typography** — h1-h3, p, a, small, label styles using Fraunces for headings, DM Sans for body
5. **Layout** — `.app-layout` (CSS grid: sidebar + main), `.main-content` with padding, `.page-header`
6. **Sidebar nav** — `.sidebar` fixed left, 260px wide, cream background, logo area, nav links with terracotta active indicator, auth status footer, DB status dot. Collapsible at `max-width: 768px` (becomes bottom bar)
7. **Cards** — `.card` with bg-secondary, border-radius 12px, shadow, hover lift. `.card-grid` for grid layouts
8. **Forms** — `.form-card` (styled form container), input/select/textarea base styles (8px radius, border color, focus ring in terracotta), `.form-group` (label + input stacking), `.form-row` (horizontal grouping)
9. **Buttons** — `.btn` base, `.btn-primary` (terracotta), `.btn-secondary` (sage green), `.btn-outline`, `.btn-sm`. Hover/active states
10. **Tables** — `.data-table` replacing `.tables-style`. Warm cream header instead of teal, soft row hover, rounded container. Row fade-in animation class `.row-animate`
11. **Tabs** — `.tabs-container`, `.tab-list`, `.tab-btn` (with active state terracotta underline), `.tab-panel` (with fade transition)
12. **Filter chips** — `.chip` and `.chip.active` with scale-bounce
13. **Badges/tags** — `.badge` for species, gender tags. Colors: warm-gold, sage-green, terracotta variants
14. **Expandable panel** — `.expandable-panel`, `.expandable-trigger`, `.expandable-content` (collapsed by default, transition on max-height)
15. **Messages** — `.message`, `.message-success`, `.message-error` for form feedback
16. **Stats ribbon** — `.stats-ribbon` (flex row of `.stat-item` cards with large number + label)
17. **Hero section** — `.hero` with gradient background, organic blob shapes as pseudo-elements, large Fraunces heading
18. **Horizontal scroll** — `.scroll-row` for featured pets on home page
19. **Animation utilities** — `.fade-in`, `.slide-up`, `.stagger-delay-1` through `-5`, `@keyframes fadeIn`, `@keyframes slideUp`
20. **Doggy button animation** — Preserve EXACTLY all `.container`, `.button-container`, `.dog`, `.paw`, `.tail`, keyframes `tailSkew`, `tongueBounce`, and all sub-element styles from current CSS. Copy verbatim — these are lines 2-370 of the current styles.css.
21. **Auth page** — `.auth-layout` (centered card on gradient background), paw-print pattern
22. **Responsive** — `@media (max-width: 768px)` sidebar becomes bottom bar, grid goes single column, hero text shrinks
23. **Loading spinner** — `.spinner` for form submit states

**Step 2: Verify CSS loads correctly**

Run: `npm run dev`
Open browser — page should load with new fonts visible (even if layout is broken since HTML hasn't been updated yet).

**Step 3: Commit**

```bash
git add public/styles/styles.css
git commit -m "feat: replace CSS with warm & organic design system"
```

---

### Task 2: Shared JS Modules

**Files:**
- Create: `public/scripts/main.js`
- Create: `public/scripts/shared/tabs.js`
- Keep: `public/scripts/shared/api.js` (no changes needed)
- Keep: `public/scripts/shared/table.js` (no changes needed)

**Step 1: Create `public/scripts/shared/tabs.js`**

Tab component module that:
- Accepts a container selector
- Finds all `.tab-btn` buttons within it and all `.tab-panel` panels
- On button click: removes `.active` from all buttons/panels, adds `.active` to clicked button and matching panel (matched by `data-tab` attribute on button → panel `id`)

**Step 2: Create `public/scripts/main.js`**

Shared initialization module loaded by every page via `<script type="module" src="scripts/main.js">`:

Functions to implement:
- `initSidebar()` — highlight active nav link based on `window.location.pathname`
- `initAuthStatus()` — check for JWT token in localStorage, call `/auth/me` if present, show email or login link in sidebar footer. Logout link clears token and reloads.
- `initDbStatus()` — call `/check-db-connection`, set `.status-dot` class to `connected` or `disconnected`
- `initAnimations()` — add staggered `animation-delay` to all `.fade-in` elements
- `initMobileNav()` — toggle `.sidebar.open` class on hamburger click

All functions use `apiFetch` from `shared/api.js`.

**Step 3: Commit**

```bash
git add public/scripts/main.js public/scripts/shared/tabs.js
git commit -m "feat: add main.js shared init and tabs.js component"
```

---

### Task 3: Home Page

**Files:**
- Rewrite: `public/index.html`
- Rewrite: `public/scripts/pages/home.js`

**Step 1: Rewrite `public/index.html`**

Structure:
- `<div class="app-layout">` wrapping sidebar + main
- **Sidebar** (identical structure on every page):
  - `.sidebar-logo` — img from Imgur + "PetAdopt BC" text
  - `.sidebar-nav` — 4 links (Home active, Browse Pets, Adoptions, Admin) with inline SVG icons (simple line-style, 24x24 stroke-only)
  - `.sidebar-footer` — DB status dot (`#dbStatusDot`), auth section (`#authStatus`, `#sidebarLoginLink`, `#sidebarLogoutLink`)
- **Main content** (`<main class="main-content">`):
  - `.hero` section — h1 "Find Your New Best Friend", subtitle paragraph, CTA button linking to pets.html
  - `.hero-blobs` — 3 decorative divs styled by CSS as organic blob shapes
  - `.stats-ribbon` — 3 `.stat-item` divs with `#statPets`, `#statAdoptions`, `#statCenters`
  - Featured Pets section — h2 + `.scroll-row#featuredPets` container (populated by JS)
  - Quick Links section — h2 + 3 `.link-card` cards in `.card-grid-3`

Scripts loaded: `scripts/main.js` + `scripts/pages/home.js` (both `type="module"`)

**Step 2: Rewrite `public/scripts/pages/home.js`**

Functions:
- `loadStats()` — `Promise.all` fetching `/pet-table`, `/adoption-table`, `/adoption-center-table`. Sets `.textContent` of stat number elements to data array lengths.
- `loadFeaturedPets()` — fetches `/pet-table`, takes first 8 results. For each pet array `[id, name, age, breed, gender, species]`, creates card DOM elements using `createElement`/`textContent` (NOT innerHTML). Appends to `#featuredPets`.

Both functions called at module load (no need for `window.onload` with `type="module"`).

**Step 3: Verify**

Run: `npm run dev`, open `/`
Check: hero visible, stats show numbers, pet cards appear in scroll row, sidebar nav highlights "Home", DB dot shows.

**Step 4: Commit**

```bash
git add public/index.html public/scripts/pages/home.js
git commit -m "feat: redesign home page with hero, stats, featured pets"
```

---

### Task 4: Browse Pets Page

**Files:**
- Rewrite: `public/pages/pets.html`
- Rewrite: `public/scripts/pages/pets.js`

**Step 1: Rewrite `public/pages/pets.html`**

Structure: sidebar (same HTML as home, with Browse Pets link active) + main content:
- **Expandable panel**: `.expandable-panel` at top with trigger "Register a New Pet". Content has form `id="new_pet"` — inputs: MicrochipID, petName, petAge, breed, gender (select F/M/I/O), speciesSelect (select, dynamically populated), submit button "Register Pet". Message div `id="new_pet_message"`.
- **Filter section**: `.filter-bar` with species select `id="speciesFilter"` (options: All, Dog, Cat, Bird), age range inputs `id="ageMinFilter"` / `id="ageMaxFilter"`, buttons `id="applyFilters"` / `id="resetFilters"`
- **Pet table**: `table#pet_table.data-table` with thead (ID, Name, Age, Breed, Gender, Species) and empty tbody. Button `id="see_pets"` and `id="resetPetTable"`.
- **Stats section**: `.card` containing h2 "Pet Statistics", button `id="viewPetStats"`, table `id="petStatsTable"` (Species, Average Age). Button `id="speciesAgeStats"`, table `id="speciesStatsTable"`.

Scripts: `../scripts/main.js` + `../scripts/pages/pets.js`

**Step 2: Rewrite `public/scripts/pages/pets.js`**

Merge all logic from current `pets.js` + `managePets.js`:
- From pets.js: `fetchAndDisplayPetTable`, `fetchPetTableData`, `applyPetFilters`, `resetPetFilters`, `filterPetsBySpecies`, `viewOldesPets`, `fetchSpeciesAgeStats`, `resetPetTable`
- From managePets.js: `insertNewPet`, `populateSpeciesDropdown`
- Add: expandable panel toggle logic (click trigger → toggle class on content)
- All event listeners from both files

**Step 3: Verify**

Run: `npm run dev`, open `/pages/pets.html`
Check: pet table loads, filters work, register pet panel expands, species dropdown populates, stats work.

**Step 4: Commit**

```bash
git add public/pages/pets.html public/scripts/pages/pets.js
git commit -m "feat: redesign Browse Pets page with merged pet registration"
```

---

### Task 5: Adoptions Page

**Files:**
- Rewrite: `public/pages/adoptions.html`
- Rewrite: `public/scripts/pages/adoptions.js`

**Step 1: Rewrite `public/pages/adoptions.html`**

Structure: sidebar + main with `.tabs-container`:

Tab buttons: "Adoption Records" (active by default), "Client Accounts"

**Tab panel 1** (`id="tab-adoptions"`):
- Table `id="adoption_table"` class `data-table` (PetMicrochipID, AdoptionDate, ClientID, CenterLicenseNumber)
- Form `id="new_adoption"` — "Register New Adoption" with petMicrochipID, adoptionDate, clientID, centerLicenseNumber inputs, submit button
- Message `id="new_adoption_message"`
- Form `id="adoption_update"` — "Update Adoption" with *_update inputs
- Message `id="adoption_update_status"`
- Button `id="resetAdoptionTable"`, message `id="resetAdoptionResultMsg"`

**Tab panel 2** (`id="tab-clients"`):
- Form `id="sign_up"`:
  - Inputs: ClientFirstName, ClientLastName, ClientAddress, ClientContact
  - Select `id="ClientType"` (Donor/Adopter)
  - **DOGGY BUTTON** — the exact `.container > .button-container` HTML structure with `.dog`, `.paw`, `.tail` sub-elements from `signup.html:33-63`. Submit button text "Create Account".
- Status `id="sign_up_status"`
- Form `id="client_update"` — ClientNumber, *_update inputs, submit "Update Account"
- Status `id="update_status"`
- Table `id="client_table"` class `data-table` (ID, First Name, Last Name, Address, Phone Number)
- Button `id="resetClient"`, message `id="resetResultMsg"`

Scripts: `../scripts/main.js` + `../scripts/pages/adoptions.js`

**Step 2: Rewrite `public/scripts/pages/adoptions.js`**

Merge current `adoptions.js` + `signup.js` into one file:
- Import `initTabs` from `../shared/tabs.js` and call it
- Import `apiFetch` from `../shared/api.js`
- Import `populateTableFromArrays` from `../shared/table.js`
- Adoption functions: `fetchAndDisplayAdoptionTable`, `insertNewAdoption`, `updateAdoption`, `initializeAdoptionTable`
- Client functions: `insertNewClient`, `fetchAndDisplayClientTable`, `updateClient`, `resetClient`
- All event listeners from both files

**Step 3: Verify**

Check: tabs switch, adoption CRUD works, client signup with doggy button works (tail wags on hover!), client table populates.

**Step 4: Commit**

```bash
git add public/pages/adoptions.html public/scripts/pages/adoptions.js
git commit -m "feat: redesign Adoptions page with tabs, preserved doggy button"
```

---

### Task 6: Admin Dashboard

**Files:**
- Create: `public/pages/admin.html`
- Create: `public/scripts/pages/admin.js`
- Modify: `public/scripts/pages/medicalRecords.js` (fix ID conflicts)

**Step 1: Create `public/pages/admin.html`**

Structure: sidebar + main with `.tabs-container` and 5 tabs:

Tab buttons: "Adoption Centers" (active), "Veterinarians", "Medical Records", "Species", "Insurance"

**Tab 1** (`id="tab-centers"`): Content from adoptioncentres.html
- Table `id="adoption_center_table"` (CenterLicenseNumber, CenterName, Address, AnimalCapacity)
- Add form `id="new_adoption_center"` — centerLicenseNumber, centerName, address, animalCapacity
- Update form `id="adoption_center_update"` — *_update fields
- Messages, reset button

**Tab 2** (`id="tab-veterinarians"`): Merged from Veterenarians.html + VetPractice.html
- Projection form `id="projectVetInfo"` with vetInfo checkboxes
- Vet table `id="vet_table"`
- Register form `id="registerVet"` — vetID, vetName, clinicName, vetContact, vetEmail + vetSpecialty checkboxes
- Status: `vet_register_status`, `vet_species_status`
- Update form `id="vet_update"` — *_update fields + specialty checkboxes
- Reset button `id="resetVet"`

**Tab 3** (`id="tab-medical"`): From VetMedicalRecord.html
- Add record form `id="medicalRecordForm"` — use prefixed IDs: `med_petMicrochipID`, `med_recordID`, `med_insurancePolicyNumber`, `med_vaccinationStatus`, `med_healthCondition`, `med_vetNotes`
- All records table `id="medicalRecordTable"` tbody=`medicalRecordTableBody`
- Reset button `id="resetMedicalRecordTable"`
- Pet-specific form `id="accessPetMedical"` — `petMicrochipMedical`
- Pet records table `id="petRecordTable"` tbody=`petRecordTableBody`

**Tab 4** (`id="tab-species"`): From CenterPet.html + CenterEmployees.html
- Species form `id="speciesForm"` — speciesName, housingSpace, groomingRoutine, dietType
- Species table, reset, aggregation query (all same IDs)
- Employee form `id="employeeForm"` + table `id="employeeTable"`

**Tab 5** (`id="tab-insurance"`): From insurancePolicies.html
- Insurance form `id="insuranceForm"` — insurancePolicyNumber, policyLevel, coverageAmount, insuranceStartDate, insuranceExpiration
- Insurance table, reset (same IDs)

Scripts: `../scripts/main.js` + `../scripts/pages/admin.js`

**Step 2: Create `public/scripts/pages/admin.js`**

```javascript
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
```

**Step 3: Update `public/scripts/pages/medicalRecords.js` for prefixed IDs**

Change these `getElementById` calls:
- `'petMicrochipID'` → `'med_petMicrochipID'`
- `'recordID'` → `'med_recordID'`
- `'insurancePolicyNumber'` → `'med_insurancePolicyNumber'`
- `'vaccinationStatus'` → `'med_vaccinationStatus'`
- `'healthCondition'` → `'med_healthCondition'`
- `'vetNotes'` → `'med_vetNotes'`

**Step 4: Verify**

All 5 tabs work, forms submit, tables populate, hash nav works.

**Step 5: Commit**

```bash
git add public/pages/admin.html public/scripts/pages/admin.js public/scripts/pages/medicalRecords.js
git commit -m "feat: admin dashboard consolidating 7 pages into 5 tabs"
```

---

### Task 7: Auth Pages

**Files:**
- Rewrite: `public/pages/login.html`
- Rewrite: `public/pages/register.html`
- Keep: `public/scripts/auth.js` (no changes — IDs preserved)

**Step 1: Rewrite `public/pages/login.html`**

NO sidebar. Uses `.auth-layout`:
- Centered `.auth-card` on warm gradient background
- Logo image at top
- Fraunces h1 "Welcome Back"
- Form `id="loginForm"` — `loginEmail` (email), `loginPassword` (password), submit "Login"
- Message `id="loginMessage"`
- Link: "Don't have an account? Register here" → register.html
- Script: `../scripts/auth.js` (type=module)

**Step 2: Rewrite `public/pages/register.html`**

Same `.auth-layout`:
- h1 "Create Account"
- Form `id="registerForm"` — `registerEmail`, `registerPassword`, `registerConfirmPassword`, submit
- Message `id="registerMessage"`
- Link: "Already have an account? Login here"
- Script: `../scripts/auth.js`

**Step 3: Verify**

Login and register work, redirect on success.

**Step 4: Commit**

```bash
git add public/pages/login.html public/pages/register.html
git commit -m "feat: redesign auth pages with centered card layout"
```

---

### Task 8: Cleanup Old Files

**Step 1: Delete old HTML pages**

```bash
git rm public/pages/managePets.html public/pages/signup.html public/pages/adoptioncentres.html public/pages/Veterenarians.html public/pages/VetPractice.html public/pages/VetMedicalRecord.html public/pages/insurancePolicies.html public/pages/CenterPet.html public/pages/CenterEmployees.html
```

**Step 2: Delete old JS files**

```bash
git rm public/scripts/pages/managePets.js public/scripts/pages/signup.js public/scripts/scripts.js
```

**Step 3: Verify all pages still work**

Navigate through every page, test every form and button.

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove old pages consolidated into new structure"
```

---

### Task 9: Polish & Final Verification

**Step 1: Test responsive layout at 375px width**

Verify sidebar collapses, grids go single column, tables scroll, doggy button works.

**Step 2: Full end-to-end CRUD test**

Every form on every page. Document any bugs.

**Step 3: Fix bugs found during testing**

**Step 4: Commit**

```bash
git add -A
git commit -m "fix: polish responsive layout and fix end-to-end testing issues"
```
