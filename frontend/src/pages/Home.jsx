import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, BarChart3, Shield, Truck, Zap, Cpu, Settings, ChevronRight, Play, Pause, RefreshCw } from 'lucide-react';

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

// Volumetric 3D Building component using CSS transforms
function VolumetricBuilding({ size = 40, height = 80, x = 0, y = 0, topColor, leftColor, rightColor, name }) {
  const style = {
    '--size': `${size}px`,
    '--height': `${height}px`,
    '--top-color': topColor || 'linear-gradient(135deg, #a5b4fc, #6366f1)',
    '--left-color': leftColor || '#4f46e5',
    '--right-color': rightColor || '#312e81',
    left: `${x}px`,
    top: `${y}px`,
  };

  return (
    <div className="building-3d absolute" style={style}>
      <div className="building-face building-left" />
      <div className="building-face building-right" />
      <div className="building-face building-top flex items-center justify-center text-[8px] font-bold text-white/90 uppercase tracking-widest font-mono">
        <span className="transform -rotate-45 block" style={{ transform: 'rotateX(0deg) rotateY(0deg) rotateZ(45deg)' }}>
          {name}
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const [fleetSize, setFleetSize] = useState(35);
  const [avgDistance, setAvgDistance] = useState(5400); // km/month
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [simActive, setSimActive] = useState(true);
  const [logs, setLogs] = useState([
    'System initialization successful.',
    'Tracking 120 simulated telemetry feeds.',
    'Radar scan active on port 4000.',
  ]);

  const [simulatedTrucks, setSimulatedTrucks] = useState([
    { id: 1, name: 'Truck Alpha', status: 'In Transit', progress: 42, speed: 74, temp: 4, battery: 92, route: 'Top' },
    { id: 2, name: 'Truck Beta', status: 'Idle', progress: 0, speed: 0, temp: 5, battery: 89, route: 'None' },
    { id: 3, name: 'Truck Gamma', status: 'In Transit', progress: 78, speed: 66, temp: 6, battery: 90, route: 'Bottom' },
  ]);

  const heroRef = useRef(null);

  // Mouse tilt handler for the 3D Hero Scene
  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Live simulation loop
  useEffect(() => {
    if (!simActive) return;
    const interval = setInterval(() => {
      setSimulatedTrucks((prev) =>
        prev.map((t) => {
          if (t.status === 'In Transit') {
            const nextProgress = t.progress + Math.floor(Math.random() * 5) + 2;
            const reached = nextProgress >= 100;
            if (reached) {
              setLogs((l) => [`[Telematics] ${t.name} reached HUB-B. Cargo dispatched.`, ...l.slice(0, 4)]);
            }
            return {
              ...t,
              progress: reached ? 0 : nextProgress,
              status: reached ? 'Idle' : 'In Transit',
              speed: reached ? 0 : Math.floor(Math.random() * 12) + 64,
              battery: Math.max(t.battery - (Math.random() > 0.8 ? 1 : 0), 15),
            };
          } else {
            const startMoving = Math.random() > 0.8;
            if (startMoving) {
              setLogs((l) => [`[Telematics] Dispatching ${t.name} from HUB-A to HUB-B.`, ...l.slice(0, 4)]);
            }
            return {
              ...t,
              status: startMoving ? 'In Transit' : 'Idle',
              speed: startMoving ? 70 : 0,
              progress: startMoving ? 5 : 0,
            };
          }
        })
      );
    }, 1200);
    return () => clearInterval(interval);
  }, [simActive]);

  // ROI Calculations
  const calculatedSavings = fleetSize * (avgDistance * 0.082); // $0.082 saved per km
  const co2Reduction = fleetSize * (avgDistance * 0.125); // 0.125 kg CO2 saved per km
  const utilizationLift = Math.min(15 + Math.round(avgDistance / 450), 30);

  // ROI savings percentage compared to theoretical max ($150 fleet * 12000 km)
  const maxSavingsPossible = 150 * 12000 * 0.082;
  const savingsPct = Math.min(Math.round((calculatedSavings / maxSavingsPossible) * 100), 100);

  // SVG circular gauge params
  const strokeRadius = 50;
  const circumference = 2 * Math.PI * strokeRadius; // ~314.16
  const strokeDashoffset = circumference - (circumference * savingsPct) / 100;

  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // Prefill demo credentials
  const launchDemo = (account) => {
    sessionStorage.setItem('prefilled_email', account.email);
    sessionStorage.setItem('prefilled_password', account.password);
    sessionStorage.setItem('prefilled_role', account.role);
    window.location.hash = '#login';
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 font-sans">
      {/* Dynamic Aurora Background Blobs */}
      <div className="absolute top-[-15%] left-[-25%] w-[70%] h-[70%] rounded-full bg-gradient-to-tr from-indigo-200/50 to-violet-300/40 blur-[130px] pointer-events-none animate-float-y" />
      <div className="absolute bottom-[-15%] right-[-25%] w-[75%] h-[75%] rounded-full bg-gradient-to-tr from-cyan-200/50 to-sky-300/40 blur-[140px] pointer-events-none animate-float-y-delayed" />

      {/* Glassmorphic Nav Header */}
      <header className="sticky top-0 z-50 px-6 py-4 backdrop-blur-md bg-white/60 border-b border-indigo-50/50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-200/50 hover:scale-105 transition-transform">
              <svg className="w-5.5 h-5.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <span className="font-display font-black text-2xl tracking-tight text-slate-800">
              Nexora
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-spring hover-spring">Features</a>
            <a href="#simulator" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-spring hover-spring">Simulator</a>
            <a href="#calculator" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-spring hover-spring">ROI Calculator</a>
            <a href="#demo" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-spring hover-spring">Quick Demo</a>
          </nav>

          <button
            onClick={() => window.location.hash = '#login'}
            className="btn-primary px-6 py-3 text-sm cursor-pointer hover:shadow-glow transition-spring"
          >
            Launch System <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 py-12 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 space-y-6 z-10 text-center lg:text-left fade-up-spring">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold tracking-wider font-mono shadow-sm">
            <Cpu className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '4s' }} /> AGENTIC LOGISTICS PLATFORM
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
              onClick={() => document.getElementById('demo-roles')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary py-3 px-6 cursor-pointer text-sm font-bold shadow-lg click-tactile"
            >
              Get Started
            </button>
            <button
              onClick={() => document.getElementById('simulator')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-ghost py-3 px-6 cursor-pointer text-sm font-bold border border-slate-200 shadow-sm click-tactile"
            >
              Watch Simulator
            </button>
          </div>
        </div>

        {/* 3D Volumetric City Hero Graphic */}
        <div
          ref={heroRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="lg:col-span-7 flex justify-center items-center h-[450px] sm:h-[520px] perspective-container cursor-grab active:cursor-grabbing z-10"
        >
          <div
            className="scene-3d w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] grid-3d-isometric relative bg-white/20 backdrop-blur-md rounded-[56px] border border-white/50 shadow-premium"
            style={{
              transform: `rotateX(${54.7 + mousePos.y * 25}deg) rotateZ(${-45 + mousePos.x * 25}deg) translateZ(0px)`,
            }}
          >
            {/* Grid Floor Mesh */}
            <div className="absolute inset-6 border border-dashed border-indigo-100/40 rounded-[44px] overflow-hidden flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full opacity-70" viewBox="0 0 100 100">
                <path d="M 0,20 L 100,20 M 0,40 L 100,40 M 0,60 L 100,60 M 0,80 L 100,80" stroke="#818cf8" strokeWidth="0.3" strokeDasharray="1 3" />
                <path d="M 20,0 L 20,100 M 40,0 L 40,100 M 60,0 L 60,100 M 80,0 L 80,100" stroke="#818cf8" strokeWidth="0.3" strokeDasharray="1 3" />
                
                {/* Simulated dynamic transit connection lines */}
                <path d="M 20,20 L 50,50 L 80,20" fill="none" stroke="url(#line-grad-1)" strokeWidth="1" />
                <path d="M 20,80 L 50,50 L 80,80" fill="none" stroke="url(#line-grad-2)" strokeWidth="1.5" className="animate-dash-route" />
                
                <defs>
                  <linearGradient id="line-grad-1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                  <linearGradient id="line-grad-2" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Volumetric 3D Isometric Buildings */}
              {/* Central HQ Terminal */}
              <VolumetricBuilding
                size={55} height={110} x={145} y={145}
                topColor="linear-gradient(135deg, #a5b4fc, #6366f1)"
                leftColor="#4f46e5" rightColor="#312e81"
                name="HQ"
              />

              {/* Cargo Terminal West */}
              <VolumetricBuilding
                size={40} height={60} x={40} y={180}
                topColor="linear-gradient(135deg, #a7f3d0, #10b981)"
                leftColor="#059669" rightColor="#064e3b"
                name="DEP-A"
              />

              {/* Communication Mast (Tall, thin) */}
              <VolumetricBuilding
                size={25} height={140} x={240} y={230}
                topColor="linear-gradient(135deg, #fde68a, #f59e0b)"
                leftColor="#d97706" rightColor="#78350f"
                name="TWR"
              />

              {/* Charging Dock Station East */}
              <VolumetricBuilding
                size={35} height={40} x={250} y={50}
                topColor="linear-gradient(135deg, #cffafe, #06b6d4)"
                leftColor="#0891b2" rightColor="#164e63"
                name="EV-1"
              />

              {/* 3D Floating Node Bubble 1 */}
              <div
                className="absolute px-2.5 py-1.5 bg-white/95 rounded-xl shadow-md border border-indigo-100/50 flex items-center gap-1.5 animate-float-y layer-3d-2 font-mono text-[8px] font-bold text-slate-800"
                style={{ left: '30px', top: '40px', transform: 'translateZ(60px)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>GPS ACTIVE</span>
              </div>

              {/* 3D Floating Node Bubble 2 */}
              <div
                className="absolute px-2.5 py-1.5 bg-white/95 rounded-xl shadow-md border border-cyan-100/50 flex items-center gap-1.5 animate-float-y-delayed layer-3d-3 font-mono text-[8px] font-bold text-slate-800"
                style={{ left: '160px', top: '270px', transform: 'translateZ(90px)' }}
              >
                <Truck className="h-2.5 w-2.5 text-indigo-500 animate-bounce" />
                <span>NEX-3401: ON ROUTE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Fleet Simulator Section */}
      <section id="simulator" className="max-w-7xl mx-auto px-6 py-16 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12 fade-up-spring">
          <h2 className="text-3xl font-display font-bold text-slate-900">
            Real-time <span className="gradient-text">Fleet Simulator</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Observe simulated logistics coordinates, telematics logs, battery charging status, and transit indicators dynamically.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Sim Logs (1 col) */}
          <div className="glass-premium rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-slate-900 text-base">Active Assets Status</h3>
              <button
                onClick={() => setSimActive(!simActive)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer border ${simActive ? 'bg-amber-50 text-amber-600 border-amber-200/50' : 'bg-emerald-50 text-emerald-600 border-emerald-200/50'}`}
              >
                {simActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div className="space-y-3">
              {simulatedTrucks.map((t) => (
                <div key={t.id} className="p-4 rounded-xl bg-white/70 border border-slate-100 shadow-sm space-y-2 glass-premium click-tactile">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${t.route === 'Top' ? 'bg-indigo-500' : t.route === 'Bottom' ? 'bg-cyan-500' : 'bg-slate-300'}`} />
                      <span className="text-sm font-bold text-slate-800">{t.name}</span>
                    </div>
                    <span className={`badge text-[9px] ${t.status === 'In Transit' ? 'badge-cyan animate-pulse' : 'badge-slate'}`}>
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

            {/* Sim Logs terminal */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Log Feed</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="p-3 bg-slate-900 rounded-xl font-mono text-[9px] text-emerald-400/90 space-y-1.5 min-h-[90px] shadow-inner">
                {logs.map((log, idx) => (
                  <div key={idx} className="truncate select-none">
                    <span className="text-slate-500">&gt;</span> {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Routing View (2 cols) */}
          <div className="glass-premium rounded-2xl p-6 lg:col-span-2 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-slate-900 text-base">Simulated Route Visualization</h3>
                <p className="text-xs text-slate-400">Interactive telemetry routing path simulation</p>
              </div>
              <div className="text-xs font-mono font-bold text-slate-600 bg-slate-100 rounded-lg px-2.5 py-1 flex items-center gap-1.5">
                <RefreshCw className={`h-3 w-3 ${simActive ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
                ACTIVE TRIPS: {simulatedTrucks.filter(t => t.status === 'In Transit').length}
              </div>
            </div>

            <div className="h-80 rounded-2xl bg-slate-50 relative border border-slate-100 overflow-hidden flex items-center justify-center">
              {/* Overlay simulation paths */}
              <svg className="w-full h-full absolute inset-0 opacity-80" viewBox="0 0 500 200">
                {/* Circular Radar Sweep */}
                <g className="radar-scanner text-indigo-500/10">
                  {/* Sweep ray */}
                  <line x1="100" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  {/* Light gradient segment */}
                  <path d="M100 100 L 100 0 A 100 100 0 0 1 170 30 Z" fill="currentColor" className="opacity-30" />
                  {/* Outer scan border */}
                  <circle cx="100" cy="100" r="100" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="opacity-40" />
                  <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" className="opacity-35" />
                  <circle cx="100" cy="100" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" className="opacity-20" />
                </g>

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
                <g className="cursor-pointer" onClick={() => setLogs((l) => ['[System] Hub Alpha scanned. Fleet capacity at 94%.', ...l.slice(0, 4)])}>
                  <circle cx="50" cy="100" r="8" fill="#6366f1" className="animate-ping" style={{ animationDuration: '4s' }} />
                  <circle cx="50" cy="100" r="5" fill="#6366f1" />
                  <circle cx="50" cy="100" r="3" fill="#ffffff" />
                  <text x="45" y="122" className="text-[9px] font-mono font-bold fill-slate-500">HUB-A</text>
                </g>

                <g className="cursor-pointer" onClick={() => setLogs((l) => ['[System] Hub Beta scanned. Inbound queue clear.', ...l.slice(0, 4)])}>
                  <circle cx="450" cy="100" r="8" fill="#8b5cf6" className="animate-ping" style={{ animationDuration: '5s' }} />
                  <circle cx="450" cy="100" r="5" fill="#8b5cf6" />
                  <circle cx="450" cy="100" r="3" fill="#ffffff" />
                  <text x="440" y="122" className="text-[9px] font-mono font-bold fill-slate-500">HUB-B</text>
                </g>

                {/* Simulating running trucks coordinates */}
                {simulatedTrucks[0].status === 'In Transit' && (
                  <g style={{ transform: `translate(${(simulatedTrucks[0].progress * 3.8) - 10}px, ${Math.sin((simulatedTrucks[0].progress / 100) * Math.PI) * -38}px)` }}>
                    <circle cx="50" cy="100" r="8" fill="#6366f1" className="opacity-35 animate-ping" />
                    <circle cx="50" cy="100" r="5.5" fill="#6366f1" className="stroke-white stroke-[1.5]" />
                  </g>
                )}
                {simulatedTrucks[2].status === 'In Transit' && (
                  <g style={{ transform: `translate(${(simulatedTrucks[2].progress * 3.8) - 10}px, ${Math.sin((simulatedTrucks[2].progress / 100) * Math.PI) * 38}px)` }}>
                    <circle cx="50" cy="100" r="8" fill="#06b6d4" className="opacity-35 animate-ping" />
                    <circle cx="50" cy="100" r="5.5" fill="#06b6d4" className="stroke-white stroke-[1.5]" />
                  </g>
                )}
              </svg>

              <div className="absolute bottom-4 left-4 bg-white/95 px-3 py-2 rounded-xl border border-slate-100 shadow-md text-[10px] font-mono text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span>Alpha Path (North Route)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  <span>Gamma Path (South Route)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet ROI Savings Calculator Section */}
      <section id="calculator" className="max-w-7xl mx-auto px-6 py-16 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12 fade-up-spring">
          <h2 className="text-3xl font-display font-bold text-slate-900">
            Interactive <span className="gradient-text">ROI Calculator</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Calculate your operating cost reduction, carbon savings, and asset utilization lift based on parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-6 p-8 rounded-3xl glass-premium shadow-premium">
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

          {/* Results Bento Grid (including the Gauge) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Massive Circular Gauge (spans 2 cols on wide, or full) */}
            <div className="glass-premium rounded-3xl p-6 sm:col-span-2 flex flex-col sm:flex-row items-center justify-around gap-6 card-tilt-premium">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* SVG Gauge */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r={strokeRadius} fill="none" stroke="#f1f5f9" strokeWidth="9" />
                  <circle
                    cx="60" cy="60" r={strokeRadius}
                    fill="none" stroke="url(#gauge-gradient)" strokeWidth="9"
                    strokeLinecap="round" strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                  />
                  <defs>
                    <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="60%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Value inside circle */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-display font-black text-slate-800">{savingsPct}%</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">EFFICIENCY</span>
                </div>
              </div>

              <div className="text-center sm:text-left space-y-1">
                <h4 className="font-display font-black text-slate-800 text-lg">Projected Savings Impact</h4>
                <p className="text-slate-500 text-xs leading-relaxed max-w-[200px]">
                  Adjust sliders to observe the efficiency metrics scale dynamically.
                </p>
                <div className="text-sm font-bold text-indigo-600 font-mono pt-1.5">
                  MONTHLY CAPEX RETENTION
                </div>
              </div>
            </div>

            {/* Operating Savings */}
            {/* Operating Savings */}
            <div className="glass-premium rounded-3xl p-6 card-tilt-premium text-center flex flex-col justify-center">
              <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-xl mx-auto mb-3">💰</div>
              <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">OPERATING SAVINGS</div>
              <div className="text-xl font-display font-extrabold text-slate-900">{formatCurrency(calculatedSavings)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Estimated / month</div>
            </div>

            {/* CO2 Reduction */}
            <div className="glass-premium rounded-3xl p-6 card-tilt-premium text-center flex flex-col justify-center">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-xl mx-auto mb-3">🌿</div>
              <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">CO2 REDUCTION</div>
              <div className="text-xl font-display font-extrabold text-slate-900">{(co2Reduction / 1000).toFixed(1)} tons</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Emissions reduced</div>
            </div>

            {/* Utilization Lift */}
            <div className="glass-premium rounded-3xl p-6 card-tilt-premium text-center flex flex-col justify-center">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-xl mx-auto mb-3">⚡</div>
              <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">UTILIZATION LIFT</div>
              <div className="text-xl font-display font-extrabold text-slate-900">+{utilizationLift}%</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Availability yield</div>
            </div>
          </div>
        </div>
      </section>

      {/* Onboarding Quick Demo Portal */}
      <section id="demo" className="max-w-7xl mx-auto px-6 py-16 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12 fade-up-spring">
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
              className="glass-premium rounded-3xl p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 relative overflow-hidden group click-tactile"
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
