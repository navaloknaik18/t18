import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  BusTelemetry,
  BusRoute,
  SmartAlarmConfig,
  NotificationItem,
  BoardingRecord,
  BusAvatarType
} from '../types';
import {
  MOCK_BUSES,
  MOCK_ROUTE,
  INITIAL_NOTIFICATIONS,
  MOCK_BOARDING_RECORDS
} from '../data/mockData';
import { useAppAudio } from './AudioContext';

interface TrackingContextType {
  buses: BusTelemetry[];
  activeBus: BusTelemetry;
  route: BusRoute;
  alarmConfig: SmartAlarmConfig;
  alarmTriggered: boolean;
  incomingCallActive: boolean;
  driverTripActive: boolean;
  notifications: NotificationItem[];
  boardingRecords: BoardingRecord[];
  selectedAvatarType: BusAvatarType;
  selectedAvatarColor: string;
  updateAlarmConfig: (config: Partial<SmartAlarmConfig>) => void;
  dismissAlarm: () => void;
  answerSimulatedCall: () => void;
  declineSimulatedCall: () => void;
  triggerManualAlarm: () => void;
  startDriverTrip: () => void;
  endDriverTrip: () => void;
  driverAdvanceStop: () => void;
  driverReportDelay: (minutes: number, reason: string) => void;
  triggerEmergencySos: (details?: string) => void;
  updateAvatar: (type: BusAvatarType, color: string) => void;
  recordStudentBoarding: (studentId: string, status: 'boarded' | 'exited') => void;
  markNotificationsAsRead: () => void;
  setBusPositionManual: (lat: number, lng: number) => void;
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

export const TrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { playAlarmSiren, playPhoneRing, stopAlarmSound } = useAppAudio();

  const [buses, setBuses] = useState<BusTelemetry[]>(MOCK_BUSES);
  const [activeBusId, setActiveBusId] = useState<string>('bus-t18-01');
  const [route] = useState<BusRoute>(MOCK_ROUTE);

  const [selectedAvatarType, setSelectedAvatarType] = useState<BusAvatarType>('futuristic');
  const [selectedAvatarColor, setSelectedAvatarColor] = useState<string>('#00f3ff');

  const [driverTripActive, setDriverTripActive] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [boardingRecords, setBoardingRecords] = useState<BoardingRecord[]>(MOCK_BOARDING_RECORDS);

  // Smart Bus Arrival Alarm Configuration
  const [alarmConfig, setAlarmConfig] = useState<SmartAlarmConfig>({
    enabled: true,
    stopId: 'stop-3',
    stopName: 'Oakridge Green Boulevard',
    leadMinutes: 5,
    pushNotification: true,
    soundAlert: true,
    vibrationAlert: true,
    phoneCallAlert: true,
    repeatedAlerts: false,
    triggered: false
  });

  const [alarmTriggered, setAlarmTriggered] = useState<boolean>(false);
  const [incomingCallActive, setIncomingCallActive] = useState<boolean>(false);

  const activeBus = buses.find(b => b.id === activeBusId) || buses[0];
  const stepRef = useRef<number>(0);

  // Simulated live GPS telemetry tick
  useEffect(() => {
    if (!driverTripActive) return;

    const interval = setInterval(() => {
      setBuses(prevBuses => {
        return prevBuses.map((bus, idx) => {
          if (idx !== 0) return bus; // Move primary bus along waypoints

          stepRef.current += 0.05;
          const waypoints = route.waypoints;
          const totalPoints = waypoints.length;
          const currentIdx = Math.floor(stepRef.current) % (totalPoints - 1);
          const nextIdx = (currentIdx + 1) % totalPoints;

          const p1 = waypoints[currentIdx];
          const p2 = waypoints[nextIdx];
          const frac = stepRef.current - Math.floor(stepRef.current);

          const newLat = p1[0] + (p2[0] - p1[0]) * frac;
          const newLng = p1[1] + (p2[1] - p1[1]) * frac;

          // Calculate distance to Oakridge Green Boulevard (stop-3)
          const targetStop = route.stops[2]; // stop-3
          const latDiff = targetStop.coordinates.lat - newLat;
          const lngDiff = targetStop.coordinates.lng - newLng;
          const distKm = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111;
          const etaMin = Math.max(1, Math.round(distKm / 0.4));

          // Check if alarm conditions are met
          if (alarmConfig.enabled && !alarmConfig.triggered && etaMin <= alarmConfig.leadMinutes) {
            triggerAlarmFlow(etaMin, distKm);
          }

          return {
            ...bus,
            coordinates: { lat: newLat, lng: newLng },
            nextStopDistanceKm: parseFloat(distKm.toFixed(1)),
            nextStopEtaMinutes: etaMin,
            speedKmh: 42 + Math.floor(Math.sin(stepRef.current * 2) * 8),
            avatarType: selectedAvatarType,
            avatarColor: selectedAvatarColor,
            lastUpdated: 'Just now'
          };
        });
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [driverTripActive, alarmConfig, route, selectedAvatarType, selectedAvatarColor]);

  const triggerAlarmFlow = (etaMin: number, distKm: number) => {
    setAlarmConfig(prev => ({ ...prev, triggered: true }));
    setAlarmTriggered(true);

    if (alarmConfig.soundAlert) {
      playAlarmSiren();
    }

    if (alarmConfig.phoneCallAlert) {
      setIncomingCallActive(true);
      playPhoneRing();
    }

    const newNotif: NotificationItem = {
      id: `alarm-${Date.now()}`,
      type: 'approaching',
      title: '🚨 SMART ARRIVAL ALARM TRIGGERED',
      message: `Your college bus is ${distKm.toFixed(1)} km (${etaMin} mins) away from ${alarmConfig.stopName}. Head to the stop now!`,
      time: 'Just now',
      read: false,
      urgent: true
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Vibration API if supported on device
    if (alarmConfig.vibrationAlert && navigator.vibrate) {
      navigator.vibrate([400, 200, 400, 200, 800]);
    }
  };

  const triggerManualAlarm = () => {
    triggerAlarmFlow(4, 1.4);
  };

  const dismissAlarm = () => {
    setAlarmTriggered(false);
    stopAlarmSound();
  };

  const answerSimulatedCall = () => {
    setIncomingCallActive(false);
    stopAlarmSound();
  };

  const declineSimulatedCall = () => {
    setIncomingCallActive(false);
    stopAlarmSound();
  };

  const updateAlarmConfig = (config: Partial<SmartAlarmConfig>) => {
    setAlarmConfig(prev => ({ ...prev, ...config }));
  };

  const startDriverTrip = () => {
    setDriverTripActive(true);
    setBuses(prev => prev.map(b => b.id === activeBusId ? { ...b, status: 'in_transit' } : b));
    const notif: NotificationItem = {
      id: `trip-start-${Date.now()}`,
      type: 'approaching',
      title: 'Trip Started - Live GPS Active',
      message: `Driver Vikramaditya Rao initiated authorized GPS broadcast for route ${route.code}.`,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const endDriverTrip = () => {
    setDriverTripActive(false);
    setBuses(prev => prev.map(b => b.id === activeBusId ? { ...b, status: 'stopped_at_stop', speedKmh: 0 } : b));
    const notif: NotificationItem = {
      id: `trip-end-${Date.now()}`,
      type: 'reached',
      title: 'Trip Completed',
      message: `Bus ${activeBus.regNumber} completed its route. GPS tracking suspended.`,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const driverAdvanceStop = () => {
    setBuses(prev => prev.map(b => {
      if (b.id !== activeBusId) return b;
      const nextIdx = (b.currentStopIndex + 1) % route.stops.length;
      const nextStopObj = route.stops[nextIdx];
      return {
        ...b,
        currentStopIndex: nextIdx,
        nextStop: nextStopObj.name,
        nextStopDistanceKm: 2.1,
        nextStopEtaMinutes: 5
      };
    }));
  };

  const driverReportDelay = (minutes: number, reason: string) => {
    const notif: NotificationItem = {
      id: `delay-${Date.now()}`,
      type: 'delayed',
      title: `Bus Delayed by ~${minutes} Mins`,
      message: `Driver report: ${reason}. Updated arrival time dispatched to registered passengers & parents.`,
      time: 'Just now',
      read: false,
      urgent: true
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const triggerEmergencySos = (details = 'Immediate safety dispatch initiated by student.') => {
    const notif: NotificationItem = {
      id: `sos-${Date.now()}`,
      type: 'sos',
      title: '🚨 EMERGENCY SOS DISPATCHED',
      message: `High-priority alert broadcasted to Campus Security & Transport Dispatch: "${details}". Live GPS lock broadcasted.`,
      time: 'Just now',
      read: false,
      urgent: true
    };
    setNotifications(prev => [notif, ...prev]);
    playAlarmSiren();
    if (navigator.vibrate) {
      navigator.vibrate([1000, 300, 1000, 300, 1500]);
    }
  };

  const updateAvatar = (type: BusAvatarType, color: string) => {
    setSelectedAvatarType(type);
    setSelectedAvatarColor(color);
    setBuses(prev => prev.map(b => b.id === activeBusId ? { ...b, avatarType: type, avatarColor: color } : b));
  };

  const recordStudentBoarding = (studentId: string, status: 'boarded' | 'exited') => {
    const newRecord: BoardingRecord = {
      id: `rec-${Date.now()}`,
      studentId,
      studentName: 'Aarav Sharma',
      busId: activeBusId,
      stopName: activeBus.nextStop,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status,
      guardianNotified: true
    };
    setBoardingRecords(prev => [newRecord, ...prev]);

    const notif: NotificationItem = {
      id: `board-${Date.now()}`,
      type: 'boarding',
      title: status === 'boarded' ? '✅ Student Boarded Bus' : '🚶 Student Exited Bus',
      message: `Aarav Sharma verified at ${activeBus.nextStop}. Guardian notified via encrypted push alert.`,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const setBusPositionManual = (lat: number, lng: number) => {
    setBuses(prev => prev.map(b => b.id === activeBusId ? { ...b, coordinates: { lat, lng } } : b));
  };

  return (
    <TrackingContext.Provider
      value={{
        buses,
        activeBus,
        route,
        alarmConfig,
        alarmTriggered,
        incomingCallActive,
        driverTripActive,
        notifications,
        boardingRecords,
        selectedAvatarType,
        selectedAvatarColor,
        updateAlarmConfig,
        dismissAlarm,
        answerSimulatedCall,
        declineSimulatedCall,
        triggerManualAlarm,
        startDriverTrip,
        endDriverTrip,
        driverAdvanceStop,
        driverReportDelay,
        triggerEmergencySos,
        updateAvatar,
        recordStudentBoarding,
        markNotificationsAsRead,
        setBusPositionManual
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
};

export const useTracking = () => {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error('useTracking must be used within TrackingProvider');
  }
  return context;
};
