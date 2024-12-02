import { useEffect } from "react"
import { useThree } from "@react-three/fiber"
import { useControls } from "leva"
import * as THREE from "three"

export function ToneMapping() {
  const gl = useThree((state) => state.gl)
  const { mapping, exposure } = useControls("Tone Mapping", {
    exposure: { value: 2, min: 0, max: 4 },
    mapping: {
      value: "ACESFilmic",
      options: [
        "No",
        "Linear",
        "AgX",
        "ACESFilmic",
        "Reinhard",
        "Cineon",
        "Custom",
      ],
    },
  })

  useEffect(() => {
    const prevFrag = THREE.ShaderChunk.tonemapping_pars_fragment
    const prevTonemapping = gl.toneMapping
    const prevTonemappingExp = gl.toneMappingExposure
    // Model viewers "commerce" tone mapping
    // https://github.com/google/model-viewer/blob/master/packages/model-viewer/src/three-components/Renderer.ts#L141
    THREE.ShaderChunk.tonemapping_pars_fragment =
      THREE.ShaderChunk.tonemapping_pars_fragment.replace(
        "vec3 CustomToneMapping( vec3 color ) { return color; }",
        `float startCompression = 0.8 - 0.04;
         float desaturation = 0.15;
         vec3 CustomToneMapping( vec3 color ) {
           color *= toneMappingExposure;
           float x = min(color.r, min(color.g, color.b));
           float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
           color -= offset;
           float peak = max(color.r, max(color.g, color.b));
           if (peak < startCompression) return color;
           float d = 1. - startCompression;
           float newPeak = 1. - d * d / (peak + d - startCompression);
           color *= newPeak / peak;
           float g = 1. - 1. / (desaturation * (peak - newPeak) + 1.);
           return mix(color, vec3(1, 1, 1), g);
         }`
      )

    // @ts-expect-error temp ignore
    gl.toneMapping = THREE[mapping + "ToneMapping"]
    gl.toneMappingExposure = exposure
    return () => {
      // Retore on unmount or data change
      gl.toneMapping = prevTonemapping
      gl.toneMappingExposure = prevTonemappingExp
      THREE.ShaderChunk.tonemapping_pars_fragment = prevFrag
    }
  }, [mapping, exposure, gl])

  return null
}
