"use client"

import React, { useMemo } from "react"
import { Cloud, Clouds, Float, OrbitControls, Stats } from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import * as THREE from "three"

function seededRandom(seed: number) {
  const m = 50,
    a = 11,
    c = 17
  return function () {
    seed = (a * seed + c) % m
    return seed / m
  }
}

function randomOnHorizontalPlaneWithSeed(
  count: number,
  width: number,
  depth: number,
  heightVariation: number,
  seed: number
): Float32Array {
  const random = seededRandom(seed)
  const points = new Float32Array(count * 3)
  for (let i = 0; i < count * 3; i += 3) {
    points[i] = (random() - 0.5) * width
    points[i + 1] = (random() - 0.5) * heightVariation
    points[i + 2] = (random() - 0.5) * depth
  }
  return points
}
function CloudsComposition() {
  const cloudPositions = useMemo(
    () => randomOnHorizontalPlaneWithSeed(20, 190, 10, 2, 1),
    []
  )

  return (
    <Float speed={0}>
      <Clouds material={THREE.MeshBasicMaterial}>
        {Array.from({ length: cloudPositions.length / 3 }, (_, i) => (
          <Cloud
            key={i}
            segments={10}
            bounds={[30, 0.1, 80]}
            volume={40}
            color="#A978FF"
            position={[
              cloudPositions[i * 3],
              cloudPositions[i * 3 + 1],
              cloudPositions[i * 3 + 2],
            ]}
            renderOrder={i}
          />
        ))}
        {/* <Cloud position={[-4, -2, -25]} speed={0.2} opacity={1} />
        <Cloud position={[4, 2, -15]} speed={0.2} opacity={0.5} />
        <Cloud segments={20} position={[-4, 2, -10]} speed={0.2} opacity={1} />
        <Cloud position={[4, -2, -5]} speed={0.2} opacity={0.5} />
        <Cloud segments={20} position={[4, 2, 0]} speed={0.2} opacity={0.75} />
        <Cloud segments={20} volume={6} color="#a964ff" /> */}
      </Clouds>
    </Float>
  )
}
export default function App() {
  return (
    <main className="purple-bg w-full overflow-x-auto">
      <Canvas
        shadows
        camera={{ position: [0, 10, 40], fov: 50, near: 0.1, far: 1000 }}
      >
        <Stats className="absolute bottom-0 left-0" />
        {/* <color attach="background" args={['#A964FF']} /> */}
        {/* <Sky /> */}
        <ambientLight intensity={0.5} />
        <CloudsComposition />
        <OrbitControls
          enableDamping
          dampingFactor={0.1}
          minDistance={10}
          maxDistance={100}
        />
      </Canvas>
    </main>
  )
}
