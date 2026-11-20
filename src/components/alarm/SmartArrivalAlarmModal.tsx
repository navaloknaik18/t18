import React, { useState } from 'react';
import { useTracking } from '../../context/TrackingContext';
import { useAppAudio } from '../../context/AudioContext';
import {
  Bell,
  Clock,
  Volume2,
  Smartphone,
  PhoneCall,
  Repeat,
  CheckCircle2,
  X,
  AlertTriangle,
  Info
} from 'lucide-react';

export const SmartArrivalAlarmModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose
}) => {
  const { alarmConfig, updateAlarmConfig, triggerManualAlarm, route } = useTracking();
  const { playUiClick } = useAppAudio();

  const [leadMinutes, setLeadMinutes] = useState<number>(alarmConfig.leadMinutes);
  const [soundAlert, setSoundAlert] = useState<boolean>(alarmConfig.soundAlert);
  const [vibrationAlert, setVibrationAlert] = useState<boolean>(alarmConfig.vibrationAlert);
  const [phoneCallAlert, setPhoneCallAlert] = useState<boolean>(alarmConfig.phoneCallAlert);
  const [repeatedAlerts, setRepeatedAlerts] = useState<boolean>(alarmConfig.repeatedAlerts);
  const [selectedStopId, setSelectedStopId] = useState<string>(alarmConfig.stopId);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    playUiClick();
    const chosenStop = route.stops.find(s => s.id === selectedStopId);
    updateAlarmConfig({
      enabled: true,
      stopId: selectedStopId,
      stopName: chosenStop?.name || 'Oakridge Green Boulevard',
      leadMinutes,
      soundAlert,
      vibrationAlert,
      phoneCallAlert,
      repeatedAlerts,
      triggered: false
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleTestNow = () => {
    playUiClick();
    triggerManualAlarm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-t18-cyan/40 shadow-glow-cyan text-white relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-xl bg-t18-blue/20 border border-t18-cyan/50 text-t18-cyan shadow-glow-cyan">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-gaming uppercase tracking-wide">
              Smart Bus Arrival Alarm
            </h3>
            <span className="text-[11px] text-white/50 font-mono">
              PRECISION GEOFENCE PROXIMITY DISPATCH
            </span>
          </div>
        </div>

        <p className="text-xs text-white/70 font-mono mt-2 mb-4 leading-relaxed">
          Keep your phone in your pocket. T18 will automatically wake your device and alert you when your college bus enters the arrival threshold.
        </p>

        {/* Stop Selector */}
        <div className="space-y-1.5 mb-4">
          <label className="text-xs font-bold font-gaming uppercase tracking-wider text-t18-cyan">
            Select Your Bus Stop
          </label>
          <select
            value={selectedStopId}
            onChange={e => setSelectedStopId(e.target.value)}
            className="w-full bg-t18-surface border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-t18-cyan focus:outline-none"
          >
            {route.stops.map(stop => (
              <option key={stop.id} value={stop.id} className="bg-t18-bg text-white">
                #{stop.sequence} {stop.name} (Sched: {stop.scheduledTime})
              </option>
            ))}
          </select>
        </div>

        {/* Lead Time Selection */}
        <div className="space-y-1.5 mb-5">
          <label className="text-xs font-bold font-gaming uppercase tracking-wider text-t18-cyan flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> How Early To Alert You?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[5, 10, 15].map(min => (
              <button
                key={min}
                onClick={() => setLeadMinutes(min)}
                className={`py-2 px-3 rounded-xl border font-mono text-xs font-bold transition-all ${
                  leadMinutes === min
                    ? 'bg-t18-cyan text-black border-t18-cyan shadow-glow-cyan'
                    : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'
                }`}
              >
                {min} Mins Before
              </button>
            ))}
          </div>
        </div>

        {/* Alert Channels & Modalities */}
        <div className="space-y-2.5 mb-5 border-t border-white/10 pt-4">
          <div className="text-xs font-bold font-gaming uppercase tracking-wider text-white/80 mb-1">
            Alarm Modalities
          </div>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10">
            <div className="flex items-center gap-2 text-xs font-mono">
              <Volume2 className="w-4 h-4 text-t18-cyan" />
              <span>Audible Alarm Siren</span>
            </div>
            <input
              type="checkbox"
              checked={soundAlert}
              onChange={e => setSoundAlert(e.target.checked)}
              className="accent-t18-cyan w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10">
            <div className="flex items-center gap-2 text-xs font-mono">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Haptic Vibration Burst</span>
            </div>
            <input
              type="checkbox"
              checked={vibrationAlert}
              onChange={e => setVibrationAlert(e.target.checked)}
              className="accent-t18-cyan w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10">
            <div className="flex items-center gap-2 text-xs font-mono">
              <PhoneCall className="w-4 h-4 text-amber-400" />
              <div>
                <span>Automated Phone Call Alert</span>
                <span className="block text-[10px] text-white/40">Interactive dispatch ring</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={phoneCallAlert}
              onChange={e => setPhoneCallAlert(e.target.checked)}
              className="accent-t18-cyan w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10">
            <div className="flex items-center gap-2 text-xs font-mono">
              <Repeat className="w-4 h-4 text-fuchsia-400" />
              <span>Repeated Alerts Every 90s</span>
            </div>
            <input
              type="checkbox"
              checked={repeatedAlerts}
              onChange={e => setRepeatedAlerts(e.target.checked)}
              className="accent-t18-cyan w-4 h-4"
            />
          </label>
        </div>

        {/* Operating System Permissions Notice */}
        <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-[11px] font-mono text-blue-200/80 mb-5 flex items-start gap-2">
          <Info className="w-4 h-4 text-t18-cyan flex-shrink-0 mt-0.5" />
          <span>
            <strong>OS Transparency:</strong> Background automated phone calls and alarms require explicit user authorization. Battery optimization exemption is recommended so alerts break through Do Not Disturb. T18 never initiates secretive calls.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleTestNow}
            className="flex-1 py-3 px-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 font-gaming font-bold text-xs uppercase tracking-wider text-white"
          >
            Test Fire Alarm Now
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 px-3 rounded-xl bg-gradient-to-r from-t18-blue to-t18-cyan text-black font-gaming font-black text-xs uppercase tracking-wider shadow-glow-cyan flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-black" />
            <span>{savedSuccess ? 'Saved!' : 'Arm Smart Alarm'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
