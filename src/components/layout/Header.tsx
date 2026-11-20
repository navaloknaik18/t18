import React, { useState } from 'react';
import { useAppAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { useAppAudio } from '../../context/AudioContext';
import { useTracking } from '../../context/TrackingContext';
import { UserRole } from '../../types';
import {
  Bus,
  Bell,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  User,
  Shield,
  Layers,
  ChevronDown,
  Sparkles,
  Zap
} from 'lucide-react';

export const Header: React.FC<{
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenLogin: () => void;
}> = ({ onOpenNotifications, onOpenProfile, onOpenLogin }) => {
  const { currentUser, isAuthenticated, activeRole, switchRole } = useAppAuth();
  const { theme, toggleTheme } = useAppTheme();
  const { muted, toggleMute, playUiClick } = useAppAudio();
  const { notifications } = useTracking();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleRoleSelect = (role: UserRole) => {
    playUiClick();
    switchRole(role);
    setRoleMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-[500] w-full bg-[#090a0f]/80 backdrop-blur-xl border-b border-white/10 px-3 lg:px-6 py-2.5 flex items-center justify-between select-none">
      {/* T18 Brand Logo & Tagline */}
      <div className="flex items-center gap-3">
        <div className="relative group cursor-pointer flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-t18-blue via-t18-cyan to-white p-0.5 shadow-glow-cyan">
            <div className="w-full h-full bg-[#090a0f] rounded-[10px] flex items-center justify-center">
              <Bus className="w-5 h-5 text-t18-cyan animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black font-gaming tracking-wider uppercase bg-gradient-to-r from-white via-t18-cyan to-white bg-clip-text text-transparent">
                T18
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono tracking-widest bg-t18-cyan text-black">
                PRO
              </span>
            </div>
            <span className="hidden sm:block text-[10px] text-white/50 font-mono tracking-tight -mt-0.5">
              Your College Bus. Your Journey. Your World.
            </span>
          </div>
        </div>
      </div>

      {/* Role Switcher Pill & Control Toolbar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              playUiClick();
              setRoleMenuOpen(!roleMenuOpen);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-gaming font-bold uppercase tracking-wider text-white transition-all shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-t18-cyan animate-ping" />
            <span>Role: {activeRole}</span>
            <ChevronDown className="w-3.5 h-3.5 text-white/60" />
          </button>

          {roleMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 glass-panel p-1.5 rounded-2xl border border-t18-cyan/40 shadow-glow-cyan z-50 text-xs font-gaming font-bold uppercase animate-in fade-in">
              <div className="px-3 py-1.5 text-[10px] text-white/40 font-mono border-b border-white/10 mb-1">
                SWITCH DASHBOARD ROLE
              </div>
              {(['student', 'parent', 'driver', 'admin'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => handleRoleSelect(r)}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors ${
                    activeRole === r
                      ? 'bg-t18-cyan text-black font-black'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{r} Console</span>
                  {activeRole === r && <Zap className="w-3.5 h-3.5 fill-black" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Audio Mute/Unmute */}
        <button
          onClick={() => {
            playUiClick();
            toggleMute();
          }}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
          title={muted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {muted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-t18-cyan" />}
        </button>

        {/* Theme Switcher */}
        <button
          onClick={() => {
            playUiClick();
            toggleTheme();
          }}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
          title={`Theme: ${theme}`}
        >
          {theme === 'light' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-t18-cyan" />
          )}
        </button>

        {/* Notifications Icon with Badge */}
        <button
          onClick={() => {
            playUiClick();
            onOpenNotifications();
          }}
          className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all"
          title="Notifications"
        >
          <Bell className="w-4 h-4 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-t18-cyan text-black text-[9px] font-black font-mono flex items-center justify-center animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Avatar / Sign In */}
        {isAuthenticated && currentUser ? (
          <button
            onClick={() => {
              playUiClick();
              onOpenProfile();
            }}
            className="flex items-center gap-2 p-1 pl-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-left transition-all"
          >
            <div className="hidden md:block text-right">
              <div className="text-xs font-bold font-gaming uppercase tracking-wide text-white truncate max-w-[100px]">
                {currentUser.fullName}
              </div>
              <div className="text-[9px] text-t18-cyan font-mono -mt-0.5">{currentUser.role}</div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-t18-blue to-t18-cyan flex items-center justify-center text-black font-black text-xs font-gaming">
              {currentUser.fullName.charAt(0)}
            </div>
          </button>
        ) : (
          <button
            onClick={() => {
              playUiClick();
              onOpenLogin();
            }}
            className="py-1.5 px-3 rounded-xl bg-t18-cyan text-black font-gaming font-black text-xs uppercase tracking-wider"
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};
