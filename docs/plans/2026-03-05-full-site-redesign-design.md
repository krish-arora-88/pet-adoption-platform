# Full Site Redesign — Warm & Organic

**Date:** 2026-03-05
**Goal:** Portfolio-grade redesign of the Pet Adoption Platform frontend. Consolidate 13 pages into 5, modularize JS, apply a warm & organic design system.

## Design System

### Colors
| Token | Value | Use |
|-------|-------|-----|
| `--bg-primary` | `#FBF7F2` | Page background (warm cream) |
| `--bg-secondary` | `#F3EDE4` | Card/section backgrounds |
| `--bg-accent` | `#E8DFD3` | Hover states, subtle fills |
| `--text-primary` | `#2C1810` | Headings, body text (deep espresso) |
| `--text-secondary` | `#6B5744` | Secondary text, labels |
| `--text-muted` | `#9C8B7A` | Placeholders, disabled states |
| `--accent-primary` | `#C4704B` | Terracotta — CTAs, active states |
| `--accent-hover` | `#A85C3A` | Terracotta dark — hover |
| `--accent-secondary` | `#5B7F5E` | Sage green — success, secondary actions |
| `--accent-warm` | `#D4956A` | Warm gold — highlights, badges |
| `--border` | `#DDD4C8` | Borders, dividers |
| `--shadow` | `rgba(44, 24, 16, 0.08)` | Soft shadows |

### Typography
- **Display/Headings:** Fraunces (variable serif, optical sizing, wonky axis)
- **Body/UI:** DM Sans (geometric sans-serif)
- Scale: 48px hero > 32px h1 > 24px h2 > 18px h3 > 16px body > 14px small

### Spacing & Shape
- Border radius: 12px cards, 8px inputs/buttons, 24px pills/tags
- Shadows: `0 1px 3px rgba(44,24,16,0.06), 0 8px 24px rgba(44,24,16,0.08)`

## Page Architecture

### Consolidation Map (13 pages → 5 + 2 auth)

| New Page | URL | Consolidates |
|----------|-----|-------------|
| Home | `/` | index.html |
| Browse Pets | `/pages/pets.html` | pets.html + managePets.html |
| Adoptions | `/pages/adoptions.html` | adoptions.html + signup.html |
| Admin | `/pages/admin.html` | adoptioncentres + Veterenarians + VetPractice + VetMedicalRecord + insurancePolicies + CenterPet + CenterEmployees |
| Login | `/pages/login.html` | login.html (kept separate) |
| Register | `/pages/register.html` | register.html (kept separate) |

### Navigation
- Persistent sidebar (desktop) / bottom bar (mobile)
- Logo + app name at top
- Links: Home, Browse Pets, Adoptions, Admin
- Auth status at sidebar bottom
- Active link: terracotta left-border indicator

## Page Designs

### Home (`/`)
- Hero: Large Fraunces heading "Find Your New Best Friend" over warm gradient with organic blob shapes. Terracotta CTA.
- Stats ribbon: 3 live counters — Pets Available, Happy Adoptions, Centers
- Featured Pets: Horizontal scrolling card row (name, species, age, breed)
- Quick Links: 3 role-based cards (Pet Owners, Center Staff, Veterinarians)
- DB status: subtle green/red dot in sidebar footer

### Browse Pets (`/pages/pets.html`)
- Filter sidebar (left): species chips, age range, breed text input
- Pet grid (right): card layout — name, breed, age, gender tag, species badge
- Register Pet: expandable panel at top, collapsed by default
- Stats section: average ages by species as horizontal bars

### Adoptions (`/pages/adoptions.html`)
- Tab 1 — Adoption Records: card-table of adoptions, register/update forms
- Tab 2 — Client Accounts: registration form with animated doggy button on "Create Account", client table, update form

### Admin Dashboard (`/pages/admin.html`)
- 5 tabs: Adoption Centers, Veterinarians, Medical Records, Species Management, Insurance Policies
- Each tab: data table at top, add/edit forms below
- Consistent card-table pattern with row hover effects

### Auth Pages (`/pages/login.html`, `/pages/register.html`)
- Centered card on warm gradient background
- Fraunces heading, clean form
- Subtle paw-print background pattern

## JS Architecture

```
public/scripts/
  main.js          → shared init, sidebar nav, auth status, DB status
  pages/
    home.js        → featured pets, stats counters
    pets.js        → pet CRUD, filters, stats
    adoptions.js   → adoption + client CRUD
    admin.js       → tab management, loads sub-modules
    admin/
      centers.js   → adoption center CRUD
      vets.js      → vet browse + practice CRUD
      medical.js   → medical records CRUD
      species.js   → species CRUD + aggregation
      insurance.js → insurance CRUD
  shared/
    api.js         → fetch wrapper, error handling
    table.js       → generic table renderer
    tabs.js        → tab component logic
    auth.js        → auth state management
```

Each HTML page loads `main.js` as `type="module"`. Main.js dynamically imports the page-specific module. No monolith.

## Animations & Interactions

- **Page load:** staggered fade-in — sidebar slides in, content cards appear with 50ms delays
- **Card hover:** translateY(-4px) + shadow deepen
- **Tab switching:** crossfade (opacity + slight translateY)
- **Filter chips:** scale-bounce on select/deselect
- **Doggy button:** preserved on Create Account — CSS animated dog with tail wag and tongue bounce on hover
- **Table rows:** fade in sequentially on data load
- **Sidebar nav:** active link indicator slides between items
- **Form submit:** button loading spinner → checkmark on success
- **Hero:** subtle parallax on blob shapes

## Constraints

- Vanilla HTML/CSS/JS only — no frameworks, no build step
- ES6 modules via `type="module"` script tags
- All existing API endpoints and response formats preserved exactly
- Google Fonts loaded via CDN (Fraunces + DM Sans)
- Must work on Vercel deployment (static files served by Express)
