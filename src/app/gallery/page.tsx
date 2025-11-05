"use client"

import { useEffect } from "react"
import { getFullPath } from "@/helpers/pathHelper"
import {
  BakeShadows,
  CubeCamera,
  Environment,
  OrbitControls,
  Stats,
  useBoxProjectedEnv,
  useGLTF,
  useTexture,
} from "@react-three/drei"
import { Canvas, useThree } from "@react-three/fiber"
import { Leva, useControls } from "leva"
import * as THREE from "three"
import { GLTF, KTX2Loader } from "three-stdlib"

type GLTFResult = GLTF & {
  nodes: {
    VR_Gallery001_Material_0: THREE.Mesh
  }
  materials: {
    Material: THREE.MeshStandardMaterial
  }
}

export default function App() {
  return (
    <main className="w-full overflow-x-auto bg-black">
      <Leva collapsed />

      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        shadows
        camera={{ near: 0.1, far: 100, fov: 75, position: [0, 5, 10] }}
      >
        <fog attach="fog" args={["#000000", 0, 130]} />
        <ambientLight intensity={1} />
        <group position={[0, 0, 0]}>
          <Gallery />
          <ReflectiveFloor />
        </group>
        <OrbitControls />
        <Environment
          files={getFullPath("/env-maps/room.jpg")}
          environmentIntensity={3.4}
        />
        <BakeShadows />
        <Stats />
      </Canvas>
    </main>
  )
}

// @ts-expect-error temp ignore
function Gallery(props: JSX.IntrinsicElements["group"]) {
  const { gl } = useThree()
  const ktx2Loader = new KTX2Loader()
  ktx2Loader.setTranscoderPath(
    "https://unpkg.com/three@0.168.0/examples/jsm/libs/basis/"
  )

  const { nodes, materials } = useGLTF(
    getFullPath("/gallery/vr_modern_gallery_room_org_ktx.glb"),
    true,
    true,
    (loader) => {
      loader.setKTX2Loader(ktx2Loader.detectSupport(gl))
    }
  ) as GLTFResult

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        name="VR_Gallery001_Material_0"
        geometry={nodes.VR_Gallery001_Material_0.geometry}
        material={materials.Material}
        position={[0.13, 4.127, -0.001]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={12.449}
      />
    </group>
  )
}

// @ts-expect-error temp ignore
function ReflectiveFloor(props: JSX.IntrinsicElements["group"]) {
  const { up, scale, ...config } = useControls("Reflective Floor", {
    up: { value: 0, min: -100, max: 100 },
    scale: { value: 20, min: 5, max: 50 },
    roughness: { value: 0, min: 0, max: 1, step: 0.01 },
    metalness: { value: 1, min: 0, max: 1, step: 0.01 },
    envMapIntensity: { value: 0.8, min: 0, max: 5 },
    opacity: { value: 0.3, min: 0, max: 1, step: 0.01 },
    color: "#fffff",
  })

  const [floow_normal_texture] = useTexture([
    getFullPath("/reflection/normal.jpg"),
  ])

  const textureConfig = useControls("Texture Settings", {
    normalScale: { value: 0.21, min: -5, max: 5, step: 0.1 },
    normalScaleY: { value: -0.04, min: -5, max: 5, step: 0.1 },
  })

  useEffect(() => {
    if (floow_normal_texture) {
      floow_normal_texture.wrapS = floow_normal_texture.wrapT =
        THREE.RepeatWrapping

      floow_normal_texture.needsUpdate = true
    }
  }, [floow_normal_texture])

  const projection = useBoxProjectedEnv([0, up, 0], [scale, scale, scale])

  return (
    <CubeCamera
      frames={1}
      position={[0, 1, 0]}
      resolution={2048}
      near={0.1}
      far={100}
      {...props}
    >
      {(texture) => (
        <mesh
          receiveShadow
          position={[0, -1, -0.001]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[10.88, 24.85]} />
          <meshStandardMaterial
            envMap={texture}
            transparent
            color={config.color}
            {...projection}
            roughness={config.roughness}
            metalness={config.metalness}
            envMapIntensity={config.envMapIntensity}
            opacity={config.opacity}
            normalMap={floow_normal_texture}
            normalScale={[
              textureConfig.normalScale,
              textureConfig.normalScaleY,
            ]}
          />
        </mesh>
      )}
    </CubeCamera>
  )
}

// useGLTF.preload(getFullPath("/vr_modern_gallery_room_org_ktx.glb"))
