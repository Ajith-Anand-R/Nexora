# Nexora — Volumetric 3D Fleet Management & Logistics Portal

Nexora is an ultra-premium, interactive 3D fleet intelligence and operations web application. Unlike standard layout dashboards, Nexora employs custom CSS-based volumetric 3D modeling, interactive coordinate radar simulations, mathematical ROI savings indicators, and tactile micro-animations to deliver a next-generation logistics command experience.

---

## 🎨 Premium Visual Architecture

### 1. Volumetric 3D Isometric City (`Home.jsx`)
- Built using **pure CSS 3D transforms** (`rotateX(54.7deg) rotateZ(-45deg)`).
- Composed of 3D structures (`HQ`, `Depot`, `Tower`, `EV-Station`) with distinct face-shading (light top, medium left, dark right) generating physical depth.
- Incorporates dynamic mouse-move cursor tracking, rotating the entire city layout on hover to create interactive depth perspective.

### 2. Live Telemetric Radar Simulation (`Home.jsx`)
- Features active route pathways and pulsing coordinate beacons.
- Overlaid with a continuous **glowing radar sweep scan** rotating at 8s intervals to reflect real-time logistics telemetry.

### 3. Circular Savings Calculator (`Home.jsx`)
- Uses dynamic SVG stroke calculations to render an animated savings gauge.
- Calculates capex retention, payback periods, and emissions metrics in real time based on active user parameters.

### 4. Glass-Premium Double-Border Layouts (`index.css` & Pages)
- Employs a custom `.glass-premium` utility that wraps containers in a translucent blur (`backdrop-filter`) accented by two distinct borders:
  - Outer border: `rgba(255, 255, 255, 0.55)`
  - Inner shadow ring: `rgba(99, 102, 241, 0.04)`
- Card frames across the entire portal dynamically glow and scale on hover.

### 5. Tactile 3D Click Feedback (`index.css` & Pages)
- Applies `.click-tactile` transitions to all links, buttons, and selection panels.
- When clicked, elements physically depress along the Z-axis (`transform: scale(0.95) translateZ(-6px) rotateX(1deg)`) with a custom spring easing bounce (`cubic-bezier(0.34, 1.56, 0.64, 1)`).

---

## ⚙️ Tech Stack

- **Client**: React 18, Vite, Tailwind CSS (Layouts), Lucide Icons, Custom CSS 3D Engines
- **Server**: Node.js, Express, Native SQLite Database Engine
- **Auth**: State-guarded context router with demo role injection profiles

---

## 🚀 Getting Started

### 1. Clone & Setup Remotes
```bash
git clone https://github.com/Ajith-Anand-R/Nexora.git
cd Nexora
```

### 2. Launch the Backend Server
The server runs on [http://localhost:4000](http://localhost:4000) and exposes the logistics database API.
```bash
cd backend
npm install
npm run dev
```

### 3. Launch the Frontend Client
The client runs on [http://localhost:5173](http://localhost:5173).
```bash
cd ../frontend
npm install
npm run dev
```

---

## 👥 Demo Profiles
Nexora supports four unique demo roles, each pre-loaded with custom KPIs, permissions, and views:
- **Fleet Manager** — View vehicle statuses, edit registries, and retire units.
- **Dispatcher** — Initiate trips, assign drivers, and cancel pending routes.
- **Safety Officer** — Review driver licensing and critical safety indices.
- **Financial Analyst** — Generate capex profitability charts and capex ROI sheets.

---

> [!NOTE]
> Database operations use native node SQLite wrappers. All SQL queries use strictly parameterized, single-quoted strings to prevent syntax exceptions.
