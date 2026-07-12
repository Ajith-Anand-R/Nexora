# TransitOps — Agent.md
**Single source of truth. Any person or AI agent reading only this file should be able to design, build, verify, and demo the entire project in 8 hours.**

---

## 0. TL;DR

Build a role-based transport operations web app: React frontend + Express REST API + SQLite (local file DB via Prisma). No cloud dependency, no static mock JSON in the frontend — all data flows through real API calls to a real local database. Core loop: register Vehicles/Drivers → create Trips → system enforces business rules → auto status transitions → Dashboard/Reports reflect live state.

Team of 3–4. Timeboxed to 8 hours. Read this file top to bottom before writing code.

---

## 1. Objective & Scope

Digitize: vehicle registry, driver management, trip dispatch, maintenance, fuel/expense logging, and analytics — with enforced business rules and RBAC. Full requirements are in the problem statement; this file translates them into an executable build plan.

**Non-negotiables from the brief (map these to your work explicitly):**
- Real/dynamic data via API + local DB — no hardcoded JSON beyond a one-time seed script
- Clean, responsive, consistently-styled UI
- Robust client + server validation
- Intuitive nav (persistent sidebar/topbar, clear IA)
- Real Git workflow — multiple contributors, feature branches, real commit history
- Backend APIs + data modeling + local database, designed by the team (not black-boxed)
- If you use AI-generated code, read and adapt it — don't paste blindly
- Runs fully offline/local (no dependency on live internet or third-party cloud services)
- Use trendy tech only if it adds real value — boring and working beats fancy and broken

---

## 2. Users & RBAC Matrix

| Role | Primary Job | Vehicles | Drivers | Trips | Maintenance | Fuel/Expense | Reports |
|---|---|---|---|---|---|---|---|
| Fleet Manager | Oversees fleet, maintenance, lifecycle | CRUD | CRUD | View | CRUD | CRUD | Full |
| Driver (functions as Dispatcher) | Creates/assigns/monitors trips | View | View | CRUD (create/dispatch/complete/cancel) | View | Create (fuel logs on own trips) | View own trips |
| Safety Officer | Compliance, license validity, safety scores | View | CRUD (safety score, status) | View | View | — | Compliance-only view |
| Financial Analyst | Cost, fuel, ROI | View | View | View | View | View | Full (cost/ROI focus) |

> **Design note:** the brief names one role "Driver" but describes dispatcher-like behavior ("creates trips, assigns vehicles and drivers"). Treat this as a **User Role called Driver/Dispatcher**, completely separate from the **Driver entity** (the person physically driving, stored in the `Drivers` table). Document this distinction clearly in your README so judges aren't confused — it's the single most likely spot for misunderstanding the spec.

Auth: email + password login, JWT issued on success, RBAC middleware checks role claim on every protected route.

---

## 3. Tech Stack (and why)

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite + Tailwind CSS | Fast scaffolding, no build-config pain, everyone on a team usually knows it |
| Routing | React Router | Standard, zero learning curve |
| State | React Context/useReducer (no Redux) | One day project — don't add state-management overhead you don't need |
| HTTP | Axios | Interceptors make attaching JWT + global error handling trivial |
| Charts | Recharts | Clean, fast to wire up for KPI/analytics cards |
| Backend | Node.js + Express | Minimal ceremony, huge familiarity, easy middleware for RBAC |
| ORM | Prisma | Schema-first, auto-migrations, works great with SQLite, fast to iterate |
| Database | **SQLite** (single `transitops.db` file) | Zero setup, zero network dependency, satisfies the "offline/local" and "local database" requirements directly — no cloud DB, no risk of venue wifi killing your demo |
| Auth | JWT + bcrypt | Standard, no external auth provider dependency (again: offline-safe) |
| Validation | Zod (backend schemas) + inline HTML5/JS checks (frontend) | Shared shape of truth for validation rules, fast to write |
| Version Control | Git + GitHub (private repo) | See §11 |

Avoid: microservices, Kubernetes, GraphQL, external auth providers (Auth0/Firebase), cloud databases (Supabase/Mongo Atlas) — none of these add value at this scope and all add offline/setup risk.

---

## 4. System Architecture

```
[ Browser — React SPA (Vite build) ]
        |  HTTPS/HTTP, JSON, JWT in Authorization header
        v
[ Express API Server (Node.js) ]
   ├── auth middleware (verify JWT)
   ├── rbac middleware (check role vs route)
   ├── controllers: vehicles, drivers, trips, maintenance, fuel, expenses, reports
   ├── services layer (business rules + state machine — see §7)
   ├── validation layer (Zod schemas per entity)
   └── Prisma Client
        v
[ SQLite file: transitops.db ]  ← lives on disk, no network hop, fully local
```

Run everything on `localhost` (e.g., frontend on :5173, backend on :4000). One `docker-compose` or two `npm run dev` terminals — keep it that simple.

---

## 5. Database Design

### Entities & Fields

```
Roles
  id, name (FleetManager | Driver | SafetyOfficer | FinancialAnalyst)

Users
  id, name, email (unique), password_hash, role_id (FK Roles), created_at

Vehicles
  id, registration_number (unique), name_model, type, max_load_capacity,
  odometer, acquisition_cost, region, status (Available|On Trip|In Shop|Retired),
  created_at

Drivers
  id, name, license_number, license_category, license_expiry_date,
  contact_number, safety_score, status (Available|On Trip|Off Duty|Suspended),
  created_at

Trips
  id, source, destination, vehicle_id (FK), driver_id (FK), cargo_weight,
  planned_distance, actual_distance (nullable), fuel_consumed (nullable),
  status (Draft|Dispatched|Completed|Cancelled),
  created_at, dispatched_at, completed_at

MaintenanceLogs
  id, vehicle_id (FK), description, cost, status (Active|Closed),
  start_date, end_date (nullable)

FuelLogs
  id, vehicle_id (FK), trip_id (FK, nullable), liters, cost, date

Expenses
  id, vehicle_id (FK), category (toll|other), amount, date, description
```

### Relationships
- Roles 1—N Users
- Vehicles 1—N Trips, 1—N MaintenanceLogs, 1—N FuelLogs, 1—N Expenses
- Drivers 1—N Trips

### Seed script (run once, at startup of dev environment)
Seed: 4 roles, 1 user per role, ~6 vehicles (mixed statuses), ~6 drivers (mixed statuses, one with expired license, one suspended), 2–3 historical completed trips with fuel logs so Reports isn't empty on first launch. This is your **only** allowed "static" data — used purely to bootstrap the local DB, not as a data source the app reads from directly.

---

## 6. API Design (REST)

```
POST   /api/auth/login                  → { token, user }
GET    /api/auth/me                     → current user + role

GET    /api/vehicles?status=&type=&region=
POST   /api/vehicles
GET    /api/vehicles/:id
PUT    /api/vehicles/:id
PUT    /api/vehicles/:id/retire

GET    /api/drivers?status=
POST   /api/drivers
PUT    /api/drivers/:id
PUT    /api/drivers/:id/suspend

GET    /api/trips?status=
POST   /api/trips                       → creates Draft, runs validation (§7)
PUT    /api/trips/:id/dispatch          → Draft → Dispatched (flips statuses)
PUT    /api/trips/:id/complete          → Dispatched → Completed (flips back, records odometer/fuel)
PUT    /api/trips/:id/cancel            → Dispatched → Cancelled (flips back)

GET    /api/maintenance
POST   /api/maintenance                 → creates Active record, flips vehicle → In Shop
PUT    /api/maintenance/:id/close       → flips vehicle → Available (unless Retired)

GET    /api/fuel-logs
POST   /api/fuel-logs
GET    /api/expenses
POST   /api/expenses

GET    /api/reports/dashboard           → KPI numbers for dashboard cards
GET    /api/reports/fleet-utilization
GET    /api/reports/vehicle-roi
GET    /api/reports/export/csv?type=
```

Every list endpoint supports filtering via query params. Every write endpoint validates with a Zod schema and returns 400 with a field-level error message on failure (not a generic "error").

---

## 7. Business Rules & State Machines

**Vehicle status:** `Available → On Trip → Available` (via trip complete/cancel) and `Available ⇄ In Shop` (via maintenance) and `→ Retired` (terminal, one-way).

**Driver status:** `Available → On Trip → Available` (via trip lifecycle), plus manually settable `Off Duty` / `Suspended`.

**Trip lifecycle:** `Draft → Dispatched → Completed`, or `Dispatched → Cancelled`.

### Trip creation/dispatch validation (pseudocode — this is the core logic of the whole app, get it right first)
```
function validateAndDispatchTrip(vehicleId, driverId, cargoWeight):
    vehicle = getVehicle(vehicleId)
    driver  = getDriver(driverId)

    assert vehicle.status == "Available"        else reject("vehicle not available")
    assert vehicle.status != "Retired"           else reject("vehicle retired")
    assert driver.status == "Available"          else reject("driver not available")
    assert driver.status != "Suspended"          else reject("driver suspended")
    assert driver.license_expiry_date >= today() else reject("driver license expired")
    assert cargoWeight <= vehicle.max_load_capacity else reject("cargo exceeds capacity")

    // all checks pass — wrap in a DB transaction:
    trip.status = "Dispatched"
    vehicle.status = "On Trip"
    driver.status = "On Trip"
    commit()
```

Wrap every status-flipping action (dispatch/complete/cancel/maintenance open/close) in a **database transaction** — half-applied state (e.g., trip marked Dispatched but vehicle still shows Available) is the #1 bug source in this kind of app and the #1 thing judges will poke at.

**Golden rule:** Retired or In Shop vehicles, and Suspended/expired-license/On-Trip drivers, must **never appear in dispatch dropdowns** — filter at the query level (`WHERE status = 'Available'`), don't just filter visually in the frontend.

---

## 8. UI/UX Design

**Pages:** Login → Dashboard → Vehicles (list + form) → Drivers (list + form) → Trips (list + create wizard + detail w/ dispatch/complete/cancel actions) → Maintenance → Fuel & Expenses → Reports.

**Layout:** persistent left sidebar (role-aware — hide nav items the current role can't use) + top bar (user name, role badge, logout). Content area uses a consistent max-width container, 16–24px spacing scale, card-based panels with soft shadows.

**Color system (pick once, use everywhere):**
- Primary: deep blue/navy (trust, logistics feel) — sidebar, primary buttons
- Status colors: green = Available, blue = On Trip, amber = In Shop, gray = Retired/Off Duty, red = Suspended/expired
- Neutral grays for backgrounds/borders/text-secondary
- Use the same status color mapping everywhere (badges, dashboard, charts) — this consistency reads as "polish" to judges far more than any single flashy feature.

**Responsiveness:** sidebar collapses to a hamburger/bottom-nav under ~768px; tables become stacked cards on mobile; test this once early, not at hour 7.

---

## 9. Phase-by-Phase Build Plan (8 hours, team of 4)

Suggested roles: **A** = Backend/DB lead, **B** = Frontend lead, **C** = Full-stack (trips/business-logic owner), **D** = Full-stack/QA + integration + demo prep. Adjust to your team size — the phases don't change, only who's doing them.

| Time | Phase | A (Backend) | B (Frontend) | C (Trips/Logic) | D (QA/Integration) |
|---|---|---|---|---|---|
| 0:00–0:30 | Kickoff | Finalize schema w/ team | Set up Vite+Tailwind scaffold | Review business rules, write validation pseudocode | Create GitHub repo, branch protection, invite team |
| 0:30–1:30 | Foundations | Express server, Prisma schema + migration, seed script, auth endpoints + JWT | Routing shell, layout (sidebar/topbar), Login page wired to auth | RBAC middleware design + review with A | Set up `.env`, shared Postman/Thunder collection, CI sanity check (app boots) |
| 1:30–3:00 | Core CRUD | Vehicles + Drivers CRUD APIs w/ Zod validation | Vehicles + Drivers list/create/edit pages, status badges | Write trip validation service (unit-testable, isolated from Express) | Manual test each CRUD endpoint against checklist §10 |
| 3:00–4:30 | Trips | Support endpoints (available vehicles/drivers lists) | Trip creation wizard + trip list/detail UI, dispatch/complete/cancel buttons | Wire trip validation + transaction-wrapped status flips into API | Test every rule in §7 against live app, log bugs immediately |
| 4:30–5:30 | Maintenance + Fuel/Expense | Maintenance + fuel/expense CRUD, auto status-flip logic | Maintenance page, fuel/expense log forms | Assist wiring maintenance→vehicle status flip; cost aggregation query | Regression-test trip flows still work after maintenance changes |
| 5:30–6:30 | Dashboard + Reports | KPI aggregation endpoint, CSV export | Dashboard cards, charts (Recharts), filters | Fleet utilization / ROI calculation logic | Verify KPI numbers match manual DB counts |
| 6:30–7:15 | Bonus (only if core is green) | License-expiry check endpoint | Dark mode toggle, search/sort/filter polish | PDF export (optional) | Full checklist re-run, prioritize fixing bugs over adding bonus features |
| 7:15–7:45 | Hardening | — | Responsive pass (resize to laptop/projector width) | — | Full E2E run of the Example Workflow (§ below), reseed clean demo data |
| 7:45–8:00 | Demo prep | Tag `v1.0-demo` release | Final commit | Rehearse demo script (§13) | Confirm app runs fully offline (kill wifi and reload as a test) |

**Rule of thumb:** if you're behind schedule at any checkpoint, cut bonus features (§12) before cutting core validation or the demo rehearsal slot. A working core demo beats a broken feature-rich one every time.

---

## 10. Verification Checklist

Run this exact sequence at least once before the demo — it mirrors the brief's own example workflow, so it doubles as your rehearsal script.

- [ ] Register vehicle `Van-05`, capacity 500kg → status Available
- [ ] Attempt to register a second vehicle with the same registration number → rejected with a clear error
- [ ] Register driver `Alex` with a valid (future) license date → status Available
- [ ] Create trip: cargo 450kg on Van-05/Alex → allowed, trip status Draft
- [ ] Attempt trip with cargo 600kg on Van-05 → rejected ("exceeds max load capacity")
- [ ] Dispatch the 450kg trip → Van-05 and Alex both flip to On Trip; both disappear from the dropdown in a *new* trip form
- [ ] Attempt to assign Van-05 (now On Trip) to a second trip → blocked
- [ ] Suspend a different driver → confirm they cannot be selected for a new trip
- [ ] Set a driver's license_expiry_date to yesterday → confirm they cannot be selected
- [ ] Complete the dispatched trip, enter final odometer + fuel consumed → Van-05 and Alex both return to Available; odometer updates
- [ ] Create a new trip, dispatch it, then Cancel it (instead of completing) → vehicle/driver both return to Available
- [ ] Create a maintenance record (e.g. "Oil Change") on an Available vehicle → vehicle flips to In Shop and disappears from all trip-creation dropdowns
- [ ] Close that maintenance record → vehicle returns to Available
- [ ] Retire a vehicle → confirm it never reappears in dispatch dropdowns, even after closing any open maintenance
- [ ] Dashboard KPIs (Active Vehicles, Active Trips, Fleet Utilization %, etc.) update immediately after each state change above — refresh and manually cross-check one number against the DB
- [ ] CSV export downloads a file matching the currently applied filters
- [ ] Log in as each of the 4 roles → confirm nav items and access match the RBAC matrix in §2
- [ ] Resize browser to phone width → layout still usable, no horizontal scroll/broken nav
- [ ] Disconnect from the internet entirely → app still fully functional (proves the "offline/local" requirement)
- [ ] Check `git log --oneline --all` → confirm commits from more than one team member

---

## 11. Git & Team Workflow

- One shared **private GitHub repo**, created in the first 15 minutes.
- `main` branch is protected (or at least treated as always-working) — never commit straight-to-broken.
- Branch per module: `feature/auth`, `feature/vehicles`, `feature/trips`, `feature/reports`, etc.
- Small, frequent commits with real messages (`fix: cargo validation off-by-one`, not `update`). This matters — judges/repo reviewers can and do check the contributor graph; one person committing everyone else's work is an instant red flag against the "proper Git usage" requirement.
- Merge into `main` via PR (even a self-approved PR in a small team is fine) at the end of each phase in §9, so you always have a working checkpoint to fall back to.
- Tag a `v1.0-demo` release once hardening (7:15) is done — if anything breaks in the last 45 minutes, you can revert to this tag before going on stage.
- `.gitignore`: `node_modules/`, `.env`, `*.db` (commit a `schema.prisma` + seed script instead of the raw DB file, so anyone can regenerate it).

---

## 12. Bonus Features — Priority Order

Only attempt these after the full checklist in §10 passes. In priority order (highest demo-value-per-minute first):
1. Charts/visual analytics on Reports (you likely need this for KPIs anyway — cheap add)
2. Search, filters, sorting on list pages (judges test this reflexively)
3. License-expiry banner/reminder in the UI (easy, visibly demonstrates business awareness)
4. Dark mode toggle (fast with Tailwind, nice visual wow)
5. Vehicle document management (higher effort, lower payoff at this scope)
6. PDF export (optional per the brief — do CSV well first, skip PDF unless time is abundant)

---

## 13. Demo Script (~2 minutes)

1. **Hook (10s):** "Fleet managers today run this on spreadsheets — missed maintenance, expired licenses, double-booked trucks. TransitOps fixes that."
2. **Login as Fleet Manager (10s):** show role-aware dashboard, KPIs.
3. **Attempt an invalid trip (20s):** try to overload a vehicle or assign a suspended driver → show the system rejecting it live. *This single moment is your strongest proof of "business rules enforced," lead with it.*
4. **Create + dispatch a valid trip (20s):** show vehicle/driver flipping to On Trip in real time, and disappearing from a second trip's dropdown.
5. **Maintenance flow (15s):** put a vehicle into the shop, show it vanish from dispatch options.
6. **Reports (15s):** show utilization/ROI chart update to reflect everything just done.
7. **Close (10s):** one sentence on what you'd add with more time (bonus features you didn't get to).

Rehearse this at 7:15–7:45, not for the first time on stage.

---

## 14. Common Pitfalls / Judge Red Flags

- Frontend reads from a hardcoded JSON file instead of the real API — instantly visible if judges refresh or add data live.
- Validation only on the frontend (bypassable via devtools/direct API call) — always duplicate critical checks server-side.
- Status flips not wrapped in a transaction — leads to inconsistent state exactly when judges are testing edge cases.
- Retired/In-Shop vehicles or Suspended/expired drivers still selectable in some dropdown you forgot to filter.
- One person's name on all the commits.
- Empty screens on first load because no seed data — always seed before demoing.
- Inconsistent spacing/colors across pages — looks unfinished even if functionality is complete.
- Trying to add a trendy tool (GraphQL, a new state library, a cloud DB) mid-hackathon "because it's cool" and losing an hour to it — don't.