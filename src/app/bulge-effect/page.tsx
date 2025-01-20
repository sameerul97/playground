"use client"

import React, { useEffect, useRef } from "react"
import { getFullPath } from "@/helpers/pathHelper"
import { useTexture } from "@react-three/drei"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ShaderPlane = () => {
  const planeRef = useRef<THREE.Mesh>(null!)
  //   const { mouse, viewport, camera } = useThree()
  const mainTexture = useTexture(
    // "https://threejs.org/examples/textures/ambientcg/Ice002_1K-JPG_Color.jpg"
    getFullPath("/Marble012_1K-JPG/Marble012_1K-JPG_Color.jpg")
  )

  const shaderMaterial = useRef(
    new THREE.ShaderMaterial({
      uniforms: {
        _mainTex: { value: mainTexture },
        _centre: { value: new THREE.Vector2(0.0, 0.5) },
        _scale: { value: -0.5 },
        _radius: { value: 0.3 },
      },
      vertexShader: `
        varying vec2 vUv;        
        void main() {
          vUv = uv;                 
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D _mainTex;
        uniform vec2 _centre;
        uniform float _scale;
        uniform float _radius;
        varying vec2 vUv;        
        
        void main() {           
          vec2 uv = vUv; 
          vec2 centre = _centre * 0.51 + vec2(0.5, 0.5);
          uv = uv - centre;
          float buldgeDist = smoothstep(clamp(_scale, -1.0, _radius), _radius, distance(centre, vUv));
          uv = uv * buldgeDist + centre;
          uv = uv * 2.0 - 0.5;
          vec4 mainCol = texture2D(_mainTex, uv);
          if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
            discard;
          }
          gl_FragColor = mainCol;
        }
      `,
      transparent: true,
    })
  )

  //   useEffect(() => {
  //     const handleMouseMove = (event: MouseEvent) => {
  //       if (!planeRef.current) return

  //       const rect = viewport.getCurrentViewport(camera, [0, 0, 0])
  //       const x = (event.clientX / window.innerWidth) * 2 - 1
  //       const y = -(event.clientY / window.innerHeight) * 2 + 1

  //       const intersectPoint = new THREE.Vector3()
  //       const raycaster = new THREE.Raycaster()
  //       raycaster.setFromCamera({ x, y }, camera)

  //       const intersects = raycaster.intersectObject(planeRef.current)
  //       if (intersects.length > 0) {
  //         planeRef.current.worldToLocal(intersects[0].point)
  //         shaderMaterial.current.uniforms._centre.value.set(
  //           intersects[0].point.x / rect.width + 0.5,
  //           intersects[0].point.y / rect.height + 0.5
  //         )
  //       }
  //     }

  //     window.addEventListener("mousemove", handleMouseMove)
  //     return () => {
  //       window.removeEventListener("mousemove", handleMouseMove)
  //     }
  //   }, [camera, viewport])

  return (
    <mesh
      ref={planeRef}
      material={shaderMaterial.current}
      scale={[1.5, 1.5, 1.5]}
      rotation={[0, 0, 0]}
      position={[0, 0, 0]}
    >
      <planeGeometry args={[1, 1, 1, 1]} />
    </mesh>
  )
}

function InteractivePlane() {
  const planeRef = useRef()
  const { pointer, viewport } = useThree()

  // Load texture
  const texture = useTexture(getFullPath("/car.jpg"))

  // Initialize shader uniforms
  const uniforms = useRef({
    _mainTex: { value: texture },
    _centre: { value: new THREE.Vector2(0.0, 0.0) },
    _scale: { value: -0.5 },
    _radius: { value: 0.3 },
  })

  // Update `_centre` uniform using `pointer` in `useFrame`
  useFrame(() => {
    if (planeRef.current) {
      const x = (pointer.x * viewport.width) / 2
      const y = (pointer.y * viewport.height) / 1
      // ref.current.lookAt(x, y, 1)

      // Normalize pointer coordinates to plane UV space
      const normalizedPointer = new THREE.Vector2(
        x, // Convert from [-1, 1] to [0, 1]
        y
      )

      // Update shader uniform `_centre`
      uniforms.current._centre.value.copy(normalizedPointer)
    }
  })

  return (
    <mesh ref={planeRef} scale={[3, 1.5, 1.5]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        uniforms={uniforms.current}
        vertexShader={`
            varying vec2 vUv;
  
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
        fragmentShader={`
            uniform sampler2D _mainTex;
            uniform vec2 _centre;
            uniform float _scale;
            uniform float _radius;
  
            varying vec2 vUv;
  
            void main() {
              vec2 uv = vUv;
              vec2 centre = _centre * 0.51 + vec2(0.5, 0.5);
  
              uv = uv - centre;
              float buldgeDist = smoothstep(clamp(_scale, -1.0, _radius), _radius, distance(centre, vUv));
              uv = uv * buldgeDist + centre;
  
              uv = uv * 2.0 - 0.5;
              vec4 mainCol = texture2D(_mainTex, uv);
  
              if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
                discard;
              }
  
              gl_FragColor = mainCol;
            }
          `}
        transparent={true}
      />
    </mesh>
  )
}

const Scene = () => {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 0, 1)
  }, [camera])

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} />
      <directionalLight position={[-5, -3, -5]} intensity={1.5} />
      {/* <ShaderPlane /> */}
      <InteractivePlane />
    </>
  )
}

const App = () => {
  return (
    <main className="purple-bg w-full overflow-x-auto">
      <Canvas
        camera={{ fov: 75, near: 0.1, far: 100 }}
        onCreated={({ gl }) => {
          gl.setSize(window.innerWidth, window.innerHeight)
          gl.setPixelRatio(window.devicePixelRatio)
        }}
      >
        <Scene />
      </Canvas>
    </main>
  )
}

export default App
