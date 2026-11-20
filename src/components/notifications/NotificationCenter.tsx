import React, { useState } from 'react';
import { useTracking } from '../../context/TrackingContext';
import { useAppAudio } from '../../context/AudioContext';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Radio,
  Filter,
  CheckCheck
} from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const { notifications, markNotificationsAsRead } = useTracking();
  const { playUiClick } = useAppAudio();

  const [filter, setFilter] = useState<'all' | 'arrival' | 'boarding' | 'sos'>('all');

  const filtered = notifications.filter(n => {
    if (filter === 'arrival') return n.type === 'approaching' || n.type === 'arriving' || n.type === 'reached';
    if (filter === 'boarding') return n.type === 'boarding';
    if (filter === 'sos') return n.type === 'sos' || n.type === 'security';
    return true;
  });

  return (
    <div className="flex flex-col gap-4 p-3 lg:p-6 max-w-4xl mx-auto w-full text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-panel p-4 rounded-2xl border border-t18-border/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-t18-blue/20 text-t18-cyan border border-t18-cyan/40 flex items-center gap-1">
              <Bell className="w-3.5 h-3.5" /> SECURE DISPATCH FEED
            </span>
            <span className="text-xs text-white/40 font-mono">
              {notifications.filter(n => !n.read).length} UNREAD
            </span>
          </div>
          <h2 className="text-2xl font-black font-gaming uppercase tracking-wide mt-1">
            Notifications & Alerts
          </h2>
        </div>

        <button
          onClick={() => {
            playUiClick();
            markNotificationsAsRead();
          }}
          className="py-2 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-xs font-gaming font-bold uppercase tracking-wider text-white flex items-center gap-1.5 self-start sm:self-center"
        >
          <CheckCheck className="w-4 h-4 text-t18-cyan" />
          <span>Mark All As Read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs font-gaming font-bold uppercase overflow-x-auto pb-1">
        {(['all', 'arrival', 'boarding', 'sos'] as const).map(f => (
          <button
            key={f}
            onClick={() => {
              playUiClick();
              setFilter(f);
            }}
            className={`py-2 px-4 rounded-xl transition-all whitespace-nowrap ${
              filter === f
                ? 'bg-t18-cyan text-black font-black shadow-glow-cyan'
                : 'text-white/60 hover:text-white bg-white/5'
            }`}
          >
            {f === 'all' && 'All Alerts'}
            {f === 'arrival' && 'Bus Proximity & ETA'}
            {f === 'boarding' && 'Boarding Records'}
            {f === 'sos' && 'Safety & Emergency'}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl border border-white/10 text-center font-mono text-xs text-white/50">
            No notifications in this category.
          </div>
        ) : (
          filtered.map(notif => {
            const isSos = notif.type === 'sos';
            const isArrival = notif.type === 'approaching' || notif.type === 'arriving';
            const isBoarding = notif.type === 'boarding';

            return (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isSos
                    ? 'bg-red-950/30 border-red-500/60 shadow-glow-red'
                    : isArrival
                    ? 'bg-t18-blue/20 border-t18-cyan/40 shadow-glow-cyan'
                    : isBoarding
                    ? 'glass-panel border-emerald-500/40'
                    : 'glass-panel border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl border flex items-center justify-center ${
                        isSos
                          ? 'bg-red-600/30 border-red-500 text-red-400'
                          : isArrival
                          ? 'bg-t18-cyan/20 border-t18-cyan text-t18-cyan'
                          : 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      }`}
                    >
                      {isSos ? (
                        <ShieldAlert className="w-5 h-5" />
                      ) : isArrival ? (
                        <Radio className="w-5 h-5" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <h4 className="font-gaming font-bold text-base uppercase text-white">
                        {notif.title}
                      </h4>
                      <p className="text-xs text-white/70 font-mono mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-white/40 whitespace-nowrap">
                    {notif.time}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
