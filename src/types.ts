export type UserRole = 'student' | 'parent' | 'driver' | 'admin';

export type AppTheme = 'dark' | 'light' | 'minimal';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  collegeName: string;
  studentId?: string;
  profilePic?: string;
  assignedBusId?: string;
  registeredStopId?: string;
  linkedChildId?: string;
  linkedChildName?: string;
  linkedChildStudentId?: string;
  twoFactorEnabled: boolean;
  sessionsCount: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface BusStop {
  id: string;
  name: string;
  coordinates: LatLng;
  sequence: number;
  expectedArrivalTime: string;
  scheduledTime: string;
  studentsCount: number;
}

export interface BusRoute {
  id: string;
  name: string;
  code: string;
  startPoint: string;
  endPoint: string;
  totalDistanceKm: number;
  estimatedMinutes: number;
  stops: BusStop[];
  waypoints: [number, number][];
}

export type BusAvatarType = 'school' | 'luxury' | 'electric' | 'sports' | 'futuristic';

export interface BusAvatarConfig {
  type: BusAvatarType;
  name: string;
  tagline: string;
  primaryColor: string;
  metallic: number;
  roughness: number;
  speedRating: number;   // 1 - 100
  armorRating: number;   // 1 - 100
  aeroRating: number;    // 1 - 100
  comfortRating: number; // 1 - 100
  ecoRating: number;     // 1 - 100
  description: string;
}

export interface BusTelemetry {
  id: string;
  regNumber: string;
  model: string;
  driverName: string;
  driverPhone: string;
  driverRating: number;
  routeId: string;
  routeName: string;
  currentStopIndex: number;
  nextStop: string;
  nextStopDistanceKm: number;
  nextStopEtaMinutes: number;
  coordinates: LatLng;
  heading: number; // 0 - 360 degrees
  speedKmh: number;
  status: 'in_transit' | 'delayed' | 'stopped_at_stop' | 'off_duty' | 'emergency';
  avatarType: BusAvatarType;
  avatarColor: string;
  passengersOnBoard: number;
  maxCapacity: number;
  lastUpdated: string;
}

export interface SmartAlarmConfig {
  enabled: boolean;
  stopId: string;
  stopName: string;
  leadMinutes: number; // 5, 10, 15
  pushNotification: boolean;
  soundAlert: boolean;
  vibrationAlert: boolean;
  phoneCallAlert: boolean;
  repeatedAlerts: boolean;
  triggered: boolean;
}

export interface BoardingRecord {
  id: string;
  studentId: string;
  studentName: string;
  busId: string;
  stopName: string;
  time: string;
  status: 'boarded' | 'exited' | 'verified_by_rfid' | 'absent';
  guardianNotified: boolean;
}

export interface NotificationItem {
  id: string;
  type: 'approaching' | 'arriving' | 'reached' | 'delayed' | 'departed' | 'boarding' | 'sos' | 'security';
  title: string;
  message: string;
  time: string;
  read: boolean;
  urgent?: boolean;
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  current: boolean;
  lastActive: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  ip: string;
  status: 'SUCCESS' | 'WARNING' | 'ALERT';
}

export interface RacingCarConfig {
  id: string;
  name: string;
  class: string;
  topSpeedKmh: number;
  acceleration: number;
  handling: number;
  nitroCapacity: number;
  color: string;
}
