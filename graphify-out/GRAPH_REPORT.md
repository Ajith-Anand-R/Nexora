# Graph Report - .  (2026-07-12)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 126 nodes · 199 edges · 15 communities (14 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- App.jsx
- package.json
- package.json
- devDependencies
- auth.js
- db.js
- db
- seed.js
- server.js
- auth.js
- trips.js
- seed.ts

## God Nodes (most connected - your core abstractions)
1. `db` - 9 edges
2. `authenticate()` - 9 edges
3. `authorize()` - 6 edges
4. `AuthContext` - 6 edges
5. `initDb()` - 4 edges
6. `seedDb()` - 4 edges
7. `verifyJwt()` - 4 edges
8. `scripts` - 4 edges
9. `api` - 4 edges
10. `scripts` - 3 edges

## Surprising Connections (you probably didn't know these)
- `authenticate()` --calls--> `verifyJwt()`  [EXTRACTED]
  backend/src/middleware/auth.js → backend/src/utils/jwt.js
- `seedDb()` --calls--> `initDb()`  [EXTRACTED]
  backend/src/seed.js → backend/src/db.js
- `seedDb()` --calls--> `hashPassword()`  [EXTRACTED]
  backend/src/seed.js → backend/src/utils/crypto.js

## Import Cycles
- None detected.

## Communities (15 total, 1 thin omitted)

### Community 0 - "App.jsx"
Cohesion: 0.14
Nodes (12): App(), Sidebar(), AuthContext, AuthProvider(), Dashboard(), FuelExpenses(), Login(), Maintenance() (+4 more)

### Community 1 - "package.json"
Cohesion: 0.11
Nodes (17): dependencies, lucide-react, react, react-dom, recharts, name, private, scripts (+9 more)

### Community 2 - "package.json"
Cohesion: 0.12
Nodes (15): dependencies, bcryptjs, express, zod, description, main, name, scripts (+7 more)

### Community 3 - "devDependencies"
Cohesion: 0.13
Nodes (15): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/react, @types/react-dom, vite (+7 more)

### Community 4 - "auth.js"
Cohesion: 0.36
Nodes (6): loginSchema, router, base64UrlDecode(), base64UrlEncode(), signJwt(), verifyJwt()

### Community 5 - "db.js"
Cohesion: 0.29
Nodes (6): dbPath, __dirname, __filename, runTransaction(), maintenanceSchema, router

### Community 6 - "db"
Cohesion: 0.50
Nodes (3): db, router, vehicleSchema

### Community 7 - "seed.js"
Cohesion: 0.53
Nodes (4): initDb(), seedDb(), hashPassword(), verifyPassword()

### Community 8 - "server.js"
Cohesion: 0.50
Nodes (3): router, router, app

### Community 9 - "auth.js"
Cohesion: 0.33
Nodes (6): authenticate(), authorize(), driverSchema, expenseSchema, fuelLogSchema, router

### Community 10 - "trips.js"
Cohesion: 0.50
Nodes (3): router, tripCompleteSchema, tripCreateSchema

## Knowledge Gaps
- **41 isolated node(s):** `name`, `version`, `description`, `main`, `type` (+36 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _41 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14245014245014245 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._