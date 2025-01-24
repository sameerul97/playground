"use client"

import React, { useEffect, useRef, useState } from "react"
import { getFullPath } from "@/helpers/pathHelper"
import { OrthographicCamera, useFBO, useTexture } from "@react-three/drei"
import {
  Camera,
  Canvas,
  Size,
  useFrame,
  useThree,
  Viewport,
} from "@react-three/fiber"
import * as THREE from "three"

import useDimension from "@/hooks/use-dimension"
import useMouse from "@/hooks/use-mouse"

const fragment = `
uniform sampler2D uTexture;
uniform sampler2D uDisplacement;
uniform vec4 winResolution;
varying vec2 vUv;
float PI = 3.141592653589793238;

void main() {
  vec2 vUvScreen = gl_FragCoord.xy / winResolution.xy;

  vec4 displacement = texture2D(uDisplacement, vUvScreen);
  float theta = displacement.r*2.0*PI;

  vec2 dir = vec2(sin(theta),cos(theta));
  vec2 uv = vUvScreen + dir*displacement.r*0.075;
  vec4 color = texture2D(uTexture,uv);

  gl_FragColor = color;
}
`

const vertex = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

function Model() {
  const { viewport } = useThree()
  const texture = useTexture(getFullPath("/brush.png"))
  const meshRefs = useRef<THREE.Mesh[]>([])
  const [meshes, setMeshes] = useState<JSX.Element[]>([])
  const mouse = useMouse()
  const device = useDimension()
  const [prevMouse, setPrevMouse] = useState({ x: 0, y: 0 })
  const [currentWave, setCurrentWave] = useState(0)
  const { camera } = useThree()

  const scene = new THREE.Scene()
  const max = 100

  const uniforms = useRef({
    uDisplacement: { value: null },
    uTexture: { value: null },
    winResolution: {
      value: new THREE.Vector2(0, 0),
    },
  })

  const fboBase = useFBO(device.width, device.height)
  const fboTexture = useFBO(device.width, device.height)

  const { scene: imageScene, camera: imageCamera } = Images(viewport)

  const handleRef = (el: THREE.Mesh | null, i: number) => {
    if (el) {
      meshRefs.current[i] = el
    }
  }

  useEffect(() => {
    const generatedMeshes = Array.from({ length: max }).map((_, i) => (
      <mesh
        key={i}
        position={[0, 0, 0]}
        ref={(el) => handleRef(el, i)}
        rotation={[0, 0, Math.random()]}
        visible={false}
      >
        <planeGeometry args={[60, 60, 1, 1]} />
        <meshBasicMaterial transparent={true} map={texture} />
      </mesh>
    ))
    setMeshes(generatedMeshes)
  }, [texture])

  function setNewWave(x: number, y: number, currentWave: number) {
    const mesh = meshRefs.current[currentWave] as THREE.Mesh
    if (mesh) {
      mesh.position.x = x
      mesh.position.y = y
      mesh.visible = true
      const material = mesh.material as THREE.MeshBasicMaterial
      material.opacity = 1
      mesh.scale.x = 1
      mesh.scale.y = 1
    }
  }

  function trackMousePos(x: number, y: number) {
    if (Math.abs(x - prevMouse.x) > 0.1 || Math.abs(y - prevMouse.y) > 0.1) {
      setCurrentWave((currentWave + 1) % max)
      setNewWave(x, y, currentWave)
    }
    setPrevMouse({ x: x, y: y })
  }

  useFrame(({ gl, scene: finalScene }) => {
    const x = mouse.x - device.width / 2
    const y = -mouse.y + device.height / 2

    trackMousePos(x, y)

    meshRefs.current.forEach((mesh) => {
      if (mesh.visible) {
        mesh.rotation.z += 0.025
        const material = mesh.material as THREE.MeshBasicMaterial
        material.opacity *= 0.95
        mesh.scale.x = 0.98 * mesh.scale.x + 0.155
        mesh.scale.y = 0.98 * mesh.scale.y + 0.155
      }
    })

    if (device.width > 0 && device.height > 0) {
      gl.setRenderTarget(fboBase)
      gl.clear()
      meshRefs.current.forEach((mesh) => {
        if (mesh.visible) {
          scene.add(mesh)
        }
      })
      gl.render(scene, camera)
      meshRefs.current.forEach((mesh) => {
        if (mesh.visible) {
          scene.remove(mesh)
        }
      })
      // @ts-expect-error ignore temp
      uniforms.current.uTexture.value = fboTexture.texture

      gl.setRenderTarget(fboTexture)
      gl.render(imageScene, imageCamera)

      // @ts-expect-error ignore temp
      uniforms.current.uDisplacement.value = fboBase.texture

      gl.setRenderTarget(null)
      gl.render(finalScene, camera)

      // Render the scene with updated displacement
      gl.setRenderTarget(fboTexture)
      gl.clear()
      gl.render(scene, camera)

      // @ts-expect-error temp ignore
      uniforms.current.uTexture.value = fboTexture.texture
      gl.setRenderTarget(null)

      uniforms.current.winResolution.value = new THREE.Vector2(
        device.width,
        device.height
      ).multiplyScalar(device.pixelRatio)
    }
  }, 1)

  function Images(
    viewport: Viewport & {
      getCurrentViewport: (
        camera?: Camera,
        target?: THREE.Vector3 | Parameters<THREE.Vector3["set"]>,
        size?: Size
      ) => Omit<Viewport, "dpr" | "initialDpr">
    }
  ) {
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(
      viewport.width / -2,
      viewport.width / 2,
      viewport.height / 2,
      viewport.height / -2,
      -1000,
      1000
    )
    camera.position.z = 2
    scene.add(camera)
    const geometry = new THREE.PlaneGeometry(1, 1)
    const group = new THREE.Group()
    const texture1 = useTexture(getFullPath("/car.jpg"))
    const material1 = new THREE.MeshBasicMaterial({ map: texture1 })
    const image1 = new THREE.Mesh(geometry, material1)

    image1.scale.x = viewport.width / 2
    image1.scale.y = viewport.width / 4
    group.add(image1)

    scene.add(group)
    return { scene, camera }
  }

  return (
    <group>
      {meshes}
      <mesh>
        <planeGeometry args={[device.width, device.height, 1, 1]} />
        <shaderMaterial
          vertexShader={vertex}
          fragmentShader={fragment}
          transparent={true}
          uniforms={uniforms.current}
        />
      </mesh>
    </group>
  )
}

export default function Page() {
  const device = useDimension()

  if (!device.width || !device.height) {
    return null
  }

  const frustumSize = device.height
  const aspect = device.width / device.height

  return (
    <main className="purple-bg w-full overflow-x-auto">
      <Canvas>
        <OrthographicCamera
          makeDefault
          args={[
            (frustumSize * aspect) / -2,
            (frustumSize * aspect) / 2,
            frustumSize / 2,
            frustumSize / -2,
            -1000,
            1000,
          ]}
          position={[0, 0, 2]}
        />
        <Model />
      </Canvas>
    </main>
  )
}
