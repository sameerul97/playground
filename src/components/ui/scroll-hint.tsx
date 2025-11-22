"use client"

import { useRef } from "react"
import { useScroll } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { easing } from "maath"
import tunnel from "tunnel-rat"

// Create the tunnel - export this so you can use t.Out in your App component
export const ScrollHintUi = tunnel()

export function ScrollHint({ started }: { started: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const scroll = useScroll()

  // Animate opacity based on scroll
  useFrame((state, delta) => {
    if (!ref.current || !started) return

    // Hide after scrolling 2% (adjust threshold as needed)
    const targetOpacity = scroll.offset > 0.02 ? 0 : 1
    easing.damp(ref.current.style, "opacity", targetOpacity, 0.2, delta)
  })

  if (!started) return null

  return (
    <ScrollHintUi.In>
      <div
        ref={ref}
        className="pointer-events-none fixed bottom-10 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center text-white"
        style={{ opacity: 0, transition: "opacity 0.5s" }}
      >
        <div className="scroll-hint-pulse mb-3 text-lg font-semibold">
          Scroll Down
        </div>

        {/* Vertical animated line */}
        <div className="scroll-line relative h-12 w-[2px] overflow-hidden rounded-full bg-white/30">
          <div className="scroll-line-fill absolute left-0 top-0 size-full"></div>
        </div>
      </div>
    </ScrollHintUi.In>
  )
}
