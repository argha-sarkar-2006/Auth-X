import { useEffect, useRef, useState } from 'react'
import { extractFaceVector, loadFaceLandmarker } from '../lib/face'

// Full-screen camera modal. Loads the MediaPipe FaceLandmarker + webcam, lets
// the user capture a frame, and returns the flat face-landmark vector via
// onCapture. The camera is always stopped on unmount / cancel / success.
export default function FaceCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const landmarkerRef = useRef(null)

  const [status, setStatus] = useState('Starting camera…')
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }

  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const [stream, landmarker] = await Promise.all([
          navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } }),
          loadFaceLandmarker(),
        ])
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        landmarkerRef.current = landmarker
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setReady(true)
        setStatus('Center your face in the frame, then capture.')
      } catch (e) {
        setStatus(e?.message || 'Could not start the camera.')
      }
    }
    init()
    return () => {
      cancelled = true
      stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCapture = () => {
    if (!ready || busy || !landmarkerRef.current || !videoRef.current) return
    setBusy(true)
    const vec = extractFaceVector(landmarkerRef.current, videoRef.current)
    if (!vec) {
      setStatus('No face detected. Center your face and try again.')
      setBusy(false)
      return
    }
    stopCamera()
    onCapture(vec)
  }

  const handleCancel = () => {
    stopCamera()
    onCancel()
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 11000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        background: 'rgba(5,5,7,0.92)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: 24,
      }}
    >
      <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem', fontWeight: 700 }}>
        Capture Your Face
      </h2>

      <div
        style={{
          position: 'relative',
          width: 'min(90vw, 480px)',
          aspectRatio: '4 / 3',
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.15)',
          background: '#000',
        }}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
        />
      </div>

      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', textAlign: 'center', maxWidth: 420 }}>
        {status}
      </span>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          type="button"
          onClick={handleCancel}
          style={{
            padding: '11px 26px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'transparent',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleCapture}
          disabled={!ready || busy}
          style={{
            padding: '11px 30px',
            borderRadius: 999,
            border: 'none',
            background: '#7df9ff',
            color: '#000',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: !ready || busy ? 'default' : 'pointer',
            opacity: !ready || busy ? 0.5 : 1,
          }}
        >
          {busy ? 'Capturing…' : 'Capture'}
        </button>
      </div>
    </div>
  )
}
