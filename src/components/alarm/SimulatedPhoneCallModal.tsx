import React, { useState, useEffect } from 'react';
import { useTracking } from '../../context/TrackingContext';
import { useAppAudio } from '../../context/AudioContext';
import { Phone, PhoneOff, Volume2, ShieldCheck, Bus } from 'lucide-react';

export const SimulatedPhoneCallModal: React.FC = () => {
  const { incomingCallActive, answerSimulatedCall, declineSimulatedCall, activeBus, alarmConfig } = useTracking();
  const { stopAlarmSound } = useAppAudio();

  const [callAnswered, setCallAnswered] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);

  useEffect(() => {
    let timer: number;
    if (callAnswered) {
      timer = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callAnswered]);

  useEffect(() => {
    if (!incomingCallActive) {
      setCallAnswered(false);
      setCallDuration(0);
    }
  }, [incomingCallActive]);

  if (!incomingCallActive) return null;

  const handleAnswer = () => {
    setCallAnswered(true);
    stopAlarmSound();

    // Browser Speech Synthesis for realistic automated voice dispatch
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const message = `Hello student. This is the T18 Automated College Transit Dispatch. Bus ${activeBus.regNumber} is arriving at ${alarmConfig.stopName} in ${activeBus.nextStopEtaMinutes} minutes. Please be ready at your bus stop.`;
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleEndCall = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (callAnswered) {
      answerSimulatedCall();
    } else {
      declineSimulatedCall();
    }
  };

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-300 select-none">
      <div className="max-w-sm w-full glass-panel p-8 rounded-3xl border border-t18-cyan/50 shadow-glow-cyan text-white text-center flex flex-col items-center">
        {/* College Caller ID Banner */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold mb-6">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>VERIFIED COLLEGE CARRIER</span>
        </div>

        {/* Pulsing Avatar icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-t18-cyan/30 animate-ping" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-t18-blue to-t18-cyan border-2 border-white flex items-center justify-center shadow-glow-cyan">
            <Bus className="w-12 h-12 text-black" />
          </div>
        </div>

        {/* Caller Title */}
        <h2 className="text-2xl font-black font-gaming tracking-wide uppercase text-white mb-1">
          T18 BUS ARRIVAL DISPATCH
        </h2>
        <span className="text-xs text-white/50 font-mono tracking-wider mb-2">
          +91 80 4567 1818 (Automated IVR)
        </span>

        {callAnswered ? (
          <div className="my-4 w-full">
            <div className="text-xs font-mono text-emerald-400 mb-2">
              CALL IN PROGRESS · {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
            </div>

            {/* Simulated Audio Waveform */}
            <div className="flex items-center justify-center gap-1 my-4 h-8">
              {[40, 70, 100, 60, 90, 45, 80, 100, 50, 75].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-t18-cyan rounded-full animate-pulse"
                  style={{ height: `${h}%`, animationDuration: `${0.4 + (i % 4) * 0.2}s` }}
                />
              ))}
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white/80 text-left leading-relaxed">
              <strong className="text-t18-cyan block mb-1">VOICE READOUT:</strong>
              "Bus {activeBus.regNumber} is {activeBus.nextStopDistanceKm} km from {alarmConfig.stopName}. ETA is {activeBus.nextStopEtaMinutes} minutes. Please proceed to the boarding zone."
            </div>
          </div>
        ) : (
          <div className="my-6">
            <span className="text-xs font-mono text-t18-cyan animate-pulse block mb-1">
              INCOMING SMART BUS CALL...
            </span>
            <span className="text-[11px] text-white/40 font-mono">
              Proximity Alert: {alarmConfig.stopName}
            </span>
          </div>
        )}

        {/* Call Action Controls */}
        <div className="flex items-center justify-center gap-10 mt-4 w-full">
          {!callAnswered ? (
            <>
              {/* Decline Button */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={handleEndCall}
                  className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>
                <span className="text-[10px] font-mono text-white/60">DECLINE</span>
              </div>

              {/* Answer Button */}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  onClick={handleAnswer}
                  className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-lg active:scale-95 transition-all animate-bounce"
                >
                  <Phone className="w-7 h-7" />
                </button>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">ACCEPT</span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={handleEndCall}
                className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
              <span className="text-[10px] font-mono text-white/60">DISCONNECT</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
