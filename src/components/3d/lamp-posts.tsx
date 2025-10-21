import React, { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

import { LampPost } from "./lamp-post"

export function LampPosts() {
  const group = useRef<THREE.Group>(null!)

  const speed = 0.02
  const spacing = 8
  const lampCount = 4
  const loopDistance = spacing * lampCount
  const lampOffsetX = 5

  useFrame(() => {
    group.current.children.forEach((lamp) => {
      lamp.position.z -= speed
      if (lamp.position.z < -loopDistance / 2) {
        lamp.position.z += loopDistance
      }
    })
  })

  return (
    <group ref={group} rotation={[0, Math.PI / 2, 0]}>
      {Array.from({ length: lampCount }).flatMap((_, i) => {
        const z = i * -spacing
        return [
          <LampPost
            key={`left-${i}`}
            scale={0.15}
            position={[-lampOffsetX, -0.28, z]}
          />,
          <LampPost
            key={`right-${i}`}
            scale={0.15}
            position={[lampOffsetX, -0.28, z]}
          />,
        ]
      })}
    </group>
  )
}
