import React from 'react';
import { useAppAudio } from '../../context/AudioContext';
import { useTracking } from '../../context/TrackingContext';
import {
  LayoutDashboard,
  MapPin,
  Bus,
  Gamepad2,
  Bell,
  User
} from 'lucide-react';

export type NavTab = 'dashboard' | 'map' | 'garage' | 'racing' | 'notifications' | 'profile';

export const BottomNav: React.FC<{
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}> = ({ activeTab, onTabChange }) => {
  const { playUiClick } = useAppAudio();
  const { notifications } = useTracking();

  const unreadCount = notifications.filter(n => !n.read).length;

  const tabs: Array<{ id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Console', icon: LayoutDashboard },
    { id: 'map', label: 'Live Map', icon: MapPin },
    { id: 'garage', label: '3D Garage', icon: Bus },
    { id: 'racing', label: 'Racing', icon: Gamepad2 },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[500] bg-[#090a0f]/90 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 select-none max-w-2xl mx-auto md:rounded-t-3xl shadow-2xl">
      <div className="flex items-center justify-around">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                playUiClick();
                onTabChange(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
                isActive
                  ? 'text-t18-cyan font-black scale-105'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {isActive && (
                <div className="absolute -top-1.5 w-6 h-1 rounded-full bg-t18-cyan shadow-glow-cyan" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-glow' : ''}`} />
                {tab.id === 'notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-mono font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>

              <span className={`text-[10px] font-gaming uppercase tracking-wider mt-0.5 ${
                isActive ? 'text-t18-cyan font-black' : 'font-semibold'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
