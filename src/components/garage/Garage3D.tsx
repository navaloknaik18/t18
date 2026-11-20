import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BUS_AVATARS } from '../../data/mockData';
import { BusAvatarType, BusAvatarConfig } from '../../types';
import { useTracking } from '../../context/TrackingContext';
import { useAppAudio } from '../../context/AudioContext';
import {
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Shield,
  Gauge,
  Wind,
  Armchair,
  Leaf,
  Layers,
  Palette
} from 'lucide-react';

const PAINT_COLORS = [
  { name: 'Neon Cyan', hex: '#00f3ff' },
  { name: 'Electric Blue', hex: '#0066ff' },
  { name: 'Vulcan Crimson', hex: '#ff0055' },
  { name: 'Imperial Gold', hex: '#ffd700' },
  { name: 'Acid Green', hex: '#00ff88' },
  { name: 'Stealth Obsidian', hex: '#11131a' },
  { name: 'Chrono Violet', hex: '#a855f7' }
];

export const Garage3D: React.FC = () => {
  const { selectedAvatarType, selectedAvatarColor, updateAvatar } = useTracking();
  const { playUiClick } = useAppAudio();

  const mountRef = useRef<HTMLDivElement>(null);
  const [currentAvatarType, setCurrentAvatarType] = useState<BusAvatarType>(selectedAvatarType);
  const [activeColor, setActiveColor] = useState<string>(selectedAvatarColor);
  const [paintFinish, setPaintFinish] = useState<'metallic' | 'matte' | 'carbon'>('metallic');
  const [equippedSuccess, setEquippedSuccess] = useState<boolean>(false);

  const busGroupRef = useRef<THREE.Group | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const cameraTargetRotation = useRef({ x: 0.2, y: 0.6 });
  const cameraCurrentRotation = useRef({ x: 0.2, y: 0.6 });
  const cameraDistance = useRef(9.5);

  const activeAvatarConfig: BusAvatarConfig =
    BUS_AVATARS.find(a => a.type === currentAvatarType) || BUS_AVATARS[0];

  // Build the 3D model according to avatar type
  const constructBusModel = (type: BusAvatarType, colorHex: string, finish: 'metallic' | 'matte' | 'carbon') => {
    const group = new THREE.Group();
    materialsRef.current = [];

    const metalness = finish === 'metallic' ? 0.9 : finish === 'carbon' ? 0.6 : 0.15;
    const roughness = finish === 'matte' ? 0.6 : 0.25;

    // Primary Body Material
    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      metalness,
      roughness,
      envMapIntensity: 1.5
    });
    materialsRef.current.push(bodyMat);

    // Glass Material
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x051222,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.7,
      transparent: true,
      opacity: 0.85
    });

    // Dark Trim Material
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x0b0d14,
      metalness: 0.8,
      roughness: 0.3
    });

    // Chrome/Silver Material
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      metalness: 0.95,
      roughness: 0.1
    });

    // Neon Glow Material
    const neonMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      emissive: new THREE.Color(colorHex),
      emissiveIntensity: 2.2,
      roughness: 0.1
    });

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.42, 24);
    wheelGeo.rotateZ(Math.PI / 2);
    const rimGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.44, 16);
    rimGeo.rotateZ(Math.PI / 2);

    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x15161b, roughness: 0.8 });
    const rimMat = new THREE.MeshStandardMaterial({
      color: finish === 'metallic' ? 0xcccccc : new THREE.Color(colorHex),
      metalness: 0.9,
      roughness: 0.2
    });

    const addWheel = (x: number, y: number, z: number) => {
      const tire = new THREE.Mesh(wheelGeo, wheelMat);
      tire.position.set(x, y, z);
      tire.castShadow = true;
      group.add(tire);

      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.position.set(x, y, z);
      group.add(rim);
    };

    // Four standard wheels
    addWheel(-1.3, 0.55, 2.2);
    addWheel(1.3, 0.55, 2.2);
    addWheel(-1.3, 0.55, -2.2);
    addWheel(1.3, 0.55, -2.2);

    if (type === 'luxury') {
      // Extra rear axle for luxury triple-axle coach
      addWheel(-1.3, 0.55, -3.2);
      addWheel(1.3, 0.55, -3.2);
    }

    if (type === 'futuristic') {
      // Sleek Maglev Aero Capsule
      const bodyGeo = new THREE.BoxGeometry(2.3, 1.4, 6.2);
      const mainBody = new THREE.Mesh(bodyGeo, bodyMat);
      mainBody.position.y = 1.35;
      mainBody.castShadow = true;
      group.add(mainBody);

      // Curved nose
      const noseGeo = new THREE.CylinderGeometry(1.15, 1.15, 2.3, 32, 1, false, 0, Math.PI);
      noseGeo.rotateZ(Math.PI / 2);
      noseGeo.rotateY(Math.PI / 2);
      const nose = new THREE.Mesh(noseGeo, bodyMat);
      nose.position.set(0, 1.35, 3.1);
      group.add(nose);

      // Curved wrap-around cockpit windshield
      const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.75, 1.5), glassMat);
      frontGlass.position.set(0, 1.55, 2.4);
      group.add(frontGlass);

      // Continuous Aero Side Windows
      const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.65, 4.4), glassMat);
      sideGlass.position.set(0, 1.55, -0.4);
      group.add(sideGlass);

      // Maglev Side Neon Skirts
      const skirtLeft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 5.8), neonMat);
      skirtLeft.position.set(-1.22, 0.55, 0);
      group.add(skirtLeft);

      const skirtRight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.2, 5.8), neonMat);
      skirtRight.position.set(1.22, 0.55, 0);
      group.add(skirtRight);

      // Top Aero Fin
      const fin = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.5, 4), neonMat);
      fin.rotation.x = Math.PI / 2;
      fin.position.set(0, 2.2, -2.6);
      group.add(fin);
    } else if (type === 'sports') {
      // Track-Tuned Sports GT Bus
      const bodyGeo = new THREE.BoxGeometry(2.4, 1.3, 5.8);
      const mainBody = new THREE.Mesh(bodyGeo, bodyMat);
      mainBody.position.y = 1.25;
      mainBody.castShadow = true;
      group.add(mainBody);

      // Front Racing Splitter
      const splitter = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 1.2), trimMat);
      splitter.position.set(0, 0.35, 2.8);
      group.add(splitter);

      // Rear Downforce GT Wing
      const wing = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.08, 0.6), trimMat);
      wing.position.set(0, 2.3, -2.8);
      group.add(wing);

      const pylon1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4), chromeMat);
      pylon1.position.set(-0.9, 2.05, -2.8);
      const pylon2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4), chromeMat);
      pylon2.position.set(0.9, 2.05, -2.8);
      group.add(pylon1, pylon2);

      // Tinted Cockpit & Windows
      const cockpit = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.65, 4.2), glassMat);
      cockpit.position.set(0, 1.45, 0.4);
      group.add(cockpit);

      // Hood Vents
      const vent = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.8), trimMat);
      vent.position.set(0, 1.92, 1.8);
      group.add(vent);

      // Neon Underglow
      const underglow = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.05, 5.0), neonMat);
      underglow.position.set(0, 0.25, 0);
      group.add(underglow);
    } else if (type === 'luxury') {
      // Royale Imperial Triple-Axle Bus
      const bodyGeo = new THREE.BoxGeometry(2.4, 1.6, 7.2);
      const mainBody = new THREE.Mesh(bodyGeo, bodyMat);
      mainBody.position.y = 1.5;
      mainBody.castShadow = true;
      group.add(mainBody);

      // Dual Panoramic Sunroof
      const sunroof = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.05, 5.2), glassMat);
      sunroof.position.set(0, 2.32, -0.4);
      group.add(sunroof);

      // Chrome Beltline Trim
      const chromeTrim = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.08, 7.3), chromeMat);
      chromeTrim.position.set(0, 1.2, 0);
      group.add(chromeTrim);

      // Windows
      const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(2.42, 0.8, 6.0), glassMat);
      sideGlass.position.set(0, 1.7, -0.2);
      group.add(sideGlass);
    } else if (type === 'electric') {
      // Volt-Runner Unibody EV
      const bodyGeo = new THREE.BoxGeometry(2.35, 1.5, 5.9);
      const mainBody = new THREE.Mesh(bodyGeo, bodyMat);
      mainBody.position.y = 1.45;
      mainBody.castShadow = true;
      group.add(mainBody);

      // Roof Solar Panels
      const solarMat = new THREE.MeshStandardMaterial({
        color: 0x112244,
        metalness: 0.9,
        roughness: 0.1
      });
      const solarPanel = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.04, 4.4), solarMat);
      solarPanel.position.set(0, 2.22, 0);
      group.add(solarPanel);

      // Windows
      const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(2.38, 0.7, 4.6), glassMat);
      sideGlass.position.set(0, 1.6, 0.2);
      group.add(sideGlass);

      // Eco Glow Strip
      const ecoStrip = new THREE.Mesh(new THREE.BoxGeometry(2.38, 0.08, 5.9), neonMat);
      ecoStrip.position.set(0, 0.95, 0);
      group.add(ecoStrip);
    } else {
      // Sentinel Heavy-Duty College Bus
      const bodyGeo = new THREE.BoxGeometry(2.4, 1.5, 6.0);
      const mainBody = new THREE.Mesh(bodyGeo, bodyMat);
      mainBody.position.y = 1.45;
      mainBody.castShadow = true;
      group.add(mainBody);

      // Heavy Front Bumper
      const bumper = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.3, 0.5), trimMat);
      bumper.position.set(0, 0.65, 3.1);
      group.add(bumper);

      // Side Guard Rub Rails
      const railL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 5.6), trimMat);
      railL.position.set(-1.24, 1.1, 0);
      const railR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 5.6), trimMat);
      railR.position.set(1.24, 1.1, 0);
      group.add(railL, railR);

      // Emergency Roof Flasher Beacons
      const flasherMat = new THREE.MeshStandardMaterial({
        color: 0xff8800,
        emissive: 0xff8800,
        emissiveIntensity: 2
      });
      const beaconL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.15), flasherMat);
      beaconL.position.set(-0.9, 2.25, 2.6);
      const beaconR = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.15), flasherMat);
      beaconR.position.set(0.9, 2.25, 2.6);
      group.add(beaconL, beaconR);

      // Windows
      const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(2.42, 0.7, 4.6), glassMat);
      sideGlass.position.set(0, 1.6, 0.2);
      group.add(sideGlass);
    }

    // High-tech Headlights on all buses
    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 3
    });
    const hlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.08), headlightMat);
    hlLeft.position.set(-0.85, 0.95, 3.02);
    const hlRight = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.08), headlightMat);
    hlRight.position.set(0.85, 0.95, 3.02);
    group.add(hlLeft, hlRight);

    return group;
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x090a0f, 0.035);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      100
    );
    cameraRef.current = camera;
    camera.position.set(0, 3.5, cameraDistance.current);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    mountRef.current.replaceChildren(renderer.domElement);

    // 4. Showroom Turn-table Floor
    const floorGeo = new THREE.CylinderGeometry(5.2, 5.2, 0.3, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x121522,
      metalness: 0.85,
      roughness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.15;
    floor.receiveShadow = true;
    scene.add(floor);

    // Neon Ring Around Pedestal
    const ringGeo = new THREE.TorusGeometry(5.22, 0.04, 16, 64);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(activeColor) });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.01;
    scene.add(ring);

    // Grid on Ground
    const gridHelper = new THREE.GridHelper(24, 24, 0x00f3ff, 0x181e30);
    gridHelper.position.y = -0.3;
    scene.add(gridHelper);

    // 5. Lighting (Cinematic Studio Rig)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const mainSpot = new THREE.SpotLight(0xffffff, 3.5);
    mainSpot.position.set(5, 9, 6);
    mainSpot.angle = Math.PI / 4;
    mainSpot.penumbra = 0.6;
    mainSpot.castShadow = true;
    mainSpot.shadow.mapSize.width = 1024;
    mainSpot.shadow.mapSize.height = 1024;
    scene.add(mainSpot);

    const rimLightBlue = new THREE.PointLight(0x0066ff, 3, 15);
    rimLightBlue.position.set(-6, 3, -5);
    scene.add(rimLightBlue);

    const rimLightCyan = new THREE.PointLight(0x00f3ff, 2.5, 15);
    rimLightCyan.position.set(6, 2, -4);
    scene.add(rimLightCyan);

    // 6. Bus Model Initialization
    const busModel = constructBusModel(currentAvatarType, activeColor, paintFinish);
    busGroupRef.current = busModel;
    scene.add(busModel);

    // 7. Animation Loop
    let animationFrameId: number;
    let autoRotateAngle = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth interpolation for camera controls
      if (!isDraggingRef.current) {
        autoRotateAngle += 0.003;
      }

      cameraCurrentRotation.current.x += (cameraTargetRotation.current.x - cameraCurrentRotation.current.x) * 0.08;
      cameraCurrentRotation.current.y += (cameraTargetRotation.current.y - cameraCurrentRotation.current.y) * 0.08;

      const rotY = cameraCurrentRotation.current.y + autoRotateAngle;
      const rotX = cameraCurrentRotation.current.x;

      camera.position.x = Math.sin(rotY) * Math.cos(rotX) * cameraDistance.current;
      camera.position.y = Math.max(0.8, Math.sin(rotX) * cameraDistance.current + 1.2);
      camera.position.z = Math.cos(rotY) * Math.cos(rotX) * cameraDistance.current;
      camera.lookAt(0, 1.2, 0);

      // Hover breathing effect on pedestal
      if (busGroupRef.current) {
        busGroupRef.current.position.y = Math.sin(Date.now() * 0.002) * 0.04;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Event Handlers
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Bus Model when type, color or finish changes
  useEffect(() => {
    if (!sceneRef.current) return;

    if (busGroupRef.current) {
      sceneRef.current.remove(busGroupRef.current);
    }

    const newModel = constructBusModel(currentAvatarType, activeColor, paintFinish);
    busGroupRef.current = newModel;
    sceneRef.current.add(newModel);
  }, [currentAvatarType, activeColor, paintFinish]);

  // Touch and Mouse Orbit Controls
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;

    cameraTargetRotation.current.y -= deltaX * 0.008;
    cameraTargetRotation.current.x = Math.max(
      -0.2,
      Math.min(0.8, cameraTargetRotation.current.x + deltaY * 0.008)
    );

    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    cameraDistance.current = Math.max(5.5, Math.min(14, cameraDistance.current + e.deltaY * 0.008));
  };

  const handleEquipBus = () => {
    playUiClick();
    updateAvatar(currentAvatarType, activeColor);
    setEquippedSuccess(true);
    setTimeout(() => setEquippedSuccess(false), 3000);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full w-full gap-4 p-2 lg:p-4 text-white overflow-y-auto">
      {/* 3D Canvas Viewport */}
      <div className="relative flex-1 min-h-[420px] lg:min-h-[580px] rounded-2xl overflow-hidden glass-panel-glow border border-t18-border/60">
        <div
          ref={mountRef}
          className="w-full h-full cursor-grab active:cursor-grabbing select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={handleWheel}
        />

        {/* Viewport Overlay HUD */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-t18-blue/20 text-t18-cyan border border-t18-cyan/40">
              ASPHALT 3D GARAGE
            </span>
            <span className="text-xs text-white/50 font-mono tracking-wider">
              ROTATION 360° | ORBIT PBR ENGINE
            </span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-black font-gaming tracking-wide uppercase text-white drop-shadow-md">
            {activeAvatarConfig.name}
          </h2>
          <p className="text-xs text-t18-cyan font-mono">{activeAvatarConfig.tagline}</p>
        </div>

        {/* Controls Hint */}
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[11px] text-white/70">
          <RotateCcw className="w-3.5 h-3.5 text-t18-cyan animate-spin" style={{ animationDuration: '6s' }} />
          <span>Drag to orbit 360° · Scroll to Zoom</span>
        </div>

        {/* Quick Equip Status Pill */}
        {selectedAvatarType === currentAvatarType && (
          <div className="absolute top-4 right-4 z-10 bg-emerald-500/20 border border-emerald-500/60 px-3 py-1 rounded-full flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>ACTIVE ON LIVE TRACKING MAP</span>
          </div>
        )}
      </div>

      {/* Customization & Stats Panel */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        {/* Avatar Selector Carousel */}
        <div className="glass-panel p-4 rounded-xl border border-t18-border/60">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-t18-cyan flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Select Avatar Archetype
            </span>
            <span className="text-[11px] font-mono text-white/40">5 MODELS</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
            {BUS_AVATARS.map(avatar => {
              const isSelected = avatar.type === currentAvatarType;
              return (
                <button
                  key={avatar.type}
                  onClick={() => {
                    playUiClick();
                    setCurrentAvatarType(avatar.type);
                  }}
                  className={`p-2.5 rounded-lg text-left transition-all border ${
                    isSelected
                      ? 'bg-t18-blue/30 border-t18-cyan shadow-glow-cyan text-white'
                      : 'bg-t18-surface/80 border-white/5 hover:border-white/20 text-white/70'
                  }`}
                >
                  <div className="text-xs font-bold uppercase tracking-wide truncate">{avatar.name}</div>
                  <div className="text-[10px] text-t18-cyan/80 font-mono mt-0.5">{avatar.tagline}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Paint & Finish Customizer */}
        <div className="glass-panel p-4 rounded-xl border border-t18-border/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-t18-cyan flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> High-Gloss Custom Paint
            </span>
            <span className="text-[11px] font-mono text-white/40">{activeColor.toUpperCase()}</span>
          </div>

          <div className="flex items-center gap-2.5 my-2 overflow-x-auto py-1">
            {PAINT_COLORS.map(c => (
              <button
                key={c.hex}
                onClick={() => {
                  playUiClick();
                  setActiveColor(c.hex);
                }}
                className={`w-7 h-7 rounded-full flex-shrink-0 transition-transform ${
                  activeColor === c.hex
                    ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-black'
                    : 'hover:scale-110 opacity-80'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>

          {/* Finish selector */}
          <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-white/5">
            {(['metallic', 'matte', 'carbon'] as const).map(finish => (
              <button
                key={finish}
                onClick={() => {
                  playUiClick();
                  setPaintFinish(finish);
                }}
                className={`py-1 text-center rounded text-[11px] font-mono uppercase tracking-wider transition-colors ${
                  paintFinish === finish
                    ? 'bg-t18-cyan text-black font-bold'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {finish}
              </button>
            ))}
          </div>
        </div>

        {/* Performance Radar Specs */}
        <div className="glass-panel p-4 rounded-xl border border-t18-border/60">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-t18-cyan flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Performance Telemetry
            </span>
            <span className="text-[11px] font-mono text-emerald-400">CLASS S+</span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            {/* Speed */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="flex items-center gap-1 text-white/70">
                  <Gauge className="w-3 h-3 text-t18-cyan" /> Top Speed
                </span>
                <span className="text-t18-cyan font-bold">{activeAvatarConfig.speedRating} / 100</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-t18-cyan h-full rounded-full transition-all duration-500"
                  style={{ width: `${activeAvatarConfig.speedRating}%` }}
                />
              </div>
            </div>

            {/* Armor */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="flex items-center gap-1 text-white/70">
                  <Shield className="w-3 h-3 text-amber-400" /> Chassis Armor
                </span>
                <span className="text-amber-400 font-bold">{activeAvatarConfig.armorRating} / 100</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${activeAvatarConfig.armorRating}%` }}
                />
              </div>
            </div>

            {/* Aero */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="flex items-center gap-1 text-white/70">
                  <Wind className="w-3 h-3 text-fuchsia-400" /> Aerodynamics
                </span>
                <span className="text-fuchsia-400 font-bold">{activeAvatarConfig.aeroRating} / 100</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-fuchsia-600 to-fuchsia-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${activeAvatarConfig.aeroRating}%` }}
                />
              </div>
            </div>

            {/* Comfort */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="flex items-center gap-1 text-white/70">
                  <Armchair className="w-3 h-3 text-indigo-400" /> Passenger Comfort
                </span>
                <span className="text-indigo-400 font-bold">{activeAvatarConfig.comfortRating} / 100</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${activeAvatarConfig.comfortRating}%` }}
                />
              </div>
            </div>

            {/* Eco */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="flex items-center gap-1 text-white/70">
                  <Leaf className="w-3 h-3 text-emerald-400" /> Zero Emission Rating
                </span>
                <span className="text-emerald-400 font-bold">{activeAvatarConfig.ecoRating} / 100</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${activeAvatarConfig.ecoRating}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Equip Button */}
        <button
          onClick={handleEquipBus}
          className="w-full py-3.5 px-4 rounded-xl font-gaming font-black uppercase tracking-wider text-sm bg-gradient-to-r from-t18-blue via-t18-cyan to-t18-blue bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-black shadow-glow-cyan flex items-center justify-center gap-2 active:scale-95"
        >
          <CheckCircle2 className="w-4 h-4 text-black" />
          <span>Equip On Live Tracking Map</span>
        </button>

        {equippedSuccess && (
          <div className="text-center text-xs text-emerald-400 font-mono animate-bounce">
            ✨ Avatar successfully synchronized with Live GPS Map!
          </div>
        )}
      </div>
    </div>
  );
};
