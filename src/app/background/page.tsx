"use client"

import React, { useMemo, useRef } from "react"
import { OrbitControls, Plane } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { Leva, useControls } from "leva"
import * as THREE from "three"

import { ToneMapping } from "@/components/3d/tone-mapping"

const Platon: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.rotation.x = 10 * Math.sin(t / 4.1)
      groupRef.current.rotation.y = 7 * Math.cos(t / 3.7)
    }
  })

  return (
    <group ref={groupRef}>
      <mesh castShadow>
        <tetrahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={0x9040ff}
          metalness={0.95}
          roughness={0.05}
          flatShading
        />
      </mesh>

      <mesh castShadow scale={0.799}>
        <tetrahedronGeometry args={[1, 2]} />
        <meshStandardMaterial
          color={0xffffff}
          metalness={0.95}
          roughness={0.05}
          flatShading
        />
      </mesh>

      <mesh castShadow scale={0.713}>
        <octahedronGeometry args={[1, 4]} />
        <meshStandardMaterial
          color={0x000000}
          metalness={0.95}
          roughness={0.05}
          flatShading
        />
      </mesh>
    </group>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function SceneWithPrimitive() {
  // Create and memoize the spotlights
  const spotLight1 = useMemo(() => {
    const light = new THREE.SpotLight("white", 2000, 100, 1.2, 1, 2)
    light.position.set(0, 20, 0)
    light.castShadow = true
    return light
  }, [])

  const spotLight2 = useMemo(() => {
    const light = new THREE.SpotLight("white", 15000, 100, 1.2, 1, 2)
    light.position.set(0, -20, 0)
    return light
  }, [])

  const spotLight3 = useMemo(() => {
    const light = new THREE.SpotLight("white", 35000, 100, 0.15, 1, 2.7)
    light.position.set(0, 20, 0)
    light.castShadow = true
    return light
  }, [])

  // Create and memoize the geometry and materials for reuse
  const ground = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(100, 100)
    const material = new THREE.MeshLambertMaterial({ color: 0x480048 })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.rotation.x = -Math.PI / 2
    mesh.position.y = -2
    mesh.receiveShadow = true
    return mesh
  }, [])

  const background = useMemo(() => {
    const geometry = new THREE.SphereGeometry(50)
    const material = new THREE.MeshLambertMaterial({
      color: 0x480048,
      side: THREE.BackSide,
    })
    const background = new THREE.Mesh(geometry, material)
    background.scale.y = 0.3
    return background
  }, [])

  const platon = useMemo(() => {
    const mainMaterial = new THREE.MeshStandardMaterial({
      color: 0x9040ff,
      metalness: 0.95,
      roughness: 0.05,
      flatShading: true,
    })
    const subMaterial1 = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.95,
      roughness: 0.05,
      flatShading: true,
    })
    const subMaterial2 = new THREE.MeshStandardMaterial({
      color: 0x000000,
      metalness: 0.95,
      roughness: 0.05,
      flatShading: true,
    })

    const mainGeometry = new THREE.TetrahedronGeometry(1, 1)
    const subGeometry1 = new THREE.TetrahedronGeometry(1, 2)
    const subGeometry2 = new THREE.OctahedronGeometry(1, 4)

    const mainMesh = new THREE.Mesh(mainGeometry, mainMaterial)
    const subMesh1 = new THREE.Mesh(subGeometry1, subMaterial1)
    const subMesh2 = new THREE.Mesh(subGeometry2, subMaterial2)

    subMesh1.scale.setScalar(0.799)
    subMesh2.scale.setScalar(0.713)

    mainMesh.add(subMesh1, subMesh2)
    mainMesh.castShadow = true

    return mainMesh
  }, [])

  // Animation loop for the platon object
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (platon) {
      platon.rotation.x = 10 * Math.sin(t / 4100)
      platon.rotation.y = 7 * Math.cos(t / 3700)
    }
  })

  return (
    <>
      {/* Add pre-created objects to the scene */}
      <primitive object={spotLight1} />
      <primitive object={spotLight2} />
      <primitive object={spotLight3} />
      <primitive object={ground} />
      <primitive object={background} />
      <primitive object={platon} />
    </>
  )
}

function Scene() {
  const { color } = useControls("Scene Color", {
    color: "#514169",
    // 0x480048
  })

  return (
    <>
      <Plane
        args={[100, 100]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2, 0]}
        receiveShadow
        castShadow
      >
        <meshLambertMaterial color={color} />
      </Plane>

      <mesh scale={[1, 0.3, 1]}>
        <sphereGeometry args={[50]} />
        <meshLambertMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
    </>
  )
}

function SpotLights() {
  return (
    <>
      <spotLight
        position={[0, 20, 0]}
        intensity={2000}
        distance={100}
        angle={1.2}
        penumbra={1}
        decay={2}
        castShadow
      />
      <spotLight
        position={[0, -20, 0]}
        intensity={15000}
        distance={100}
        angle={1.2}
        penumbra={1}
        decay={2}
      />
      {/* <spotLight
        position={[0, 20, 0]}
        intensity={35000}
        distance={100}
        angle={0.15}
        penumbra={1}
        decay={2.7}
        castShadow
      /> */}
    </>
  )
}

export default function App() {
  return (
    <main className="purple-bg w-full overflow-x-auto">
      <Leva />
      <Canvas
        shadows
        camera={{ position: [0, 0, 10], fov: 30 }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true
          gl.shadowMap.type = THREE.PCFSoftShadowMap
        }}
      >
        <OrbitControls enableDamping maxPolarAngle={1.7} />
        {/* <ambientLight intensity={1} /> */}
        {/* <SceneWithPrimitive /> */}

        <SpotLights />
        <Scene />
        <Platon />
        <ToneMapping />
      </Canvas>
    </main>
  )
}
