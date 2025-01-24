"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { getFullPath } from "@/helpers/pathHelper"
import {
  Decal,
  Environment,
  MeshWobbleMaterial,
  OrbitControls,
  useTexture,
} from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { Leva, useControls } from "leva"
import * as THREE from "three"

const STATION_IMAGES = [
  getFullPath("/stations/kiss.png"),
  getFullPath("/stations/absolute.png"),
  getFullPath("/stations/keerang.png"),
  getFullPath("/stations/greatest-hits.png"),
  getFullPath("/stations/magic.png"),
  getFullPath("/stations/hits-radio.png"),
  getFullPath("/stations/planet-rock.png"),
]
const DEFAULT_SCALE = [0.5, -0.25, 0.25]
const THRESHOLD = 10

const Stickers = () => {
  const [initialMousePosition, setInitialMousePosition] = useState({
    x: 0,
    y: 0,
  })

  const materialRef = useRef(null)
  const wobbleFactorRef = useRef(1)
  const wobbleSpeedRef = useRef(1)

  useFrame(() => {
    if (materialRef.current) {
      // @ts-expect-error temp ignore
      materialRef.current.factor +=
        // @ts-expect-error temp ignore
        (wobbleFactorRef.current - materialRef.current.factor) * 0.12
      // @ts-expect-error temp ignore
      materialRef.current.speed +=
        // @ts-expect-error temp ignore
        (wobbleSpeedRef.current - materialRef.current.speed) * 0.12
    }
  })

  const [stationLogos, setStationLogos] = useState<THREE.Texture[]>([])
  const textures = useTexture(STATION_IMAGES)
  const rayo = useTexture(getFullPath("/stations/rayo.png"))
  const {
    color,
    metalness,
    roughness,
    emissive,
    // factor,
    // speed,
  } = useControls("Rayo Ball Props", {
    color: "#fff",
    emissive: "#000",
    metalness: { value: 0.15, min: 0, max: 2 },
    roughness: { value: 0.26, min: 0, max: 1 },

    // factor: { value: 1, min: 0, max: 20 },
    // speed: { value: 10, min: 0, max: 50 },
  })

  const {
    stickerColor,
    stickerMetalness,
    stickerRoughness,
    stickerClearcoat,
    stickerClearcoatRoughness,
  } = useControls("Sticker Props", {
    stickerColor: "#fff",
    stickerMetalness: { value: 2, min: 0, max: 4 },
    stickerRoughness: { value: 1, min: 0, max: 1 },
    stickerClearcoat: { value: 0.6, min: 0, max: 1 },
    stickerClearcoatRoughness: { value: 0.5, min: 0, max: 1 },
  })

  useEffect(() => {
    // rayo.flipY = false
    // rayo.repeat.set(2, 1)
    rayo.offset.set(0.2, 0)
    rayo.wrapS = THREE.RepeatWrapping
    // rayo.WrapT = THREE.RepeatWrapping
    rayo.needsUpdate = true
  }, [rayo])

  useEffect(() => {
    // textures.forEach((texture) => {
    //   texture.needsUpdate = true
    // })
  }, [textures])

  const handleOnMouseDown = useCallback(
    (event: { clientX: never; clientY: never }) => {
      setInitialMousePosition({ x: event.clientX, y: event.clientY })
    },
    []
  )

  const handleOnMouseUp = useCallback(
    (event: { clientX: number; clientY: number; point: never }) => {
      if (
        !(
          Math.abs(event.clientX - initialMousePosition.x) > THRESHOLD ||
          Math.abs(event.clientY - initialMousePosition.y) > THRESHOLD
        )
      ) {
        setStationLogos([
          ...stationLogos,
          {
            // @ts-expect-error temp ignore
            position: event.point,
            rotation: Math.PI * (Math.random() * (2.2 - 1.8) + 1.8),
            scale: DEFAULT_SCALE.map((s) => s + Math.random() * 0.1),
            texture: textures[Math.floor(Math.random() * textures.length)],
            renderOrder: stationLogos.length,
          },
        ])

        wobbleFactorRef.current = wobbleFactorRef.current === 1 ? 2 : 1
        wobbleSpeedRef.current = wobbleSpeedRef.current === 1 ? 1.5 : 1
      }
    },
    [stationLogos, initialMousePosition, textures]
  )
  return (
    <>
      <mesh
        castShadow
        receiveShadow
        onPointerDown={handleOnMouseDown}
        onPointerUp={handleOnMouseUp}
      >
        <sphereGeometry args={[1, 64, 64]} />
        {stationLogos.map((sticker, i) => (
          <Decal key={i} {...sticker}>
            <meshPhysicalMaterial
              // @ts-expect-error temp ignore
              map={sticker.texture}
              //   roughness={1}
              //   metalness={1}
              //   clearcoat={0.1}
              //   clearcoatRoughness={1}
              transmission={1}
              thickness={1}
              color={stickerColor}
              roughness={stickerMetalness}
              metalness={stickerRoughness}
              clearcoat={stickerClearcoat}
              clearcoatRoughness={stickerClearcoatRoughness}
              polygonOffsetFactor={-10}
              transparent={true}
              polygonOffset={true}
              map-flipY={false}
              depthWrite={false}
              toneMapped={false}
            />
          </Decal>
        ))}
        <MeshWobbleMaterial
          ref={materialRef}
          roughness={roughness}
          metalness={metalness}
          color={color}
          emissive={emissive}
          map={rayo}
          factor={1}
          speed={1}
          // factor={factor}
          // speed={speed}
          depthWrite={false}
        />
        {/* <PhysicalMaterialBall texture={rayo} /> */}
      </mesh>
    </>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PhysicalMaterialBall = ({ texture }: { texture: THREE.Texture }) => {
  const {
    color,
    metalness,
    roughness,
    clearcoat,
    clearcoatRoughness,
    transmission,
    thickness,
  } = useControls("Rayo Ball Props", {
    color: "#fff",
    metalness: { value: 0.15, min: 0, max: 2 },
    roughness: { value: 0.26, min: 0, max: 1 },

    clearcoat: { value: 0.6, min: 0, max: 1 },
    clearcoatRoughness: { value: 0.5, min: 0, max: 1 },
    transmission: { value: 0.6, min: 0, max: 1 },
    thickness: { value: 0.5, min: 0, max: 1 },
  })

  return (
    <meshPhysicalMaterial
      // color="black"
      // metalness={0.5}
      // roughness={1}
      clearcoat={clearcoat}
      clearcoatRoughness={clearcoatRoughness}
      transmission={transmission}
      thickness={thickness}
      roughness={roughness}
      metalness={metalness}
      color={color}
      map={texture}
    />
  )
}
useTexture.preload(STATION_IMAGES)

export default function App() {
  return (
    <main className="purple-bg w-full overflow-x-auto">
      <Leva />
      <Canvas shadows camera={{ position: [0, 0.5, 5], fov: 45 }}>
        {/* <color attach="background" args={["#fff"]} /> */}
        <OrbitControls
          enableDamping
          maxPolarAngle={1.5}
          dampingFactor={0.1}
          minDistance={3}
          maxDistance={6}
        />
        <Environment preset="warehouse" environmentIntensity={1} />
        <hemisphereLight intensity={1} />

        <Stickers />
      </Canvas>
    </main>
  )
}
