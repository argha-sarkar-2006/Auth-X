import { useEffect, useState } from 'react'
import ElectricBorder from './ElectricBorder'
import qrImg from '../assets/qr.png'
import {
  createAccount,
  getMyAccount,
  sendEth,
  subscribeAccount,
  subscribeHistory,
} from '../lib/wallet'

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 10,
  padding: '11px 16px',
  color: '#fff',
  fontSize: '1rem',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  color: 'rgba(255,255,255,0.5)',
  marginBottom: 6,
}

const shorten = (addr) =>
  addr && addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr || '—'

export default function Wallet({ user }) {
  const uid = user?.uid

  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)

  // One-time setup form
  const [setupAddr, setSetupAddr] = useState('')
  const [setupBalance, setSetupBalance] = useState('')
  const [setupError, setSetupError] = useState(null)
  const [creating, setCreating] = useState(false)

  // Send form
  const [receiver, setReceiver] = useState('')
  const [amount, setAmount] = useState('')
  const [sendError, setSendError] = useState(null)
  const [sendMsg, setSendMsg] = useState(null)
  const [sending, setSending] = useState(false)

  // History
  const [history, setHistory] = useState([])

  // ── Load the user's account once on mount ──────────────────────────────
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
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [uid])

  // ── Once an account exists, live-sync its balance and history ──────────
  useEffect(() => {
    if (!account?.address) return
    const unsubAcc = subscribeAccount(account.address, (acc) => {
      if (acc) setAccount(acc)
    })
    const unsubHist = subscribeHistory(account.address, setHistory)
    return () => {
      unsubAcc()
      unsubHist()
    }
  }, [account?.address])

  const handleCreate = async () => {
    setSetupError(null)
    setCreating(true)
    try {
      const acc = await createAccount(uid, setupAddr, Number(setupBalance))
      setAccount(acc)
    } catch (e) {
      setSetupError(e?.message || 'Could not create account.')
    } finally {
      setCreating(false)
    }
  }

  const handleSend = async () => {
    setSendError(null)
    setSendMsg(null)
    setSending(true)
    try {
      await sendEth(account.address, receiver, Number(amount))
      setSendMsg(`Sent ${amount} ETH to ${shorten(receiver.trim())}.`)
      setReceiver('')
      setAmount('')
    } catch (e) {
      setSendError(e?.message || 'Transaction failed.')
    } finally {
      setSending(false)
    }
  }

  // ── One-time account setup ─────────────────────────────────────────────
  if (!loading && !account) {
    return (
      <ElectricBorder color="#7df9ff" speed={1} chaos={0.12} borderRadius={16} style={{ width: '100%' }}>
        <div style={{ position: 'relative', zIndex: 1, padding: '2rem 2.5rem' }}>
          <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
            Set Up Your Account
          </h2>
          <p style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
            Enter your account address and starting balance. These can only be set once.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={labelStyle}>Account Address</label>
              <input
                type="text"
                placeholder="0x..."
                value={setupAddr}
                onChange={(e) => setSetupAddr(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Starting Balance (Sepolia ETH)</label>
              <input
                type="number"
                placeholder="0.00"
                value={setupBalance}
                onChange={(e) => setSetupBalance(e.target.value)}
                style={inputStyle}
              />
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 6, display: 'block' }}>
                USD value is always $0 on testnet.
              </span>
            </div>
            {setupError && (
              <span style={{ fontSize: '0.85rem', color: '#ff8080' }}>{setupError}</span>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <button
                type="button"
                onClick={handleCreate}
                disabled={creating}
                style={{
                  padding: '11px 32px',
                  borderRadius: 999,
                  border: 'none',
                  background: '#7df9ff',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: creating ? 'default' : 'pointer',
                  opacity: creating ? 0.6 : 1,
                }}
              >
                {creating ? 'Creating…' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      </ElectricBorder>
    )
  }

  return (
    <>
      {/* ── Account Details ── */}
      <ElectricBorder color="#7df9ff" speed={1} chaos={0.12} borderRadius={16} style={{ width: '100%' }}>
        <div style={{ position: 'relative', zIndex: 1, padding: '2rem 2.5rem' }}>
          <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Account Details</h2>
          <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <img src={qrImg} alt="QR Code" style={{ width: 160, height: 160, objectFit: 'contain', borderRadius: 8, flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', color: 'rgba(255,255,255,0.85)', fontSize: '1rem' }}>
              <div>
                <span style={{ opacity: 0.5, fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Wallet Address</span>
                <span style={{ fontFamily: 'monospace', fontSize: '1rem', wordBreak: 'break-all' }}>{account?.address}</span>
              </div>
              <div>
                <span style={{ opacity: 0.5, fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Balance</span>
                <span>{(account?.balance ?? 0)} ETH <span style={{ opacity: 0.5 }}>· $0.00</span></span>
              </div>
            </div>
          </div>
        </div>
      </ElectricBorder>

      {/* ── Send Transaction ── */}
      <ElectricBorder color="#EAB308" speed={1} chaos={0.12} borderRadius={16} style={{ width: '100%' }}>
        <div style={{ position: 'relative', zIndex: 1, padding: '2rem 2.5rem' }}>
          <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Send Transaction</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={labelStyle}>Receiver Account Address</label>
              <input
                type="text"
                placeholder="0x..."
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Total Amount to Send</label>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={inputStyle}
              />
            </div>
            {sendError && <span style={{ fontSize: '0.85rem', color: '#ff8080' }}>{sendError}</span>}
            {sendMsg && <span style={{ fontSize: '0.85rem', color: '#7df9ff' }}>{sendMsg}</span>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                type="button"
                onClick={handleSend}
                disabled={sending}
                style={{
                  padding: '11px 32px',
                  borderRadius: 999,
                  border: 'none',
                  background: '#EAB308',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: sending ? 'default' : 'pointer',
                  opacity: sending ? 0.6 : 1,
                }}
              >
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </ElectricBorder>

      {/* ── History ── */}
      <ElectricBorder color="#96c8ff" speed={1} chaos={0.12} borderRadius={16} style={{ width: '100%' }}>
        <div style={{ position: 'relative', zIndex: 1, padding: '2rem 2.5rem' }}>
          <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>History</h2>
          {history.length === 0 ? (
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.45)' }}>
              No transactions yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {history.map((h) => {
                const sent = h.from === account?.address
                const other = sent ? h.to : h.from
                return (
                  <div
                    key={h.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      padding: '12px 16px',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(9,9,11,0.6)',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          color: sent ? '#EAB308' : '#7df9ff',
                        }}
                      >
                        {sent ? 'Sent' : 'Received'}
                      </span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                        {sent ? 'To' : 'From'} {shorten(other)}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: sent ? '#ff9b9b' : '#7dffb0',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {sent ? '−' : '+'}{h.amount} ETH
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </ElectricBorder>
    </>
  )
}
