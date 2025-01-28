import { useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

export const CameraTrackingLight = () => {
  const lightRef = useRef<THREE.DirectionalLight>(null)
  const { camera } = useThree()

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.position.copy(camera.position)
    }
  })

  return <directionalLight ref={lightRef} color="white" intensity={2} />
}
