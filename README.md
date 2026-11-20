# T18 – 3D Smart College Bus Tracking & Gaming Platform
**Tagline:** *Your College Bus. Your Journey. Your World.*

T18 is a mobile-first, production-oriented intelligent college transportation and 3D gaming platform built with **React**, **TypeScript**, **Tailwind CSS**, and **Three.js**.

---

## 🏎️ Design Inspiration & UI/UX

1. **Asphalt 9 / Asphalt Legends Unite**:
   - 3D Vehicle Showroom with 360° turn-table pedestal, orbital PBR lighting, and reflective asphalt floor.
   - High-octane 3D Racing Arena with arcade physics, speed boost pads, chequered gantry, nitro camera warping, and AI competitors.
   - Glassmorphic HUD telemetry cards, speedometer dials, glowing neon cyan/blue highlights, and race countdowns.

2. **Rapido**:
   - Real-time bus tracking map with animated bus avatar markers and directional heading.
   - Instant ETA countdown badge, stop-to-stop distance telemetry, and route progression bar.
   - Proximity radar geofencing around student bus stops.

3. **Modern Automotive Dashboards**:
   - Clean cluster telemetry with speed limit adherence, passenger headcount capacity bars, and driver rating indicators.
   - 24/7 one-click emergency SOS broadcast.

4. **REA Repository Design Patterns**:
   - Clean typographic hierarchy, Catppuccin-inspired dark mode tokens (`--bg-primary: #090a0f`, `--text-primary: #ffffff`, `--accent-cyan: #00f3ff`), clean disclosure cards, and audit logs.

---

## 🌟 Key Functional Pillars

### 1. Smart Bus Arrival Alarm (Geofence Trigger)
- **Stop Selection**: Choose any scheduled stop on Route 18.
- **Lead Time Alert**: Configure 5, 10, or 15-minute advance warnings.
- **Modalities**:
  - Audible High-Frequency Chime
  - Haptic Device Vibration
  - Automated Simulated Phone Call with interactive IVR voice readout
  - Push notification alerts
- **OS Transparency**: Clear explanations regarding Android/iOS background limits and Do-Not-Disturb overrides.

### 2. 3D Bus Avatar Garage (Three.js)
Students can inspect, customize, and equip 5 procedural 3D bus avatars:
1. **T18 AERO-NEXUS X** (Futuristic Maglev Aero Bus)
2. **T18 CYBER-VULCAN GT** (Track-Tuned Sports College Coach)
3. **T18 VOLT-RUNNER EV** (Zero-Emission Solid-State Bus with Solar Array)
4. **T18 ROYALE IMPERIAL** (Executive Triple-Axle First-Class Lounge Bus)
5. **T18 SENTINEL HERITAGE** (Heavy-Duty Titanium-Reinforced Bus)
- **Features**: 360° touch/mouse drag rotation, scroll zoom, 7 custom metallic paint colors, matte/metallic/carbon finishes, performance telemetry radar, and instant synchronization with the live GPS map.

### 3. Asphalt-Inspired 3D Racing Arena
- **3 High-Performance Sports Cars**: T18 Apex Hyperion, Neon Proto-GTR, Cyber Interceptor X.
- **Playable 3D Circuit**: Elevated race track with Catmull-Rom spline curves, glowing neon barriers, and start/finish gantry.
- **Arcade Dynamics**: Acceleration, braking, lateral steering drift, nitro boost with camera FOV distortion (60° to 72°).
- **AI Competitors**: Two automated opponent vehicles racing simultaneously.
- **HUD**: Speedometer, Lap counter (3 Laps), Lap timer, Race position badge (1st/2nd/3rd).
- **Controls**: WASD / Arrow Keys / Space for Nitro + On-screen mobile touch driving controls.
- **Audio**: Web Audio API engine rev, nitro whoosh, checkpoint chimes, and confetti victory fanfare.

### 4. 4 Role-Based Dashboards
- **Student Console**: Bus ETA countdown, live speed, RFID/QR boarding badge, driver call button, emergency SOS.
- **Parent Console**: Verified ward linking (Student ID + OTP), real-time boarding timeline (*"Boarded at Stop 3 - 07:43 AM"*), 24/7 college security hotline.
- **Driver Console**: One-touch Start Trip / End Trip GPS broadcast, stop progression checklist (*"Arrived At Next Stop"*), delay broadcaster (+5m, +10m, +20m), passenger headcount counter.
- **College Administrator Console**: Fleet overview KPI cards (Active Fleet, On-Time Adherence, Passengers, Safety Score), multi-bus table, route & stop editor, driver allocations, and JSON report export.

### 5. Cybersecurity & Privacy (Section 10 Compliance)
- Role-based access control (RBAC).
- Student ID and ward linking protected by simulated 2-factor OTP.
- Masked phone numbers and email privacy.
- Session manager with active device listing and remote session revocation (*"Logout from all other devices"*).
- Immutable audit log tracking administrative, driver, and parent actions.

---

## 🛠️ Project Structure

```
t18/
├── dist/                     # Optimized production bundle
├── src/
│   ├── components/
│   │   ├── alarm/            # Smart Arrival Alarm & Incoming Phone Call Modals
│   │   ├── auth/             # Login, Register, OTP Verification Modals
│   │   ├── common/           # Emergency SOS Modal, Stat Badges
│   │   ├── dashboards/       # Student, Parent, Driver, Admin Dashboards
│   │   ├── garage/           # Three.js 3D Bus Avatar Garage
│   │   ├── layout/           # Asphalt 9 Header & Mobile Bottom Navigation Dock
│   │   ├── map/              # Leaflet Live Bus Tracking Map (Cyber/Google/Satellite)
│   │   ├── notifications/    # Alert Center & Secure Dispatch Feed
│   │   ├── profile/          # User Profile & Active Sessions Manager
│   │   └── racing/           # Three.js 3D Racing Game Arena
│   ├── context/
│   │   ├── AudioContext.tsx  # Web Audio API procedural sound synthesizer
│   │   ├── AuthContext.tsx   # Role switcher & session manager
│   │   ├── ThemeContext.tsx  # Cyber Dark, Titanium Light, Minimal B&W
│   │   └── TrackingContext.tsx # Live GPS telemetry simulation loop
│   ├── data/
│   │   └── mockData.ts       # Route 18 stops, mock fleet, cars, audit logs
│   ├── types.ts              # Domain interfaces
│   ├── App.tsx               # Main application container
│   ├── index.css             # Tailwind CSS & custom neon glow shaders
│   └── main.tsx              # React DOM mounting
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Running Locally (Windows PowerShell)

```powershell
# Navigate to the project directory
cd C:\Users\banot\.gemini\antigravity\scratch\t18

# Run development server
npm run dev

# Or test production preview build
npm run preview
```

Open `http://localhost:5173` in any mobile or desktop web browser.
