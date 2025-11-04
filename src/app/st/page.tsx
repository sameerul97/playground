/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { getFullPath } from "@/helpers/pathHelper"
import {
  Environment,
  OrbitControls,
  Plane,
  Stats,
  useHelper,
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
import { random } from "maath"
import * as THREE from "three"
import { Water } from "three-stdlib"

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

function ThunderLight() {
  const light1Ref = useRef(null)
  const light2Ref = useRef(null)

  // Leva controls for light position and base color
  const { lightColor, triggerProbability, maxIntensity, showHelper } =
    useControls("Thunder", {
      lightColor: { value: "#ff0000" }, // Red light as requested
      triggerProbability: {
        value: 0.015,
        min: 0.001,
        max: 0.05,
        step: 0.001,
        hint: "Chance per frame to trigger a flash",
      },
      maxIntensity: { value: 15000, min: 500, max: 50000, step: 50 },
      showHelper: { value: false, label: "Show Helper" }, // 👈 Add this
    })

  // Use a state variable for intensity to allow fast updating and decay
  const [intensity1, setIntensity1] = useState(0)
  const [intensity2, setIntensity2] = useState(0)

  // --- Light 1 position controls ---
  const { light1Pos, light1Distance } = useControls("Light 1", {
    light1Pos: {
      value: { x: -60, y: 35, z: -95 },
      step: 1,
      label: "Position",
    },
    light1Distance: { value: 150, min: 50, max: 500, step: 10 },
  })

  // --- Light 2 position controls ---
  const { light2Pos, light2Distance } = useControls("Light 2", {
    light2Pos: {
      value: { x: 60, y: 25, z: -95 },
      step: 1,
      label: "Position",
    },
    light2Distance: { value: 150, min: 50, max: 500, step: 10 },
  })

  // Frame update logic (thunder flash behavior)
  useFrame(() => {
    if (Math.random() < triggerProbability) {
      setIntensity1(maxIntensity)
    } else {
      setIntensity1((i) => Math.max(0, i - maxIntensity * 0.1))
    }

    if (Math.random() < triggerProbability * 0.9) {
      setIntensity2(maxIntensity)
    } else {
      setIntensity2((i) => Math.max(0, i - maxIntensity * 0.1))
    }

    // @ts-expect-error temp ignore
    if (light1Ref.current) light1Ref.current.intensity = intensity1
    // @ts-expect-error temp ignore
    if (light2Ref.current) light2Ref.current.intensity = intensity2
  })

  // Helpers
  const helperTarget1 = showHelper ? light1Ref : null
  const helperTarget2 = showHelper ? light2Ref : null

  useHelper(helperTarget1, THREE.PointLightHelper, 5, lightColor)
  useHelper(helperTarget2, THREE.PointLightHelper, 5, lightColor)

  return (
    <>
      <pointLight
        ref={light1Ref}
        position={[light1Pos.x, light1Pos.y, light1Pos.z]}
        color={lightColor}
        intensity={intensity1}
        distance={light1Distance}
        decay={2}
        power={10000}
      />

      {/* Light 2 */}
      <pointLight
        ref={light2Ref}
        position={[light2Pos.x, light2Pos.y, light2Pos.z]}
        color={lightColor}
        intensity={intensity2}
        distance={light2Distance}
        decay={2}
        power={10000}
      />
    </>
  )
}

function Poster() {
  const [poster] = useTexture([getFullPath("/st/st-3.png")])
  return (
    <Plane position={[0, 4, 60]} scale={[4, 5, 1]} args={[5, 2]}>
      <meshBasicMaterial color="red" map={poster} transparent opacity={1} />
    </Plane>
  )
}

function Ch1() {
  const [poster] = useTexture([getFullPath("/st/ch-1.png")])
  return (
    <Plane position={[0, 4, -10]} scale={27}>
      <meshBasicMaterial color="red" map={poster} transparent opacity={1} />
    </Plane>
  )
}

function Intro() {
  const [vec] = useState(() => new THREE.Vector3())
  return useFrame((state) => {
    state.camera.position.lerp(
      vec.set(state.pointer.x * 12, 12 + state.pointer.y * 12, 80),
      0.05
    )
    state.camera.lookAt(0, 6, 0)
  })
}

export default function App() {
  const box = random.inBox(new Float32Array(300 * 5), { sides: [1, 1, 1] })
  const spherical = random.onSphere(box, { radius: 1 })

  const { backgroundColor } = useControls("BackgroundColor", {
    backgroundColor: "#000000",
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

  // const { fogColor, fogStart, fogEnd } = useControls("Fog", {
  //   fogColor: "#050505",
  //   fogStart: { value: 40, min: 0, max: 1000, step: 1 },
  //   fogEnd: { value: 100, min: 0, max: 1000, step: 1 },
  // })

  return (
    <main className=" w-full overflow-x-auto bg-black">
      <Leva collapsed />
      <Canvas
        shadows
        camera={{
          position: [0, 3, 1200],
          // position: [0, 15.5, 25],
        }}
        // camera={{ position: [0, 1, 10], far: 20000 }}
      >
        <color attach="background" args={[backgroundColor]} />

        {/* <SemiCircleSmoke /> */}
        <DreiSmokeWall />
        <ThunderLight />
        <Poster />
        {/* <Ch1 /> */}
        <MindFlayer />
        <OrbitControls />
        <Intro />
        {/* <Ocean /> */}
        <WaterSurfaceSimple />
        <pointLight
          name="PointLight"
          intensity={10000}
          decay={2}
          distance={105}
          color="red"
          position={[0, 10, -12]}
        />
        <AudioPlayer
          ref={audioRef}
          src={getFullPath("/st/bg.mp3")}
          volume={0.5}
          loop
        />
        <EnvironmentWrapper />
        <Stats />
      </Canvas>
    </main>
  )
}
