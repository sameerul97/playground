/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React, { useEffect, useRef, useState } from "react"
import { getFullPath } from "@/helpers/pathHelper"
import { PerspectiveCamera, Stats, useTexture } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { DepthOfField, EffectComposer } from "@react-three/postprocessing"
import { Leva, useControls } from "leva"
import * as THREE from "three"

import {
  SameerCanvas,
  type CanvasQuality,
} from "@/components/3d/Canvas/sameer-canvas"
import WaterSurfaceSimple from "@/components/3d/WaterSurfaceSimple"
import {
  AudioPlayer,
  AudioPlayerControls,
} from "@/components/misc/audio-player"

function BackgroundPlane() {
  //   const texture = useTexture(getFullPath("/product/background.webp"))
  const texture = useTexture(getFullPath("/product/background.jpg"))
  //   const texture = useTexture(getFullPath("/product/background.png"))
  const { color, positionY, positionZ } = useControls("Background Plane", {
    // color: "white",
    color: "#607cb1",
    positionY: { value: 5.56, min: -10, max: 10, step: 0.01 },
    positionZ: { value: -12, min: -20, max: 30, step: 0.01 },
  })
  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.needsUpdate = true
    }
  }, [texture])

  return (
    <mesh
      scale={40}
      // position={[0, 2, -12]}
      position={[0, positionY, positionZ]}
    >
      <planeGeometry />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.8}
        map={texture}
      />
    </mesh>
  )
}

function useScrollSnapProgress(containerRef: React.RefObject<HTMLDivElement>) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const scrollTop = container.scrollTop
      const scrollHeight = container.scrollHeight - container.clientHeight
      setProgress(scrollTop / scrollHeight)
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [containerRef])

  return progress
}

interface FadingPlaneProps {
  texturePath: string
  position?: [number, number, number]
  scale?: number | [number, number, number]
  args?: [number, number]
  color?: THREE.Color | string
  fadeInStart?: number
  fadeInEnd?: number
  fadeOutStart?: number
  fadeOutEnd?: number
  transparent?: boolean
}

function FadingPlane({
  texturePath,
  position = [0, 0, 0],
  scale = 0.75,
  args = [1, 1],
  // color = "#cbcbcb",
  fadeInStart = 30, // Start fading in
  fadeInEnd = 20, // Fully visible
  fadeOutStart = 10, // Start fading out
  fadeOutEnd = 5, // Completely invisible
  // transparent = true,
}: FadingPlaneProps) {
  // const { planeColor } = useControls("Product Plane", {
  //   planeColor: "white",
  // })
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)
  const [texture] = useTexture([texturePath])
  const { camera } = useThree()

  useFrame(() => {
    if (!meshRef.current || !materialRef.current) return

    const worldPos = new THREE.Vector3()
    meshRef.current.getWorldPosition(worldPos)
    const distance = camera.position.distanceTo(worldPos)

    let opacity = 0

    if (distance >= fadeInStart) {
      // Too far away
      opacity = 0
    } else if (distance >= fadeInEnd) {
      // Fading in as we approach
      opacity = 1 - (distance - fadeInEnd) / (fadeInStart - fadeInEnd)
    } else if (distance >= fadeOutStart) {
      // Fully visible sweet spot
      opacity = 1
    } else if (distance >= fadeOutEnd) {
      // Fading out as we get too close
      opacity = (distance - fadeOutEnd) / (fadeOutStart - fadeOutEnd)
    } else {
      // Too close
      opacity = 0
    }

    materialRef.current.opacity = THREE.MathUtils.clamp(opacity, 0, 1)
  })

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <planeGeometry args={args} />
      <meshBasicMaterial
        color="#adaaaa"
        ref={materialRef}
        map={texture}
        transparent={true}
        alphaTest={0.5}
      />
    </mesh>
  )
}

function ProductGroup({ scrollProgress }: { scrollProgress: number }) {
  const groupPosition = useControls("Group POsition", {
    positionZ: { value: 0, min: 0, max: 20, step: 5 },
  })
  const groupRef = useRef<THREE.Group>(null)
  // const scroll = useScroll()

  // Control scroll range
  const startZ = 0
  const endZ = 20 // move toward camera

  useFrame((_, delta) => {
    const targetZ = THREE.MathUtils.lerp(startZ, endZ, scrollProgress)
    if (groupRef.current) {
      groupRef.current.position.z = THREE.MathUtils.damp(
        groupRef.current.position.z,
        targetZ,
        15,
        0.002
      )
    }
  })

  // useFrame(() => {
  //   const t = scroll.offset
  //   const currentZ = THREE.MathUtils.lerp(startZ, endZ, t)

  //   if (groupRef.current) {
  //     groupRef.current.position.z = currentZ
  //   }
  // })

  return (
    <group ref={groupRef} position={[0, 0.01, groupPosition.positionZ]}>
      <FadingPlane
        texturePath={getFullPath("/product/p-7.png")}
        position={[-0.25, 0.3, 22]}
        scale={[0.4, 0.61, 1]}
        fadeInStart={1000}
        fadeInEnd={1000}
        fadeOutStart={3}
        fadeOutEnd={-4}
      />

      <FadingPlane
        texturePath={getFullPath("/product/p-8.png")}
        position={[0.25, 0.3, 14.97]}
        scale={[0.4, 0.61, 1]}
        fadeOutStart={3}
        fadeOutEnd={-4}
      />

      <FadingPlane
        texturePath={getFullPath("/product/p-9.png")}
        position={[-0.25, 0.3, 8.6]}
        scale={[0.4, 0.61, 1]}
        fadeOutStart={3}
        fadeOutEnd={-4}
      />

      <FadingPlane
        texturePath={getFullPath("/product/p-10.png")}
        position={[0.25, 0.3, 1.6]}
        scale={[0.4, 0.61, 1]}
        fadeOutStart={3}
        fadeOutEnd={-4}
      />
    </group>
  )

  // This following return works for five page
  return (
    <group ref={groupRef} position={[0, 0.01, groupPosition.positionZ]}>
      <FadingPlane
        // texturePath={getFullPath("/product/p-1.png")}
        texturePath={getFullPath("/product/p-7.png")}
        position={[-0.25, 0.3, 22]}
        scale={[0.4, 0.61, 1]}
        // args={[0.5, 0.71]}
        // scale={[0.25, 0.25, 0.25 / 2]}
        fadeInStart={1000} // Very far - always visible
      />

      <FadingPlane
        // texturePath={getFullPath("/product/p-6.webp")}
        texturePath={getFullPath("/product/p-8.png")}
        color={"#a0a0a0"}
        // position={[0.25, 0.36, 17]}
        position={[0.25, 0.3, 17]}
        scale={[0.4, 0.61, 1]}
        fadeInStart={1000}
      />

      <FadingPlane
        // texturePath={getFullPath("/product/p-1.png")}
        // texturePath={getFullPath("/product/p-4.webp")}
        texturePath={getFullPath("/product/p-9.png")}
        // position={[-0.25, 0.36, 12]}
        position={[-0.25, 0.3, 12]}
        scale={[0.4, 0.61, 1]}
        // scale={[4, 5, 1]}
        // args={[5, 2]}
        fadeInStart={1000} // Very far - always visible
      />

      <FadingPlane
        // texturePath={getFullPath("/product/p-1.png")}
        // texturePath={getFullPath("/product/p-5.webp")}
        texturePath={getFullPath("/product/p-10.png")}
        // position={[0.25, 0.36, 7]}
        position={[0.25, 0.3, 7]}
        scale={[0.4, 0.61, 1]}
        // scale={[4, 5, 1]}
        // args={[5, 2]}
        fadeInStart={1000} // Very far - always visible
      />

      {/* ---------- FOLLOWING ARE DUPLICATES FOR ILLUSION  ---------- */}
      {/* <FadingPlane
        // texturePath={getFullPath("/product/p-1.png")}
        texturePath={getFullPath("/product/p-2.webp")}
        position={[-0.25, 0.36, 2]}
        // scale={[4, 5, 1]}
        // args={[5, 2]}
        fadeInStart={1000} // Very far - always visible
      />

      <FadingPlane
        texturePath={getFullPath("/product/p-3.webp")}
        position={[0.25, 0.36, -5]}
        fadeInStart={1000}
      />

      <FadingPlane
        // texturePath={getFullPath("/product/p-1.png")}
        texturePath={getFullPath("/product/p-4.webp")}
        position={[-0.25, 0.36, -10]}
        // scale={[4, 5, 1]}
        // args={[5, 2]}
        fadeInStart={1000} // Very far - always visible
      />

      <FadingPlane
        // texturePath={getFullPath("/product/p-1.png")}
        texturePath={getFullPath("/product/p-5.webp")}
        position={[0.25, 0.36, -15]}
        // scale={[4, 5, 1]}
        // args={[5, 2]}
        fadeInStart={1000} // Very far - always visible
      /> */}
    </group>
  )
}

function CameraRig({ scrollProgress }: { scrollProgress: number }) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)

  // Leva Controls (base camera values)
  const {
    fov,
    positionX,
    positionY,
    // rotationX, rotationY, rotationZ
  } = useControls("Camera", {
    fov: { value: 20, min: 10, max: 100, step: 0.01 },
    positionX: { value: 0, min: -20, max: 20, step: 0.01 },
    positionY: { value: 0.17, min: -20, max: 20, step: 0.01 },
    // rotationX: { value: 0, min: -Math.PI / 4, max: Math.PI / 4, step: 0.001 },
    // rotationY: { value: 0, min: -Math.PI / 4, max: Math.PI / 4, step: 0.001 },
    // rotationZ: { value: 0, min: -Math.PI / 4, max: Math.PI / 4, step: 0.001 },
  })

  const startZ = 25
  // const endZ = 8

  // Plane positions (match ProductGroup)
  // const planes = [
  //   { x: -0.25, z: 20 },
  //   { x: 0.5, z: 15 },
  //   { x: -0.25, z: 10 },
  //   { x: 0.25, z: 5 },
  // ]
  // Number of HTML snapping sections
  const sectionCount = 4 // <-- you have 5 sections

  const targetRot = useRef(0)

  useFrame((_, delta) => {
    if (!cameraRef.current) return
    const cam = cameraRef.current

    // Convert scrollProgress -> section index
    const index = Math.round(scrollProgress * (sectionCount - 1))

    // Alternate rotation per index
    const even = index % 2 === 0
    const desiredRotation = even ? 0.08 : -0.08

    // Smoothly interpolate camera rotation
    targetRot.current = THREE.MathUtils.damp(
      targetRot.current,
      desiredRotation,
      5,
      delta
    )

    cam.rotation.y = targetRot.current
  })

  // useFrame(() => {
  //   // const t = scroll.offset
  //   // const currentZ = THREE.MathUtils.lerp(startZ, endZ, t)
  //   const currentZ = startZ

  //   if (!cameraRef.current) return
  //   const cam = cameraRef.current

  //   // find nearest plane in z
  //   let closest = planes[0]
  //   let minDist = Math.abs(currentZ - planes[0].z)
  //   for (let i = 1; i < planes.length; i++) {
  //     const dist = Math.abs(currentZ - planes[i].z)
  //     if (dist < minDist) {
  //       minDist = dist
  //       closest = planes[i]
  //     }
  //   }

  //   // subtle look adjustment toward plane’s x (very slight rotation)
  //   const maxTurn = 0.03 // radians ≈ 1.7°
  //   const targetRotY =
  //     rotationY + THREE.MathUtils.clamp(closest.x * 0.1, -maxTurn, maxTurn)

  //   // smooth interpolation
  //   // cam.rotation.y = THREE.MathUtils.lerp(cam.rotation.y, targetRotY, 0.05)
  //   cam.rotation.y = rotationY
  //   cam.rotation.x = rotationX
  //   cam.rotation.z = rotationZ

  //   cam.position.x = THREE.MathUtils.lerp(cam.position.x, positionX, 0.05)
  //   // cam.position.y = THREE.MathUtils.lerp(cam.position.y, positionY, 0.05)
  //   cam.position.z = currentZ

  //   cam.fov = fov
  //   cam.updateProjectionMatrix()
  // })

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[positionX, positionY, startZ]}
      fov={fov}
    />
  )
}

export default function App() {
  const { backgroundColor } = useControls("BackgroundColor", {
    // backgroundColor: "#484848",
    backgroundColor: "#00091a",
  })

  const audioRef = useRef<AudioPlayerControls>(null)
  useEffect(() => {
    const handleClick = () => {
      if (audioRef.current) {
        audioRef.current.play()
      }
    }

    window.addEventListener("click", handleClick)

    const audioRefCurrent = audioRef.current

    return () => {
      window.removeEventListener("click", handleClick)
      if (audioRefCurrent) {
        audioRefCurrent.stop()
      }
    }
  }, [])

  const containerRef = useRef<HTMLDivElement>(null)
  const scrollProgress = useScrollSnapProgress(containerRef)
  const [quality] = useState<CanvasQuality>("low")

  return (
    <main className="w-full overflow-x-auto bg-black">
      <Leva collapsed />
      <SameerCanvas quality={quality}>
        <color attach="background" args={[backgroundColor]} />
        <CameraRig scrollProgress={scrollProgress} />
        <WaterSurfaceSimple
          width={25}
          length={25}
          waterSpeedFactor={40}
          position={[0, 0, 16]}
        />
        <ProductGroup scrollProgress={scrollProgress} />
        <BackgroundPlane />
        {/* <EnvironmentWrapper /> */}
        <EffectComposer>
          <DepthOfField
            focusDistance={0}
            focalLength={0.01}
            bokehScale={3}
            height={480}
          />
        </EffectComposer>
        <Stats />
      </SameerCanvas>

      {/* Scroll Snap HTML Overlay */}
      <div
        ref={containerRef}
        className="absolute inset-0 h-screen w-full snap-y snap-mandatory overflow-y-scroll scroll-smooth text-center text-white"
      >
        <section className="h-screen snap-start bg-transparent"></section>
        <section className="h-screen snap-start bg-transparent"></section>
        <section className="h-screen snap-start bg-transparent"></section>
        <section className="h-screen snap-start bg-transparent"></section>
      </div>
    </main>
  )
}
