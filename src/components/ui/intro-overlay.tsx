"use client"

import React, { useEffect, useState } from "react"
import { Loader, useProgress } from "@react-three/drei"

interface IntroOverlayProps {
  onStart: () => void
  startText?: string
  backgroundColor?: string
}

export function IntroOverlay({
  onStart,
  startText = "Click to Continue",
  backgroundColor = "black",
}: IntroOverlayProps) {
  const { loaded, total } = useProgress()
  const [loadingDone, setLoadingDone] = useState(false)
  const [started, setStarted] = useState(false)

  // When loading completes, wait a bit then fade to overlay
  useEffect(() => {
    if (loaded === total && total > 0) {
      const t = setTimeout(() => setLoadingDone(true), 150)
      return () => clearTimeout(t)
    }
  }, [loaded, total])

  const handleStart = () => {
    setStarted(true)
    onStart()
  }

  return (
    <>
      {/* Loading Screen */}
      <div
        className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
        style={{
          background: backgroundColor,
          zIndex: 200,
          opacity: loadingDone ? 0 : 1,
          pointerEvents: loadingDone ? "none" : "auto",
        }}
      >
        <Loader
          containerStyles={{ background: backgroundColor }}
          dataInterpolation={(p) => `Loading ${p.toFixed(0)}%`}
        />
      </div>

      {/* Overlay Start Screen */}
      {!started && loadingDone && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-white transition-opacity duration-500"
          style={{
            zIndex: 150,
            background: "rgba(0,0,0,1)",
          }}
        >
          <h1
            onClick={handleStart}
            className="animate-pulse cursor-pointer text-3xl font-bold"
          >
            {startText}
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Loading complete. Click to start.
          </p>
        </div>
      )}
    </>
  )
}
