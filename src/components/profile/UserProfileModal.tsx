import React, { useState } from 'react';
import { useAppAuth } from '../../context/AuthContext';
import { useAppAudio } from '../../context/AudioContext';
import {
  User,
  Shield,
  Laptop,
  Smartphone,
  LogOut,
  X,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  GraduationCap
} from 'lucide-react';

export const UserProfileModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const { currentUser, sessions, revokeAllOtherSessions, logout } = useAppAuth();
  const { playUiClick } = useAppAudio();

  const [revokedNotice, setRevokedNotice] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleRevokeAll = () => {
    playUiClick();
    revokeAllOtherSessions();
    setRevokedNotice(true);
    setTimeout(() => setRevokedNotice(false), 2500);
  };

  const handleLogout = () => {
    playUiClick();
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[650] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-t18-border/60 shadow-glow-cyan text-white relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Card Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-t18-blue to-t18-cyan flex items-center justify-center text-black font-black text-xl font-gaming border border-white/20 shadow-glow-cyan">
            {currentUser.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xl font-black font-gaming uppercase tracking-wide">
                {currentUser.fullName}
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-t18-blue/30 text-t18-cyan border border-t18-cyan/40">
                {currentUser.role}
              </span>
            </div>
            <span className="text-xs text-white/50 font-mono">
              ID: {currentUser.studentId || 'N/A'} · {currentUser.collegeName}
            </span>
          </div>
        </div>

        {/* User Details Grid */}
        <div className="space-y-2 p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono mb-5">
          <div className="flex items-center justify-between">
            <span className="text-white/50 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-t18-cyan" /> Gmail:
            </span>
            <span className="text-white">{currentUser.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/50 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" /> Phone:
            </span>
            <span className="text-white">{currentUser.phone}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/50 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" /> 2FA Status:
            </span>
            <span className="text-emerald-400 font-bold">Enabled (Hardware Verified)</span>
          </div>
        </div>

        {/* Multi-Device Session Management */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center justify-between text-xs font-gaming font-bold uppercase tracking-wider text-t18-cyan">
            <span>Active Login Sessions</span>
            <span className="font-mono text-[10px] text-white/40">{sessions.length} DEVICES</span>
          </div>

          <div className="space-y-1.5">
            {sessions.map(s => (
              <div
                key={s.id}
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2.5">
                  {s.device.includes('Android') || s.device.includes('iPhone') ? (
                    <Smartphone className="w-4 h-4 text-t18-cyan" />
                  ) : (
                    <Laptop className="w-4 h-4 text-t18-cyan" />
                  )}
                  <div>
                    <div className="text-white font-bold text-[11px] flex items-center gap-1">
                      {s.device}
                      {s.current && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-400">
                          THIS DEVICE
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-white/40">{s.location} · {s.lastActive}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleRevokeAll}
            className="w-full mt-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-xs font-mono text-white/80 hover:text-white transition-all text-center"
          >
            Logout From All Other Devices
          </button>

          {revokedNotice && (
            <div className="text-center text-xs text-emerald-400 font-mono animate-in fade-in">
              ✓ All other remote sessions have been securely revoked!
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-400 font-gaming font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out Of Terminal</span>
        </button>
      </div>
    </div>
  );
};
