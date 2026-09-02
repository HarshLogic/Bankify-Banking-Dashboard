import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows, Environment, Text, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

function Card() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, (state.pointer.x * Math.PI) / 4, 0.05);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, (state.pointer.y * Math.PI) / 4, 0.05);
    }
  });

  return (
    <group ref={group}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <RoundedBox args={[3, 1.8, 0.1]} radius={0.1} smoothness={4}>
          <meshStandardMaterial color="#1e1b4b" metalness={0.8} roughness={0.2} />
        </RoundedBox>

        {/* Card Details */}
        <Text position={[-1.2, 0.5, 0.06]} fontSize={0.15} color="white" anchorX="left">
          BANKIFY
        </Text>
        
        {/* Chip */}
        <RoundedBox args={[0.4, 0.3, 0.01]} position={[-1, 0.1, 0.055]} radius={0.05} smoothness={4}>
          <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.4} />
        </RoundedBox>

        {/* Card Number */}
        <Text position={[-1.2, -0.2, 0.06]} fontSize={0.2} color="white" anchorX="left" letterSpacing={0.1}>
          **** **** **** 1234
        </Text>

        <Text position={[-1.2, -0.6, 0.06]} fontSize={0.1} color="#a1a1aa" anchorX="left">
          JOHN DOE
        </Text>
        <Text position={[0.8, -0.6, 0.06]} fontSize={0.1} color="#a1a1aa" anchorX="left">
          12/28
        </Text>
      </Float>
    </group>
  );
}

export default function ThreeDCard() {
  const { theme } = useTheme();

  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <Card />
        <Environment preset={theme === 'dark' ? 'city' : 'apartment'} />
        <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
      </Canvas>
    </div>
  );
}
