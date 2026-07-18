import { useEffect, useState } from 'react'
import ElectricBorder from './ElectricBorder'
import FaceCapture from './FaceCapture'
import qrImg from '../assets/qr.png'
import { connectMetaMask } from '../lib/metamask'
import { createAccount, getMyAccount, DEFAULT_BALANCE } from '../lib/wallet'

const shorten = (addr) =>
  addr && addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr || '—'

// refreshKey: bump it to make the wallet re-read the account (e.g. after a
// transfer changes the balance).
export default function Wallet({ user, refreshKey = 0 }) {
  const uid = user?.uid

  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)

  // step: idle | connecting | capturing | saving
  const [step, setStep] = useState('idle')
  const [error, setError] = useState(null)
  const [pendingAddress, setPendingAddress] = useState(null)

  // ── Load the user's account on mount and after every transfer ──────────
  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!uid) {
        setLoading(false)
        return
      }
      try {
        const acc = await getMyAccount(uid)
        if (!cancelled) setAccount(acc)
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Could not load your account.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [uid, refreshKey])

  // Step 1 — pull the wallet address from MetaMask (only happens here, once,
  // since the create flow only runs when the user has no account yet).
  const startCreate = async () => {
    setError(null)
    setStep('connecting')
    try {
      const address = await connectMetaMask()
      setPendingAddress(address)
      setStep('capturing')
    } catch (e) {
      setError(e?.message || 'Could not connect MetaMask.')
      setStep('idle')
    }
  }

  // Step 2 — face vector captured → save address + vector + balance locally.
  const onFaceCaptured = async (faceVector) => {
    setStep('saving')
    try {
      const acc = await createAccount({ uid, address: pendingAddress, faceVector })
      setAccount(acc)
      setStep('idle')
    } catch (e) {
      setError(e?.message || 'Could not create your account.')
      setStep('idle')
    }
  }

  const onFaceCancelled = () => {
    setStep('idle')
    setPendingAddress(null)
  }

  if (loading) {
    return (
      <ElectricBorder color="#7df9ff" speed={1} chaos={0.12} borderRadius={16} style={{ width: '100%' }}>
        <div style={{ position: 'relative', zIndex: 1, padding: '2rem 2.5rem', color: 'rgba(255,255,255,0.6)' }}>
          Loading account…
        </div>
      </ElectricBorder>
    )
  }

  // ── No account yet → one-time create flow ──────────────────────────────
  if (!account) {
    const connecting = step === 'connecting'
    const saving = step === 'saving'
    return (
      <>
        <ElectricBorder color="#7df9ff" speed={1} chaos={0.12} borderRadius={16} style={{ width: '100%' }}>
          <div style={{ position: 'relative', zIndex: 1, padding: '2rem 2.5rem' }}>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
              Create Your Account
            </h2>
            <p style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
              Connect MetaMask to import your wallet address, then capture your face.
              Every account starts with {DEFAULT_BALANCE} Sepolia ETH.
            </p>
            {error && (
              <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#ff8080' }}>{error}</p>
            )}
            <button
              type="button"
              onClick={startCreate}
              disabled={connecting || saving}
              style={{
                padding: '11px 30px',
                borderRadius: 999,
                border: 'none',
                background: '#7df9ff',
                color: '#000',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: connecting || saving ? 'default' : 'pointer',
                opacity: connecting || saving ? 0.6 : 1,
              }}
            >
              {connecting ? 'Connecting MetaMask…' : saving ? 'Saving…' : 'Connect MetaMask & Create'}
            </button>
          </div>
        </ElectricBorder>

        {step === 'capturing' && (
          <FaceCapture onCapture={onFaceCaptured} onCancel={onFaceCancelled} />
        )}
      </>
    )
  }

  // ── Account exists → details ───────────────────────────────────────────
  return (
    <ElectricBorder color="#7df9ff" speed={1} chaos={0.12} borderRadius={16} style={{ width: '100%' }}>
      <div style={{ position: 'relative', zIndex: 1, padding: '2rem 2.5rem' }}>
        <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Account Details</h2>
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <img src={qrImg} alt="QR Code" style={{ width: 160, height: 160, objectFit: 'contain', borderRadius: 8, flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', color: 'rgba(255,255,255,0.85)', fontSize: '1rem' }}>
            <div>
              <span style={{ opacity: 0.5, fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Wallet Address</span>
              <span style={{ fontFamily: 'monospace', fontSize: '1rem', wordBreak: 'break-all' }} title={account.address}>
                {shorten(account.address)}
              </span>
            </div>
            <div>
              <span style={{ opacity: 0.5, fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Balance</span>
              <span>{account.balance} ETH <span style={{ opacity: 0.5 }}>· $0.00</span></span>
            </div>
            <div>
              <span style={{ opacity: 0.5, fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Face Vector</span>
              <span style={{ color: account.hasFaceVector ? '#7dffb0' : 'rgba(255,255,255,0.5)' }}>
                {account.hasFaceVector ? 'Captured ✓' : 'Not captured'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </ElectricBorder>
  )
}
