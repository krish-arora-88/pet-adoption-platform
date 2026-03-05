# Pet Adoption Platform - Codebase Audit Report

> Generated: 2026-03-05
> Scope: Full end-to-end analysis of repository structure, functionality, code quality, and security

---

## 1. Repository Structure

```
Pet Adoption Platform/
├── server.js                    # Express server entry point + additional routes (species, insurance, medical)
├── appController.js             # Express router with API endpoints (pets, clients, vets, adoptions)
├── appService.js                # Database service layer (OracleDB queries, table init, CRUD)
├── utils/
│   └── envUtil.js               # Custom .env file parser
├── public/                      # Frontend static files
│   ├── index.html               # Home/dashboard page
│   ├── dog_on_beach.jpeg        # Asset
│   ├── scripts/
│   │   └── scripts.js           # All frontend JavaScript (1385 lines, single monolithic file)
│   ├── styles/
│   │   └── styles.css           # Global CSS (562 lines, includes animated dog component)
│   └── pages/
│       ├── signup.html           # Client registration & account management
│       ├── pets.html             # Browse pets with species/age filters
│       ├── managePets.html       # Register new pets
│       ├── adoptions.html        # Create/update adoption records
│       ├── Veterenarians.html    # Vet directory with dynamic column projection
│       ├── VetPractice.html      # Vet registration & profile management
│       ├── VetMedicalRecord.html # Medical record CRUD
│       ├── adoptioncentres.html  # Adoption center management
│       ├── CenterPet.html        # Species management & aggregation queries
│       ├── CenterEmployees.html  # Employee management (client-side only, no backend)
│       └── insurancePolicies.html # Insurance policy management
├── scripts/                     # Setup/deployment scripts
│   ├── mac/                     # macOS tunnel & Oracle client setup scripts
│   └── win/                     # Windows equivalents
├── .env                         # Database credentials (COMMITTED TO GIT)
├── .gitignore                   # Git ignore rules (.env is COMMENTED OUT)
├── package.json                 # Node.js project config
├── vercel.json                  # Vercel deployment config
├── remote-start.sh              # Remote server start script
├── Milestone1.pdf - milestones_4.pdf  # Course milestone documents
└── afiedt.buf                   # Oracle SQL*Plus editor buffer (artifact)
```

**Line count summary:**
- Backend (server.js + appController.js + appService.js): ~1,200 lines
- Frontend JS (scripts.js): ~1,385 lines
- CSS (styles.css): ~562 lines
- HTML (11 pages): ~1,500 lines
- Total project code: ~4,650 lines

---

## 2. Purpose & Functionality

This is a **university course project** (UBC CPSC 304, 2024W Term 2) implementing a pet adoption management platform. It demonstrates relational database concepts including:

- **CRUD operations** on 8 database tables
- **Aggregation queries** with GROUP BY / HAVING
- **Dynamic SQL projection** (user-selectable columns)
- **Foreign key relationships** and cascading deletes
- **Nested subqueries** (species age statistics)

### Domain Model (8 Tables)

| Table | Primary Key | Purpose |
|-------|-------------|---------|
| Species | speciesName | Pet species with care requirements |
| Pet | PetMicrochipID | Individual pets with breed, age, gender |
| Client | ClientID (auto-increment) | Adopters with contact info |
| Veterinarian | VetLicenseNumber | Vets with clinic and contact info |
| AdoptionCenter | CenterLicenseNumber | Centers with name, address, capacity |
| Adoption | PetMicrochipID | Links pet, client, and center with date |
| InsurancePolicy | InsurancePolicyNumber | Coverage details with date ranges |
| MedicalRecord | (PetMicrochipID, RecordID) | Health records linked to pets and insurance |

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML/CSS/JS (no framework) |
| Backend | Node.js + Express.js 4.18.2 |
| Database | Oracle Database (UBC student instance) |
| DB Driver | node-oracledb 6.3.0 |
| Deployment | Vercel (serverless) |

---

## 3. Coding Conventions

### Naming
- **Functions:** camelCase (`fetchPetTableFromDb`, `insertNewClient`)
- **Variables:** camelCase (`tableContent`, `insertResult`)
- **DB Columns:** PascalCase (`PetMicrochipID`, `SpeciesName`) — inconsistently applied
- **HTML IDs:** snake_case (`pet_table`, `new_pet`) mixed with camelCase (`speciesFilter`, `resetPetTable`)
- **Files:** Mixed — PascalCase HTML (`VetPractice.html`, `CenterPet.html`) vs lowercase (`pets.html`, `signup.html`)

### Architecture
- **3-layer pattern attempted:** server.js (entry) → appController.js (routes) → appService.js (DB)
- **Broken in practice:** server.js also defines routes directly (species, insurance, medical records), bypassing the controller
- **Single frontend file:** All 1,385 lines of JS live in one `scripts.js` file loaded by every page
- **No module system on frontend:** Everything in global scope

### Error Handling Pattern
- Backend: `try/catch` returning `false` or `[]` on failure, with `console.error`
- Frontend: `async/await` with status message display to user
- No standardized error response format

### SQL Pattern
- Parameterized queries (`:paramName` bind variables) — good
- `autoCommit: true` on every write — no transaction support
- `DROP TABLE ... CASCADE CONSTRAINTS` then `CREATE TABLE` for "reset" operations

---

## 4. Code Quality / Code Smells

### Critical Issues

#### 4.1 Database Credentials Committed to Git
**Severity: CRITICAL**
**Location:** `.env` (line 3-5), `.gitignore` (line 8)

The `.gitignore` file has `.env` **commented out** (`#.env`), meaning database credentials (username: `ora_karora07`, password: `a17516238`) are tracked in version control.

#### 4.2 SQL Injection Vulnerability
**Severity: CRITICAL**
**Location:** `appService.js:310`

```js
const text = "SELECT " + selectors + " FROM Veterinarian"
```

The `selectors` parameter comes directly from user input (`req.body.selectors` in `appController.js:165`) and is concatenated into SQL without any validation or sanitization. An attacker could inject arbitrary SQL.

#### 4.3 No Authentication or Authorization
**Severity: HIGH**
No login system, session management, JWT tokens, or role-based access. Any user can:
- View, create, update, or delete any record
- Reset/drop entire tables
- Access all client personal information

#### 4.4 Custom .env Parser Instead of dotenv
**Severity: MEDIUM**
**Location:** `utils/envUtil.js`

A hand-rolled `.env` parser is used despite `dotenv` being listed as a dependency in `package.json`. The custom parser doesn't handle:
- Quoted values
- Comments
- Multiline values
- Trailing whitespace

### Structural Issues

#### 4.5 Duplicate Function Definitions
**Location:** `appService.js:83-90` and `appService.js:103-134`

`fetchPetTableFromDb()` is defined twice. The first (no-argument) version is silently overwritten by the second (with filters). JavaScript allows this but it's a bug waiting to happen.

#### 4.6 Route Splitting Between server.js and appController.js
**Location:** `server.js:41-196` and `appController.js`

Routes are split between two files with no clear organizational principle:
- `appController.js`: pets, clients, vets, adoption centers, adoptions
- `server.js` (after `app.listen()`!): species, insurance policies, medical records

Routes defined after `app.listen()` work in Express but it's an anti-pattern that signals disorganized development.

#### 4.7 Duplicate Route Definitions
The `/insert-new-pet` route is defined in **both** `server.js:107` and `appController.js:44`. Express will match the first one mounted. This causes confusion about which handler actually runs.

#### 4.8 SQL Bug in clearSpeciesTable
**Location:** `appService.js:485`

```js
await connection.execute(`DELETE TABLE Species`);
```

This is invalid SQL. It should be `DELETE FROM Species` or `DROP TABLE Species`. The function also calls `initiateSpeciesTable()` without `await`, meaning the table recreation is fire-and-forget.

#### 4.9 Monolithic Frontend Script
**Location:** `public/scripts/scripts.js` (1,385 lines)

Every page loads the entire script. The `window.onload` handler uses null-checks on DOM elements to determine which page is loaded — a fragile pattern. Functions for unrelated pages coexist in one global scope.

#### 4.10 Race Condition in Client ID Generation
**Location:** `appService.js:240-243`

```js
let id = await connection.execute(
    `SELECT NVL(MAX(ClientID), 0) + 1 AS NextID FROM Client`
);
id = id.rows[0][0];
```

Manual ID generation via `MAX(ID) + 1` has a race condition under concurrent inserts. Two simultaneous requests could get the same ID.

### Minor Issues

#### 4.11 Inconsistent Oracle Column Casing
The database uses `speciesName` (lowercase s) as a column name but references it as `SpeciesName` (uppercase S) elsewhere. Oracle is case-insensitive for unquoted identifiers, but the codebase mixes casing unpredictably across queries and frontend code.

#### 4.12 Dates Stored as Strings
**Location:** `appService.js:575-576`

Insurance policy dates (`InsuranceStartDate`, `InsuranceExpiration`) are stored as `VARCHAR2(10)` with regex CHECK constraints instead of using Oracle's native `DATE` type. This prevents date arithmetic and proper validation.

#### 4.13 Date Parsing Logic Duplicated
**Location:** `appService.js:772-781` and `appService.js:806-815`

The YYYYMMDD→YYYY-MM-DD date parsing block is copy-pasted between `insertNewAdoption` and `updateAdoption`.

#### 4.14 Unused/Dead Code
- Commented-out demotable routes in `appController.js:283-316`
- Commented-out demotable exports in `appService.js:839-842`
- `afiedt.buf` file (Oracle SQL*Plus editor buffer) committed to repo
- `dog_on_beach.jpeg` in root (duplicate of public asset?)

#### 4.15 Missing Null Safety
- `appService.js:243`: `id = id.rows[0][0]` — crashes if query returns no rows
- `scripts.js:1180`: references `messageElem` that isn't defined in scope

#### 4.16 No Input Validation
No server-side validation on any endpoint:
- No type checking (numbers could be strings)
- No length limits beyond DB column sizes
- No format validation (email, phone, dates)
- Negative ages accepted
- Empty required fields may silently fail at DB level

#### 4.17 HTML Typo in Filename
`Veterenarians.html` — misspelled ("Veterinarians")

#### 4.18 No CORS Configuration
No CORS middleware configured. The API is open to cross-origin requests from any domain.

#### 4.19 No Pagination
All queries use `SELECT *` with no `LIMIT`/`OFFSET`. Tables will load all records regardless of size.

#### 4.20 Connection Pool Sizing
Pool configured with `poolMax: 3` — will bottleneck under even moderate concurrent load.

---

## 5. Potential Issues & Risks

### Security
| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 1 | Credentials in version control | CRITICAL | `.env`, `.gitignore:8` |
| 2 | SQL injection in vet projection query | CRITICAL | `appService.js:310` |
| 3 | No authentication/authorization | HIGH | Entire application |
| 4 | No input validation | HIGH | All POST endpoints |
| 5 | No HTTPS enforcement | MEDIUM | `server.js` |
| 6 | No rate limiting | MEDIUM | `server.js` |
| 7 | No CORS policy | LOW | `server.js` |

### Reliability
| # | Issue | Risk | Location |
|---|-------|------|----------|
| 1 | Race condition in ClientID generation | Data corruption | `appService.js:240` |
| 2 | Invalid SQL in clearSpeciesTable | Runtime error | `appService.js:485` |
| 3 | Non-awaited async in clearSpeciesTable | Silent failure | `appService.js:490` |
| 4 | No database transactions | Orphaned records | `appService.js:516-531` |
| 5 | Duplicate route definitions | Wrong handler fires | `server.js:107`, `appController.js:44` |
| 6 | Pool exhaustion with 3 connections | Request timeouts | `appService.js:13` |

### Maintainability
| # | Issue | Impact |
|---|-------|--------|
| 1 | Monolithic 1,385-line frontend script | Hard to modify safely |
| 2 | Routes split across server.js and appController.js | Confusing ownership |
| 3 | No tests of any kind | No regression protection |
| 4 | No TypeScript, no JSDoc | No type safety |
| 5 | Mixed naming conventions | Cognitive overhead |
| 6 | Course milestone PDFs in repo | Repository bloat |
| 7 | Custom env parser when dotenv is available | Unnecessary complexity |

### Data Integrity
| # | Issue | Impact |
|---|-------|--------|
| 1 | DROP TABLE used for "reset" operations | Data loss on table reset |
| 2 | Dates as strings in InsurancePolicy | No date arithmetic/comparison |
| 3 | No unique constraints beyond PKs | Duplicate data possible |
| 4 | Manual ID generation for Client | Collision under concurrency |
| 5 | CASCADE CONSTRAINTS on some drops but not others | Inconsistent FK handling |

---

## 6. Recommendations for Redemption

### Immediate (Before Adding Features)
1. **Rotate credentials** — the committed password must be considered compromised
2. **Uncomment `.env` in `.gitignore`** and remove `.env` from git history
3. **Fix the SQL injection** in `fetchVetProject()` — whitelist allowed column names
4. **Fix the SQL bug** in `clearSpeciesTable()` — `DELETE TABLE` → `DELETE FROM`
5. **Remove duplicate** `fetchPetTableFromDb()` definition
6. **Consolidate all routes** into `appController.js`
7. **Delete dead code** — commented-out demotable routes, `afiedt.buf`

### Short-Term (Foundation for Growth)
1. **Replace OracleDB with PostgreSQL** — free, widely supported, better for deployment
2. **Add input validation** — use a library like `zod` or `joi`
3. **Use `dotenv` instead of custom parser** — it's already in dependencies
4. **Split `scripts.js`** into per-page modules
5. **Add basic authentication** — sessions or JWT
6. **Use Oracle sequences or UUIDs** for ID generation instead of `MAX(ID) + 1`
7. **Add a test framework** — at minimum, API endpoint tests

### Long-Term (Modernization)
1. **Adopt a frontend framework** (React, Vue, or Svelte)
2. **Add TypeScript** for type safety
3. **Implement database migrations** instead of DROP/CREATE
4. **Add logging** (winston or pino) instead of console.log
5. **Add API documentation** (OpenAPI/Swagger)
6. **Set up CI/CD pipeline** with linting and testing

---

## 7. Summary

This is a functional university database course project that successfully demonstrates CRUD operations, SQL aggregation, and relational database concepts. However, it has **critical security vulnerabilities** (committed credentials, SQL injection), **no authentication**, **no tests**, and several **structural anti-patterns** that would need to be addressed before building upon it for any serious use.

The codebase is approximately 4,650 lines across ~35 files. The core domain model (8 tables, ~40 API endpoints, 11 pages) is a solid foundation, but the implementation needs significant hardening before it's ready for enhancement.
