/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react"
// useGLTF.preload(getFullPath("/st/vecna_resized_transformed.glb"))
// useGLTF.preload(getFullPath("/st/public/st/vecna_resized_transformed_ktx.glb"))

import Link from "next/link"
import { getFullPath } from "@/helpers/pathHelper"
import {
  Environment,
  ScrollControls,
  Stats,
  useDetectGPU,
  useGLTF,
  useHelper,
  useScroll,
  useTexture,
} from "@react-three/drei"
import {
  Canvas,
  extend,
  useFrame,
  useLoader,
  useThree,
} from "@react-three/fiber"
import { Leva, useControls } from "leva"
import { easing } from "maath"
import * as THREE from "three"
import { GLTF, KTX2Loader, Water } from "three-stdlib"
import tunnel from "tunnel-rat"

import { IntroOverlay } from "@/components/ui/intro-overlay"
import { ScrollHint, ScrollHintUi } from "@/components/ui/scroll-hint"
import { DreiSmokeWall } from "@/components/3d/drei-smoke-wall"
import { MindFlayer } from "@/components/3d/mind-flayer"
import WaterSurfaceSimple from "@/components/3d/WaterSurfaceSimple"
import {
  AudioPlayer,
  AudioPlayerControls,
} from "@/components/misc/audio-player"

extend({ Water })

function Ocean() {
  const ref = useRef()
  const gl = useThree((state) => state.gl)

  // Load the water normal map
  const waterNormals = useLoader(
    THREE.TextureLoader,
    getFullPath("/water/water_normal.webp")
  )
  waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping

  const { waterColor, sunColor, distortionScale } = useControls(
    "Ocean Controls",
    {
      waterColor: "#960000",
      sunColor: "#050505",
      distortionScale: { value: 2.0, min: 0, max: 10, step: 0.1 },
    }
  )

  const geom = useMemo(() => new THREE.PlaneGeometry(100, 100), [])
  const config = useMemo(
    () => ({
      textureWidth: 512,
      textureHeight: 512,
      waterNormals,
      sunDirection: new THREE.Vector3(),
      sunColor,
      waterColor,
      distortionScale,
      fog: true,
      // @ts-expect-error temp ignore
      format: gl.encoding,
    }),
    [waterNormals, sunColor, waterColor, distortionScale, gl]
  )

  useFrame((state, delta) => {
    if (!ref.current) return
    // @ts-expect-error temp ignore
    ref.current.material.uniforms.time.value += delta / 2
    // @ts-expect-error temp ignore
    ref.current.material.uniforms.distortionScale.value = distortionScale
    // @ts-expect-error temp ignore
    ref.current.material.uniforms.waterColor.value.set(waterColor)
    // @ts-expect-error temp ignore
    ref.current.material.uniforms.sunColor.value.set(sunColor)
  })

  return (
    <>
      {/* @ts-expect-error temp ignore */}
      <water
        ref={ref}
        position={[0, 0, -20]}
        args={[geom, config]}
        rotation-x={-Math.PI / 2}
      />
    </>
  )
}

type GLTFResult = GLTF & {
  nodes: {
    polySurface3_Vecna_MAT_0: THREE.Mesh
  }
  materials: {
    Vecna_MAT: THREE.MeshPhysicalMaterial
  }
}

// @ts-expect-error temp ignore
function Vecna(props: JSX.IntrinsicElements["group"]) {
  const { gl } = useThree()
  const ktx2Loader = new KTX2Loader()
  ktx2Loader.setTranscoderPath(
    "https://unpkg.com/three@0.168.0/examples/jsm/libs/basis/"
  )

  const { nodes, materials } = useGLTF(
    getFullPath("/st/vecna_resized_transformed_ktx.glb"),
    true,
    true,
    (loader) => {
      loader.setKTX2Loader(ktx2Loader.detectSupport(gl))
    }
  ) as GLTFResult

  // const { nodes, materials } = useGLTF(
  //   // getFullPath("/st/vecna_resized_transformed.glb")
  //   getFullPath("/st/public/st/vecna_resized_transformed_ktx.glb")
  // ) as GLTFResult

  const meshRef = useRef<THREE.Mesh>(null!)
  const scroll = useScroll()

  useFrame(() => {
    const scrollOffset = scroll.offset

    const scrollEndFactor = THREE.MathUtils.smoothstep(scrollOffset, 0.76, 1.0)

    // rotate right → left
    const startRot = -0.8
    const endRot = 0.1

    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      startRot,
      endRot,
      scrollEndFactor
    )
  })

  return (
    <group {...props} dispose={null}>
      <mesh
        ref={meshRef}
        geometry={nodes.polySurface3_Vecna_MAT_0.geometry}
        material={materials.Vecna_MAT}
      />
    </group>
  )
}

const buttonTunnel = tunnel()

function ScrollButton() {
  const scroll = useScroll()
  const buttonRef = useRef<HTMLDivElement>(null)

  useFrame((state, delta) => {
    if (!buttonRef.current) return

    const targetOpacity = scroll.offset >= 0.95 ? 1 : 0
    easing.damp(buttonRef.current.style, "opacity", targetOpacity, 0.2, delta)
    buttonRef.current.style.pointerEvents =
      scroll.offset >= 0.95 ? "auto" : "none"
  })

  return (
    <buttonTunnel.In>
      <div>
        <div
          ref={buttonRef}
          className="absolute bottom-20 left-1/2 z-[200] -translate-x-1/2"
          style={{ opacity: 0 }}
        >
          <Link
            legacyBehavior
            href="https://www.netflix.com/gb/title/80057281"
            passHref
          >
            <a
              className="rounded-full bg-[#e50815] px-6 py-3 text-white transition-opacity duration-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              WATCH NOW
            </a>
          </Link>
        </div>
      </div>
    </buttonTunnel.In>
  )
}

function EnvironmentWrapper() {
  const { envIntensity } = useControls("Environment", {
    envIntensity: { value: 0.9, min: 0, max: 5, step: 0.1 },
    // groundHeight: { value: 32, min: 0, max: 100, step: 1 },
    // groundRadius: { value: 122, min: 0, max: 200, step: 1 },
    // groundScale: { value: 12, min: 1, max: 50, step: 1 },
  })

  return null
  return (
    <Environment
      preset="warehouse"
      background
      // ground={{
      //   height: groundHeight,
      //   radius: groundRadius,
      //   scale: groundScale,
      // }}
      environmentIntensity={envIntensity}
    />
  )
}

// function PointLightWrapper() {
//   const {
//     lightPositionX,
//     lightPositionY,
//     lightPositionZ,
//     lightPosition,
//     lightIntensity,
//     lightColor,
//     // lightIntensity,
//     lightTargetX,
//     lightTargetY,
//     lightTargetZ,
//   } = useControls("Point Light", {
//     lightPositionX: { value: 10, min: -1000, max: 1000, step: 0.1, label: "X" },
//     lightPositionY: { value: 10, min: -1000, max: 1000, step: 0.1, label: "Y" },
//     lightPositionZ: { value: 10, min: -1000, max: 1000, step: 0.1, label: "Z" },
//     lightPosition: { value: [10, 10, 10], min: -1000, max: 1000, step: 1 },
//     lightColor: "red", // Default color,
//     lightIntensity: { value: 1000, min: 0, max: 10000, step: 0.1 },
//     lightTargetX: { value: 0, min: -10, max: 10, step: 0.1 },
//     lightTargetY: { value: 0, min: -10, max: 10, step: 0.1 },
//     lightTargetZ: { value: 0, min: -10, max: 10, step: 0.1 },
//   })

//   // Reference to the point light and its target
//   const pointLightRef = useRef(null)
//   const lightTargetRef = useRef(new THREE.Object3D())

//   useHelper(pointLightRef, THREE.PointLightHelper)

//   useEffect(() => {
//     if (pointLightRef.current && lightTargetRef.current) {
//       // Update the light target's position dynamically
//       lightTargetRef.current.position.set(
//         lightTargetX,
//         lightTargetY,
//         lightTargetZ
//       )
//       // @ts-expect-error temp ignore
//       pointLightRef.current.target = lightTargetRef.current
//       // @ts-expect-error temp ignore
//       pointLightRef.current.target.updateMatrixWorld()
//     }
//   }, [lightTargetX, lightTargetY, lightTargetZ])

//   return (
//     <>
//       <pointLight
//         ref={pointLightRef}
//         position={[lightPositionX, lightPositionY, lightPositionZ]} // Controlled via 'lightPosition'
//         // position={lightPosition} // Controlled via 'lightPosition'
//         intensity={lightIntensity} // Controlled via 'lightIntensity'
//         color={lightColor} // Controlled via 'lightColor'
//       />
//       {/* Optional: Add a helper to visualize the light's target */}
//       <mesh position={[lightTargetX, lightTargetY, lightTargetZ]}>
//         <sphereGeometry args={[0.1]} />
//         <meshStandardMaterial color="red" />
//       </mesh>
//     </>
//   )
// }

const smokeTextureURL =
  "https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png"

const CENTER = new THREE.Vector3(0, 0, 0)

function generateSmokeSemiCirclePositions(
  count: number,
  radius: number,
  height: number,
  spread: number
) {
  const particlesData = []

  const dummyMesh = new THREE.Object3D()

  for (let i = 0; i < count; i++) {
    const angleStart = Math.PI
    const angleRange = Math.PI
    const finalAngle = angleStart + Math.random() * angleRange

    const currentRadius =
      radius + Math.random() * spread * (Math.random() > 0.5 ? 1 : -1)

    const x = Math.cos(finalAngle) * currentRadius
    const z = Math.sin(finalAngle) * currentRadius

    const y = 2 + Math.random() * height

    const position = new THREE.Vector3(x, y, z)

    dummyMesh.position.copy(position)
    dummyMesh.lookAt(CENTER)

    const baseRotation = [
      dummyMesh.rotation.x,
      dummyMesh.rotation.y,
      dummyMesh.rotation.z,
    ] as [number, number, number]

    particlesData.push({
      position: position,
      rotationZ: (Math.random() * 360 * Math.PI) / 180,
      baseRotation: baseRotation,
    })
  }
  return particlesData
}

function SemiCircleSmoke({ particleCount = 150 }) {
  const { smokeColor, smokeOpacity } = useControls("Smoke Material", {
    smokeColor: { value: "purple" },
    smokeOpacity: {
      value: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
    },
  })

  const smokeTexture = useLoader(THREE.TextureLoader, smokeTextureURL)
  // const smokeTexture = useLoader(
  //   THREE.TextureLoader,
  //   getFullPath("/clouds/cloud-1.png")
  // )

  const smokeGeo = useMemo(() => new THREE.PlaneGeometry(30, 30), [])
  const smokeMaterial = useMemo(
    () =>
      new THREE.MeshLambertMaterial({
        color: new THREE.Color(smokeColor),
        map: smokeTexture,
        transparent: true,
        opacity: smokeOpacity,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [smokeTexture, smokeColor, smokeOpacity] // Dependency array includes controls
  )

  const particlesRef = useRef<(THREE.Mesh | null)[]>([])

  const waterPlaneSize = 100
  const baseRadius = waterPlaneSize / 2 + 5

  const particlePositionsAndRotations = useMemo(() => {
    // Now calls the updated function
    return generateSmokeSemiCirclePositions(
      particleCount * 2,
      baseRadius,
      50,
      10
    )
  }, [particleCount, baseRadius])

  useFrame((state, delta) => {
    particlesRef.current.forEach((particle, index) => {
      const data = particlePositionsAndRotations[index]

      if (particle && data) {
        const rotationZ = data.baseRotation[2] + state.clock.elapsedTime * 0.2 // Use state.clock.elapsedTime for cumulative rotation

        particle.rotation.set(
          data.baseRotation[0],
          data.baseRotation[1],
          rotationZ
        )
      }
    })
  })

  return (
    <>
      {particlePositionsAndRotations.map((data, index) => (
        <mesh
          key={index}
          geometry={smokeGeo}
          material={smokeMaterial}
          position={data.position}
          // Use the calculated base rotation from the data
          rotation={data.baseRotation}
          ref={(el) => (particlesRef.current[index] = el)}
        />
      ))}
    </>
  )
}

// Define the new target positions for the dynamic movement
// const TARGET_POS_1 = new THREE.Vector3(-81, 53, -78)
// const TARGET_POS_2 = new THREE.Vector3(78, 48, -49)

// For Fake Flat cloud plane
const TARGET_POS_1 = new THREE.Vector3(-81, 63, -135)
const TARGET_POS_2 = new THREE.Vector3(78, 43, -135)
// const TARGET_POS_1 = new THREE.Vector3(-27, 20, -41)
// const TARGET_POS_2 = new THREE.Vector3(37, 20, -48)

// Target light for Vecna object
const VecnaPosLight1 = new THREE.Vector3(-37, 24, -49)
const VecnaPosLight2 = new THREE.Vector3(35, 24, -29)

const TARGET_DISTANCE_1 = 100
const TARGET_DISTANCE_2 = 70

function ThunderLight({ isVecna = true }: { isVecna?: boolean }) {
  const light1Ref = useRef<THREE.PointLight>(null)
  const light2Ref = useRef<THREE.PointLight>(null)
  const scroll = useScroll()

  // Use refs for intensity, color, and decay value to maintain frame-to-frame continuity
  const intensity1 = useRef(0)
  const intensity2 = useRef(0)

  const { lightColor, triggerProbability, maxIntensity, showHelper } =
    useControls("Thunder", {
      lightColor: { value: "#ff0000" },
      triggerProbability: {
        value: 0.01,
        min: 0.001,
        max: 0.05,
        step: 0.001,
        hint: "Chance per frame to trigger a flash",
      },
      maxIntensity: { value: 15000, min: 500, max: 50000, step: 50 },
      showHelper: { value: false, label: "Show Helper" },
    })
  const { light1Pos, light1Distance: baseDistance1 } = useControls("Light 1", {
    light1Pos: {
      value: { x: -60, y: 35, z: -95 },
      step: 1,
      label: "Base Position",
    },
    light1Distance: { value: 150, min: 50, max: 500, step: 10 },
  })

  const { light2Pos, light2Distance: baseDistance2 } = useControls("Light 2", {
    light2Pos: {
      value: { x: 60, y: 25, z: -95 },
      step: 1,
      label: "Base Position",
    },
    light2Distance: { value: 150, min: 50, max: 500, step: 10 },
  })

  const [dynamicPos1] = useState(
    () => new THREE.Vector3(light1Pos.x, light1Pos.y, light1Pos.z)
  )
  const [dynamicPos2] = useState(
    () => new THREE.Vector3(light2Pos.x, light2Pos.y, light2Pos.z)
  )

  const BASE_POS_1 = useMemo(
    () => new THREE.Vector3(light1Pos.x, light1Pos.y, light1Pos.z),
    [light1Pos]
  )
  const BASE_POS_2 = useMemo(
    () => new THREE.Vector3(light2Pos.x, light2Pos.y, light2Pos.z),
    [light2Pos]
  )

  const currentTargetPos1 = useRef(BASE_POS_1.clone())
  const currentTargetPos2 = useRef(BASE_POS_2.clone())

  const colorA = useMemo(() => new THREE.Color(), [])
  const colorB = useMemo(() => new THREE.Color("#ffffff"), [])
  const finalColor = useMemo(() => new THREE.Color(), [])

  useFrame(() => {
    const scrollOffset = scroll.offset

    const scrollEndFactor = THREE.MathUtils.smoothstep(
      scrollOffset,
      0.8, // Start transition at 80% scroll
      1.0 // End transition at 100% scroll
    )

    const flickerFactor = 1.0 - scrollEndFactor
    const maxFlashIntensity = maxIntensity * flickerFactor

    const endSceneBaseIntensity = maxIntensity * 0.2
    const baseIntensity = endSceneBaseIntensity * scrollEndFactor

    const isFlashingAllowed = flickerFactor > 0.01

    const movementProbability = 0.5
    const shouldMove = Math.random() < movementProbability

    const positionLerpSpeed = 0.05

    // --- Light 1 Update ---
    if (isFlashingAllowed) {
      if (Math.random() < triggerProbability) {
        intensity1.current = baseIntensity + maxFlashIntensity

        if (shouldMove) {
          currentTargetPos1.current = TARGET_POS_1
        }
      } else {
        // Decay towards the current base intensity
        intensity1.current = Math.max(
          baseIntensity,
          intensity1.current - maxFlashIntensity * 0.1
        )

        // Slowly move back to base position when not flashing and intensity is low
        if (intensity1.current < baseIntensity + maxIntensity * 0.05) {
          currentTargetPos1.current = BASE_POS_1
        }
      }
    } else {
      // If not flashing, maintain base intensity and return to base position
      intensity1.current = baseIntensity
      currentTargetPos1.current = BASE_POS_1

      if (isVecna) {
        currentTargetPos1.current = VecnaPosLight1
      }
    }

    // Interpolate position 1 and distance 1
    dynamicPos1.lerp(currentTargetPos1.current, positionLerpSpeed)
    const dynamicDistance1 = THREE.MathUtils.lerp(
      baseDistance1,
      TARGET_DISTANCE_1,
      scrollEndFactor
    )

    // --- Light 2 Update ---
    if (isFlashingAllowed) {
      if (Math.random() < triggerProbability * 0.9) {
        intensity2.current = baseIntensity + maxFlashIntensity

        if (shouldMove) {
          currentTargetPos2.current = TARGET_POS_2
        }
      } else {
        // Decay towards the current base intensity
        intensity2.current = Math.max(
          baseIntensity,
          intensity2.current - maxFlashIntensity * 0.1
        )

        // Slowly move back to base position when not flashing and intensity is low
        if (intensity2.current < baseIntensity + maxIntensity * 0.05) {
          currentTargetPos2.current = BASE_POS_2
        }
      }
    } else {
      // If not flashing, maintain base intensity and return to base position
      intensity2.current = baseIntensity
      currentTargetPos2.current = BASE_POS_2

      if (isVecna) {
        currentTargetPos2.current = VecnaPosLight2
      }
    }

    dynamicPos2.lerp(currentTargetPos2.current, positionLerpSpeed)
    const dynamicDistance2 = THREE.MathUtils.lerp(
      baseDistance2,
      TARGET_DISTANCE_2,
      scrollEndFactor
    )

    colorA.set(lightColor)
    finalColor.copy(colorA).lerp(colorB, scrollEndFactor)

    if (light1Ref.current) {
      light1Ref.current.intensity = intensity1.current
      light1Ref.current.color.copy(finalColor)
      light1Ref.current.position.copy(dynamicPos1)
      light1Ref.current.distance = dynamicDistance1
    }
    if (light2Ref.current) {
      light2Ref.current.intensity = intensity2.current
      light2Ref.current.color.copy(finalColor)
      light2Ref.current.position.copy(dynamicPos2)
      light2Ref.current.distance = dynamicDistance2
    }
  })

  const helperTarget1 = showHelper ? light1Ref : null
  const helperTarget2 = showHelper ? light2Ref : null

  useHelper(helperTarget1, THREE.PointLightHelper, 5, lightColor)
  useHelper(helperTarget2, THREE.PointLightHelper, 5, lightColor)

  return (
    <>
      <pointLight ref={light1Ref} decay={2} power={10000} />
      <pointLight ref={light2Ref} decay={2} power={10000} />
    </>
  )
}

function FakeCloud() {
  const texture = useTexture(getFullPath("/st/foggy-cloud.webp"))
  const { color, positionY, positionZ } = useControls("Background FakeCloud", {
    // color: "white",
    color: "#ff0505",
    positionY: { value: 3.5, min: -220, max: 220, step: 0.01 },
    positionZ: { value: -145, min: -170, max: -20, step: 0.01 },
  })
  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.needsUpdate = true
    }
  }, [texture])

  return (
    <>
      <mesh
        // scale={40}
        scale={[655, 355, 1]}
        // position={[0, 2, -12]}
        // position={[0, 3.5, -55]}
        rotation={[0, 0, THREE.MathUtils.degToRad(-10)]}
        position={[0, positionY + 30, positionZ - 1]}
      >
        <planeGeometry />
        <meshLambertMaterial
          color={color}
          transparent
          opacity={1}
          map={texture}
        />
      </mesh>
      <mesh
        // scale={40}
        scale={[655, 355, 1]}
        // position={[0, 2, -12]}
        // position={[0, 3.5, -55]}
        position={[0, positionY, positionZ]}
      >
        <planeGeometry />
        <meshLambertMaterial
          color={color}
          transparent
          opacity={1}
          map={texture}
        />
      </mesh>
    </>
  )
}

interface FadingPlaneProps {
  texturePath: string
  position?: [number, number, number]
  scale?: number | [number, number, number]
  args?: [number, number]
  fadeInStart?: number
  fadeInEnd?: number
  fadeOutStart?: number
  fadeOutEnd?: number
  transparent?: boolean
}

function FadingPlane({
  texturePath,
  position = [0, 0, 0],
  scale = 1,
  args = [1, 1],
  fadeInStart = 30, // Start fading in
  fadeInEnd = 20, // Fully visible
  fadeOutStart = 10, // Start fading out
  fadeOutEnd = 5, // Completely invisible
  transparent = true,
}: FadingPlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)
  const [texture] = useTexture([texturePath])
  const { camera } = useThree()

  const planePosition = useMemo(
    () => new THREE.Vector3(...position),
    [position]
  )

  useFrame(() => {
    if (!meshRef.current || !materialRef.current) return

    const distance = camera.position.distanceTo(planePosition)
    let opacity = 0

    if (distance <= fadeOutEnd) {
      // Too close - completely invisible
      opacity = 0
    } else if (distance <= fadeOutStart) {
      // Fading out as we get closer
      opacity = (distance - fadeOutEnd) / (fadeOutStart - fadeOutEnd)
    } else if (distance <= fadeInEnd) {
      // Fully visible range
      opacity = 1
    } else if (distance <= fadeInStart) {
      // Fading in as we approach
      opacity = 1 - (distance - fadeInEnd) / (fadeInStart - fadeInEnd)
    } else {
      // Too far - completely invisible
      opacity = 0
    }

    opacity = Math.max(0, Math.min(1, opacity))
    materialRef.current.opacity = opacity
  })

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <planeGeometry args={args} />
      <meshBasicMaterial
        color={"red"}
        ref={materialRef}
        map={texture}
        transparent={transparent}
        opacity={0}
        depthWrite={false}
      />
    </mesh>
  )
}

const TARGET_FOV = 90

function CameraRig({
  isMobile,
  started,
}: {
  isMobile: boolean
  started: boolean
}) {
  const scroll = useScroll()
  const [vec] = useState(() => new THREE.Vector3())

  // STATE FOR INTRO
  const introProgress = useRef(0) // 0 → 1
  const introDone = useRef(false)

  // INITIAL + FINAL CAMERA POSITIONS
  const introStartPos = useMemo(() => new THREE.Vector3(0, 2, 100), [])
  const introEndPos = useMemo(() => new THREE.Vector3(0, 4, 90), [])

  useFrame((state, delta) => {
    const camera = state.camera as THREE.PerspectiveCamera

    // ─────────────────────────────
    // INTRO CAMERA ANIMATION
    // ─────────────────────────────
    if (!introDone.current) {
      if (!started) {
        // hold at initial position before the click
        camera.position.lerp(introStartPos, 0.2)
        return
      }

      introProgress.current += delta * 0.6 // animation speed
      const t = THREE.MathUtils.clamp(introProgress.current, 0, 1)

      camera.position.lerpVectors(introStartPos, introEndPos, t)

      // Optionally animate FOV during intro
      camera.fov = THREE.MathUtils.lerp(30, 60, t)
      camera.updateProjectionMatrix()

      if (t >= 1) introDone.current = true
      return
    }

    // ─────────────────────────────
    // NORMAL SCROLL CAMERA BEHAVIOR
    // (Runs only after intro is complete)
    // ─────────────────────────────
    const scrollOffset = scroll.offset

    const scrollEndFactor = THREE.MathUtils.smoothstep(scrollOffset, 0.8, 1.0)

    const dynamicFov = THREE.MathUtils.lerp(60, TARGET_FOV, scrollEndFactor)

    if (camera.fov !== dynamicFov) {
      camera.fov = dynamicFov
      camera.updateProjectionMatrix()
    }

    // Z movement
    const zPos = THREE.MathUtils.lerp(90, -30, scrollOffset)

    // X/Y movement: desktop only
    const mouseX = isMobile ? 0 : state.pointer.x * 0.9
    const mouseY = isMobile ? 0 : state.pointer.y * 0.4

    // Build vector and lerp camera
    vec.set(mouseX, 4 + mouseY, zPos)

    // vec.set(mouseX, 4 + mouseY, zPos)

    camera.position.lerp(vec, 0.05)
  })

  return null
}

function ThunderFloor() {
  const texture = useTexture(getFullPath("/st/thunder-1.png"))

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, -Math.PI / 1.5]}
      position={[0, 0.1, 0]}
      scale={202}
    >
      <planeGeometry />
      <meshBasicMaterial
        map={texture}
        opacity={0.5}
        color={"red"}
        transparent
      />
    </mesh>
  )
}

export function Experience() {
  const { backgroundColor } = useControls("BackgroundColor", {
    backgroundColor: "#000000",
  })

  const GPUTier = useDetectGPU()
  const [dpr, setDpr] = useState<[number, number]>([1, 1])
  const [isMobile, setIsMobile] = useState(false)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (GPUTier.tier === 3) {
      setIsMobile(false)
      setDpr([1, 2])
    } else {
      setIsMobile(true)
      setDpr([1, 1])
    }

    // if (GPUTier.tier === 0 || GPUTier.isMobile) {
    //   setIsMobile(true)
    //   setDpr([1, 1])
    // }
  }, [GPUTier.tier])

  const audioRef = useRef<AudioPlayerControls>(null)

  const handleStartClick = () => {
    setStarted(true)
    audioRef.current?.play()
  }

  // Hemisphere light controls
  const {
    hemisphereLightIntensity,
    skyColor,
    groundColor,
    position: hemispherePosition,
    rotation,
  } = useControls("Hemisphere Light", {
    // hemisphereLightIntensity: { value: 0.15, min: 0, max: 2, step: 0.01 },
    hemisphereLightIntensity: { value: 2, min: 0, max: 2, step: 0.01 },
    skyColor: "#fff",
    groundColor: "#890000",
    position: { value: [0, 50, 0], step: 0.1 },
    rotation: { value: [0, 0, 0], min: 0, max: Math.PI * 2, step: 0.01 },
  })

  return (
    <>
      <Leva collapsed hidden />
      <IntroOverlay
        onStart={handleStartClick}
        startText="Tap to Begin"
        backgroundColor="#000"
      />

      <Canvas dpr={dpr}>
        <Suspense fallback={null}>
          <color attach="background" args={[backgroundColor]} />
          {/* <fog attach="fog" args={[fogColor, fogStart, fogEnd]} /> */}

          <ThunderFloor />
          <DreiSmokeWall />

          {/* Static foggy cloud via image */}
          {/* <VecnaPlane
                    texturePath={getFullPath("/st/foggy-cloud.png")}
                    position={[0, 3.5, -55]}
                    scale={[455, 255, 1]}
                    fadeInStart={1000}
                  /> */}
          <FakeCloud />
          <ScrollControls pages={8} damping={0.1}>
            <ThunderLight />

            <ScrollHint started={started} />
            <ScrollButton />
            <FadingPlane
              // texturePath={getFullPath("/st/st-3.png")}
              texturePath={getFullPath("/st/st-3-resized.png")}
              position={[0, 4, 65]}
              scale={[5, 6, 1]}
              args={[5, 2]}
              fadeInStart={1000}
            />
            <FadingPlane
              texturePath={getFullPath("/st/5.png")}
              position={[0, 4, 65.5]}
              scale={[4, 6, 1]}
              args={[5, 2]}
              fadeInStart={1000}
            />

            <FadingPlane
              // texturePath={getFullPath("/st/red-frame-with-text.png")}
              // texturePath={getFullPath("/st/get-ready-2.png")}
              texturePath={getFullPath("/st/get-ready-mob-2.png")}
              position={[0, 4, 40]}
              // scale={17}
              scale={[15, 5, 1]}
              fadeInStart={35} // Starts fading in at 25 units
              fadeInEnd={20} // Fully visible at 20 units
              fadeOutStart={15} // Starts fading out at 15 units
              fadeOutEnd={2} // Completely invisible at 10 units
            />

            <FadingPlane
              texturePath={getFullPath("/st/ch-3.png")}
              position={[0, 4, 20]}
              scale={[20, 10, 1]}
              fadeInStart={28} // Starts fading in at 28 units
              fadeInEnd={15} // Fully visible at 15 units
              fadeOutStart={8} // Starts fading out at 8 units
              fadeOutEnd={3} // Completely invisible at 3 units
            />

            <FadingPlane
              texturePath={getFullPath("/st/one-last-adventure-2.png")}
              position={[0, 4.5, 0]}
              scale={[13, 6, 1]}
              fadeInStart={28} // Starts fading in at 28 units
              fadeInEnd={15} // Fully visible at 15 units
              fadeOutStart={8} // Starts fading out at 8 units
              fadeOutEnd={3} // Completely invisible at 3 units
            />

            <FadingPlane
              texturePath={getFullPath("/st/see-you-2.png")}
              position={[0, 3.5, -42]}
              scale={[25, 6, 1]}
              fadeInStart={35} // Starts fading in at 28 units
              fadeInEnd={25} // Fully visible at 15 units
            />

            <Vecna
              // rotation={[0, THREE.MathUtils.degToRad(20), 0]}
              position={[0, -18, -50]}
              scale={5}
            />
            <MindFlayer />
            <CameraRig started={started} isMobile={isMobile} />
            <WaterSurfaceSimple />
            <hemisphereLight
              name="HemisphereLight"
              intensity={hemisphereLightIntensity}
              color={skyColor}
              groundColor={groundColor}
              position={hemispherePosition}
              rotation={rotation}
            />
            <AudioPlayer
              ref={audioRef}
              src={getFullPath("/st/bg.mp3")}
              volume={0.5}
              loop
            />
            <EnvironmentWrapper />
          </ScrollControls>
          <Stats className="hidden" />
        </Suspense>
      </Canvas>
      <ScrollHintUi.Out />
      <div id="ui">
        <buttonTunnel.Out />
      </div>
    </>
  )
}
