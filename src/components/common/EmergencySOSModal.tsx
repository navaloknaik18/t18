import React, { useState } from 'react';
import { useTracking } from '../../context/TrackingContext';
import { useAppAudio } from '../../context/AudioContext';
import { ShieldAlert, AlertTriangle, Phone, X, CheckCircle2 } from 'lucide-react';

export const EmergencySOSModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const { triggerEmergencySos, activeBus } = useTracking();
  const { playUiClick } = useAppAudio();

  const [selectedReason, setSelectedReason] = useState<string>('Immediate Personal Safety Emergency');
  const [sosDispatched, setSosDispatched] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDispatch = () => {
    playUiClick();
    triggerEmergencySos(selectedReason);
    setSosDispatched(true);
    setTimeout(() => {
      setSosDispatched(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-red-500/60 shadow-glow-red text-white text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-full bg-red-600/30 border-2 border-red-500 mx-auto flex items-center justify-center mb-3 animate-pulse">
          <ShieldAlert className="w-9 h-9 text-red-400" />
        </div>

        <h3 className="text-2xl font-black font-gaming uppercase tracking-wider text-red-400 mb-1">
          EMERGENCY SOS DISPATCH
        </h3>
        <p className="text-xs text-white/70 font-mono mb-4">
          Transmits high-priority distress signal, live GPS lock, and alerts Campus Police, College Transport Dispatch, and emergency contacts.
        </p>

        {/* Reason Selector */}
        <div className="space-y-2 mb-5 text-left">
          <label className="text-xs font-bold font-gaming uppercase tracking-wider text-red-400">
            Emergency Category
          </label>
          {[
            'Immediate Personal Safety Emergency',
            'Medical Distress / First Aid Required',
            'Bus Collision / Road Breakdown',
            'Route Deviation / Suspicious Incident'
          ].map(reason => (
            <button
              key={reason}
              onClick={() => setSelectedReason(reason)}
              className={`w-full p-2.5 rounded-xl border text-left text-xs font-mono transition-all ${
                selectedReason === reason
                  ? 'bg-red-600/30 border-red-500 text-white font-bold'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
              }`}
            >
              {reason}
            </button>
          ))}
        </div>

        {/* Live GPS Pinpoint Info */}
        <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-[11px] font-mono text-white/60 text-left mb-5">
          <div>BUS GPS: {activeBus.coordinates.lat.toFixed(4)}, {activeBus.coordinates.lng.toFixed(4)}</div>
          <div>TIMESTAMP: {new Date().toLocaleTimeString()}</div>
        </div>

        {sosDispatched ? (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/60 text-emerald-400 font-mono text-xs flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>DISTRESS SIGNAL BROADCASTED TO DISPATCH!</span>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/20 bg-white/5 font-gaming font-bold text-xs uppercase"
            >
              Cancel
            </button>
            <button
              onClick={handleDispatch}
              className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-gaming font-black text-xs uppercase tracking-wider shadow-glow-red flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4 fill-white" />
              <span>CONFIRM SOS</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
