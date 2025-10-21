"use client"

import React, { useEffect, useRef } from "react"
import { getFullPath } from "@/helpers/pathHelper"
import {
  Environment,
  OrbitControls,
  Stats,
  useTexture,
} from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { Bloom, EffectComposer, Noise } from "@react-three/postprocessing"
import { Leva, useControls } from "leva"
import * as THREE from "three"

import { CameraTrackingLight } from "@/components/3d/camera-tracking-light"
import { LampPosts } from "@/components/3d/lamp-posts"
import { TeslaCyberTruck } from "@/components/3d/tesla-cyber-truck"

function Road() {
  const materialRef = useRef<THREE.MeshLambertMaterial>(null!)

  const [colorMap] = useTexture([getFullPath("/road/texture-1.jpg")])

  const { color, metalness, roughness, rotation } = useControls("Floor Props", {
    color: "#767676",
    metalness: { value: 0.21, min: 0, max: 2 },
    roughness: { value: 2, min: 0, max: 4 },
    rotation: { value: 4.75, min: 0, max: Math.PI * 2, step: 0.01 },
  })

  // Apply texture settings
  useEffect(() => {
    if (colorMap) {
      colorMap.center.set(0.5, 0.5) // Rotate around center
      colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping
      colorMap.anisotropy = 16
      colorMap.needsUpdate = true
    }
  }, [colorMap])

  useFrame(() => {
    if (colorMap) {
      colorMap.rotation = rotation // Live update from Leva
      colorMap.offset.y += 0.0023 // Still animate offset if desired
    }
  })

  useEffect(() => {
    if (materialRef.current) {
      const material = materialRef.current

      // Modify the shader on compilation
      material.onBeforeCompile = (shader) => {
        shader.uniforms.distMin = { value: 0.65 }
        shader.uniforms.distMax = { value: 1 }
        shader.uniforms.distCol = { value: new THREE.Color("#000") }

        shader.fragmentShader = `
          uniform float distMin;
          uniform float distMax;
          uniform vec3 distCol;
          ${shader.fragmentShader}
        `.replace(
          `#include <tonemapping_fragment>`,
          `#include <tonemapping_fragment>
            gl_FragColor.rgb = mix(gl_FragColor.rgb, distCol, smoothstep(distMin, distMax, length(vUv - 0.5) * 2.));
          `
        )
      }

      material.defines = { USE_UV: "" }
      material.needsUpdate = true
    }
  }, [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[10, 10, 100, 100]} />
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
        ref={materialRef}
        map={colorMap}
      />
    </mesh>
  )
}

function Lights() {
  return (
    <>
      <ambientLight intensity={Math.PI * 0.5} />
      <CameraTrackingLight color="yellow" castShadow={false} />
      <directionalLight
        intensity={Math.PI}
        castShadow
        color="white"
        position={[5, 5, -5]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </>
  )
}

export default function App() {
  return (
    <main className="purple-bg w-full overflow-x-auto">
      <Leva collapsed />
      <Canvas shadows camera={{ position: [0, 0.5, 10], fov: 45 }}>
        <color attach="background" args={["#000"]} />
        <fog attach="fog" args={["#000", 10, 15]} />
        {/* <Plane
          material-color="black"
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.1, 0]}
          scale={100}
        /> */}
        <Lights />

        <OrbitControls enableDamping maxPolarAngle={1.5} />
        <Road />
        <TeslaCyberTruck
          color={"#313131"}
          metalness={0.81}
          roughness={0.51}
          // @ts-expect-error temp ignore
          scale={1.5}
          position={[0, 0.61, 0]}
        />
        <LampPosts />

        <Environment preset="night" environmentIntensity={0.9} />
        <EffectComposer>
          <Bloom luminanceThreshold={0} luminanceSmoothing={0.1} />
          <Noise opacity={0.02} />
        </EffectComposer>
        <Stats />
      </Canvas>
    </main>
  )
}
