"use client"

import React, { useEffect, useRef } from "react"
import { getFullPath } from "@/helpers/pathHelper"
import { OrbitControls, Stats, useTexture } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { Bloom, EffectComposer } from "@react-three/postprocessing"
import { Leva, useControls } from "leva"
import * as THREE from "three"

import { CameraTrackingLight } from "@/components/3d/camera-tracking-light"
import { LampPosts } from "@/components/3d/lamp-posts"
import { TeslaCyberTruck } from "@/components/3d/tesla-cyber-truck"

function Road() {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!)

  // const [colorMap] = useTexture([getFullPath("/road/texture-1.jpg")])
  const [colorMap, road_normal_map] = useTexture([
    getFullPath("/road/texture-2.png"),
    getFullPath("/road/road_normal_map.webp"),
  ])

  const { color, metalness, roughness, rotation } = useControls("Floor Props", {
    color: "#767676",
    metalness: { value: 1.06, min: 0, max: 2 },
    roughness: { value: 0.76, min: 0, max: 4 },
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

    if (road_normal_map) {
      road_normal_map.wrapS = road_normal_map.wrapT = THREE.RepeatWrapping
      road_normal_map.repeat.set(5, 5) // Repeat the normal map 5 times on each axis
      road_normal_map.anisotropy = 16
      road_normal_map.needsUpdate = true
    }
  }, [colorMap, road_normal_map])

  useFrame(() => {
    if (colorMap) {
      colorMap.rotation = rotation // Live update from Leva
      colorMap.offset.y += 0.0023 // Still animate offset if desired
    }

    if (road_normal_map) {
      road_normal_map.offset.x += 0.0123 // Animate offset for normal map
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
        normalMap={road_normal_map}
        normalScale={[12, 12]}
        map={colorMap}
      />
    </mesh>
  )
}

function Lights() {
  // const {
  //   spotColor,
  //   spotIntensity,
  //   spotDistance,
  //   spotAngle,
  //   spotTargetPosition,
  //   spotAttenuation,
  //   spotAnglePower,
  //   spotPosition,
  // } = useControls("SpotLight", {
  //   spotColor: "#ffffff", // Color of the spotlight
  //   spotIntensity: { value: 0.7, min: 0, max: 5 }, // Spotlight intensity
  //   spotDistance: { value: 5, min: 0, max: 20 }, // Spotlight distance (falloff)
  //   spotAngle: { value: 0.15, min: 0, max: Math.PI / 2 }, // Angle of the spotlight cone
  //   spotAttenuation: { value: 5, min: 1, max: 10 }, // How sharp the falloff is
  //   spotAnglePower: { value: 5, min: 1, max: 20 }, // Angle Power for light attenuation
  //   spotTargetPosition: { value: [0, 0, 0], step: 0.1 }, // Position of the target point the spotlight looks at
  //   spotPosition: { value: [0, 10, 0], step: 0.1 },
  // })

  // const targetRef = useRef<THREE.Object3D>(null!)

  // useEffect(() => {
  //   if (targetRef.current) {
  //     targetRef.current.position.set(...spotTargetPosition)
  //   }
  // }, [spotTargetPosition])

  // const spotlightTarget = targetRef.current || new THREE.Object3D() // Fallback if null

  return (
    <>
      <ambientLight intensity={Math.PI * 0.5} />
      <CameraTrackingLight color="yellow" intensity={0.7} castShadow={false} />
      <directionalLight
        intensity={22}
        castShadow
        color="white"
        position={[5, 5, -5]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* <SpotLight
        position={spotPosition} // The spotlight's position
        intensity={spotIntensity} // Controlled intensity
        distance={spotDistance} // Controlled distance
        angle={spotAngle} // Controlled angle
        attenuation={spotAttenuation} // Controlled attenuation
        anglePower={spotAnglePower} // Controlled angle power for softening
        color={spotColor} // Controlled color
        castShadow // Enable shadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        target={spotlightTarget} // Ensure target is not null
      />

      <mesh ref={targetRef} position={spotTargetPosition}>
        <sphereGeometry args={[0.1]} />
        <meshBasicMaterial color="red" />
      </mesh> */}
    </>
  )
}

// function EnvironmentWrapper() {
//   const { envIntensity } = useControls("Environment", {
//     envIntensity: { value: 0.9, min: 0, max: 5, step: 0.1 },
//     // groundHeight: { value: 32, min: 0, max: 100, step: 1 },
//     // groundRadius: { value: 122, min: 0, max: 200, step: 1 },
//     // groundScale: { value: 12, min: 1, max: 50, step: 1 },
//   })

//   return (
//     <Environment
//       preset="night"
//       // ground={{
//       //   height: groundHeight,
//       //   radius: groundRadius,
//       //   scale: groundScale,
//       // }}
//       environmentIntensity={envIntensity}
//     />
//   )
// }
export default function App() {
  return (
    <main className="noise w-full overflow-x-auto">
      <Leva collapsed />
      <Canvas shadows camera={{ position: [0, 0.5, 10], fov: 45 }}>
        <color attach="background" args={["#000"]} />
        <fog attach="fog" args={["#000", 10, 15]} />
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
        {/* <BMWCar2
          disableMouseTrackingAnimation
          position={[0, -0.02, 0]}
          rotation={[0, Math.PI / 2, 0]}
        /> */}
        <LampPosts />

        {/* <EnvironmentWrapper /> */}
        <EffectComposer>
          <Bloom luminanceThreshold={0} luminanceSmoothing={0.7} />
          {/* <Noise opacity={0.04} /> */}
        </EffectComposer>
        <Stats />
      </Canvas>
    </main>
  )
}
