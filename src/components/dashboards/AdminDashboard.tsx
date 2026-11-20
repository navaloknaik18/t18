import React, { useState } from 'react';
import { useTracking } from '../../context/TrackingContext';
import { useAppAuth } from '../../context/AuthContext';
import { useAppAudio } from '../../context/AudioContext';
import { MOCK_AUDIT_LOGS } from '../../data/mockData';
import { AuditLogItem } from '../../types';
import {
  Bus,
  Users,
  Route as RouteIcon,
  ShieldCheck,
  FileSpreadsheet,
  Plus,
  Radio,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Download,
  Filter
} from 'lucide-react';

export const AdminDashboard: React.FC<{ onOpenMap: () => void }> = ({ onOpenMap }) => {
  const { buses, route } = useTracking();
  const { currentUser } = useAppAuth();
  const { playUiClick } = useAppAudio();

  const [activeTab, setActiveTab] = useState<'fleet' | 'routes' | 'drivers' | 'audit' | 'reports'>('fleet');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [auditLogs] = useState<AuditLogItem[]>(MOCK_AUDIT_LOGS);

  // New Bus Registration State
  const [newBusModalOpen, setNewBusModalOpen] = useState<boolean>(false);
  const [newRegNumber, setNewRegNumber] = useState<string>('KA-01-EQ-5544');
  const [newModel, setNewModel] = useState<string>('T18 Volt-Runner EV 2026');
  const [newDriverName, setNewDriverName] = useState<string>('Ramesh Gowda');
  const [registeredSuccess, setRegisteredSuccess] = useState<boolean>(false);

  // Total Fleet Stats
  const totalBuses = buses.length;
  const activeInTransit = buses.filter(b => b.status === 'in_transit').length;
  const totalPassengers = buses.reduce((acc, b) => acc + b.passengersOnBoard, 0);

  const handleExportReport = () => {
    playUiClick();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(buses, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `t18_transit_report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRegisterBusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playUiClick();
    setRegisteredSuccess(true);
    setTimeout(() => {
      setRegisteredSuccess(false);
      setNewBusModalOpen(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-5 p-3 lg:p-6 max-w-7xl mx-auto w-full text-white">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel p-4 lg:p-5 rounded-2xl border border-t18-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-t18-blue/20 text-t18-cyan border border-t18-cyan/40">
              COLLEGE TRANSPORTATION MANAGEMENT
            </span>
            <span className="text-xs text-white/40 font-mono">CAMPUS FLEET OPS</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black font-gaming tracking-wide uppercase mt-1">
            Director: {currentUser?.fullName || 'Prof. K. Sundaram'}
          </h1>
          <p className="text-xs text-white/60 font-mono">
            {currentUser?.collegeName} · Fleet Operations Central Server
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playUiClick();
              setNewBusModalOpen(true);
            }}
            className="py-2.5 px-4 rounded-xl font-gaming font-bold uppercase text-xs tracking-wider bg-gradient-to-r from-t18-blue to-t18-cyan text-black shadow-glow-cyan flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Register New Bus</span>
          </button>

          <button
            onClick={handleExportReport}
            className="py-2.5 px-4 rounded-xl font-gaming font-bold uppercase text-xs tracking-wider bg-white/5 hover:bg-white/10 border border-white/20 text-white flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-t18-cyan" />
            <span className="hidden sm:inline">Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
        <div className="glass-panel p-4 rounded-xl border border-t18-border/60">
          <span className="text-[10px] font-mono text-white/50 uppercase block">ACTIVE FLEET</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl lg:text-3xl font-black font-gaming text-t18-cyan">{activeInTransit}</span>
            <span className="text-xs font-mono text-white/40">/ {totalBuses} Buses</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-t18-border/60">
          <span className="text-[10px] font-mono text-white/50 uppercase block">ON-TIME ADHERENCE</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl lg:text-3xl font-black font-gaming text-emerald-400">99.2%</span>
            <span className="text-xs font-mono text-white/40">High</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-t18-border/60">
          <span className="text-[10px] font-mono text-white/50 uppercase block">PASSENGERS TRANSITING</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl lg:text-3xl font-black font-gaming text-white">{totalPassengers}</span>
            <span className="text-xs font-mono text-white/40">Students</span>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-t18-border/60">
          <span className="text-[10px] font-mono text-white/50 uppercase block">SAFETY AUDIT SCORE</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl lg:text-3xl font-black font-gaming text-emerald-400">100 / 100</span>
            <span className="text-xs font-mono text-white/40">Optimal</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/10 text-xs font-gaming font-bold uppercase tracking-wider">
        {(['fleet', 'routes', 'drivers', 'audit', 'reports'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => {
              playUiClick();
              setActiveTab(tab);
            }}
            className={`py-2 px-4 rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-t18-cyan text-black font-black shadow-glow-cyan'
                : 'text-white/60 hover:text-white bg-white/5'
            }`}
          >
            {tab === 'fleet' && 'Fleet Overview & Telemetry'}
            {tab === 'routes' && 'Route & Stop Management'}
            {tab === 'drivers' && 'Driver Allocations'}
            {tab === 'audit' && 'Security Audit Logs'}
            {tab === 'reports' && 'Transportation Intelligence'}
          </button>
        ))}
      </div>

      {/* Tab 1: Fleet Overview & Table */}
      {activeTab === 'fleet' && (
        <div className="glass-panel p-5 rounded-2xl border border-t18-border/60 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-white/40" />
              <input
                type="text"
                placeholder="Search bus registration or driver..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-t18-surface border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white focus:border-t18-cyan focus:outline-none"
              />
            </div>

            <button
              onClick={onOpenMap}
              className="py-2 px-4 rounded-xl text-xs font-gaming font-bold uppercase tracking-wider bg-t18-blue/30 border border-t18-cyan text-t18-cyan shadow-glow-cyan flex items-center gap-1.5"
            >
              <span>View All on Multi-Bus Map</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Bus Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/5 text-white/50 uppercase border-b border-white/10">
                <tr>
                  <th className="p-3">Bus Registration</th>
                  <th className="p-3">Model</th>
                  <th className="p-3">Assigned Driver</th>
                  <th className="p-3">Route</th>
                  <th className="p-3">Speed</th>
                  <th className="p-3">Next Stop (ETA)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {buses
                  .filter(b => b.regNumber.toLowerCase().includes(searchTerm.toLowerCase()) || b.driverName.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(bus => (
                    <tr key={bus.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: bus.avatarColor }}
                        />
                        <span>{bus.regNumber}</span>
                      </td>
                      <td className="p-3 text-white/70">{bus.model}</td>
                      <td className="p-3 text-white/80">{bus.driverName}</td>
                      <td className="p-3 text-t18-cyan">{bus.routeName}</td>
                      <td className="p-3">{bus.speedKmh} km/h</td>
                      <td className="p-3 text-emerald-400">
                        {bus.nextStop} ({bus.nextStopEtaMinutes}m)
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400">
                          {bus.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={onOpenMap}
                          className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] uppercase font-bold"
                        >
                          Locate
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Route & Stop Management */}
      {activeTab === 'routes' && (
        <div className="glass-panel p-5 rounded-2xl border border-t18-border/60 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold font-gaming uppercase tracking-wide">
                Route: {route.name} ({route.code})
              </h3>
              <p className="text-xs text-white/60 font-mono">
                Total Distance: {route.totalDistanceKm} km · Scheduled Transit: {route.estimatedMinutes} mins
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {route.stops.map((stop, i) => (
              <div
                key={stop.id}
                className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-t18-blue/30 border border-t18-cyan text-t18-cyan flex items-center justify-center font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <span className="text-white font-bold text-sm">{stop.name}</span>
                    <span className="text-white/40 block text-[11px]">
                      GPS: {stop.coordinates.lat.toFixed(4)}, {stop.coordinates.lng.toFixed(4)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-emerald-400 font-bold block">{stop.scheduledTime}</span>
                  <span className="text-white/50 text-[11px]">{stop.studentsCount} Students Registered</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Driver Allocations */}
      {activeTab === 'drivers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {buses.map(bus => (
            <div key={bus.id} className="glass-panel p-5 rounded-2xl border border-t18-border/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-t18-cyan font-bold">
                  ASSIGNED DRIVER
                </span>
                <span className="text-amber-400 text-xs font-mono font-bold">★ {bus.driverRating}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-t18-blue to-t18-cyan flex items-center justify-center font-bold text-black text-lg">
                  {bus.driverName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-gaming font-bold text-base uppercase text-white">{bus.driverName}</h4>
                  <div className="text-xs font-mono text-white/50">{bus.driverPhone}</div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-white/50">Assigned Bus:</span>
                  <span className="text-white font-bold">{bus.regNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Shift Route:</span>
                  <span className="text-t18-cyan truncate max-w-[140px]">{bus.routeName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Security Audit Logs */}
      {activeTab === 'audit' && (
        <div className="glass-panel p-5 rounded-2xl border border-t18-border/60 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-gaming uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> IMMUTABLE AUDIT TRAIL (SECTION 10 SECURITY)
            </span>
            <span className="text-xs font-mono text-white/40">3 RECENT EVENTS</span>
          </div>

          <div className="space-y-2">
            {auditLogs.map(log => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-t18-blue/30 text-t18-cyan">
                      {log.action}
                    </span>
                    <span className="text-white/50">{log.timestamp}</span>
                  </div>
                  <div className="text-white mt-1">{log.target}</div>
                  <div className="text-white/40 text-[10px]">Actor: {log.actor} ({log.role}) · IP: {log.ip}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 self-start sm:self-center">
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Transportation Intelligence Report */}
      {activeTab === 'reports' && (
        <div className="glass-panel p-6 rounded-2xl border border-t18-border/60 space-y-4 text-center">
          <FileSpreadsheet className="w-12 h-12 text-t18-cyan mx-auto" />
          <h3 className="text-2xl font-black font-gaming uppercase tracking-wide">
            Automated Transportation Intelligence
          </h3>
          <p className="text-xs font-mono text-white/60 max-w-md mx-auto">
            Comprehensive audit reports covering fuel efficiency, driver punctuality ratings, student boarding verification logs, and GPS geofence alerts.
          </p>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={handleExportReport}
              className="py-3 px-6 rounded-xl font-gaming font-bold uppercase text-xs tracking-wider bg-t18-cyan text-black shadow-glow-cyan flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download Complete JSON / CSV Dataset
            </button>
          </div>
        </div>
      )}

      {/* New Bus Registration Modal */}
      {newBusModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-t18-cyan/40 shadow-glow-cyan text-white">
            <h3 className="text-xl font-bold font-gaming uppercase tracking-wide mb-1">
              Register New College Bus
            </h3>
            <p className="text-xs text-white/60 font-mono mb-4">
              Add new vehicle to central GPS telemetry matrix and provision driver account.
            </p>

            <form onSubmit={handleRegisterBusSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-mono text-white/70 block mb-1">Registration Plate</label>
                <input
                  type="text"
                  value={newRegNumber}
                  onChange={e => setNewRegNumber(e.target.value)}
                  className="w-full bg-t18-surface border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-t18-cyan focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-mono text-white/70 block mb-1">Bus Model & Specs</label>
                <input
                  type="text"
                  value={newModel}
                  onChange={e => setNewModel(e.target.value)}
                  className="w-full bg-t18-surface border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-t18-cyan focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-mono text-white/70 block mb-1">Assigned Driver Full Name</label>
                <input
                  type="text"
                  value={newDriverName}
                  onChange={e => setNewDriverName(e.target.value)}
                  className="w-full bg-t18-surface border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-t18-cyan focus:outline-none"
                  required
                />
              </div>

              {registeredSuccess && (
                <div className="text-center text-xs text-emerald-400 font-mono py-1">
                  ✓ Vehicle Registered & Assigned Successfully!
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewBusModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/20 bg-white/5 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-t18-blue to-t18-cyan text-black font-gaming font-bold text-xs uppercase tracking-wider shadow-glow-cyan"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
