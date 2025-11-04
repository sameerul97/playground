import { useMemo, useRef } from "react"
import { getFullPath } from "@/helpers/pathHelper"
import { useTexture } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { PlaneGeometry, RepeatWrapping } from "three"
import * as THREE from "three"

import { WaterSimple } from "./Water/WaterSimple"

type Props = {
  width?: number
  length?: number
  dimensions?: number
  waterColor?: number
  position?: [number, number, number]
  distortionScale?: number
  fxDistortionFactor?: number
  fxDisplayColorAlpha?: number
  fxMixColor?: number | string
  children?: React.ReactNode
}

export default function WaterSurfaceSimple({
  width = 190,
  length = 190,
  dimensions = 1024,
  waterColor = 0x000000,
  position = [0, 0, 0],
  distortionScale = 0.7,
  fxDistortionFactor = 0.2,
  fxDisplayColorAlpha = 0.0,
  fxMixColor = 0x000000,
}: Props) {
  const ref = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>>()

  const waterNormals = useTexture(getFullPath("/water/water_normal.webp"))
  waterNormals.wrapS = waterNormals.wrapT = RepeatWrapping
  const geom = useMemo(() => new PlaneGeometry(width, length), [length, width])
  const config = useMemo(
    () => ({
      textureWidth: dimensions,
      textureHeight: dimensions,
      waterNormals,
      waterColor: waterColor,
      distortionScale: distortionScale,
      fxDistortionFactor: fxDistortionFactor,
      fxDisplayColorAlpha: fxDisplayColorAlpha,
      fxMixColor: fxMixColor,
      fog: false,
    }),
    [
      dimensions,
      distortionScale,
      fxDisplayColorAlpha,
      fxDistortionFactor,
      fxMixColor,
      waterColor,
      waterNormals,
    ]
  )
  useFrame((_, delta) => {
    if (ref.current) ref.current.material.uniforms.time.value += delta / 2
  })

  const waterObj = useMemo(() => new WaterSimple(geom, config), [geom, config])

  return (
    <primitive
      ref={ref}
      object={waterObj}
      rotation-x={-Math.PI / 2}
      position={position}
    />
  )
}
