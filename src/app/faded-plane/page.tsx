"use client"

import React, { useEffect, useRef } from "react"
import { getFullPath } from "@/helpers/pathHelper"
import {
  Environment,
  OrbitControls,
  useGLTF,
  useTexture,
} from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { Leva, useControls } from "leva"
import * as THREE from "three"
import { GLTF } from "three-stdlib"

import { CameraTrackingLight } from "@/components/3d/camera-tracking-light"
import { TeslaCyberTruckOld } from "@/components/3d/tesla-cyber-truck-old"

type GLTFResult = GLTF & {
  nodes: {
    Cylinder018_Cylinder007: THREE.Mesh
    Cylinder018_Cylinder007_1: THREE.Mesh
  }
  materials: {
    Car: THREE.MeshStandardMaterial
    Windshield: THREE.MeshStandardMaterial
  }
}

// @ts-expect-error temp ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Car(props: JSX.IntrinsicElements["group"]) {
  const group = useRef<THREE.Group>()
  const { nodes, materials } = useGLTF(
    "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/zombie-car/model.gltf"
  ) as GLTFResult

  return (
    <group ref={group} {...props} dispose={null}>
      <group scale={0.25} rotation={[0, -Math.PI / 2, 0]} position={[0, 1, 0]}>
        <mesh
          geometry={nodes.Cylinder018_Cylinder007.geometry}
          material={materials.Car}
          material-envMapintensity={0}
          castShadow
        />
        <mesh
          geometry={nodes.Cylinder018_Cylinder007_1.geometry}
          material={materials.Windshield}
          material-envMapintensity={0}
          castShadow
        />
      </group>
    </group>
  )
}

function Road() {
  const materialRef = useRef<THREE.MeshLambertMaterial>(null!)

  // const texture = useTexture(
  //   // "https://threejs.org/examples/textures/ambientcg/Ice002_1K-JPG_Color.jpg"
  //   getFullPath("/Marble012_1K-JPG/Marble012_1K-JPG_Color.jpg")
  // )

  // if (texture) {
  //   texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  //   texture.colorSpace = "srgb"
  // }

  // useFrame((state) => {
  //   if (texture) {
  //     const t = state.clock.getElapsedTime()
  //     texture.offset.x = t * 0.1 // Animate texture offset
  //   }
  // })

  const [colorMap, roughnessMap, normalMap] = useTexture([
    getFullPath("/Marble012_1K-JPG/Marble012_1K-JPG_Color.jpg"),
    getFullPath("/Marble012_1K-JPG/Marble012_1K-JPG_Roughness.jpg"),
    getFullPath("/Marble012_1K-JPG/Marble012_1K-JPG_NormalGL.jpg"), // Use GL normal map for WebGL compatibility
  ])

  // Apply texture settings
  useEffect(() => {
    ;[colorMap, roughnessMap, normalMap].forEach((map) => {
      if (map) {
        map.wrapS = map.wrapT = THREE.RepeatWrapping // Ensure seamless tiling
        map.anisotropy = 16 // Enhance quality at oblique angles
        map.needsUpdate = true
      }
    })
  }, [colorMap, roughnessMap, normalMap])

  // Animate the texture offset
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    colorMap.offset.x = t * 0.1
    roughnessMap.offset.x = t * 0.1
    normalMap.offset.x = t * 0.1
  })

  useEffect(() => {
    if (materialRef.current) {
      const material = materialRef.current

      // Modify the shader on compilation
      material.onBeforeCompile = (shader) => {
        shader.uniforms.distMin = { value: 0.65 }
        shader.uniforms.distMax = { value: 1 }
        shader.uniforms.distCol = { value: new THREE.Color("#fff") }

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

      // Add custom shader definitions
      material.defines = { USE_UV: "" }
      material.needsUpdate = true // Ensure the material updates with the new shader
    }
  }, [])

  const { color, metalness, roughness } = useControls("Floor Props", {
    color: "#fff",
    metalness: { value: 0.21, min: 0, max: 2 },
    roughness: { value: 2, min: 0, max: 4 },
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[10, 10, 100, 100]} />
      <meshStandardMaterial
        // color="#fff"
        // metalness={0.21}
        // roughness={2}
        color={color}
        metalness={metalness}
        roughness={roughness}
        ref={materialRef}
        map={colorMap}
        roughnessMap={roughnessMap}
        normalMap={normalMap}
      />
    </mesh>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Wheel() {
  const wheelRef = useRef<THREE.Mesh>(null!)
  const texture = useTexture(
    "https://threejs.org/examples/textures/hardwood2_diffuse.jpg"
  )

  useEffect(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.colorSpace = "srgb"
  }, [texture])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    wheelRef.current.rotation.z = -(1 / 1.5) * t
  })

  const shapeWheel = new THREE.Shape().absarc(0, 0, 1.5, 0, Math.PI * 2)
  shapeWheel.holes = Array.from({ length: 6 }, (_, hIdx) => {
    return new THREE.Path(
      [
        [1.3, 0.5],
        [1.3, -0.5],
        [0.3, -0.1],
        [0.3, 0.1],
      ].map((p) => {
        return new THREE.Vector2(...p).rotateAround(
          new THREE.Vector2(),
          ((Math.PI * 2) / 6) * hIdx
        )
      })
    )
  })

  const extrudeSettings = {
    depth: 0.5,
    curveSegments: 20,
    bevelEnabled: false,
  }

  return (
    <mesh ref={wheelRef} position={[0, 1.5, 0]} castShadow>
      <extrudeGeometry args={[shapeWheel, extrudeSettings]} />
      <meshLambertMaterial map={texture} color="brown" />
    </mesh>
  )
}

function Lights() {
  return (
    <>
      <ambientLight intensity={Math.PI * 0.5} />
      <CameraTrackingLight castShadow={false} />
      <directionalLight
        intensity={Math.PI}
        castShadow
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
        <color attach="background" args={["#fff"]} />
        <Lights />
        <OrbitControls enableDamping maxPolarAngle={1.3} />
        <Road />
        {/* <Car /> */}
        <TeslaCyberTruckOld scale={1.3} position={[0, 0.55, 0]} />
        <Environment preset="warehouse" environmentIntensity={0.4} />
      </Canvas>
    </main>
  )
}
