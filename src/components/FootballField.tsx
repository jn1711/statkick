import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Grass shader material
function GrassField() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [spotPosition, setSpotPosition] = useState(() => new THREE.Vector3(0.5, 0.5, 0));

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFieldColor1: { value: new THREE.Color("#1a5c1a") },
      uFieldColor2: { value: new THREE.Color("#144214") },
      uLineColor: { value: new THREE.Color("rgba(255,255,255,0.85)") },
      uCenterSpot: { value: spotPosition },
      uPulse: { value: 1.0 },
    }),
    []
  );

  // Move spot every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newPos = new THREE.Vector3(
        0.2 + Math.random() * 0.6,
        0.2 + Math.random() * 0.6,
        0
      );
      setSpotPosition(newPos);
      uniforms.uCenterSpot.value.copy(newPos);
    }, 2000);
    return () => clearInterval(interval);
  }, [uniforms]);

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uFieldColor1;
    uniform vec3 uFieldColor2;
    uniform vec3 uLineColor;
    uniform vec3 uCenterSpot;
    uniform float uPulse;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      // Procedural grass
      float noise = fract(sin(dot(vUv * 80.0, vec2(12.9898, 78.233))) * 43758.5453);
      vec3 grassColor = mix(uFieldColor1, uFieldColor2, noise);
      
      // Field markings
      vec2 uv = vUv * 2.0 - 1.0;
      float aspect = 1.5;
      uv.x *= aspect;
      
      float fieldDist = max(
        max(abs(uv.x) - aspect, abs(uv.y) - 1.0),
        max(abs(abs(uv.x) - aspect * 0.65) - 0.01, abs(abs(uv.y) - 0.35) - 0.01)
      );
      fieldDist = max(fieldDist, abs(uv.x) - 0.01);
      
      float line = smoothstep(0.02, 0.0, fieldDist);
      float circle = abs(length(uv) - 0.25);
      float centerLine = smoothstep(0.015, 0.0, circle) * smoothstep(0.05, 0.0, abs(uv.x));
      float lines = max(line, centerLine);
      
      grassColor = mix(grassColor, uLineColor, lines * 0.8);
      
      // Pulsing xG zones
      float dist = distance(vUv, uCenterSpot.xy);
      float pulse = sin(uTime * 3.0) * 0.5 + 0.5;
      float glow = smoothstep(0.3, 0.0, dist) * pulse * uPulse;
      
      vec3 spotColor = vec3(0.0, 0.9, 0.4);
      vec3 color = grassColor + spotColor * glow;
      float alpha = 0.95 + glow * 0.5;
      
      gl_FragColor = vec4(color, alpha);
    }
  `;

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[30, 20, 256, 256]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

// 3D Goal posts
function GoalPosts({ side }: { side: "left" | "right" }) {
  const xPos = side === "left" ? -14.5 : 14.5;
  const color = "#FFFFFF";

  return (
    <group position={[xPos, 0, 0]}>
      {/* Posts */}
      <mesh position={[0, 1.2, -2]}>
        <cylinderGeometry args={[0.05, 0.05, 2.4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.2, 2]}>
        <cylinderGeometry args={[0.05, 0.05, 2.4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Crossbar */}
      <mesh position={[0, 2.4, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Net */}
      <mesh position={[side === "left" ? -0.3 : 0.3, 1.2, 0]}>
        <boxGeometry args={[0.6, 2.4, 4]} />
        <meshStandardMaterial color="#FFFFFF" transparent opacity={0.1} wireframe />
      </mesh>
    </group>
  );
}

// Animated player dots
function PlayerDots() {
  const groupRef = useRef<THREE.Group>(null);
  const dots = useMemo(() => {
    return Array.from({ length: 12 }, () => ({
      x: (Math.random() - 0.5) * 24,
      z: (Math.random() - 0.5) * 16,
      speed: 0.3 + Math.random() * 0.5,
      offset: Math.random() * Math.PI * 2,
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const dot = dots[i];
      if (dot) {
        child.position.x = dot.x + Math.sin(state.clock.elapsedTime * dot.speed + dot.offset) * 2;
        child.position.z = dot.z + Math.cos(state.clock.elapsedTime * dot.speed + dot.offset) * 1.5;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {dots.map((_, i) => (
        <mesh key={i} position={[dots[i].x, 0.05, dots[i].z]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial
            color={i < 6 ? "#00E701" : "#3B82F6"}
            emissive={i < 6 ? "#00E701" : "#3B82F6"}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

// Field border
function FieldBorder() {
  return (
    <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[30.2, 20.2]} />
      <meshStandardMaterial color="#0B192C" />
    </mesh>
  );
}

export default function FootballField() {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas
        camera={{ position: [0, 18, 12], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={1.2} castShadow />
        <pointLight position={[0, 15, 0]} intensity={0.5} color="#00E701" distance={30} />
        
        <FieldBorder />
        <GrassField />
        <GoalPosts side="left" />
        <GoalPosts side="right" />
        <PlayerDots />
        
        <fog attach="fog" args={["#030B15", 25, 45]} />
      </Canvas>
    </div>
  );
}
