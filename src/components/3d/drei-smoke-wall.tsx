import { useMemo } from "react"
import { Cloud, Clouds } from "@react-three/drei"
import { useControls } from "leva"
import * as THREE from "three"

const CENTER = new THREE.Vector3(0, 0, 0)

interface ParticleData {
  position: THREE.Vector3
  rotationZ: number
  baseRotation: THREE.Euler
}

interface CloudState {
  point?: THREE.Vector3
  volume: number
}

// function generateSmokeSemiCirclePositions(
//   count: number,
//   radius: number,
//   height: number,
//   spread: number
// ) {
//   const particlesData = []
//   const dummyMesh = new THREE.Object3D()

//   for (let i = 0; i < count; i++) {
//     const angleStart = Math.PI
//     const angleRange = Math.PI
//     const finalAngle = angleStart + Math.random() * angleRange

//     const currentRadius =
//       radius + Math.random() * spread * (Math.random() > 0.5 ? 1 : -1)

//     const x = Math.cos(finalAngle) * currentRadius
//     const z = Math.sin(finalAngle) * currentRadius

//     const y = 2 + Math.random() * height

//     const position = new THREE.Vector3(x, y, z)

//     dummyMesh.position.copy(position)
//     dummyMesh.lookAt(CENTER)

//     particlesData.push({
//       position: position,
//       rotationZ: (Math.random() * 360 * Math.PI) / 180,
//       baseRotation: new THREE.Euler().setFromQuaternion(dummyMesh.quaternion),
//     })
//   }
//   return particlesData
// }

// --------------------------------------------------------------------------------------

function generateSmokeSemiCirclePositions(
  count: number,
  radius: number,
  height: number,
  spread: number,
  trimAngle: number = Math.PI / 4 // trim amount on each side (default = 45°)
) {
  const particlesData: ParticleData[] = []
  const dummyMesh = new THREE.Object3D()

  // instead of full 180°, we remove trimAngle on both sides
  const angleStart = Math.PI + trimAngle
  const angleRange = Math.PI - trimAngle * 2

  for (let i = 0; i < count; i++) {
    const finalAngle = angleStart + Math.random() * angleRange

    const currentRadius =
      radius + Math.random() * spread * (Math.random() > 0.5 ? 1 : -1)

    const x = Math.cos(finalAngle) * currentRadius
    const z = Math.sin(finalAngle) * currentRadius
    const y = 2 + Math.random() * height

    const position = new THREE.Vector3(x, y, z)

    dummyMesh.position.copy(position)
    dummyMesh.lookAt(CENTER)

    particlesData.push({
      position,
      rotationZ: (Math.random() * 360 * Math.PI) / 180,
      baseRotation: new THREE.Euler().setFromQuaternion(dummyMesh.quaternion),
    })
  }

  return particlesData
}

export function DreiSmokeWall({ particleCount = 60 }) {
  const { smokeColor, smokeOpacity, smokeGrowth, smokeSpeed } = useControls(
    "Smoke Material",
    {
      smokeColor: { value: "red" },
      smokeOpacity: { value: 0.63, min: 0, max: 1, step: 0.01 },
      smokeGrowth: {
        value: 10,
        min: 0,
        max: 100,
        step: 0.1,
        hint: "For animated size changes",
      },
      smokeSpeed: {
        value: 0.4,
        min: 0,
        max: 4,
        step: 0.01,
        hint: "Controls rotational speed",
      },
    }
  )

  const { trimAngle } = useControls("Smoke Shape", {
    trimAngle: { value: Math.PI / 5.236, min: 0, max: Math.PI / 2, step: 0.05 },
    // trimAngle: { value: Math.PI / 3, min: 0, max: Math.PI / 2, step: 0.05 },
  })

  const waterPlaneSize = 100
  const baseRadius = waterPlaneSize / 2 + 5
  const height = 35 // Low height
  const densityMultiplier = 3
  const totalSegments = particleCount * densityMultiplier

  const particleData = useMemo(() => {
    return generateSmokeSemiCirclePositions(
      totalSegments,
      baseRadius,
      height,
      7, // spread
      trimAngle // Math.PI / 6 trim 30° on each side → shorter arc
    )
  }, [totalSegments, baseRadius, trimAngle])

  const maxPosition = useMemo(() => {
    let maxX = 0,
      maxY = 0,
      maxZ = 0
    particleData.forEach((d) => {
      maxX = Math.max(maxX, Math.abs(d.position.x))
      maxY = Math.max(maxY, d.position.y)
      maxZ = Math.max(maxZ, Math.abs(d.position.z))
    })
    const bounds: [number, number, number] = [maxX + 5, maxY + 5, maxZ + 5]
    return bounds
  }, [particleData])

  const distributeParticles = (cloudState: CloudState, index: number) => {
    const data = particleData[index]
    if (!data) return { point: new THREE.Vector3(), volume: 0 }
    const cloudPosition = cloudState.point || new THREE.Vector3(0, 0, 0)

    const point = new THREE.Vector3(
      data.position.x / (maxPosition[0] / 2) + cloudPosition.x,
      data.position.y / (maxPosition[1] / 2) + cloudPosition.y,
      data.position.z / (maxPosition[2] / 2) + cloudPosition.z
    )

    const volumeFactor = 1.0

    return { point, volume: volumeFactor }
  }

  return (
    <Clouds
      scale={1}
      // material={THREE.MeshPhongMaterial}
      // texture={getFullPath("/clouds/cloud-3.png")}
      limit={totalSegments}
    >
      <Cloud
        // opacity={smokeOpacity * 0.5} // reduce opacity
        seed={12}
        segments={totalSegments} // Total number of particles
        bounds={maxPosition} // The computed volume that encompasses all particles
        volume={25} // Base volume/thickness of segments
        color={smokeColor}
        opacity={smokeOpacity}
        speed={smokeSpeed}
        growth={smokeGrowth}
        concentrate="outside"
        distribute={distributeParticles}
      />
    </Clouds>
  )
}
