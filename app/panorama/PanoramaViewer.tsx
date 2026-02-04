'use client'
import { useRef, useEffect, useState, useCallback } from 'react'
import * as THREE from 'three'

type AxisPreset = 'y-up' | 'z-up' | 'y-up-flip' | 'z-up-flip' | 'x-up' | 'x-up-flip'

const axisConfigs: Record<AxisPreset, { sphereRotation: [number, number, number], upVector: [number, number, number], label: string }> = {
  'y-up': { sphereRotation: [0, Math.PI, 0], upVector: [0, 1, 0], label: 'Y-up (standard)' },
  'y-up-flip': { sphereRotation: [Math.PI, Math.PI, 0], upVector: [0, -1, 0], label: 'Y-up flipped' },
  'z-up': { sphereRotation: [Math.PI / 2, Math.PI, 0], upVector: [0, 0, 1], label: 'Z-up' },
  'z-up-flip': { sphereRotation: [-Math.PI / 2, Math.PI, 0], upVector: [0, 0, -1], label: 'Z-up flipped' },
  'x-up': { sphereRotation: [0, Math.PI, Math.PI / 2], upVector: [1, 0, 0], label: 'X-up' },
  'x-up-flip': { sphereRotation: [0, Math.PI, -Math.PI / 2], upVector: [-1, 0, 0], label: 'X-up flipped' },
}

const PanoramaViewer = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [isVideo, setIsVideo] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [axisPreset, setAxisPreset] = useState<AxisPreset>('y-up')
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    sphere: THREE.Mesh
    texture: THREE.Texture | THREE.VideoTexture
    isUserInteracting: boolean
    lon: number
    lat: number
    onPointerDownLon: number
    onPointerDownLat: number
    onPointerDownX: number
    onPointerDownY: number
  } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      const fileIsVideo = file.type.startsWith('video/')
      setIsVideo(fileIsVideo)
      setMediaUrl(url)
      setIsPlaying(true)
    }
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const initScene = useCallback((url: string, videoMode: boolean) => {
    if (!containerRef.current) return
    // Clean up existing scene
    if (sceneRef.current) {
      sceneRef.current.renderer.dispose()
      sceneRef.current.texture.dispose()
      containerRef.current.removeChild(sceneRef.current.renderer.domElement)
    }
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.src = ''
      videoRef.current = null
    }
    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.set(0, 0, 0)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)
    // Create sphere geometry with texture on inside
    const geometry = new THREE.SphereGeometry(500, 60, 40)
    geometry.scale(-1, 1, 1) // Invert to see inside
    let texture: THREE.Texture | THREE.VideoTexture
    if (videoMode) {
      const video = document.createElement('video')
      video.src = url
      video.crossOrigin = 'anonymous'
      video.loop = true
      video.muted = true
      video.playsInline = true
      video.play()
      videoRef.current = video
      texture = new THREE.VideoTexture(video)
    } else {
      const textureLoader = new THREE.TextureLoader()
      texture = textureLoader.load(url)
    }
    texture.colorSpace = THREE.SRGBColorSpace
    const material = new THREE.MeshBasicMaterial({ map: texture })
    const sphere = new THREE.Mesh(geometry, material)
    const config = axisConfigs[axisPreset]
    sphere.rotation.set(...config.sphereRotation)
    scene.add(sphere)
    camera.up.set(...config.upVector)
    sceneRef.current = {
      scene, camera, renderer, sphere, texture,
      isUserInteracting: false,
      lon: 0, lat: 0,
      onPointerDownLon: 0, onPointerDownLat: 0,
      onPointerDownX: 0, onPointerDownY: 0
    }
  }, [axisPreset])

  useEffect(() => {
    if (!mediaUrl) return
    initScene(mediaUrl, isVideo)
    const container = containerRef.current
    if (!container || !sceneRef.current) return
    const { renderer, camera } = sceneRef.current
    const onPointerDown = (e: PointerEvent) => {
      if (!sceneRef.current) return
      sceneRef.current.isUserInteracting = true
      sceneRef.current.onPointerDownX = e.clientX
      sceneRef.current.onPointerDownY = e.clientY
      sceneRef.current.onPointerDownLon = sceneRef.current.lon
      sceneRef.current.onPointerDownLat = sceneRef.current.lat
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!sceneRef.current || !sceneRef.current.isUserInteracting) return
      sceneRef.current.lon = (sceneRef.current.onPointerDownX - e.clientX) * 0.1 + sceneRef.current.onPointerDownLon
      sceneRef.current.lat = (e.clientY - sceneRef.current.onPointerDownY) * 0.1 + sceneRef.current.onPointerDownLat
    }
    const onPointerUp = () => {
      if (!sceneRef.current) return
      sceneRef.current.isUserInteracting = false
    }
    const onWheel = (e: WheelEvent) => {
      if (!sceneRef.current) return
      const fov = sceneRef.current.camera.fov + e.deltaY * 0.05
      sceneRef.current.camera.fov = THREE.MathUtils.clamp(fov, 10, 120)
      sceneRef.current.camera.updateProjectionMatrix()
    }
    const onResize = () => {
      if (!sceneRef.current || !container) return
      const w = container.clientWidth
      const h = container.clientHeight
      sceneRef.current.camera.aspect = w / h
      sceneRef.current.camera.updateProjectionMatrix()
      sceneRef.current.renderer.setSize(w, h)
    }
    container.addEventListener('pointerdown', onPointerDown)
    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerup', onPointerUp)
    container.addEventListener('wheel', onWheel)
    window.addEventListener('resize', onResize)
    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      if (!sceneRef.current) return
      const { scene, camera, renderer, lat, lon } = sceneRef.current
      const clampedLat = Math.max(-85, Math.min(85, lat))
      const phi = THREE.MathUtils.degToRad(90 - clampedLat)
      const theta = THREE.MathUtils.degToRad(lon + 180) // +180 to start looking at -Z
      const target = new THREE.Vector3(
        500 * Math.sin(phi) * Math.sin(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.cos(theta)
      )
      camera.lookAt(target)
      renderer.render(scene, camera)
    }
    animate()
    return () => {
      cancelAnimationFrame(animationId)
      container.removeEventListener('pointerdown', onPointerDown)
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerup', onPointerUp)
      container.removeEventListener('wheel', onWheel)
      window.removeEventListener('resize', onResize)
      if (sceneRef.current) {
        sceneRef.current.renderer.dispose()
      }
    }
  }, [mediaUrl, isVideo, initScene, axisPreset])

  const axisPresets = Object.keys(axisConfigs) as AxisPreset[]

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
      {!mediaUrl && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{ textAlign: 'center', color: '#fff' }}>
            <p style={{ marginBottom: '16px' }}>Select a spherical panorama image or video</p>
            <input ref={fileInputRef} type="file" accept="image/*,video/mp4,video/webm" onChange={handleFileChange} style={{ color: '#fff' }} />
          </div>
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height: '100%', display: mediaUrl ? 'block' : 'none', cursor: 'grab' }} />
      {mediaUrl && (
        <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,0,0,0.7)', padding: '8px', color: '#fff', fontSize: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div>
            <div style={{ marginBottom: '4px' }}>Axis:</div>
            <select value={axisPreset} onChange={e => setAxisPreset(e.target.value as AxisPreset)} style={{ background: '#333', color: '#fff', padding: '4px' }}>
              {axisPresets.map(preset => (
                <option key={preset} value={preset}>{axisConfigs[preset].label}</option>
              ))}
            </select>
          </div>
          {isVideo && (
            <button onClick={togglePlayPause} style={{ background: '#333', color: '#fff', padding: '4px 12px', cursor: 'pointer', border: 'none' }}>
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default PanoramaViewer
