import React from 'react';
import { useTracking } from '../../context/TrackingContext';
import { useAppAuth } from '../../context/AuthContext';
import {
  Bus,
  MapPin,
  Clock,
  Gauge,
  Phone,
  QrCode,
  ShieldAlert,
  Bell,
  Star,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export const StudentDashboard: React.FC<{
  onOpenMap: () => void;
  onOpenGarage: () => void;
  onOpenAlarm: () => void;
  onOpenSos: () => void;
}> = ({ onOpenMap, onOpenGarage, onOpenAlarm, onOpenSos }) => {
  const { activeBus, route, alarmConfig, alarmTriggered } = useTracking();
  const { currentUser } = useAppAuth();

  const studentStop = route.stops.find(s => s.id === (currentUser?.registeredStopId || 'stop-3')) || route.stops[2];

  return (
    <div className="flex flex-col gap-5 p-3 lg:p-6 max-w-7xl mx-auto w-full text-white">
      {/* Top Welcome & Active Avatar Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel p-4 lg:p-5 rounded-2xl border border-t18-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-t18-blue/20 text-t18-cyan border border-t18-cyan/40">
              STUDENT TELEMETRY HUB
            </span>
            <span className="text-xs text-white/40 font-mono">ID: {currentUser?.studentId || 'T18-2024-CS089'}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black font-gaming tracking-wide uppercase mt-1">
            Welcome back, {currentUser?.fullName || 'Aarav Sharma'}
          </h1>
          <p className="text-xs text-white/60 font-mono">
            College: {currentUser?.collegeName} · Registered Stop: <span className="text-t18-cyan font-bold">{studentStop.name}</span>
          </p>
        </div>

        {/* 3D Bus Avatar Mini Showcase */}
        <button
          onClick={onOpenGarage}
          className="flex items-center gap-3 p-2.5 rounded-xl bg-t18-surface/80 hover:bg-t18-surface border border-t18-cyan/30 hover:border-t18-cyan transition-all group text-left"
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/20 shadow-glow-cyan"
            style={{ backgroundColor: activeBus.avatarColor || '#00f3ff' }}
          >
            <Bus className="w-6 h-6 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-1 text-[10px] text-t18-cyan font-mono uppercase font-bold">
              <Sparkles className="w-3 h-3" /> Active 3D Avatar
            </div>
            <div className="text-xs font-bold font-gaming uppercase tracking-wide group-hover:text-t18-cyan">
              {activeBus.avatarType.toUpperCase()} CLASS
            </div>
            <div className="text-[10px] text-white/40 font-mono">Customize in 3D Garage →</div>
          </div>
        </button>
      </div>

      {/* Main Bus Live Telemetry Card (Rapido style) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Real-time Transit Status */}
        <div className="lg:col-span-2 glass-panel-glow p-5 rounded-2xl border border-t18-cyan/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  LIVE IN TRANSIT · ROUTE 18 EXPRESS
                </span>
              </div>
              <span className="text-xs font-mono text-white/50">{activeBus.regNumber}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-mono text-white/60 uppercase block">Next Stop On Route</span>
                <h2 className="text-2xl lg:text-3xl font-black font-gaming text-white uppercase mt-0.5">
                  {activeBus.nextStop}
                </h2>
                <div className="flex items-center gap-3 mt-2 text-xs font-mono text-white/70">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-t18-cyan" /> {activeBus.nextStopDistanceKm} km away
                  </span>
                  <span className="flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-emerald-400" /> {activeBus.speedKmh} km/h
                  </span>
                </div>
              </div>

              {/* Big ETA Countdown */}
              <div className="p-4 rounded-xl bg-t18-blue/20 border border-t18-cyan/50 shadow-glow-cyan text-right flex-shrink-0">
                <span className="text-[10px] text-t18-cyan font-mono uppercase block">ESTIMATED ARRIVAL</span>
                <div className="text-4xl font-black font-gaming text-white tracking-tight">
                  {activeBus.nextStopEtaMinutes}
                  <span className="text-sm font-mono text-t18-cyan ml-1">MINS</span>
                </div>
              </div>
            </div>

            {/* Route Stop Progression Line */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-[11px] font-mono text-white/50">
                <span>Route Progression</span>
                <span>Stop 3 of 5</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5 items-center">
                {route.stops.map((stop, i) => {
                  const isCurrent = i === activeBus.currentStopIndex;
                  const isPassed = i < activeBus.currentStopIndex;
                  const isStudentStop = stop.id === studentStop.id;

                  return (
                    <div key={stop.id} className="flex flex-col gap-1 items-center text-center">
                      <div
                        className={`w-full h-2 rounded-full transition-all ${
                          isPassed
                            ? 'bg-emerald-500'
                            : isCurrent
                            ? 'bg-t18-cyan shadow-glow-cyan'
                            : isStudentStop
                            ? 'bg-red-500/80'
                            : 'bg-white/10'
                        }`}
                      />
                      <span className={`text-[10px] font-mono truncate max-w-full ${
                        isStudentStop ? 'text-red-400 font-bold' : 'text-white/40'
                      }`}>
                        {isStudentStop ? 'YOUR STOP' : `Stop ${i + 1}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
            <button
              onClick={onOpenMap}
              className="flex-1 py-3 px-4 rounded-xl font-gaming font-bold uppercase text-xs tracking-wider bg-gradient-to-r from-t18-blue to-t18-cyan text-black shadow-glow-cyan flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4 text-black" />
              <span>Open Live Rapido Map</span>
            </button>

            <button
              onClick={onOpenAlarm}
              className={`py-3 px-4 rounded-xl font-gaming font-bold uppercase text-xs tracking-wider border flex items-center justify-center gap-2 ${
                alarmConfig.enabled
                  ? 'bg-t18-cyan/20 border-t18-cyan text-t18-cyan shadow-glow-cyan'
                  : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Smart Alarm {alarmConfig.enabled ? `(${alarmConfig.leadMinutes}m)` : 'Off'}</span>
            </button>

            <button
              onClick={onOpenSos}
              className="py-3 px-4 rounded-xl font-gaming font-bold uppercase text-xs tracking-wider bg-red-600/20 hover:bg-red-600/30 border border-red-500/60 text-red-400 flex items-center justify-center gap-2 shadow-glow-red"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Emergency SOS</span>
            </button>
          </div>
        </div>

        {/* Right Column: Driver Telemetry & Digital RFID Pass */}
        <div className="flex flex-col gap-4">
          {/* Driver Card */}
          <div className="glass-panel p-4 rounded-2xl border border-t18-border/60">
            <span className="text-[10px] font-mono uppercase tracking-wider text-t18-cyan block mb-2 font-bold">
              VERIFIED COLLEGE DRIVER
            </span>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-t18-blue to-t18-cyan flex items-center justify-center font-bold text-black text-lg">
                VR
              </div>
              <div className="flex-1">
                <h4 className="font-gaming font-bold text-base uppercase text-white">{activeBus.driverName}</h4>
                <div className="flex items-center gap-2 text-xs font-mono text-white/60">
                  <span className="flex items-center text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-current" /> {activeBus.driverRating}
                  </span>
                  <span>· 8 Yrs Service</span>
                </div>
              </div>
              <a
                href={`tel:${activeBus.driverPhone}`}
                className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center"
                title="Call Driver"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Student RFID Boarding Pass */}
          <div className="glass-panel p-5 rounded-2xl border border-t18-border/60 flex flex-col justify-between flex-1">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-t18-cyan font-bold">
                  SECURE DIGITAL BOARDING PASS
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> ACTIVE
                </span>
              </div>

              <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/10 mb-3">
                <div className="p-2 rounded-lg bg-black/50 border border-white/20">
                  <QrCode className="w-12 h-12 text-t18-cyan" />
                </div>
                <div className="text-xs font-mono">
                  <div className="text-white font-bold">{currentUser?.fullName}</div>
                  <div className="text-white/50">{currentUser?.studentId}</div>
                  <div className="text-t18-cyan mt-1">Bus: KA-01-EQ-1818</div>
                </div>
              </div>

              <div className="text-[11px] font-mono text-white/60 leading-tight">
                Scan when boarding and exiting. Automatic push confirmation sent to parent profile.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
