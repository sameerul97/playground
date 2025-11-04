import React from "react"
import { getFullPath } from "@/helpers/pathHelper"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"
import { GLTF } from "three-stdlib"

type GLTFResult = GLTF & {
  nodes: {
    Object_2: THREE.Mesh
  }
  materials: Record<string, unknown>
}

// @ts-expect-error -- IGNORE --
export function MindFlayer(props: JSX.IntrinsicElements["group"]) {
  const { nodes } = useGLTF(
    getFullPath("/st/mind-f-compressed-v2.glb")
  ) as GLTFResult
  return (
    <group
      {...props}
      dispose={null}
      rotation={[0, THREE.MathUtils.degToRad(50), 0]}
      position={[0, 8, -50]}
      scale={0.5}
    >
      <mesh
        name="Object_2"
        geometry={nodes.Object_2.geometry}
        material={nodes.Object_2.material}
        position={[4.152, -18.999, -3.427]}
        rotation={[-Math.PI / 2, 0, -0.75]}
        material-roughness={0.7}
        material-color={"black"}
        material-transparent={true}
        material-opacity={0.8}
      />
    </group>
  )
}

useGLTF.preload(getFullPath("/st/mind-f-compressed-v2.glb.glb"))
