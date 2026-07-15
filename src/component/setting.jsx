import { useEffect, useRef, useState } from 'react'
import { HeroLogo } from './herologo'
import SideRays from './SideRays'
import ProfileCard from './ProfileCard'
import { db } from '../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

// ── Resize + compress an image File into a small JPEG data URL ──────────────
// Keeps the payload comfortably under Firestore's ~1MB per-document limit by
// downscaling to a max dimension and re-encoding as JPEG.
function fileToResizedDataUrl(file, maxDim = 400, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Invalid image'))
      img.onload = () => {
        let { width, height } = img
        if (width >= height && width > maxDim) {
          height = Math.round((height * maxDim) / width)
          width = maxDim
        } else if (height > width && height > maxDim) {
          width = Math.round((width * maxDim) / height)
          height = maxDim
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

// ── Settings page ──────────────────────────────────────────────────────────
export default function Setting({ onClose, user }) {
  const fallbackName = user?.displayName || user?.email?.split('@')[0] || 'User'
  const handle = (user?.email?.split('@')[0] || 'user').toLowerCase()

  const [userName, setUserName] = useState(fallbackName)
  const [draftName, setDraftName] = useState('')
  const [profileImage, setProfileImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const currentName = userName

  // ── Load persisted profile (name + image) from Firestore on mount ────────
  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!user?.uid) {
        setLoading(false)
        return
      }
      try {
        const snap = await getDoc(doc(db, 'users', user.uid))
        if (!cancelled && snap.exists()) {
          const data = snap.data()
          if (data.photoDataUrl) setProfileImage(data.photoDataUrl)
          if (data.displayName) setUserName(data.displayName)
        }
      } catch (e) {
        if (!cancelled) setError('Could not load your saved profile.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user?.uid])

  // ── Persist a change name to Firestore ───────────────────────────────────
  const saveName = async () => {
    const next = draftName.trim()
    if (!next) return
    setUserName(next)
    setDraftName('')
    if (!user?.uid) return
    try {
      await setDoc(doc(db, 'users', user.uid), { displayName: next }, { merge: true })
    } catch (e) {
      setError('Could not save your user name.')
    }
  }

  // ── Handle profile image upload → resize → save to Firestore ─────────────
  const onFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    setError(null)
    setSaving(true)
    try {
      const dataUrl = await fileToResizedDataUrl(file)
      setProfileImage(dataUrl)
      if (user?.uid) {
        await setDoc(doc(db, 'users', user.uid), { photoDataUrl: dataUrl }, { merge: true })
      }
    } catch (err) {
      setError(err?.message || 'Could not upload the image.')
    } finally {
      setSaving(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const openFilePicker = () => fileInputRef.current?.click()

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflowY: 'auto',
        background: '#0a0a0a',
        color: '#ffffff',
        zIndex: 500,
        fontFamily: 'inherit',
      }}
    >
      {/* SideRays background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <SideRays speed={2.5} rayColor1="#EAB308" rayColor2="#96c8ff" intensity={2} spread={2} origin="top-right" tilt={0} saturation={1.5} blend={0.75} falloff={1.6} opacity={1} />
      </div>

      {/* Back button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          title="Close Settings"
          style={{
            position: 'fixed',
            top: 20,
            left: 20,
            zIndex: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 16px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'rgba(20,20,22,0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s ease, border-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(20,20,22,0.65)'
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
      )}

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1080,
          margin: '0 auto',
          padding: '80px 32px 140px',
        }}
      >
        {/* ── Hero (sparkles built in) ── */}
        <HeroLogo name="AuthX" subtitle="Settings" />

        {/* ── Settings: sections centered/wider + profile card on the right ── */}
        <div
          style={{
            marginTop: 32,
            display: 'flex',
            gap: 24,
            alignItems: 'flex-start',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {/* Left / main column — the settings sections */}
          <div
            style={{
              flex: '1 1 520px',
              minWidth: 300,
              maxWidth: 640,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {/* Current user name */}
            <SettingCard>
              <SettingLabel>User Name</SettingLabel>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{currentName}</div>
            </SettingCard>

            {/* Change user name */}
            <SettingCard>
              <SettingLabel>Change User Name</SettingLabel>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Enter new user name"
                  onKeyDown={(e) => { if (e.key === 'Enter') saveName() }}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    color: '#fff',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={saveName}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 999,
                    border: 'none',
                    background: '#96c8ff',
                    color: '#000',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  Save
                </button>
              </div>
            </SettingCard>

            {/* Language */}
            <SettingCard>
              <SettingLabel>Language</SettingLabel>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)' }}>English</span>
                <Badge>Supported: English only</Badge>
              </div>
            </SettingCard>

            {/* Currency */}
            <SettingCard>
              <SettingLabel>Currency</SettingLabel>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)' }}>USD ($)</span>
                <Badge>Supported: USD only</Badge>
              </div>
            </SettingCard>

            {/* Default network */}
            <SettingCard>
              <SettingLabel>Default Network</SettingLabel>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.85)' }}>Sepolia ETH</span>
                <Badge>Testnet</Badge>
              </div>
            </SettingCard>
          </div>

          {/* Right column — profile image card */}
          <div style={{ flex: '0 0 340px', maxWidth: 340, width: '100%' }}>
            <SettingCard>
              <SettingLabel>Upload Profile Image</SettingLabel>

              <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 8px' }}>
                {loading ? (
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Loading profile…</span>
                ) : profileImage ? (
                  <ProfileCard
                    avatarUrl={profileImage}
                    miniAvatarUrl={profileImage}
                    name={currentName}
                    title="AuthX User"
                    handle={handle}
                    status="Online"
                    showUserInfo
                    enableTilt
                    contactText="Change"
                    onContactClick={openFilePicker}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      borderRadius: 12,
                      border: '1px dashed rgba(255,255,255,0.2)',
                      padding: '28px 16px',
                      textAlign: 'center',
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: 13,
                    }}
                  >
                    No profile image yet
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                style={{ display: 'none' }}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={saving || loading}
                  style={{
                    padding: '10px 22px',
                    borderRadius: 999,
                    border: 'none',
                    background: '#96c8ff',
                    color: '#000',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: saving || loading ? 'default' : 'pointer',
                    opacity: saving || loading ? 0.6 : 1,
                  }}
                >
                  {profileImage ? 'Change Image' : 'Upload Image'}
                </button>
                {saving && <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Saving…</span>}
              </div>

              {error && <span style={{ fontSize: 12, color: '#ff8080', textAlign: 'center' }}>{error}</span>}
            </SettingCard>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Small presentational helpers ───────────────────────────────────────────
function SettingCard({ children }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '18px 20px',
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(9,9,11,0.6)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {children}
    </div>
  )
}

function SettingLabel({ children }) {
  return (
    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
      {children}
    </span>
  )
}

function Badge({ children }) {
  return (
    <span
      style={{
        padding: '4px 12px',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        fontSize: 11,
        fontWeight: 600,
        color: 'rgba(255,255,255,0.6)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}
