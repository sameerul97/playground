"use client"

import React from "react"
import { getFullPath } from "@/helpers/pathHelper"
import {
  Environment,
  Html,
  OrbitControls,
  Stats,
  useGLTF,
} from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import * as THREE from "three"
import { GLTF } from "three-stdlib"

type GLTFResult = GLTF & {
  nodes: {
    joystickshaft_low_pacman_machine_0: THREE.Mesh
    joystickball_low_pacman_machine_0: THREE.Mesh
    buttons_low_pacman_machine_0: THREE.Mesh
    mainbody_low_pacman_machine_0: THREE.Mesh
    pacmanhead_low_pacman_machine_0: THREE.Mesh
    screenborder_low_pacman_machine_0: THREE.Mesh
    sidepanels_low_pacman_machine_0: THREE.Mesh
    coinpanel_low_pacman_machine_0: THREE.Mesh
    frontpanel_low_pacman_machine_0: THREE.Mesh
    screen_low_pacman_screen_0: THREE.Mesh
    backswitch_low_pacman_machine_0: THREE.Mesh
    utilitypanel_low_pacman_machine_0: THREE.Mesh
  }
  materials: {
    pacman_machine: THREE.MeshStandardMaterial
    pacman_screen: THREE.MeshStandardMaterial
  }
}

// @ts-expect-error temporarily ignore the error
export function Model(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF(
    getFullPath("/pacman_machine.glb")
  ) as GLTFResult

  // const { nodes, materials } = useGLTF("/pacman_machine.glb") as GLTFResult
  return (
    <group {...props} dispose={null}>
      <group name="07c30d2070ce40f0b35ec5738f83f6dffbx" scale={0.01}>
        <mesh
          name="joystickshaft_low_pacman_machine_0"
          castShadow
          receiveShadow
          geometry={nodes.joystickshaft_low_pacman_machine_0.geometry}
          material={materials.pacman_machine}
          position={[8.031, 103.289, 34.064]}
          rotation={[-1.169, 0, 0]}
          scale={100}
        />
        <mesh
          name="joystickball_low_pacman_machine_0"
          castShadow
          receiveShadow
          geometry={nodes.joystickball_low_pacman_machine_0.geometry}
          material={materials.pacman_machine}
          position={[8.031, 109.794, 36.825]}
          rotation={[-1.169, 0, 0]}
          scale={100}
        />
        <mesh
          name="buttons_low_pacman_machine_0"
          castShadow
          receiveShadow
          geometry={nodes.buttons_low_pacman_machine_0.geometry}
          material={materials.pacman_machine}
          position={[-3.067, 103.046, 35.573]}
          rotation={[-1.169, 0, 0]}
          scale={100}
        />
        <mesh
          name="mainbody_low_pacman_machine_0"
          castShadow
          receiveShadow
          geometry={nodes.mainbody_low_pacman_machine_0.geometry}
          material={materials.pacman_machine}
          position={[0, 60.919, -8.996]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
          scale={100}
        />
        <mesh
          name="pacmanhead_low_pacman_machine_0"
          castShadow
          receiveShadow
          geometry={nodes.pacmanhead_low_pacman_machine_0.geometry}
          material={materials.pacman_machine}
          position={[0, 122.442, 9.904]}
          rotation={[-1.174, 0, Math.PI / 2]}
          scale={100}
        />
        <mesh
          name="screenborder_low_pacman_machine_0"
          castShadow
          receiveShadow
          geometry={nodes.screenborder_low_pacman_machine_0.geometry}
          material={materials.pacman_machine}
          position={[0, 126.507, 4.875]}
          rotation={[-1.682, 0, 0]}
          scale={100}
        />
        <mesh
          name="sidepanels_low_pacman_machine_0"
          castShadow
          receiveShadow
          geometry={nodes.sidepanels_low_pacman_machine_0.geometry}
          material={materials.pacman_machine}
          position={[0, 60.919, -8.996]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
          scale={100}
        />
        <mesh
          name="coinpanel_low_pacman_machine_0"
          castShadow
          receiveShadow
          geometry={nodes.coinpanel_low_pacman_machine_0.geometry}
          material={materials.pacman_machine}
          position={[0, 62.859, -8.996]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
          scale={100}
        />
        <mesh
          name="frontpanel_low_pacman_machine_0"
          castShadow
          receiveShadow
          geometry={nodes.frontpanel_low_pacman_machine_0.geometry}
          material={materials.pacman_machine}
          position={[0, 60.919, -10.697]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
          scale={100}
        />
        <mesh
          name="screen_low_pacman_screen_0"
          castShadow
          receiveShadow
          geometry={nodes.screen_low_pacman_screen_0.geometry}
          material={materials.pacman_screen}
          position={[0, 127.193, 22.598]}
          rotation={[-1.682, 0, 0]}
          scale={100}
        >
          <Html
            transform
            occlude
            distanceFactor={1.5}
            position={[0, 0, 0.01]} // Slightly in front to avoid z-fighting
            rotation={[Math.PI / 2, 0, 0]} // Rotate to face the camera
          >
            <iframe
              src="/playground/pac-man/index.html"
              style={{
                width: "300px",
                height: "350px",
                border: "none",
                borderRadius: "8px",
              }}
            />
          </Html>
        </mesh>

        <mesh
          name="backswitch_low_pacman_machine_0"
          castShadow
          receiveShadow
          geometry={nodes.backswitch_low_pacman_machine_0.geometry}
          material={materials.pacman_machine}
          position={[24.769, 15.714, -19.744]}
          rotation={[Math.PI, 0, 0]}
          scale={100}
        />
        <mesh
          name="utilitypanel_low_pacman_machine_0"
          castShadow
          receiveShadow
          geometry={nodes.utilitypanel_low_pacman_machine_0.geometry}
          material={materials.pacman_machine}
          position={[0, 60.919, -8.996]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
          scale={100}
        />
      </group>
    </group>
  )
}

useGLTF.preload("/pacman_machine.glb")

export default function App() {
  return (
    <main className=" w-full overflow-x-auto  ">
      <Canvas
        shadows
        camera={{ position: [0, 10, 20], fov: 50, near: 0.1, far: 1000 }}
      >
        <Stats className="absolute bottom-0 left-0" />
        <color attach="background" args={["#e4c346"]} />

        <Model position={[0, -10, 0]} scale={[12, 12, 12]} />
        <Environment preset="city" />
        <ambientLight intensity={1} />
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
