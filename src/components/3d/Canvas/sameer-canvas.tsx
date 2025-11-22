import { MutableRefObject, useEffect, useRef, useState } from "react"
import { Canvas } from "@react-three/fiber"
import * as THREE from "three"

export type CanvasQuality = "default" | "high" | "low"

const qualityToDPR: Record<CanvasQuality, number | [number, number]> = {
  default: [1, 1],
  high: [1, 2],
  // TODO Workout a good value for low
  low: [0.8, 0.8],
}

type SameerCanvasProps = {
  quality: CanvasQuality
  children: React.ReactNode
}

export function SameerCanvas({ quality, children }: SameerCanvasProps) {
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const [frameloop, setFrameloop] = useState<"never" | "always">("never")

  return (
    <Canvas
      onCreated={(state) => {
        state.setSize(window.innerWidth, window.innerHeight)
      }}
      frameloop={frameloop}
      dpr={qualityToDPR[quality]}
      // camera={{
      //   position: [18.6, -0.6, 0],
      //   near: 0.1,
      //   far: 50,
      //   fov: 65,
      // }}
      shadows={"variance"}
      gl={(canvas) => {
        const renderer = new THREE.WebGLRenderer({
          canvas: canvas as HTMLCanvasElement,
          antialias: false,
          alpha: false,
          stencil: false,
        })

        // Initialize WebGL and store renderer reference
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.setSize(window.innerWidth, window.innerHeight)
        rendererRef.current = renderer
        setFrameloop("always")
        return renderer
      }}
    >
      {children}
      <ResizeHandler quality={quality} rendererRef={rendererRef} />
    </Canvas>
  )
}

type ResizeHandlerProps = {
  quality: CanvasQuality
  rendererRef: MutableRefObject<THREE.WebGLRenderer | null>
}

function ResizeHandler({ quality, rendererRef }: ResizeHandlerProps) {
  useEffect(() => {
    const handleResize = () => {
      if (rendererRef.current) {
        rendererRef.current.setSize(window.innerWidth, window.innerHeight)
      }
    }

    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [quality, rendererRef])

  return null
}
