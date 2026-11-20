import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { RACING_CARS } from '../../data/mockData';
import { RacingCarConfig } from '../../types';
import { useAppAudio } from '../../context/AudioContext';
import {
  Zap,
  RotateCcw,
  Play,
  Pause,
  Trophy,
  Flag,
  Flame,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

export const RacingArena3D: React.FC = () => {
  const {
    playUiClick,
    playNitroSound,
    playEngineRev,
    playCheckpointSound,
    playVictorySound
  } = useAppAudio();

  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedCar, setSelectedCar] = useState<RacingCarConfig>(RACING_CARS[0]);
  const [gameState, setGameState] = useState<'menu' | 'countdown' | 'racing' | 'paused' | 'finished'>('menu');
  const [countdown, setCountdown] = useState<number>(3);
  const [speedKmh, setSpeedKmh] = useState<number>(0);
  const [nitro, setNitro] = useState<number>(100);
  const [currentLap, setCurrentLap] = useState<number>(1);
  const [lapTime, setLapTime] = useState<number>(0);
  const [bestLap, setBestLap] = useState<number | null>(null);
  const [position, setPosition] = useState<number>(1);

  // References for Three.js and Physics
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const playerCarRef = useRef<THREE.Group | null>(null);
  const aiCarsRef = useRef<Array<{ group: THREE.Group; progress: number; speed: number; laneOffset: number }>>([]);

  // Physics state
  const playerState = useRef({
    x: 0,
    z: 0,
    angle: 0,
    speed: 0,
    maxSpeed: 320,
    accel: 0.8,
    brake: 1.2,
    steering: 0,
    nitroActive: false,
    trackProgress: 0,
    currentLap: 1
  });

  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const timerIntervalRef = useRef<number | null>(null);

  // Track Curve Waypoints for the 3D Circuit
  const trackCurve = useRef(
    new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0, 0, 60),
        new THREE.Vector3(60, 0, 75),
        new THREE.Vector3(120, 0, 45),
        new THREE.Vector3(140, 0, -30),
        new THREE.Vector3(100, 0, -90),
        new THREE.Vector3(20, 0, -110),
        new THREE.Vector3(-60, 0, -90),
        new THREE.Vector3(-120, 0, -40),
        new THREE.Vector3(-130, 0, 20),
        new THREE.Vector3(-80, 0, 65)
      ],
      true
    )
  );

  // Construct Sports Car 3D Mesh
  const buildSportsCar = (colorHex: string, hasSpoiler = true) => {
    const carGroup = new THREE.Group();

    // Body material with clearcoat metallic finish
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colorHex),
      metalness: 0.9,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });

    const blackTrim = new THREE.MeshStandardMaterial({ color: 0x0c0e14, metalness: 0.9, roughness: 0.2 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x050c18,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.6,
      transparent: true,
      opacity: 0.9
    });

    // Lower Chassis
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.45, 4.4), bodyMat);
    lowerBody.position.y = 0.35;
    lowerBody.castShadow = true;
    carGroup.add(lowerBody);

    // Aerodynamic Cockpit Cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.45, 2.2), glassMat);
    cabin.position.set(0, 0.72, -0.2);
    carGroup.add(cabin);

    // Front Slanted Hood
    const hood = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.2, 4), bodyMat);
    hood.rotation.x = -Math.PI / 2;
    hood.rotation.y = Math.PI / 4;
    hood.position.set(0, 0.4, 1.6);
    carGroup.add(hood);

    // Front Splitter
    const splitter = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.08, 0.8), blackTrim);
    splitter.position.set(0, 0.16, 2.1);
    carGroup.add(splitter);

    // Rear Diffuser & GT Wing
    if (hasSpoiler) {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.06, 0.4), blackTrim);
      wing.position.set(0, 0.95, -2.0);
      carGroup.add(wing);

      const strutL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.1), blackTrim);
      strutL.position.set(-0.7, 0.75, -2.0);
      const strutR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.35, 0.1), blackTrim);
      strutR.position.set(0.7, 0.75, -2.0);
      carGroup.add(strutL, strutR);
    }

    // Wheels
    const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.32, 20);
    tireGeo.rotateZ(Math.PI / 2);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x111116, roughness: 0.8 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xddeeff, metalness: 0.9, roughness: 0.1 });

    const makeWheel = (x: number, y: number, z: number) => {
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.position.set(x, y, z);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.34, 12), rimMat);
      rim.rotation.z = Math.PI / 2;
      tire.add(rim);
      carGroup.add(tire);
    };

    makeWheel(-1.05, 0.38, 1.35);
    makeWheel(1.05, 0.38, 1.35);
    makeWheel(-1.05, 0.38, -1.35);
    makeWheel(1.05, 0.38, -1.35);

    // Headlights
    const hlMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.08, 0.05), hlMat);
    hlL.position.set(-0.7, 0.42, 2.18);
    const hlR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.08, 0.05), hlMat);
    hlR.position.set(0.7, 0.42, 2.18);
    carGroup.add(hlL, hlR);

    // Tail Brake Lights
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
    const tailL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.05), tailMat);
    tailL.position.set(-0.65, 0.5, -2.18);
    const tailR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.05), tailMat);
    tailR.position.set(0.65, 0.5, -2.18);
    carGroup.add(tailL, tailR);

    // Nitro Thruster Nozzles
    const thrusterMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const thrusterL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.15, 12), thrusterMat);
    thrusterL.rotation.x = Math.PI / 2;
    thrusterL.position.set(-0.25, 0.35, -2.2);
    const thrusterR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.15, 12), thrusterMat);
    thrusterR.rotation.x = Math.PI / 2;
    thrusterR.position.set(0.25, 0.35, -2.2);
    carGroup.add(thrusterL, thrusterR);

    return carGroup;
  };

  // Build the 3D Track
  const buildTrack = (scene: THREE.Scene) => {
    const curve = trackCurve.current;
    const points = curve.getSpacedPoints(160);

    // Track Tarmac Ribbon
    const shape = new THREE.Shape();
    shape.moveTo(-6.5, 0);
    shape.lineTo(6.5, 0);

    const trackExtrudeSettings = {
      steps: 160,
      bevelEnabled: false,
      extrudePath: curve
    };

    const trackGeo = new THREE.ExtrudeGeometry(shape, trackExtrudeSettings);
    const trackMat = new THREE.MeshStandardMaterial({
      color: 0x141822,
      roughness: 0.8,
      metalness: 0.2
    });
    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.receiveShadow = true;
    scene.add(trackMesh);

    // Neon Curbs & Barriers
    const barrierMatL = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
    const barrierMatR = new THREE.MeshBasicMaterial({ color: 0x0066ff });

    points.forEach((pt, i) => {
      const tangent = curve.getTangent(i / points.length).normalize();
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      // Left Barrier Post
      const postL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 1.2), barrierMatL);
      postL.position.copy(pt).add(normal.clone().multiplyScalar(6.6));
      postL.position.y += 0.3;
      scene.add(postL);

      // Right Barrier Post
      const postR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 1.2), barrierMatR);
      postR.position.copy(pt).add(normal.clone().multiplyScalar(-6.6));
      postR.position.y += 0.3;
      scene.add(postR);

      // Start/Finish Gantry at Point 0
      if (i === 0) {
        const arch = new THREE.Mesh(new THREE.BoxGeometry(15, 1.2, 1.5), new THREE.MeshStandardMaterial({ color: 0xffaa00 }));
        arch.position.copy(pt);
        arch.position.y = 5.5;
        scene.add(arch);

        const pillarL = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 6), new THREE.MeshStandardMaterial({ color: 0x333333 }));
        pillarL.position.copy(pt).add(normal.clone().multiplyScalar(7.2));
        pillarL.position.y = 3;
        const pillarR = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 6), new THREE.MeshStandardMaterial({ color: 0x333333 }));
        pillarR.position.copy(pt).add(normal.clone().multiplyScalar(-7.2));
        pillarR.position.y = 3;
        scene.add(pillarL, pillarR);
      }
    });

    // Outer Terrain Grid & Ambient Lights
    const floorGrid = new THREE.GridHelper(400, 80, 0x00f3ff, 0x111625);
    floorGrid.position.y = -0.1;
    scene.add(floorGrid);
  };

  // Initialize Three.js Game Environment
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x090a0f, 0.015);

    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      500
    );
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    mountRef.current.replaceChildren(renderer.domElement);

    // Track
    buildTrack(scene);

    // Player Car
    const playerCar = buildSportsCar(selectedCar.color);
    playerCarRef.current = playerCar;
    scene.add(playerCar);

    // 2 AI Competitor Cars
    const ai1 = {
      group: buildSportsCar('#ff0055', true),
      progress: 0.04,
      speed: 0.0016,
      laneOffset: 2.2
    };
    const ai2 = {
      group: buildSportsCar('#ffd700', false),
      progress: 0.08,
      speed: 0.0015,
      laneOffset: -2.2
    };
    aiCarsRef.current = [ai1, ai2];
    scene.add(ai1.group, ai2.group);

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x090a0f, 1.2);
    scene.add(hemiLight);

    const sun = new THREE.DirectionalLight(0xffffff, 2.5);
    sun.position.set(60, 100, 40);
    sun.castShadow = true;
    scene.add(sun);

    // Initial positioning
    const initialPos = trackCurve.current.getPointAt(0);
    playerCar.position.copy(initialPos);
    camera.position.set(initialPos.x, initialPos.y + 4, initialPos.z + 9);
    camera.lookAt(initialPos);

    // Keyboard Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
      if (e.key === ' ' || e.key.toLowerCase() === 'n') {
        playerState.current.nitroActive = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
      if (e.key === ' ' || e.key.toLowerCase() === 'n') {
        playerState.current.nitroActive = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Main Game Engine Loop
    let animId: number;

    const gameLoop = () => {
      animId = requestAnimationFrame(gameLoop);

      const pState = playerState.current;
      const keys = keysPressed.current;

      if (gameState === 'racing') {
        // Acceleration & Braking
        const isAccelerating = keys['w'] || keys['arrowup'];
        const isBraking = keys['s'] || keys['arrowdown'];
        const isSteeringLeft = keys['a'] || keys['arrowleft'];
        const isSteeringRight = keys['d'] || keys['arrowright'];

        // Speed calculation
        const maxCurrentSpeed = pState.nitroActive && nitro > 5 ? selectedCar.topSpeedKmh : selectedCar.topSpeedKmh * 0.85;

        if (isAccelerating) {
          pState.speed = Math.min(maxCurrentSpeed, pState.speed + (pState.nitroActive ? 2.5 : 1.2));
        } else if (isBraking) {
          pState.speed = Math.max(0, pState.speed - 2.8);
        } else {
          // Coasting friction
          pState.speed = Math.max(0, pState.speed - 0.5);
        }

        // Nitro Depletion / Regen
        if (pState.nitroActive && pState.speed > 80 && nitro > 0) {
          setNitro(prev => Math.max(0, prev - 0.7));
          if (cameraRef.current) {
            cameraRef.current.fov = 72; // Warp FOV during nitro
            cameraRef.current.updateProjectionMatrix();
          }
        } else {
          setNitro(prev => Math.min(100, prev + 0.15));
          if (cameraRef.current && cameraRef.current.fov > 60) {
            cameraRef.current.fov = Math.max(60, cameraRef.current.fov - 0.5);
            cameraRef.current.updateProjectionMatrix();
          }
        }

        // Advance along spline track
        const deltaProgress = (pState.speed / maxCurrentSpeed) * 0.0022;
        pState.trackProgress = (pState.trackProgress + deltaProgress) % 1.0;

        // Steering lateral offset
        if (isSteeringLeft) {
          pState.steering = Math.max(-4.2, pState.steering - 0.18);
        } else if (isSteeringRight) {
          pState.steering = Math.min(4.2, pState.steering + 0.18);
        } else {
          pState.steering *= 0.92;
        }

        // Lap detection
        if (pState.trackProgress < 0.05 && deltaProgress > 0) {
          // crossed finish line
          if (pState.currentLap < 3) {
            pState.currentLap += 1;
            setCurrentLap(pState.currentLap);
            playCheckpointSound();
          } else if (pState.currentLap >= 3) {
            // Victory!
            setGameState('finished');
            playVictorySound();
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 }
            });
          }
        }

        // Position on Spline
        const currentPt = trackCurve.current.getPointAt(pState.trackProgress);
        const nextPt = trackCurve.current.getPointAt((pState.trackProgress + 0.01) % 1.0);
        const tangent = trackCurve.current.getTangentAt(pState.trackProgress).normalize();
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

        const carTargetPos = currentPt.clone().add(normal.clone().multiplyScalar(pState.steering));
        carTargetPos.y = 0;

        if (playerCarRef.current) {
          playerCarRef.current.position.copy(carTargetPos);
          playerCarRef.current.lookAt(nextPt.clone().add(normal.clone().multiplyScalar(pState.steering)));

          // Subtle body roll when steering
          playerCarRef.current.rotation.z = -pState.steering * 0.04;
        }

        // Third-Person Chase Camera
        if (cameraRef.current) {
          const camBack = tangent.clone().multiplyScalar(-9.5);
          const camTarget = carTargetPos.clone().add(camBack);
          camTarget.y = 4.2;

          cameraRef.current.position.lerp(camTarget, 0.15);
          cameraRef.current.lookAt(carTargetPos.x, carTargetPos.y + 1.2, carTargetPos.z);
        }

        // AI Cars Progression
        aiCarsRef.current.forEach((ai) => {
          ai.progress = (ai.progress + ai.speed) % 1.0;
          const aiPt = trackCurve.current.getPointAt(ai.progress);
          const aiTangent = trackCurve.current.getTangentAt(ai.progress).normalize();
          const aiNormal = new THREE.Vector3(-aiTangent.z, 0, aiTangent.x).normalize();

          ai.group.position.copy(aiPt).add(aiNormal.clone().multiplyScalar(ai.laneOffset));
          ai.group.position.y = 0;
          ai.group.lookAt(trackCurve.current.getPointAt((ai.progress + 0.01) % 1.0));
        });

        // Determine player race ranking (1st, 2nd, 3rd)
        let rank = 1;
        aiCarsRef.current.forEach(ai => {
          if (ai.progress > pState.trackProgress) rank++;
        });
        setPosition(rank);

        setSpeedKmh(Math.round(pState.speed));
      } else {
        // Idle camera sweep in menu or finished state
        const time = Date.now() * 0.0008;
        const currentPt = trackCurve.current.getPointAt(0);
        if (cameraRef.current) {
          cameraRef.current.position.x = currentPt.x + Math.sin(time) * 12;
          cameraRef.current.position.y = currentPt.y + 5;
          cameraRef.current.position.z = currentPt.z + Math.cos(time) * 12;
          cameraRef.current.lookAt(currentPt);
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    gameLoop();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, [selectedCar, gameState]);

  // Lap timer
  useEffect(() => {
    if (gameState === 'racing') {
      timerIntervalRef.current = window.setInterval(() => {
        setLapTime(prev => prev + 0.1);
      }, 100);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [gameState]);

  // Start Race with Countdown
  const startRaceCountdown = () => {
    playUiClick();
    setGameState('countdown');
    setCountdown(3);
    playerState.current.speed = 0;
    playerState.current.trackProgress = 0;
    playerState.current.currentLap = 1;
    setCurrentLap(1);
    setLapTime(0);

    const countTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countTimer);
          setGameState('racing');
          playEngineRev();
          return 0;
        }
        playUiClick();
        return prev - 1;
      });
    }, 1000);
  };

  const handleNitroTouch = () => {
    playerState.current.nitroActive = true;
    playNitroSound();
    setTimeout(() => {
      playerState.current.nitroActive = false;
    }, 1500);
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[580px] rounded-2xl overflow-hidden glass-panel-glow border border-t18-border/60 flex flex-col">
      {/* 3D Viewport */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Top HUD: Speedometer, Lap, Position, Nitro */}
      <div className="relative z-10 p-3 lg:p-4 flex items-center justify-between pointer-events-none select-none">
        {/* Lap & Time HUD */}
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10">
          <div className="text-center">
            <span className="text-[10px] text-white/50 uppercase font-mono block">LAP</span>
            <span className="text-xl font-black font-gaming text-t18-cyan">{currentLap} / 3</span>
          </div>
          <div className="w-px h-7 bg-white/10" />
          <div className="text-center">
            <span className="text-[10px] text-white/50 uppercase font-mono block">TIME</span>
            <span className="text-lg font-mono font-bold text-white">{lapTime.toFixed(1)}s</span>
          </div>
        </div>

        {/* Position Badge */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-t18-blue/80 to-t18-cyan/80 px-4 py-1.5 rounded-xl border border-white/20 shadow-glow-cyan text-black">
          <Trophy className="w-4 h-4 text-black" />
          <span className="text-sm font-bold font-gaming uppercase tracking-wider">POS</span>
          <span className="text-2xl font-black font-gaming">{position}</span>
          <span className="text-xs font-bold font-mono">/ 3</span>
        </div>

        {/* Speedometer & Nitro HUD */}
        <div className="flex items-center gap-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
          <div className="text-right">
            <span className="text-[10px] text-white/50 uppercase font-mono block">KM / H</span>
            <span className="text-3xl font-black font-gaming tracking-tight text-white drop-shadow-md">
              {speedKmh}
            </span>
          </div>

          <div className="w-20 lg:w-28 flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-mono text-t18-cyan">
              <span className="flex items-center gap-0.5">
                <Flame className="w-3 h-3 text-t18-cyan" /> NITRO
              </span>
              <span>{Math.round(nitro)}%</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 via-t18-cyan to-white h-full transition-all duration-150"
                style={{ width: `${nitro}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Countdown Overlay */}
      {gameState === 'countdown' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm select-none">
          <div className="text-center animate-ping">
            <span className="text-8xl lg:text-9xl font-black font-gaming text-t18-cyan drop-shadow-glow">
              {countdown > 0 ? countdown : 'GO!'}
            </span>
          </div>
        </div>
      )}

      {/* Menu / Car Selection Screen */}
      {gameState === 'menu' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="max-w-lg w-full glass-panel p-6 rounded-2xl border border-t18-cyan/40 shadow-glow-cyan text-center">
            <span className="px-3 py-1 rounded text-xs font-bold uppercase tracking-widest bg-t18-blue/30 text-t18-cyan border border-t18-cyan/50">
              ASPHALT RACING ARENA
            </span>
            <h2 className="text-3xl font-black font-gaming uppercase tracking-wider text-white mt-2 mb-1">
              Select Your Racing Machine
            </h2>
            <p className="text-xs text-white/60 font-mono mb-5">
              High-Speed Three.js Circuit · Pure Arcade Physics · AI Challengers
            </p>

            {/* Car Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6">
              {RACING_CARS.map(car => (
                <button
                  key={car.id}
                  onClick={() => {
                    playUiClick();
                    setSelectedCar(car);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedCar.id === car.id
                      ? 'bg-t18-blue/30 border-t18-cyan shadow-glow-cyan text-white'
                      : 'bg-white/5 border-white/10 hover:border-white/30 text-white/70'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full mb-2"
                    style={{ backgroundColor: car.color }}
                  />
                  <div className="text-xs font-bold uppercase font-gaming truncate">{car.name}</div>
                  <div className="text-[10px] text-t18-cyan font-mono mt-0.5">{car.topSpeedKmh} KM/H</div>
                </button>
              ))}
            </div>

            {/* Controls Guide */}
            <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-xs font-mono text-white/70 mb-5 text-left flex items-center justify-between">
              <div>
                <span className="text-t18-cyan font-bold block mb-0.5">CONTROLS:</span>
                <span>W / ↑ Accel · S / ↓ Brake · A/D Steer</span>
              </div>
              <div>
                <span className="text-t18-cyan font-bold block mb-0.5">BOOST:</span>
                <span>SPACE / N for Nitro Blast</span>
              </div>
            </div>

            <button
              onClick={startRaceCountdown}
              className="w-full py-4 rounded-xl font-gaming font-black uppercase text-base tracking-widest bg-gradient-to-r from-t18-blue via-t18-cyan to-t18-blue text-black shadow-glow-cyan hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-black" />
              <span>LAUNCH RACE</span>
            </button>
          </div>
        </div>
      )}

      {/* Finished / Victory Podium */}
      {gameState === 'finished' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-yellow-400/50 shadow-glow-cyan text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto animate-bounce mb-2" />
            <span className="text-xs font-bold uppercase tracking-widest text-yellow-400 font-mono">
              GRAND PRIX FINISH
            </span>
            <h2 className="text-4xl font-black font-gaming uppercase tracking-wider text-white mt-1 mb-2">
              {position === 1 ? 'VICTORY - 1ST PLACE!' : `${position}ND PLACE FINISH`}
            </h2>
            <p className="text-xs text-white/70 font-mono mb-4">
              All 3 Laps completed in {lapTime.toFixed(1)} seconds!
            </p>

            <div className="bg-white/5 p-3 rounded-xl border border-white/10 grid grid-cols-2 gap-2 text-xs font-mono mb-5">
              <div>
                <span className="text-white/50 block text-[10px]">TOTAL TIME</span>
                <span className="text-white font-bold">{lapTime.toFixed(1)}s</span>
              </div>
              <div>
                <span className="text-white/50 block text-[10px]">VEHICLE</span>
                <span className="text-t18-cyan font-bold truncate">{selectedCar.name}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={startRaceCountdown}
                className="flex-1 py-3 rounded-xl font-gaming font-bold uppercase text-xs bg-t18-cyan text-black tracking-wider shadow-glow-cyan flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> Restart Race
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="flex-1 py-3 rounded-xl font-gaming font-bold uppercase text-xs bg-white/10 hover:bg-white/20 text-white tracking-wider border border-white/20"
              >
                Change Car
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile On-Screen Touch Driving Controls (Responsive overlay for touch devices) */}
      {gameState === 'racing' && (
        <div className="mt-auto relative z-10 p-3 flex justify-between items-end pointer-events-none select-none">
          {/* Steer Left / Right Buttons */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onPointerDown={() => { keysPressed.current['arrowleft'] = true; }}
              onPointerUp={() => { keysPressed.current['arrowleft'] = false; }}
              className="w-14 h-14 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:bg-t18-cyan active:text-black shadow-lg"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button
              onPointerDown={() => { keysPressed.current['arrowright'] = true; }}
              onPointerUp={() => { keysPressed.current['arrowright'] = false; }}
              className="w-14 h-14 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:bg-t18-cyan active:text-black shadow-lg"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          {/* Nitro Blast & Gas / Brake */}
          <div className="flex items-center gap-3 pointer-events-auto">
            <button
              onClick={handleNitroTouch}
              className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-t18-cyan text-black font-black font-gaming flex flex-col items-center justify-center border border-white/30 shadow-glow-cyan active:scale-95"
            >
              <Flame className="w-5 h-5 fill-black" />
              <span className="text-[9px] tracking-tighter">NITRO</span>
            </button>

            <button
              onPointerDown={() => { keysPressed.current['arrowdown'] = true; }}
              onPointerUp={() => { keysPressed.current['arrowdown'] = false; }}
              className="w-12 h-12 rounded-2xl bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-red-400 active:bg-red-500 active:text-white"
            >
              <ArrowDown className="w-5 h-5" />
            </button>

            <button
              onPointerDown={() => { keysPressed.current['arrowup'] = true; }}
              onPointerUp={() => { keysPressed.current['arrowup'] = false; }}
              className="w-16 h-16 rounded-2xl bg-emerald-500 text-black font-black flex items-center justify-center shadow-lg active:scale-95"
            >
              <ArrowUp className="w-7 h-7" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
