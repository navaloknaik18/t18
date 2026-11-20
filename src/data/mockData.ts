import {
  BusRoute,
  BusTelemetry,
  BusAvatarConfig,
  SmartAlarmConfig,
  BoardingRecord,
  NotificationItem,
  ActiveSession,
  AuditLogItem,
  RacingCarConfig
} from '../types';

// College Campus Corridor Route (Route 18 - Metro Campus Express)
export const MOCK_ROUTE: BusRoute = {
  id: 'route-18',
  code: 'T-18X',
  name: 'North Campus High-Speed Express',
  startPoint: 'City Central Terminal',
  endPoint: 'T18 Technology Institute Main Gate',
  totalDistanceKm: 14.8,
  estimatedMinutes: 38,
  stops: [
    {
      id: 'stop-1',
      name: 'City Central Terminal (Gate 4)',
      coordinates: { lat: 12.9716, lng: 77.5946 },
      sequence: 1,
      expectedArrivalTime: '07:30 AM',
      scheduledTime: '07:30 AM',
      studentsCount: 12
    },
    {
      id: 'stop-2',
      name: 'Metro Cyber Hub Junction',
      coordinates: { lat: 12.9850, lng: 77.6080 },
      sequence: 2,
      expectedArrivalTime: '07:42 AM',
      scheduledTime: '07:40 AM',
      studentsCount: 8
    },
    {
      id: 'stop-3',
      name: 'Oakridge Green Boulevard',
      coordinates: { lat: 13.0020, lng: 77.6250 },
      sequence: 3,
      expectedArrivalTime: '07:54 AM',
      scheduledTime: '07:50 AM',
      studentsCount: 15
    },
    {
      id: 'stop-4',
      name: 'Innovation Tech Park Crossing',
      coordinates: { lat: 13.0210, lng: 77.6400 },
      sequence: 4,
      expectedArrivalTime: '08:06 AM',
      scheduledTime: '08:05 AM',
      studentsCount: 9
    },
    {
      id: 'stop-5',
      name: 'T18 Institute of Technology Campus',
      coordinates: { lat: 13.0450, lng: 77.6620 },
      sequence: 5,
      expectedArrivalTime: '08:20 AM',
      scheduledTime: '08:20 AM',
      studentsCount: 0
    }
  ],
  waypoints: [
    [12.9716, 77.5946],
    [12.9760, 77.5990],
    [12.9850, 77.6080],
    [12.9930, 77.6160],
    [13.0020, 77.6250],
    [13.0110, 77.6320],
    [13.0210, 77.6400],
    [13.0330, 77.6510],
    [13.0450, 77.6620]
  ]
};

export const MOCK_BUSES: BusTelemetry[] = [
  {
    id: 'bus-t18-01',
    regNumber: 'KA-01-EQ-1818',
    model: 'T18 Aerostream GT-Electric 2026',
    driverName: 'Vikramaditya Rao',
    driverPhone: '+91 98450 18181',
    driverRating: 4.95,
    routeId: 'route-18',
    routeName: 'North Campus High-Speed Express',
    currentStopIndex: 2,
    nextStop: 'Oakridge Green Boulevard',
    nextStopDistanceKm: 1.4,
    nextStopEtaMinutes: 4,
    coordinates: { lat: 12.9960, lng: 77.6190 },
    heading: 42,
    speedKmh: 46,
    status: 'in_transit',
    avatarType: 'futuristic',
    avatarColor: '#00f3ff',
    passengersOnBoard: 28,
    maxCapacity: 45,
    lastUpdated: 'Just now'
  },
  {
    id: 'bus-t18-02',
    regNumber: 'KA-01-EQ-2042',
    model: 'T18 Cyber Titan 40-Seater',
    driverName: 'Sanjay Kumar Sharma',
    driverPhone: '+91 98450 20420',
    driverRating: 4.88,
    routeId: 'route-18',
    routeName: 'South Campus Shuttle',
    currentStopIndex: 1,
    nextStop: 'Metro Cyber Hub Junction',
    nextStopDistanceKm: 3.8,
    nextStopEtaMinutes: 9,
    coordinates: { lat: 12.9790, lng: 77.6010 },
    heading: 35,
    speedKmh: 38,
    status: 'in_transit',
    avatarType: 'luxury',
    avatarColor: '#ffd700',
    passengersOnBoard: 34,
    maxCapacity: 45,
    lastUpdated: '10s ago'
  },
  {
    id: 'bus-t18-03',
    regNumber: 'KA-01-EQ-9988',
    model: 'T18 Retro Classic College Bus',
    driverName: 'Mohan Lal Verma',
    driverPhone: '+91 98450 99880',
    driverRating: 4.75,
    routeId: 'route-18',
    routeName: 'East Ring Road Feeder',
    currentStopIndex: 4,
    nextStop: 'T18 Institute of Technology Campus',
    nextStopDistanceKm: 0.8,
    nextStopEtaMinutes: 2,
    coordinates: { lat: 13.0390, lng: 77.6570 },
    heading: 48,
    speedKmh: 24,
    status: 'in_transit',
    avatarType: 'school',
    avatarColor: '#ff9900',
    passengersOnBoard: 42,
    maxCapacity: 50,
    lastUpdated: '4s ago'
  }
];

export const BUS_AVATARS: BusAvatarConfig[] = [
  {
    type: 'futuristic',
    name: 'T18 AERO-NEXUS X',
    tagline: 'Superconducting Maglev Aero Bus',
    primaryColor: '#00f3ff',
    metallic: 0.9,
    roughness: 0.15,
    speedRating: 96,
    armorRating: 82,
    aeroRating: 98,
    comfortRating: 92,
    ecoRating: 100,
    description: 'Ultra-aerodynamic stealth chassis with glowing plasma rings, active aero flaps, and magnetic levitation dampers.'
  },
  {
    type: 'sports',
    name: 'T18 CYBER-VULCAN GT',
    tagline: 'Track-Tuned Sports College Coach',
    primaryColor: '#ff0055',
    metallic: 0.85,
    roughness: 0.2,
    speedRating: 94,
    armorRating: 85,
    aeroRating: 92,
    comfortRating: 88,
    ecoRating: 86,
    description: 'Inspired by endurance GT racers. Features aggressive front splitter, rear downforce wing, and carbon-ceramic brake visual cues.'
  },
  {
    type: 'electric',
    name: 'T18 VOLT-RUNNER EV',
    tagline: 'Zero-Emission Solid-State Bus',
    primaryColor: '#00ff88',
    metallic: 0.7,
    roughness: 0.3,
    speedRating: 84,
    armorRating: 78,
    aeroRating: 86,
    comfortRating: 94,
    ecoRating: 99,
    description: 'Clean modern unibody architecture with roof-mounted photovoltaic solar cells and smart acoustic glass panels.'
  },
  {
    type: 'luxury',
    name: 'T18 ROYALE IMPERIAL',
    tagline: 'Executive First-Class Lounge Bus',
    primaryColor: '#e5c158',
    metallic: 0.95,
    roughness: 0.1,
    speedRating: 80,
    armorRating: 90,
    aeroRating: 76,
    comfortRating: 99,
    ecoRating: 82,
    description: 'Prestige finish with deep metallic gold, dual panoramic tinted sunroofs, and executive leather interior layout.'
  },
  {
    type: 'school',
    name: 'T18 SENTINEL HERITAGE',
    tagline: 'Heavy-Duty Reinforced College Transporter',
    primaryColor: '#ffaa00',
    metallic: 0.4,
    roughness: 0.5,
    speedRating: 74,
    armorRating: 98,
    aeroRating: 65,
    comfortRating: 80,
    ecoRating: 75,
    description: 'Titanium-reinforced structural roll-cage, triple-reinforced collision bumpers, and classic high-visibility amber strobe lights.'
  }
];

export const RACING_CARS: RacingCarConfig[] = [
  {
    id: 'car-hyper-v',
    name: 'T18 APEX HYPERION',
    class: 'HYPERCAR - CLASS S',
    topSpeedKmh: 345,
    acceleration: 95,
    handling: 90,
    nitroCapacity: 92,
    color: '#00f3ff'
  },
  {
    id: 'car-neon-gtr',
    name: 'NEON PROTO-GTR',
    class: 'ENDURANCE - CLASS A',
    topSpeedKmh: 320,
    acceleration: 88,
    handling: 96,
    nitroCapacity: 86,
    color: '#ff0055'
  },
  {
    id: 'car-cyber-interceptor',
    name: 'CYBER INTERCEPTOR X',
    class: 'EXPERIMENTAL - PROTO',
    topSpeedKmh: 335,
    acceleration: 92,
    handling: 87,
    nitroCapacity: 98,
    color: '#ffd700'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'approaching',
    title: 'Bus Approaching Registered Stop',
    message: 'Bus KA-01-EQ-1818 is now 1.4 km (4 mins) away from Oakridge Green Boulevard.',
    time: '2 mins ago',
    read: false,
    urgent: true
  },
  {
    id: 'notif-2',
    type: 'boarding',
    title: 'RFID Boarding Verified',
    message: 'Student Aarav Sharma (ID: T18-2024-CS089) tapped RFID card at Metro Cyber Hub.',
    time: '12 mins ago',
    read: false
  },
  {
    id: 'notif-3',
    type: 'security',
    title: 'Smart Driver Telemetry Verified',
    message: 'Speed adherence 100%. Zero rapid acceleration or hard braking events detected.',
    time: '25 mins ago',
    read: true
  }
];

export const MOCK_BOARDING_RECORDS: BoardingRecord[] = [
  {
    id: 'rec-01',
    studentId: 'T18-2024-CS089',
    studentName: 'Aarav Sharma',
    busId: 'bus-t18-01',
    stopName: 'Metro Cyber Hub Junction',
    time: '07:43 AM',
    status: 'boarded',
    guardianNotified: true
  },
  {
    id: 'rec-02',
    studentId: 'T18-2024-EC041',
    studentName: 'Ananya Iyer',
    busId: 'bus-t18-01',
    stopName: 'Oakridge Green Boulevard',
    time: 'Pending ETA 07:54 AM',
    status: 'verified_by_rfid',
    guardianNotified: false
  },
  {
    id: 'rec-03',
    studentId: 'T18-2024-ME012',
    studentName: 'Rohan Mehra',
    busId: 'bus-t18-01',
    stopName: 'City Central Terminal',
    time: '07:31 AM',
    status: 'boarded',
    guardianNotified: true
  }
];

export const MOCK_ACTIVE_SESSIONS: ActiveSession[] = [
  {
    id: 'sess-1',
    device: 'OnePlus 12 (Android 15)',
    browser: 'T18 Mobile Client v1.0.4',
    ip: '103.21.244.78',
    location: 'Bengaluru, India',
    current: true,
    lastActive: 'Active now'
  },
  {
    id: 'sess-2',
    device: 'Apple MacBook Pro M3',
    browser: 'Chrome 132.0 (macOS)',
    ip: '49.207.211.102',
    location: 'Bengaluru, India',
    current: false,
    lastActive: 'Yesterday at 9:42 PM'
  }
];

export const MOCK_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: 'audit-101',
    timestamp: '2026-11-20 11:45:02',
    actor: 'Admin (Prof. K. Sundaram)',
    role: 'College Administrator',
    action: 'BUS_ROUTE_REASSIGNMENT',
    target: 'Bus KA-01-EQ-1818 assigned to Route 18-North',
    ip: '192.168.1.10',
    status: 'SUCCESS'
  },
  {
    id: 'audit-102',
    timestamp: '2026-11-20 11:32:14',
    actor: 'Driver (Vikramaditya Rao)',
    role: 'Bus Driver',
    action: 'TRIP_START_BROADCAST',
    target: 'Trip #TR-8891 initiated with authorized GPS lock',
    ip: '103.21.244.82',
    status: 'SUCCESS'
  },
  {
    id: 'audit-103',
    timestamp: '2026-11-20 11:15:30',
    actor: 'Parent (Meera Sharma)',
    role: 'Parent',
    action: 'STUDENT_ACCOUNT_LINK',
    target: 'Verified Aarav Sharma (ID: T18-2024-CS089) via OTP',
    ip: '157.48.91.22',
    status: 'SUCCESS'
  }
];
