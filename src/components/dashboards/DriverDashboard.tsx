import React, { useState } from 'react';
import { useTracking } from '../../context/TrackingContext';
import { useAppAuth } from '../../context/AuthContext';
import { useAppAudio } from '../../context/AudioContext';
import {
  Play,
  Square,
  Navigation,
  MapPin,
  Clock,
  Gauge,
  Users,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const DriverDashboard: React.FC<{ onOpenMap: () => void }> = ({ onOpenMap }) => {
  const {
    activeBus,
    route,
    driverTripActive,
    startDriverTrip,
    endDriverTrip,
    driverAdvanceStop,
    driverReportDelay,
    triggerEmergencySos
  } = useTracking();
  const { currentUser } = useAppAuth();
  const { playUiClick } = useAppAudio();

  const [delayModalOpen, setDelayModalOpen] = useState<boolean>(false);
  const [delayReason, setDelayReason] = useState<string>('Heavy traffic congestion on highway junction');
  const [delayMinutes, setDelayMinutes] = useState<number>(10);
  const [headcount, setHeadcount] = useState<number>(activeBus.passengersOnBoard);

  const handleStartTrip = () => {
    playUiClick();
    startDriverTrip();
  };

  const handleEndTrip = () => {
    playUiClick();
    endDriverTrip();
  };

  const handleAdvance = () => {
    playUiClick();
    driverAdvanceStop();
  };

  const handleSendDelay = (e: React.FormEvent) => {
    e.preventDefault();
    playUiClick();
    driverReportDelay(delayMinutes, delayReason);
    setDelayModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-5 p-3 lg:p-6 max-w-7xl mx-auto w-full text-white">
      {/* Driver Header & GPS Broadcast Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel p-4 lg:p-5 rounded-2xl border border-t18-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-t18-blue/20 text-t18-cyan border border-t18-cyan/40 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5" /> DRIVER CONSOLE & TELEMETRY UPLINK
            </span>
            <span className="text-xs text-white/40 font-mono">VEHICLE: {activeBus.regNumber}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black font-gaming tracking-wide uppercase mt-1">
            Driver: {currentUser?.fullName || activeBus.driverName}
          </h1>
          <p className="text-xs text-white/60 font-mono">
            Assigned Route: <span className="text-t18-cyan font-bold">{route.name} ({route.code})</span>
          </p>
        </div>

        {/* Live Trip Controller */}
        <div className="flex items-center gap-3">
          {driverTripActive ? (
            <button
              onClick={handleEndTrip}
              className="py-3 px-5 rounded-xl font-gaming font-black uppercase text-xs tracking-wider bg-red-600 hover:bg-red-500 text-white shadow-glow-red flex items-center gap-2 active:scale-95 transition-all"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>END TRIP & STOP GPS</span>
            </button>
          ) : (
            <button
              onClick={handleStartTrip}
              className="py-3 px-6 rounded-xl font-gaming font-black uppercase text-xs tracking-wider bg-gradient-to-r from-emerald-500 to-t18-cyan text-black shadow-glow-cyan flex items-center gap-2 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>START TRIP & BROADCAST GPS</span>
            </button>
          )}
        </div>
      </div>

      {/* Driver Active Trip HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass-panel-glow p-5 rounded-2xl border border-t18-cyan/40 flex flex-col justify-between">
          <div>
            {/* GPS Broadcast Status Indicator */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${driverTripActive ? 'bg-emerald-400 animate-ping' : 'bg-red-400'}`} />
                <span className={`text-xs font-bold uppercase tracking-wider font-mono ${
                  driverTripActive ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {driverTripActive ? 'GPS BROADCAST ACTIVE (SECURE LOCK)' : 'TRIP STOPPED (GPS INACTIVE)'}
                </span>
              </div>
              <span className="text-xs font-mono text-white/50">Speed Limit: 60 km/h</span>
            </div>

            {/* Current Speedometer & Target Stop */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                <span className="text-[10px] text-white/50 uppercase font-mono block">CURRENT SPEED</span>
                <span className="text-4xl font-black font-gaming text-t18-cyan">{activeBus.speedKmh}</span>
                <span className="text-xs font-mono text-white/40 block">KM/H</span>
              </div>

              <div className="sm:col-span-2 p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-white/50 uppercase font-mono block">UPCOMING STOP</span>
                <h3 className="text-xl font-black font-gaming uppercase text-white truncate mt-0.5">
                  #{activeBus.currentStopIndex + 1} {activeBus.nextStop}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-xs font-mono text-white/70">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-t18-cyan" /> {activeBus.nextStopDistanceKm} km
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" /> ETA: {activeBus.nextStopEtaMinutes} mins
                  </span>
                </div>
              </div>
            </div>

            {/* Stops Checklist */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs font-mono text-white/60 mb-1">
                <span>STOPS CHECKLIST</span>
                <span>Tap "Arrived At Next Stop" when reached</span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {route.stops.map((stop, idx) => {
                  const isCurrent = idx === activeBus.currentStopIndex;
                  const isPassed = idx < activeBus.currentStopIndex;

                  return (
                    <div
                      key={stop.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                        isCurrent
                          ? 'bg-t18-blue/20 border-t18-cyan text-white shadow-glow-cyan'
                          : isPassed
                          ? 'bg-white/5 border-emerald-500/30 text-white/50'
                          : 'bg-white/5 border-white/5 text-white/70'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isPassed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                            isCurrent ? 'border-t18-cyan text-t18-cyan' : 'border-white/30 text-white/40'
                          }`}>
                            {idx + 1}
                          </div>
                        )}
                        <span className={isCurrent ? 'font-bold text-white' : ''}>{stop.name}</span>
                      </div>
                      <span className="text-[11px] text-white/40">{stop.scheduledTime}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Advance Stop & Delay Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
            <button
              onClick={handleAdvance}
              disabled={!driverTripActive}
              className="flex-1 py-3 px-4 rounded-xl font-gaming font-bold uppercase text-xs tracking-wider bg-t18-cyan text-black shadow-glow-cyan flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Arrived At Stop (Advance)</span>
            </button>

            <button
              onClick={() => setDelayModalOpen(true)}
              className="py-3 px-4 rounded-xl font-gaming font-bold uppercase text-xs tracking-wider bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Broadcast Delay</span>
            </button>

            <button
              onClick={onOpenMap}
              className="py-3 px-4 rounded-xl font-gaming font-bold uppercase text-xs tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center gap-2"
            >
              <Navigation className="w-4 h-4 text-t18-cyan" />
              <span>Route Map</span>
            </button>
          </div>
        </div>

        {/* Right Column: Passenger Headcount & Emergency Alert */}
        <div className="flex flex-col gap-4">
          {/* Passenger Capacity Counter */}
          <div className="glass-panel p-5 rounded-2xl border border-t18-border/60">
            <span className="text-[10px] font-mono uppercase tracking-wider text-t18-cyan font-bold block mb-2">
              PASSENGER HEADCOUNT ON BOARD
            </span>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-4xl font-black font-gaming text-white">{headcount}</span>
                <span className="text-xs font-mono text-white/50"> / {activeBus.maxCapacity} Seats</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHeadcount(prev => Math.max(0, prev - 1))}
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg flex items-center justify-center"
                >
                  -
                </button>
                <button
                  onClick={() => setHeadcount(prev => Math.min(activeBus.maxCapacity, prev + 1))}
                  className="w-10 h-10 rounded-xl bg-t18-cyan text-black font-bold text-lg flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-t18-cyan h-full rounded-full transition-all"
                style={{ width: `${(headcount / activeBus.maxCapacity) * 100}%` }}
              />
            </div>
          </div>

          {/* Emergency SOS Dispatch */}
          <div className="glass-panel p-5 rounded-2xl border border-red-500/30 flex flex-col justify-between flex-1">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold block mb-1">
                DRIVER PANIC / BREAKDOWN SOS
              </span>
              <p className="text-xs font-mono text-white/70 mb-4 leading-relaxed">
                Immediately flags bus KA-01-EQ-1818 as emergency on Central Admin console and alerts nearby fleet backups.
              </p>
            </div>

            <button
              onClick={() => triggerEmergencySos('Driver breakdown signal reported at live coordinates.')}
              className="w-full py-3.5 rounded-xl font-gaming font-black uppercase text-xs tracking-wider bg-red-600 hover:bg-red-500 text-white shadow-glow-red flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <AlertTriangle className="w-4 h-4 fill-white" />
              <span>DISPATCH EMERGENCY ALERT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delay Broadcast Modal */}
      {delayModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-amber-500/40 text-white">
            <h3 className="text-xl font-bold font-gaming uppercase tracking-wide mb-1 flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" /> Broadcast Route Delay
            </h3>
            <p className="text-xs text-white/60 font-mono mb-4">
              Notifies all registered students and parents on Route {route.code} about the estimated delay.
            </p>

            <form onSubmit={handleSendDelay} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-white/70 block mb-1">Estimated Delay (Minutes)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 20].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDelayMinutes(m)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold border ${
                        delayMinutes === m
                          ? 'bg-amber-500 text-black border-amber-500'
                          : 'bg-white/5 border-white/10 text-white/70'
                      }`}
                    >
                      +{m} Mins
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-white/70 block mb-1">Reason for Delay</label>
                <input
                  type="text"
                  value={delayReason}
                  onChange={e => setDelayReason(e.target.value)}
                  className="w-full bg-t18-surface border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDelayModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/20 bg-white/5 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-gaming font-bold text-xs uppercase tracking-wider"
                >
                  Broadcast Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
