import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useTracking } from '../../context/TrackingContext';
import { useAppTheme } from '../../context/ThemeContext';
import { useAppAuth } from '../../context/AuthContext';
import {
  Navigation,
  Crosshair,
  Layers,
  MapPin,
  Clock,
  Gauge,
  Phone,
  ShieldAlert,
  Bell
} from 'lucide-react';

export const LiveBusMap: React.FC<{
  onOpenAlarm?: () => void;
  onOpenSos?: () => void;
  interactive?: boolean;
}> = ({ onOpenAlarm, onOpenSos, interactive = true }) => {
  const { activeBus, route, alarmConfig, alarmTriggered } = useTracking();
  const { theme } = useAppTheme();
  const { currentUser } = useAppAuth();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const busMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const stopMarkersRef = useRef<L.Marker[]>([]);
  const studentMarkerRef = useRef<L.Marker | null>(null);
  const geofenceCircleRef = useRef<L.Circle | null>(null);

  const [mapStyle, setMapStyle] = useState<'cyber' | 'google' | 'satellite'>('cyber');
  const [followBus, setFollowBus] = useState<boolean>(true);

  // Student's registered stop: Oakridge Green Boulevard (stop-3)
  const registeredStop = route.stops.find(s => s.id === (currentUser?.registeredStopId || 'stop-3')) || route.stops[2];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const map = L.map(mapContainerRef.current, {
      center: [activeBus.coordinates.lat, activeBus.coordinates.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false
    });
    mapInstanceRef.current = map;

    // Tile Layer based on style
    const getTileUrl = () => {
      if (mapStyle === 'satellite') {
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      }
      if (mapStyle === 'google') {
        return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      }
      return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    };

    L.tileLayer(getTileUrl(), { maxZoom: 19 }).addTo(map);

    // Route Polyline (Glowing Neon Cyber Ribbon)
    const polyline = L.polyline(route.waypoints, {
      color: theme === 'light' ? '#0066ff' : '#00f3ff',
      weight: 6,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);
    routePolylineRef.current = polyline;

    // Route Stops Markers
    stopMarkersRef.current = route.stops.map((stop) => {
      const isRegistered = stop.id === registeredStop.id;
      const stopIcon = L.divIcon({
        className: 'custom-stop-marker',
        html: `
          <div style="
            width: ${isRegistered ? '32px' : '22px'};
            height: ${isRegistered ? '32px' : '22px'};
            background: ${isRegistered ? '#ff0055' : '#181c2b'};
            border: 2px solid ${isRegistered ? '#ffffff' : '#00f3ff'};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: ${isRegistered ? '13px' : '10px'};
            font-weight: 800;
            box-shadow: ${isRegistered ? '0 0 16px #ff0055' : '0 0 8px rgba(0, 243, 255, 0.4)'};
          ">
            ${stop.sequence}
          </div>
        `,
        iconSize: [isRegistered ? 32 : 22, isRegistered ? 32 : 22],
        iconAnchor: [isRegistered ? 16 : 11, isRegistered ? 16 : 11]
      });

      const marker = L.marker([stop.coordinates.lat, stop.coordinates.lng], { icon: stopIcon }).addTo(map);
      marker.bindPopup(`
        <div style="background: #12151f; color: #fff; padding: 6px; border-radius: 8px; font-family: sans-serif; font-size: 12px; border: 1px solid #00f3ff;">
          <strong style="color: #00f3ff;">#${stop.sequence} ${stop.name}</strong><br/>
          <span>ETA: ${stop.expectedArrivalTime}</span><br/>
          <span>Boarding Students: ${stop.studentsCount}</span>
        </div>
      `);
      return marker;
    });

    // Geofence Radius around Student's Registered Stop
    const circle = L.circle([registeredStop.coordinates.lat, registeredStop.coordinates.lng], {
      radius: 500, // 500 meters radar geofence
      color: '#ff0055',
      fillColor: '#ff0055',
      fillOpacity: 0.12,
      weight: 1.5,
      dashArray: '4, 8'
    }).addTo(map);
    geofenceCircleRef.current = circle;

    // Student's Own Location Marker (Simulated at 250m from their stop)
    const studentIcon = L.divIcon({
      className: 'student-pin',
      html: `
        <div style="position: relative; width: 28px; height: 28px;">
          <div style="position: absolute; inset: 0; border: 2px solid #00ff88; border-radius: 50%; animation: radarPulse 2s infinite;"></div>
          <div style="position: absolute; inset: 4px; background: #00ff88; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 0 12px #00ff88;"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
    studentMarkerRef.current = L.marker([registeredStop.coordinates.lat - 0.0015, registeredStop.coordinates.lng - 0.001], {
      icon: studentIcon
    }).addTo(map).bindPopup('<strong>Your Location (Verified GPS)</strong>');

    // Bus Marker with custom 3D avatar icon and heading rotation
    const busHtml = `
      <div style="
        position: relative;
        width: 44px;
        height: 44px;
        transform: rotate(${activeBus.heading}deg);
        transition: transform 0.4s ease;
      ">
        <div style="
          width: 44px;
          height: 44px;
          background: ${activeBus.avatarColor || '#00f3ff'};
          border: 3px solid #ffffff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 24px ${activeBus.avatarColor || '#00f3ff'};
        ">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 6v6"/>
            <path d="M15 6v6"/>
            <path d="M2 12h19.6"/>
            <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.6-.1-1.1-.3-1.6l-1.4-3.5c-.3-.8-.9-1.4-1.7-1.7L15 6H4.8c-.8 0-1.5.5-1.8 1.2L1.6 11c-.2.5-.3 1-.3 1.6 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/>
            <circle cx="7" cy="18" r="2"/>
            <circle cx="17" cy="18" r="2"/>
          </svg>
        </div>
      </div>
    `;

    const busIcon = L.divIcon({
      className: 'bus-marker-icon',
      html: busHtml,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    const busMarker = L.marker([activeBus.coordinates.lat, activeBus.coordinates.lng], { icon: busIcon }).addTo(map);
    busMarkerRef.current = busMarker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mapStyle, theme]);

  // Update bus position smoothly during live GPS telemetry
  useEffect(() => {
    if (!busMarkerRef.current || !mapInstanceRef.current) return;

    const latLng = L.latLng(activeBus.coordinates.lat, activeBus.coordinates.lng);
    busMarkerRef.current.setLatLng(latLng);

    // Update heading rotation and avatar color
    const busElement = busMarkerRef.current.getElement();
    if (busElement) {
      const inner = busElement.firstElementChild as HTMLElement;
      if (inner) {
        inner.style.transform = `rotate(${activeBus.heading}deg)`;
        const badge = inner.firstElementChild as HTMLElement;
        if (badge) {
          badge.style.background = activeBus.avatarColor;
          badge.style.boxShadow = `0 0 24px ${activeBus.avatarColor}`;
        }
      }
    }

    if (followBus && mapInstanceRef.current) {
      mapInstanceRef.current.panTo(latLng, { animate: true, duration: 1.2 });
    }
  }, [activeBus.coordinates, activeBus.heading, activeBus.avatarColor, followBus]);

  const handleCenterBus = () => {
    setFollowBus(true);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([activeBus.coordinates.lat, activeBus.coordinates.lng], 15, { animate: true });
    }
  };

  const handleCenterStudent = () => {
    setFollowBus(false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([registeredStop.coordinates.lat, registeredStop.coordinates.lng], 16, { animate: true });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[480px] rounded-2xl overflow-hidden glass-panel-glow border border-t18-border/60">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 select-none" />

      {/* Map View Mode Controls & Center Buttons */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
        <div className="bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/10 flex flex-col gap-1">
          <button
            onClick={() => setMapStyle('cyber')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider transition-colors ${
              mapStyle === 'cyber' ? 'bg-t18-cyan text-black font-bold' : 'text-white/70 hover:text-white'
            }`}
          >
            Cyber Dark
          </button>
          <button
            onClick={() => setMapStyle('google')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider transition-colors ${
              mapStyle === 'google' ? 'bg-t18-cyan text-black font-bold' : 'text-white/70 hover:text-white'
            }`}
          >
            Google Light
          </button>
          <button
            onClick={() => setMapStyle('satellite')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider transition-colors ${
              mapStyle === 'satellite' ? 'bg-t18-cyan text-black font-bold' : 'text-white/70 hover:text-white'
            }`}
          >
            Satellite
          </button>
        </div>

        <button
          onClick={handleCenterBus}
          className={`p-2.5 rounded-xl backdrop-blur-md border transition-all flex items-center justify-center shadow-lg ${
            followBus
              ? 'bg-t18-cyan text-black border-white/30 shadow-glow-cyan'
              : 'bg-black/70 text-white border-white/10 hover:border-white/30'
          }`}
          title="Center on Live Bus"
        >
          <Navigation className="w-4 h-4 fill-current" />
        </button>

        <button
          onClick={handleCenterStudent}
          className="p-2.5 rounded-xl bg-black/70 text-white backdrop-blur-md border border-white/10 hover:border-white/30 transition-all flex items-center justify-center shadow-lg"
          title="Center on My Bus Stop"
        >
          <Crosshair className="w-4 h-4 text-emerald-400" />
        </button>
      </div>

      {/* Rapido-Inspired Real-Time Arrival Floating Card */}
      <div className="absolute bottom-4 left-4 right-4 z-[400] max-w-xl mx-auto glass-panel p-4 rounded-2xl border border-t18-border/80 shadow-2xl">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                RAPIDO LIVE TELEMETRY
              </span>
              <span className="text-[11px] text-white/40 font-mono">| {activeBus.regNumber}</span>
            </div>
            <h3 className="text-lg lg:text-xl font-bold font-gaming text-white uppercase mt-0.5">
              Approaching {activeBus.nextStop}
            </h3>
          </div>

          {/* Big ETA Display */}
          <div className="text-right bg-t18-blue/20 border border-t18-cyan/40 px-3.5 py-1.5 rounded-xl shadow-glow-cyan">
            <span className="text-[10px] text-t18-cyan font-mono uppercase block">ARRIVING IN</span>
            <span className="text-2xl font-black font-gaming text-white">
              {activeBus.nextStopEtaMinutes}
              <span className="text-xs font-mono text-t18-cyan ml-1">MINS</span>
            </span>
          </div>
        </div>

        {/* Telemetry Stats Grid */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/10 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-white/80">
            <Gauge className="w-3.5 h-3.5 text-t18-cyan" />
            <span>{activeBus.speedKmh} km/h</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/80">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>{activeBus.nextStopDistanceKm} km left</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/80">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>On-Time Status</span>
          </div>
        </div>

        {/* Action Buttons: Alarm Setup, Call Driver, SOS */}
        <div className="flex items-center gap-2 mt-3">
          {onOpenAlarm && (
            <button
              onClick={onOpenAlarm}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold font-gaming uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border ${
                alarmConfig.enabled
                  ? 'bg-t18-cyan/20 border-t18-cyan text-t18-cyan shadow-glow-cyan'
                  : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Smart Alarm {alarmConfig.enabled ? `(${alarmConfig.leadMinutes}m)` : 'Off'}</span>
            </button>
          )}

          <a
            href={`tel:${activeBus.driverPhone}`}
            className="py-2 px-3 rounded-xl text-xs font-bold font-gaming uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center gap-1.5"
            title="Call Assigned Driver"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Call Driver</span>
          </a>

          {onOpenSos && (
            <button
              onClick={onOpenSos}
              className="py-2 px-3.5 rounded-xl text-xs font-bold font-gaming uppercase tracking-wider bg-red-600/20 hover:bg-red-600/30 border border-red-500/60 text-red-400 flex items-center gap-1.5 shadow-glow-red"
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>SOS</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
