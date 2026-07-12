import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, BarChart3, Shield, Truck, Zap, Cpu, Settings, ChevronRight } from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    role: 'Fleet Manager',
    email: 'manager@transitops.com',
    password: 'manager123',
    icon: '🚛',
    color: 'from-emerald-500 to-teal-500',
    desc: 'Full administrative access to manage vehicles, drivers, maintenance, and fleet configuration.',
  },
  {
    role: 'Dispatcher',
    email: 'dispatcher@transitops.com',
    password: 'driver123',
    icon: '📡',
    color: 'from-cyan-500 to-sky-500',
    desc: 'Operational dashboard for trip assignment, real-time routing, and cargo status tracking.',
  },
  {
    role: 'Safety Officer',
    email: 'safety@transitops.com',
    password: 'safety123',
    icon: '🛡️',
    color: 'from-amber-500 to-orange-500',
    desc: 'Audit compliance, driver safety scorecards, and restricted access to financial metrics.',
  },
  {
    role: 'Financial Analyst',
    email: 'finance@transitops.com',
    password: 'finance123',
    icon: '📊',
    color: 'from-violet-500 to-purple-500',
    desc: 'Operating cost analysis, ROI assessments, fuel expense logs, and profit summaries.',
  },
];

export default function Home() {
  const [fleetSize, setFleetSize] = useState(25);
  const [avgDistance, setAvgDistance] = useState(4200); // km/month
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('features');
  const [simulatedTrucks, setSimulatedTrucks] = useState([
    { id: 1, name: 'Truck Alpha', status: 'In Transit', progress: 35, speed: 72, temp: 4, battery: 94 },
    { id: 2, name: 'Truck Beta', status: 'Idle', progress: 0, speed: 0, temp: 5, battery: 88 },
    { id: 3, name: 'Truck Gamma', status: 'In Transit', progress: 70, speed: 68, temp: 6, battery: 91 },
  ]);

  const heroRef = useRef(null);

  // Mouse tilt handler for the 3D Hero Scene
  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Live simulation progress loop
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedTrucks((prev) =>
        prev.map((t) => {
          if (t.status === 'In Transit') {
            const nextProgress = t.progress + Math.floor(Math.random() * 4) + 1;
            const reached = nextProgress >= 100;
            return {
              ...t,
              progress: reached ? 0 : nextProgress,
              status: reached ? 'Idle' : 'In Transit',
              speed: reached ? 0 : Math.floor(Math.random() * 10) + 65,
              battery: Math.max(t.battery - (Math.random() > 0.7 ? 1 : 0), 10),
            };
          } else {
            // Idle trucks occasionally start moving
            const startMoving = Math.random() > 0.85;
            return {
              ...t,
              status: startMoving ? 'In Transit' : 'Idle',
              speed: startMoving ? 68 : 0,
              progress: startMoving ? 5 : 0,
            };
          }
        })
      );
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // ROI Calculations
  const calculatedSavings = fleetSize * (avgDistance * 0.08); // $0.08 saved per km
  const co2Reduction = fleetSize * (avgDistance * 0.12); // 0.12 kg CO2 saved per km
  const utilizationLift = Math.min(15 + Math.round(avgDistance / 500), 28);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // Demo launch handler
  const launchDemo = (account) => {
    // Fill credentials and navigate
    sessionStorage.setItem('prefilled_email', account.email);
    sessionStorage.setItem('prefilled_password', account.password);
    sessionStorage.setItem('prefilled_role', account.role);
    window.location.hash = '#login';
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 font-sans">
      {/* Aurora Background Orbs */}
      <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-indigo-200/40 to-violet-300/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[65%] h-[65%] rounded-full bg-gradient-to-tr from-cyan-200/40 to-sky-200/30 blur-[130px] pointer-events-none" />

      {/* Floating navigation header */}
      <header className="sticky top-0 z-50 px-6 py-4 backdrop-blur-md bg-white/60 border-b border-indigo-50/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <span className="font-display font-black text-2xl tracking-tight text-slate-800">
              Nexora
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
            <a href="#simulator" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Simulator</a>
            <a href="#calculator" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">ROI Calculator</a>
            <a href="#demo" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Quick Demo</a>
          </nav>

          <button
            onClick={() => window.location.hash = '#login'}
            className="btn-primary px-5 py-2.5 text-sm cursor-pointer"
          >
            Launch System <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-12 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 space-y-6 z-10 text-center lg:text-left fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold tracking-wider font-mono">
            <Cpu className="h-3.5 w-3.5" /> AGENTIC LOGISTICS PLATFORM
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Next-Gen Fleet <br />
            Operations, <span className="gradient-text">Redefined.</span>
          </h1>
          <p className="text-slate-600 text-lg font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
            Automate routing, track driver safety scoring, log fuel efficiency, and monitor operations using a premium, 3D interactive command portal.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <button
              onClick={() => {
                const element = document.getElementById('demo');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-primary py-3 px-6 cursor-pointer text-sm font-bold"
            >
              Get Started
            </button>
            <button
              onClick={() => {
                const element = document.getElementById('simulator');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-ghost py-3 px-6 cursor-pointer text-sm font-bold border border-slate-200"
            >
              Watch Simulator
            </button>
          </div>
        </div>

        {/* 3D Hero Graphic Container */}
        <div
          ref={heroRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="lg:col-span-7 flex justify-center items-center h-[420px] sm:h-[500px] perspective-container cursor-grab active:cursor-grabbing z-10"
        >
          <div
            className="scene-3d w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] grid-3d-isometric relative bg-white/30 backdrop-blur-md rounded-[48px] border border-white/40 shadow-premium"
            style={{
              transform: `rotateX(${54.7 + mousePos.y * 30}deg) rotateZ(${-45 + mousePos.x * 30}deg) translateZ(0px)`,
            }}
          >
            {/* Base grid lines inside the 3D card */}
            <div className="absolute inset-8 border-2 border-dashed border-indigo-100/50 rounded-[32px] flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 100 100">
                <path d="M10,50 L90,50" stroke="#818cf8" strokeWidth="0.5" strokeDasharray="2 2" />
                <path d="M50,10 L50,90" stroke="#818cf8" strokeWidth="0.5" strokeDasharray="2 2" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="#818cf8" strokeWidth="0.5" strokeDasharray="1 1" />
                {/* Glowing moving delivery path */}
                <path d="M10,10 L50,50 L90,80" fill="none" stroke="url(#hero-gradient)" strokeWidth="2" className="animate-dash-route" />
                <defs>
                  <linearGradient id="hero-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>

              {/* 3D Hub Warehouse box */}
              <div
                className="absolute w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg flex items-center justify-center layer-3d-3 object-3d"
                style={{
                  transform: 'translateZ(45px)',
                  boxShadow: '0 15px 30px rgba(99, 102, 241, 0.4)',
                }}
              >
                <Cpu className="h-5 w-5 text-white" />
              </div>

              {/* 3D Floating Node: Delivery Alert */}
              <div
                className="absolute top-2 left-6 px-3 py-1.5 bg-white/95 rounded-xl shadow-md border border-indigo-50/50 flex items-center gap-1.5 animate-float-y layer-3d-2 font-mono text-[9px] font-bold text-slate-800"
                style={{ transform: 'translateZ(25px)' }}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>TRIP-049 ACTIVE</span>
              </div>

              {/* 3D Floating Node: Vehicle Status */}
              <div
                className="absolute bottom-6 right-2 px-3 py-1.5 bg-white/95 rounded-xl shadow-md border border-cyan-50/50 flex items-center gap-1.5 animate-float-y-delayed layer-3d-2 font-mono text-[9px] font-bold text-slate-800"
                style={{ transform: 'translateZ(35px)' }}
              >
                <Truck className="h-3 w-3 text-cyan-500 animate-bounce" />
                <span>NEX-8890: 72 KM/H</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Fleet Simulator Section */}
      <section id="simulator" className="max-w-7xl mx-auto px-6 py-16 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12 fade-up">
          <h2 className="text-3xl font-display font-bold text-slate-900">
            Real-time <span className="gradient-text">Fleet Simulator</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Observe simulated logistics coordinates, telematics logs, battery charging status, and transit indicators dynamically.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Sim Logs (1 col) */}
          <div className="glass rounded-2xl border border-slate-100 p-6 space-y-4">
            <h3 className="font-display font-bold text-slate-900 text-base">Active Assets Status</h3>
            <div className="space-y-3">
              {simulatedTrucks.map((t) => (
                <div key={t.id} className="p-4 rounded-xl bg-white border border-slate-50 shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-800">{t.name}</span>
                    <span className={`badge text-[9px] ${t.status === 'In Transit' ? 'badge-cyan' : 'badge-slate'}`}>
                      {t.status}
                    </span>
                  </div>
                  {t.status === 'In Transit' ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>Speed: {t.speed} km/h</span>
                        <span>Battery: {t.battery}%</span>
                      </div>
                      <div className="progress-track h-1.5">
                        <div className="progress-fill h-full" style={{ width: `${t.progress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 font-mono">Vehicle on standby. Standard cooling: {t.temp}°C</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Routing View (2 cols) */}
          <div className="glass rounded-2xl border border-slate-100 p-6 lg:col-span-2 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-base">Simulated Route Visualization</h3>
                <p className="text-xs text-slate-400">Interactive telemetry routing path simulation</p>
              </div>
              <div className="text-xs font-mono font-bold text-slate-600 bg-slate-100 rounded-lg px-2.5 py-1">
                ACTIVE TRIPS: {simulatedTrucks.filter(t => t.status === 'In Transit').length}
              </div>
            </div>

            <div className="h-64 rounded-xl bg-slate-50 relative border border-slate-100 overflow-hidden flex items-center justify-center">
              {/* Overlay simulation paths */}
              <svg className="w-full h-full absolute inset-0 opacity-80" viewBox="0 0 500 200">
                {/* Route lines */}
                <path d="M 50 100 Q 150 40 250 100 T 450 100" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                <path d="M 50 100 Q 150 160 250 100 T 450 100" fill="none" stroke="#e2e8f0" strokeWidth="3" />

                {/* Animated dash route for active trucks */}
                {simulatedTrucks[0].status === 'In Transit' && (
                  <path d="M 50 100 Q 150 40 250 100 T 450 100" fill="none" stroke="#6366f1" strokeWidth="2.5" className="animate-dash-route" />
                )}
                {simulatedTrucks[2].status === 'In Transit' && (
                  <path d="M 50 100 Q 150 160 250 100 T 450 100" fill="none" stroke="#06b6d4" strokeWidth="2.5" className="animate-dash-route" />
                )}

                {/* Simulated Pins */}
                <circle cx="50" cy="100" r="6" fill="#8b5cf6" />
                <text x="45" y="120" className="text-[9px] font-mono font-bold fill-slate-500">HUB-A</text>

                <circle cx="450" cy="100" r="6" fill="#8b5cf6" />
                <text x="440" y="120" className="text-[9px] font-mono font-bold fill-slate-500">HUB-B</text>

                {/* Simulating running trucks */}
                {simulatedTrucks[0].status === 'In Transit' && (
                  <g style={{ transform: 'translate(100px, -20px)' }}>
                    <circle cx="100" cy="80" r="8" fill="#6366f1" className="animate-ping" style={{ animationDuration: '3s' }} />
                    <circle cx="100" cy="80" r="5" fill="#6366f1" />
                  </g>
                )}
                {simulatedTrucks[2].status === 'In Transit' && (
                  <g style={{ transform: 'translate(200px, 30px)' }}>
                    <circle cx="100" cy="80" r="8" fill="#06b6d4" className="animate-ping" style={{ animationDuration: '4s' }} />
                    <circle cx="100" cy="80" r="5" fill="#06b6d4" />
                  </g>
                )}
              </svg>

              <div className="absolute bottom-4 left-4 bg-white/95 px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm text-[10px] font-mono text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span>Truck Alpha Route (Top)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  <span>Truck Gamma Route (Bottom)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet ROI Savings Calculator Section */}
      <section id="calculator" className="max-w-7xl mx-auto px-6 py-16 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12 fade-up">
          <h2 className="text-3xl font-display font-bold text-slate-900">
            Interactive <span className="gradient-text">ROI Calculator</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Calculate your operating cost reduction, carbon savings, and asset utilization lift based on parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-6 bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-indigo-50 shadow-premium">
            <h3 className="font-display font-bold text-slate-800 text-lg">Define Fleet Parameters</h3>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-slate-600">Fleet Size</span>
                <span className="text-indigo-600 font-mono">{fleetSize} units</span>
              </div>
              <input
                type="range" min="5" max="150" value={fleetSize} onChange={(e) => setFleetSize(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-slate-600">Average Distance / Month</span>
                <span className="text-indigo-600 font-mono">{avgDistance.toLocaleString()} km</span>
              </div>
              <input
                type="range" min="1000" max="12000" step="100" value={avgDistance} onChange={(e) => setAvgDistance(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 text-xs text-slate-600 font-medium">
              Calculations assume standard dispatch efficiency upgrades, optimized scheduling algorithms, and predictive fuel monitoring reductions.
            </div>
          </div>

          {/* Results Visual */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="glass rounded-2xl p-6 border border-slate-100 card-tilt-premium text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-2xl mx-auto mb-4">💰</div>
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">OPERATING SAVINGS</div>
              <div className="text-2xl font-display font-extrabold text-slate-900">{formatCurrency(calculatedSavings)}</div>
              <div className="text-xs text-slate-400 mt-1">Projected monthly reduction</div>
            </div>

            <div className="glass rounded-2xl p-6 border border-slate-100 card-tilt-premium text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-2xl mx-auto mb-4">🌿</div>
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">CO2 REDUCTION</div>
              <div className="text-2xl font-display font-extrabold text-slate-900">{(co2Reduction / 1000).toFixed(1)} t</div>
              <div className="text-xs text-slate-400 mt-1">Projected monthly carbon save</div>
            </div>

            <div className="glass rounded-2xl p-6 border border-slate-100 card-tilt-premium text-center">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-2xl mx-auto mb-4">⚡</div>
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">UTILIZATION LIFT</div>
              <div className="text-2xl font-display font-extrabold text-slate-900">+{utilizationLift}%</div>
              <div className="text-xs text-slate-400 mt-1">Expected availability gain</div>
            </div>
          </div>
        </div>
      </section>

      {/* Onboarding Quick Demo Portal */}
      <section id="demo" className="max-w-7xl mx-auto px-6 py-16 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12 fade-up">
          <h2 className="text-3xl font-display font-bold text-slate-900">
            Choose Your <span className="gradient-text">Workspace Role</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Launch Nexora as a demo role. Each role features dedicated privileges, KPIs, security limits, and dashboard actions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DEMO_ACCOUNTS.map((acc, i) => (
            <div
              key={acc.role}
              onClick={() => launchDemo(acc)}
              className="glass rounded-2xl border border-slate-100 p-6 flex flex-col justify-between cursor-pointer hover:border-indigo-200 transition-all duration-300 relative overflow-hidden group shadow-sm hover:shadow-premium hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${acc.color} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}>
                  {acc.icon}
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-display font-bold text-slate-800 text-base">{acc.role}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{acc.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 mt-6 pt-4 border-t border-slate-100 group-hover:gap-2.5 transition-all">
                <span>Launch Portal</span> <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-white mt-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight">Nexora</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            &copy; 2026 Nexora Fleet Platform. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
