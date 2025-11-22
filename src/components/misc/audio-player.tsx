import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import { useThree } from "@react-three/fiber"
import * as THREE from "three"

export interface AudioPlayerControls {
  play: () => void
  pause: () => void
  stop: () => void
  isPlaying: () => boolean
}

interface AudioPlayerProps {
  /** Path to the audio file */
  src: string
  /** Whether to loop the sound (default: true) */
  loop?: boolean
  /** Initial volume (default: 0.5) */
  volume?: number
  /** Optional callback when audio finishes */
  onEnded?: () => void
}

export const AudioPlayer = forwardRef<AudioPlayerControls, AudioPlayerProps>(
  ({ src, loop = true, volume = 0.5, onEnded }, ref) => {
    const { camera } = useThree()
    const soundRef = useRef<THREE.Audio | null>(null)
    const isLoadedRef = useRef(false)

    useImperativeHandle(ref, () => ({
      play: () => {
        if (
          soundRef.current &&
          isLoadedRef.current &&
          !soundRef.current.isPlaying
        ) {
          soundRef.current.play()
        }
      },
      pause: () => {
        if (soundRef.current?.isPlaying) {
          soundRef.current.pause()
        }
      },
      stop: () => {
        if (soundRef.current?.isPlaying) {
          soundRef.current.stop()
        }
      },
      isPlaying: () => !!soundRef.current?.isPlaying,
    }))

    useEffect(() => {
      const listener = new THREE.AudioListener()
      camera.add(listener)
      const sound = new THREE.Audio(listener)
      soundRef.current = sound

      const audioLoader = new THREE.AudioLoader()
      audioLoader.load(src, (buffer) => {
        sound.setBuffer(buffer)
        sound.setLoop(loop)
        sound.setVolume(volume)
        isLoadedRef.current = true

        if (onEnded) {
          if (!loop) {
            const duration = buffer.duration * 1000
            setTimeout(() => {
              if (!sound.isPlaying) onEnded()
            }, duration)
          }
        }
      })

      return () => {
        sound.stop()
        camera.remove(listener)
      }
    }, [camera, src, loop, volume, onEnded])

    return null
  }
)

AudioPlayer.displayName = "AudioPlayer"
