import {
  BufferGeometry,
  Color,
  FrontSide,
  HalfFloatType,
  Matrix4,
  Mesh,
  PerspectiveCamera,
  Plane,
  ShaderMaterial,
  Side,
  Texture,
  UniformsLib,
  UniformsUtils,
  Vector3,
  Vector4,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three"

// Water options interface remains the same
type WaterOptions = {
  textureWidth?: number
  textureHeight?: number
  clipBias?: number
  alpha?: number
  time?: number
  waterNormals?: Texture
  waterColor?: Color | string | number
  eye?: Vector3
  distortionScale?: number
  side?: Side
  fog?: boolean
  fxDistortionFactor?: number
  fxDisplayColorAlpha?: number
  fxMixColor?: Color | string | number
}

class WaterSimple extends Mesh {
  constructor(geometry: BufferGeometry, options: WaterOptions = {}) {
    super(geometry)

    const textureWidth = options.textureWidth ?? 512
    const textureHeight = options.textureHeight ?? 512
    const clipBias = options.clipBias ?? 0.0
    const alpha = options.alpha ?? 1.0
    const time = options.time ?? 0.0
    const normalSampler = options.waterNormals ?? null
    const waterColor = new Color(options.waterColor ?? 0x7f7f7f)
    const eye = options.eye ?? new Vector3(0, 0, 0)
    const distortionScale = options.distortionScale ?? 20.0
    const side = options.side ?? FrontSide
    const fog = options.fog ?? false
    const fxDistortionFactor = options.fxDistortionFactor ?? 1.0
    const fxDisplayColorAlpha = options.fxDisplayColorAlpha
    const fxMixColor = new Color(options.fxMixColor ?? 0x000000)

    const mirrorPlane = new Plane()
    const normal = new Vector3()
    const mirrorWorldPosition = new Vector3()
    const cameraWorldPosition = new Vector3()
    const rotationMatrix = new Matrix4()
    const lookAtPosition = new Vector3(0, 0, -1)
    const clipPlane = new Vector4()

    const textureMatrix = new Matrix4()
    const mirrorCamera = new PerspectiveCamera()

    const renderTarget = new WebGLRenderTarget(textureWidth, textureHeight, {
      type: HalfFloatType,
    })

    const mirrorShader = {
      name: "MirrorShader",
      uniforms: UniformsUtils.merge([
        UniformsLib["fog"],
        UniformsLib["lights"],
        {
          sunColor: { value: new Color(0x7f7f7f) },
          sunDirection: { value: new Vector3(0.70707, 0.70707, 0) },
          normalSampler: { value: null },
          mirrorSampler: { value: null },
          alpha: { value: 1.0 },
          time: { value: 0.0 },
          size: { value: 1.0 },
          distortionScale: { value: 20.0 },
          textureMatrix: { value: new Matrix4() },
          eye: { value: new Vector3() },
          waterColor: { value: new Color(0x555555) },
          u_fx: { value: null },
          fxDistortionFactor: { value: 1.0 },
          fxDisplayColorAlpha: { value: 0.0 },
          fxMixColor: { value: new Vector3(0, 0, 0) },
        },
      ]),
      vertexShader: /* glsl */ `
        // vertex shader code remains the same...
      `,
      fragmentShader: /* glsl */ `
        // fragment shader code remains the same...
      `,
    }

    const material = new ShaderMaterial({
      name: mirrorShader.name,
      uniforms: UniformsUtils.clone(mirrorShader.uniforms),
      vertexShader: mirrorShader.vertexShader,
      fragmentShader: mirrorShader.fragmentShader,
      lights: true,
      side: side,
      fog: fog,
    })

    material.uniforms["mirrorSampler"].value = renderTarget.texture
    material.uniforms["textureMatrix"].value = textureMatrix
    material.uniforms["alpha"].value = alpha
    material.uniforms["time"].value = time
    material.uniforms["normalSampler"].value = normalSampler
    material.uniforms["waterColor"].value = waterColor
    material.uniforms["distortionScale"].value = distortionScale
    material.uniforms["eye"].value = eye
    material.uniforms["u_fx"].value = null
    material.uniforms["fxDistortionFactor"].value = fxDistortionFactor
    material.uniforms["fxDisplayColorAlpha"].value = fxDisplayColorAlpha
    material.uniforms["fxMixColor"].value = fxMixColor

    this.material = material

    this.onBeforeRender = (renderer: WebGLRenderer, scene, camera) => {
      mirrorWorldPosition.setFromMatrixPosition(this.matrixWorld)
      cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld)

      rotationMatrix.extractRotation(this.matrixWorld)

      normal.set(0, 0, 1)
      normal.applyMatrix4(rotationMatrix)

      const view = new Vector3()
      view.subVectors(mirrorWorldPosition, cameraWorldPosition)

      // Avoid rendering when mirror is facing away
      if (view.dot(normal) > 0) return

      view.reflect(normal).negate()
      view.add(mirrorWorldPosition)

      rotationMatrix.extractRotation(camera.matrixWorld)

      lookAtPosition.set(0, 0, -1)
      lookAtPosition.applyMatrix4(rotationMatrix)
      lookAtPosition.add(cameraWorldPosition)

      const target = new Vector3()
      target.subVectors(mirrorWorldPosition, lookAtPosition)
      target.reflect(normal).negate()
      target.add(mirrorWorldPosition)

      mirrorCamera.position.copy(view)
      mirrorCamera.up.set(0, 1, 0)
      mirrorCamera.up.applyMatrix4(rotationMatrix)
      mirrorCamera.up.reflect(normal)
      mirrorCamera.lookAt(target)

      // @ts-expect-error tempignore
      mirrorCamera.far = camera.far // Used in WebGLBackground
      mirrorCamera.updateMatrixWorld()
      mirrorCamera.projectionMatrix.copy(camera.projectionMatrix)

      // Update the texture matrix
      textureMatrix.set(
        0.5,
        0.0,
        0.0,
        0.5,
        0.0,
        0.5,
        0.0,
        0.5,
        0.0,
        0.0,
        0.5,
        0.5,
        0.0,
        0.0,
        0.0,
        1.0
      )
      textureMatrix.multiply(mirrorCamera.projectionMatrix)
      textureMatrix.multiply(mirrorCamera.matrixWorldInverse)

      // Update the clip plane and projection matrix
      mirrorPlane.setFromNormalAndCoplanarPoint(normal, mirrorWorldPosition)
      mirrorPlane.applyMatrix4(mirrorCamera.matrixWorldInverse)

      clipPlane.set(
        mirrorPlane.normal.x,
        mirrorPlane.normal.y,
        mirrorPlane.normal.z,
        mirrorPlane.constant
      )

      const projectionMatrix = mirrorCamera.projectionMatrix

      const q = new Vector4()
      q.x =
        (Math.sign(clipPlane.x) + projectionMatrix.elements[8]) /
        projectionMatrix.elements[0]
      q.y =
        (Math.sign(clipPlane.y) + projectionMatrix.elements[9]) /
        projectionMatrix.elements[5]
      q.z = -1.0
      q.w =
        (1.0 + projectionMatrix.elements[10]) / projectionMatrix.elements[14]

      clipPlane.multiplyScalar(2.0 / clipPlane.dot(q))

      projectionMatrix.elements[2] = clipPlane.x
      projectionMatrix.elements[6] = clipPlane.y
      projectionMatrix.elements[10] = clipPlane.z + 1.0 - clipBias
      projectionMatrix.elements[14] = clipPlane.w

      eye.setFromMatrixPosition(camera.matrixWorld)

      // Render
      const currentRenderTarget = renderer.getRenderTarget()

      const currentXrEnabled = renderer.xr.enabled
      const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate

      this.visible = false
      renderer.xr.enabled = false
      renderer.shadowMap.autoUpdate = false
      renderer.setRenderTarget(renderTarget)

      renderer.state.buffers.depth.setMask(true)
      if (renderer.autoClear === false) renderer.clear()
      renderer.render(scene, mirrorCamera)

      this.visible = true

      renderer.xr.enabled = currentXrEnabled
      renderer.shadowMap.autoUpdate = currentShadowAutoUpdate

      renderer.setRenderTarget(currentRenderTarget)

      // Restore viewport
      const viewport = camera.viewport
      if (viewport !== undefined) {
        renderer.state.viewport(viewport)
      }
    }
  }
}

export { WaterSimple }
