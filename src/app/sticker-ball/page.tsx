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
import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber"
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

interface StationLogo {
  position: THREE.Vector3
  rotation: number
  scale: THREE.Vector3
  texture: THREE.Texture
  renderOrder: number
}

const RayoBallSticker = () => {
  const [initialMousePosition, setInitialMousePosition] = useState({
    x: 0,
    y: 0,
  })
  const [targetScale, setTargetScale] = useState<THREE.Vector3>(
    new THREE.Vector3(1, 1, 1)
  )
  const [stationLogos, setStationLogos] = useState<StationLogo[]>([])

  const textures = useTexture(STATION_IMAGES)
  const rayo = useTexture(getFullPath("/stations/rayo.png"))

  const rayoBallMesh = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)
  const wobbleFactorRef = useRef(1)
  const wobbleSpeedRef = useRef(1)

  const {
    color,
    metalness,
    roughness,
    emissive,
    animateScale,
    // factor,
    // speed,
  } = useControls("Rayo Ball Props", {
    color: "#fff",
    emissive: "#000",
    metalness: { value: 0.15, min: 0, max: 2 },
    roughness: { value: 0.26, min: 0, max: 1 },
    animateScale: { value: true },
    // factor: { value: 1, min: 0, max: 20 },
    // speed: { value: 10, min: 0, max: 50 },
  })

  useFrame((_, delta) => {
    if (animateScale) {
      const smoothing = 8 // Adjust for smoother/faster transitions
      const mesh = rayoBallMesh.current

      if (mesh) {
        // Interpolate the scale of the mesh directly
        mesh.scale.lerp(targetScale, smoothing * delta)
      }
    }
  })

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

  useEffect(() => {
    // rayo.flipY = false
    // rayo.repeat.set(2, 1)
    // rayo.WrapT = THREE.RepeatWrapping
    rayo.offset.set(0.2, 0)
    rayo.wrapS = THREE.RepeatWrapping
    rayo.needsUpdate = true
  }, [rayo])

  // useEffect(() => {
  // textures.forEach((texture) => {
  //   texture.needsUpdate = true
  // })
  // }, [textures])

  const handleOnMouseDown = useCallback(
    (event: { clientX: never; clientY: never }) => {
      setInitialMousePosition({ x: event.clientX, y: event.clientY })
    },
    []
  )

  const handleOnMouseUp = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (
        !(
          Math.abs(event.clientX - initialMousePosition.x) > THRESHOLD ||
          Math.abs(event.clientY - initialMousePosition.y) > THRESHOLD
        )
      ) {
        setStationLogos([
          ...stationLogos,
          {
            position: event.point,
            rotation: Math.PI * (Math.random() * (2.2 - 1.8) + 1.8),
            scale: new THREE.Vector3(
              DEFAULT_SCALE[0] + Math.random() * 0.1,
              DEFAULT_SCALE[1] + Math.random() * 0.1,
              DEFAULT_SCALE[2] + Math.random() * 0.1
            ),
            texture: textures[Math.floor(Math.random() * textures.length)],
            renderOrder: stationLogos.length,
          },
        ])

        wobbleFactorRef.current = wobbleFactorRef.current === 1 ? 2 : 1
        wobbleSpeedRef.current = wobbleSpeedRef.current === 1 ? 1.5 : 1

        if (animateScale) {
          const randomScale = new THREE.Vector3(
            1 + Math.random() * 0.5,
            1 + Math.random() * 0.3,
            1 + Math.random() * 0.4
          )
          setTargetScale(randomScale)

          const randomDelay = Math.random() * (300 - 100) + 100

          setTimeout(() => {
            setTargetScale(new THREE.Vector3(1, 1, 1))
          }, randomDelay)
        }
      }
    },
    [animateScale, stationLogos, initialMousePosition, textures]
  )

  return (
    <mesh
      ref={rayoBallMesh}
      castShadow
      receiveShadow
      onPointerDown={handleOnMouseDown}
      onPointerUp={handleOnMouseUp}
    >
      <sphereGeometry args={[1, 64, 64]} />
      {/* <DecalPhysicalMaterialSticker stationLogos={stationLogos} /> */}
      {stationLogos.map((sticker, i) => (
        <Decal key={i} {...sticker}>
          <meshBasicMaterial
            map={sticker.texture}
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
        depthWrite={false}
      />
      {/* <PhysicalMaterialBall texture={rayo} /> */}
    </mesh>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DecalPhysicalMaterialSticker = ({
  stationLogos,
}: {
  stationLogos: StationLogo[]
}) => {
  const {
    color,
    metalness,
    roughness,
    clearcoat,
    clearcoatRoughness,
    transmission,
    thickness,
  } = useControls("Physical Material Sticker Props", {
    color: "#fff",
    metalness: { value: 2, min: 0, max: 4 },
    roughness: { value: 1, min: 0, max: 2 },
    clearcoat: { value: 0.6, min: 0, max: 2 },
    clearcoatRoughness: { value: 0.5, min: 0, max: 2 },
    transmission: { value: 0.6, min: 0, max: 2 },
    thickness: { value: 0.6, min: 0, max: 2 },
  })

  return (
    <>
      {stationLogos.map((sticker, i) => (
        <Decal key={i} {...sticker}>
          <meshPhysicalMaterial
            map={sticker.texture}
            transmission={transmission}
            thickness={thickness}
            color={color}
            metalness={metalness}
            roughness={roughness}
            clearcoat={clearcoat}
            clearcoatRoughness={clearcoatRoughness}
            polygonOffsetFactor={-10}
            transparent={true}
            polygonOffset={true}
            map-flipY={false}
            depthWrite={false}
            toneMapped={false}
          />
        </Decal>
      ))}
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

const HemisphereLight = () => {
  const { ...hemLightProps } = useControls("HemisphereLight Props", {
    color: "#fff",
    groundColor: "#fff",
    intensity: { value: 1, min: 1, max: 4 },
  })

  return <hemisphereLight {...hemLightProps} />
}
export default function App() {
  return (
    <main className="purple-bg w-full overflow-x-auto">
      <Leva />
      <Canvas shadows camera={{ position: [0, 0.5, 5], fov: 45 }}>
        <OrbitControls
          enableDamping
          maxPolarAngle={1.5}
          dampingFactor={0.1}
          minDistance={3}
          maxDistance={6}
        />
        <Environment preset="warehouse" environmentIntensity={1} />
        <HemisphereLight />
        <RayoBallSticker />
      </Canvas>
    </main>
  )
}
