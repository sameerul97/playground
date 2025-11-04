"use client"

import { getFullPath } from "@/helpers/pathHelper"
import {
  ContactShadows,
  Environment,
  OrbitControls,
  PerspectiveCamera,
  Stats,
} from "@react-three/drei"
import { Canvas } from "@react-three/fiber"
import { Leva, useControls } from "leva"
import * as THREE from "three"

import { BMWCar } from "@/components/3d/bmw-car"
import { ToneMapping } from "@/components/3d/tone-mapping"

export default function Page() {
  // Environment ground controls
  const { groundHeight, groundRadius, groundScale } = useControls(
    "Ground Projection",
    {
      groundHeight: { value: 35, min: 0, max: 100, step: 1, label: "height" },
      groundRadius: {
        value: 100,
        min: 10,
        max: 500,
        step: 10,
        label: "radius",
      },
      groundScale: { value: 200, min: 10, max: 4000, step: 10, label: "scale" },
    }
  )

  const { environmentIntensity } = useControls("Environment", {
    environmentIntensity: {
      value: 1,
      min: 0,
      max: 20,
      step: 0.01,
      label: "intensity",
    },
  })

  return (
    <main className=" w-full overflow-x-auto bg-black">
      <Leva collapsed />
      <Canvas
        shadows
        camera={{
          position: [0, 3, 1200],
        }}
      >
        <Environment
          // Original source (higher res):
          //   files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/night_bridge_4k.hdr"
          // Compressed 4k via Monogrid tool https://gainmap-creator.monogrid.com/
          files={getFullPath("/projection/bridge_4k.jpg")}
          environmentIntensity={environmentIntensity}
          ground={{
            height: groundHeight,
            radius: groundRadius,
            scale: groundScale,
          }}
        />
        <BMWCar scale={10} rotation={[0, THREE.MathUtils.degToRad(25), 0]} />
        <ContactShadows
          renderOrder={2}
          frames={1}
          resolution={1024}
          scale={120}
          blur={2}
          opacity={1}
          far={100}
        />
        <OrbitControls enableDamping maxPolarAngle={1.4} />
        <ToneMapping />
        <PerspectiveCamera makeDefault position={[45, 45, 10]} />
        <Stats />
      </Canvas>
    </main>
  )
}
