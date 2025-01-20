import * as React from "react"

export default function useMouse() {
  const [mouse, setMouse] = React.useState({ x: 0, y: 0, pixelRatio: 0 })

  const mouseMove = (e: { clientX: number; clientY: number }) => {
    const { clientX, clientY } = e
    setMouse({
      x: clientX,
      y: clientY,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
    })
  }

  React.useEffect(() => {
    window.addEventListener("mousemove", mouseMove)
    return () => {
      window.removeEventListener("mousemove", mouseMove)
    }
  }, [])

  return mouse
}
