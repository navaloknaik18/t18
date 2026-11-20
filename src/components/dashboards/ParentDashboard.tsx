import React, { useState } from 'react';
import { useTracking } from '../../context/TrackingContext';
import { useAppAuth } from '../../context/AuthContext';
import { useAppAudio } from '../../context/AudioContext';
import {
  ShieldCheck,
  UserCheck,
  Bus,
  Clock,
  MapPin,
  Phone,
  Bell,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon
} from 'lucide-react';

export const ParentDashboard: React.FC<{
  onOpenMap: () => void;
  onOpenAlarm: () => void;
}> = ({ onOpenMap, onOpenAlarm }) => {
  const { activeBus, route, boardingRecords, alarmConfig } = useTracking();
  const { currentUser, linkChildAccount } = useAppAuth();
  const { playUiClick } = useAppAudio();

  const [studentIdInput, setStudentIdInput] = useState<string>('T18-2024-CS089');
  const [otpInput, setOtpInput] = useState<string>('448102');
  const [linkModalOpen, setLinkModalOpen] = useState<boolean>(false);
  const [linkSuccess, setLinkSuccess] = useState<boolean>(false);

  const isLinked = Boolean(currentUser?.linkedChildStudentId);

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playUiClick();
    const res = await linkChildAccount(studentIdInput, otpInput);
    if (res.success) {
      setLinkSuccess(true);
      setTimeout(() => {
        setLinkSuccess(false);
        setLinkModalOpen(false);
      }, 1200);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-3 lg:p-6 max-w-7xl mx-auto w-full text-white">
      {/* Parent Header & Child Verification Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel p-4 lg:p-5 rounded-2xl border border-t18-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> PARENT GUARDIAN CONSOLE
            </span>
            <span className="text-xs text-white/40 font-mono">ENCRYPTED TELEMETRY STREAM</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black font-gaming tracking-wide uppercase mt-1">
            Safety Dashboard for {currentUser?.fullName || 'Meera Sharma'}
          </h1>
          <p className="text-xs text-white/60 font-mono">
            Monitored Ward: <span className="text-t18-cyan font-bold">{currentUser?.linkedChildName || 'Aarav Sharma'}</span> ({currentUser?.linkedChildStudentId || 'T18-2024-CS089'})
          </p>
        </div>

        <button
          onClick={() => {
            playUiClick();
            setLinkModalOpen(true);
          }}
          className="py-2.5 px-4 rounded-xl font-gaming font-bold uppercase text-xs tracking-wider bg-white/5 hover:bg-white/10 border border-white/20 text-white flex items-center gap-2"
        >
          <LinkIcon className="w-4 h-4 text-t18-cyan" />
          <span>{isLinked ? 'Verify / Relink Child' : 'Link Child Account'}</span>
        </button>
      </div>

      {/* Main Bus Live Tracking Card for Parent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass-panel-glow p-5 rounded-2xl border border-t18-border/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  CHILD ASSIGNED BUS LIVE LOCATION
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
                    <Clock className="w-3.5 h-3.5 text-emerald-400" /> Approaching in {activeBus.nextStopEtaMinutes} mins
                  </span>
                </div>
              </div>

              {/* Big ETA */}
              <div className="p-4 rounded-xl bg-t18-blue/20 border border-t18-cyan/50 shadow-glow-cyan text-right flex-shrink-0">
                <span className="text-[10px] text-t18-cyan font-mono uppercase block">ETA TO CAMPUS</span>
                <div className="text-3xl font-black font-gaming text-white tracking-tight">
                  08:20 AM
                  <span className="text-xs font-mono text-emerald-400 block mt-0.5 font-bold">ON TIME</span>
                </div>
              </div>
            </div>

            {/* Live Boarding & Attendance Timeline */}
            <div className="space-y-3 mb-6">
              <span className="text-xs font-mono uppercase tracking-wider text-t18-cyan font-bold block">
                VERIFIED BOARDING & TRANSIT TIMELINE
              </span>

              <div className="space-y-2">
                {boardingRecords.map(record => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <div>
                        <span className="text-white font-bold">{record.stopName}</span>
                        <span className="text-white/40 block text-[10px]">{record.studentName} ({record.studentId})</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400">
                        {record.status.toUpperCase()}
                      </span>
                      <span className="text-white/40 block text-[10px] mt-0.5">{record.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10">
            <button
              onClick={onOpenMap}
              className="flex-1 py-3 px-4 rounded-xl font-gaming font-bold uppercase text-xs tracking-wider bg-gradient-to-r from-t18-blue to-t18-cyan text-black shadow-glow-cyan flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4 text-black" />
              <span>Watch Live Bus Movement</span>
            </button>

            <button
              onClick={onOpenAlarm}
              className="py-3 px-4 rounded-xl font-gaming font-bold uppercase text-xs tracking-wider border border-white/20 bg-white/5 hover:bg-white/10 flex items-center gap-2"
            >
              <Bell className="w-4 h-4 text-t18-cyan" />
              <span>Parent Proximity Alert</span>
            </button>
          </div>
        </div>

        {/* Right Column: Driver & College Security Emergency Contacts */}
        <div className="flex flex-col gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-t18-border/60">
            <span className="text-[10px] font-mono uppercase tracking-wider text-t18-cyan block mb-2 font-bold">
              BUS DRIVER DETAILS
            </span>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-t18-blue to-t18-cyan flex items-center justify-center font-bold text-black text-lg">
                VR
              </div>
              <div className="flex-1">
                <h4 className="font-gaming font-bold text-base uppercase text-white">{activeBus.driverName}</h4>
                <div className="text-xs font-mono text-white/50">{activeBus.driverPhone}</div>
              </div>
              <a
                href={`tel:${activeBus.driverPhone}`}
                className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-t18-border/60 flex flex-col justify-between flex-1">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold block mb-2">
                24/7 CAMPUS TRANSPORT HELPLINE
              </span>
              <p className="text-xs font-mono text-white/70 mb-4 leading-relaxed">
                Direct hotline to College Safety Control Room and Central Fleet Dispatchers.
              </p>

              <div className="space-y-2">
                <a
                  href="tel:+918045671800"
                  className="w-full py-2.5 px-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-400 text-xs font-mono flex items-center justify-between"
                >
                  <span>Central Security Desk</span>
                  <span className="font-bold">+91 80 4567 1800</span>
                </a>
                <a
                  href="tel:+918045671801"
                  className="w-full py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs font-mono flex items-center justify-between"
                >
                  <span>Fleet Operations Manager</span>
                  <span className="font-bold">+91 80 4567 1801</span>
                </a>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono text-white/50">
              Only authorized parents can access student GPS data under Section 10 privacy policies.
            </div>
          </div>
        </div>
      </div>

      {/* Link Child Verification Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-t18-cyan/40 shadow-glow-cyan text-white">
            <h3 className="text-xl font-bold font-gaming uppercase tracking-wide mb-1">
              Link Student Account
            </h3>
            <p className="text-xs text-white/60 font-mono mb-4">
              Enter student college registration ID and the one-time verification passcode sent to the registered student email.
            </p>

            <form onSubmit={handleLinkSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-mono text-white/70 block mb-1">Student Registration ID</label>
                <input
                  type="text"
                  value={studentIdInput}
                  onChange={e => setStudentIdInput(e.target.value)}
                  className="w-full bg-t18-surface border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-t18-cyan focus:outline-none"
                  placeholder="e.g. T18-2024-CS089"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-mono text-white/70 block mb-1">Authorization OTP Code</label>
                <input
                  type="text"
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value)}
                  className="w-full bg-t18-surface border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-t18-cyan focus:outline-none"
                  placeholder="6-digit code"
                  required
                />
              </div>

              {linkSuccess && (
                <div className="text-center text-xs text-emerald-400 font-mono py-1">
                  ✓ Student Account Verified & Linked Successfully!
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/20 bg-white/5 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-t18-blue to-t18-cyan text-black font-gaming font-bold text-xs uppercase tracking-wider shadow-glow-cyan"
                >
                  Verify & Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
