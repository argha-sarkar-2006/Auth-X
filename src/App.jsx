import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FlipFadeText from './component/Loadingpage'
import TxLoad, { TX_LOAD_DURATION } from './component/txload'
import Failed from './component/failed'
import FaceCapture from './component/FaceCapture'
import { ToastContainer, toast } from './component/notifi'
import { isValidAddress, accountExists, verifyFace, sendTransaction } from './lib/wallet'
import './component/notifi.css'
import SideRays from './component/SideRays'
import { HeroLogo } from './component/herologo'
import ElectricBorder from './component/ElectricBorder'
import Dock from './component/Dock'
import { VscHome, VscArchive, VscAccount, VscSettingsGear } from 'react-icons/vsc'
import LoginPage from './component/loginpage'
import Documentation from './component/Documentation'
import FaqPage from './component/FaqPage'
import Setting from './component/setting'
import Wallet from './component/Wallet'
import { onAuthChange, signOutUser } from './lib/auth'
import './App.css'

// ── Page indices (used to determine slide direction) ──────────────────────
// Home=0, Docs=1, FAQ=2, Settings=3
const PAGE = { HOME: 0, DOCS: 1, FAQ: 2, SETTINGS: 3 }

const WORDS = ["LOADING", "ACCOUNT CREATION", "ERC4337 DEPLOY", "FETCHING", "DONE"]
const SPLASH_DURATION = WORDS.length * 2500

// ── Page-transition variants ──────────────────────────────────────────────
// direction > 0 means going RIGHT in dock → animate LEFT-TO-RIGHT (enter from left)
// direction < 0 means going LEFT  in dock → animate RIGHT-TO-LEFT (enter from right)
const pageVariants = {
  initial: (dir) => ({
    x: dir > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
  animate: {
    x: '0%',
    opacity: 1,
    transition: { duration: 0.42, ease: [0.76, 0, 0.24, 1] },
  },
  exit: (dir) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0,
    transition: { duration: 0.35, ease: [0.76, 0, 0.24, 1] },
  }),
}

function App() {
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [postLoginLoading, setPostLoginLoading] = useState(false)

  // Active overlay: null | 'docs' | 'faq'
  const [activePage, setActivePage] = useState(null)
  // Transition direction: 1 = going right in dock, -1 = going left
  const [transitionDir, setTransitionDir] = useState(1)
  // Track current page index for direction calculation
  const [currentPageIdx, setCurrentPageIdx] = useState(PAGE.HOME)

  // ── Send-transaction flow ────────────────────────────────────────────────
  const [receiver, setReceiver] = useState('')
  const [amount, setAmount] = useState('')
  // txStep: idle | capturing | loading | failed
  const [txStep, setTxStep] = useState('idle')
  // null = face not validated yet, true/false = capture result
  const [faceOk, setFaceOk] = useState(null)
  // Set when Send was clicked before the face was validated, so the capture
  // flows straight into the transaction.
  const pendingSendRef = useRef(false)
  // Bumped after every successful transfer so the Account Details card
  // re-reads the balance.
  const [walletRefresh, setWalletRefresh] = useState(0)

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u)
      setAuthChecked(true)
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!postLoginLoading) return
    const timer = setTimeout(() => setPostLoginLoading(false), SPLASH_DURATION)
    return () => clearTimeout(timer)
  }, [postLoginLoading])

  // Navigate to a page by index, calculating direction from current index
  const navigateTo = (targetIdx, overlay) => {
    const dir = targetIdx > currentPageIdx ? 1 : -1
    setTransitionDir(dir)
    setCurrentPageIdx(targetIdx)
    setActivePage(overlay)
  }

  // ── Send-transaction handlers ────────────────────────────────────────────

  // Task 1 — pasting a valid account address triggers live face validation,
  // but only after the address is confirmed to exist in the local db.
  const handleReceiverPaste = async (e) => {
    const pasted = e.clipboardData?.getData('text')?.trim() || ''
    if (!isValidAddress(pasted)) return
    if (!(await accountExists(pasted))) {
      toast({
        title: 'Unknown address',
        description: 'No account exists for that receiver address.',
        variant: 'destructive',
        position: 'top-right',
        className: 'authx-toast',
      })
      return
    }
    setFaceOk(null)
    pendingSendRef.current = false
    setTxStep('capturing')
  }

  // Runs the loading page, then completes or fails the transaction.
  const runTransaction = (ok) => {
    setTxStep('loading')
    setTimeout(async () => {
      if (!ok) {
        setTxStep('failed')
        return
      }
      try {
        await sendTransaction({ fromUid: user.uid, toAddress: receiver.trim(), amount: parseFloat(amount) })
        setTxStep('idle')
        toast({
          title: 'Transaction Successful',
          description: `Sent ${amount} ETH to ${receiver.trim().slice(0, 6)}…${receiver.trim().slice(-4)}`,
          variant: 'success',
          position: 'top-right',
          className: 'authx-toast',
        })
        setReceiver('')
        setAmount('')
        setFaceOk(null)
        setWalletRefresh((n) => n + 1)
      } catch (err) {
        setTxStep('idle')
        toast({
          title: 'Transaction Failed',
          description: err?.message || 'Something went wrong.',
          variant: 'destructive',
          position: 'top-right',
          className: 'authx-toast',
        })
      }
    }, TX_LOAD_DURATION)
  }

  // Live face captured → match it against the vector saved with the account.
  const onTxFaceCaptured = async (vec) => {
    const ok = await verifyFace(user.uid, vec)
    setFaceOk(ok)
    if (pendingSendRef.current) {
      // Send was already clicked — go straight into the transaction.
      pendingSendRef.current = false
      runTransaction(ok)
    } else if (ok) {
      setTxStep('idle')
    } else {
      // Task 4 — face vector doesn't match → failed page.
      setTxStep('failed')
    }
  }

  const onTxFaceCancelled = () => {
    pendingSendRef.current = false
    setTxStep('idle')
  }

  const handleSend = async () => {
    if (!isValidAddress(receiver)) {
      toast({
        title: 'Invalid address',
        description: 'Paste a valid receiver account address (0x…).',
        variant: 'destructive',
        position: 'top-right',
        className: 'authx-toast',
      })
      return
    }
    if (!(await accountExists(receiver))) {
      toast({
        title: 'Unknown address',
        description: 'No account exists for that receiver address.',
        variant: 'destructive',
        position: 'top-right',
        className: 'authx-toast',
      })
      return
    }
    const amt = parseFloat(amount)
    if (!Number.isFinite(amt) || amt <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Enter an amount greater than zero.',
        variant: 'destructive',
        position: 'top-right',
        className: 'authx-toast',
      })
      return
    }
    if (faceOk === null) {
      // Face not validated yet (address typed, not pasted) — capture first.
      pendingSendRef.current = true
      setTxStep('capturing')
      return
    }
    runTransaction(faceOk)
  }

  const dockItems = [
    {
      icon: <VscHome size={18} />,
      label: 'Home',
      onClick: () => {
        setTxStep('idle')
        navigateTo(PAGE.HOME, null)
        setTimeout(() => document.getElementById('center')?.scrollIntoView({ behavior: 'smooth' }), 50)
      },
    },
    {
      icon: <VscArchive size={18} />,
      label: 'Docs',
      onClick: () => navigateTo(PAGE.DOCS, 'docs'),
    },
    {
      icon: <VscAccount size={18} />,
      label: 'FAQ',
      onClick: () => navigateTo(PAGE.FAQ, 'faq'),
    },
    {
      icon: <VscSettingsGear size={18} />,
      label: 'Settings',
      onClick: () => navigateTo(PAGE.SETTINGS, 'settings'),
    },
  ]

  const showMain = authChecked && !postLoginLoading && !!user

  return (
    <>
      {/* ── Checking session ── */}
      {!authChecked && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: 'rgba(255,255,255,0.5)', zIndex: 9999, fontSize: 14 }}>
          Checking session…
        </div>
      )}

      {/* ── Loading splash (post-login) ── */}
      {authChecked && postLoginLoading && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background, #0a0a0a)', zIndex: 9999 }}>
          <FlipFadeText words={WORDS} interval={2500} />
        </div>
      )}

      {/* ── Login page ── */}
      {authChecked && !postLoginLoading && !user && (
        <LoginPage onAuthed={() => setPostLoginLoading(true)} />
      )}

      {/* ── Main app ── */}
      {showMain && (
        <>
          {/* Background rays */}
          <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
            <SideRays speed={2.5} rayColor1="#EAB308" rayColor2="#96c8ff" intensity={2} spread={2} origin="top-right" tilt={0} saturation={1.5} blend={0.75} falloff={1.6} opacity={1} />
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={() => signOutUser()}
            title="Log out"
            style={{
              position: 'fixed',
              top: 20,
              right: 20,
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
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log out
          </button>

          {/* Scrollable home layout */}
          <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'stretch', padding: '2rem 1.25rem 8rem', gap: '1.5rem', boxSizing: 'border-box' }}>

            {/* Hero logo */}
            <div style={{ width: '100%' }}>
              <HeroLogo name="AuthX" subtitle="Get started" />
            </div>

            {/* Account Details / create-account flow */}
            <Wallet user={user} refreshKey={walletRefresh} />

            {/* Send Transaction card */}
            <ElectricBorder color="#EAB308" speed={1} chaos={0.12} borderRadius={16} style={{ width: '100%' }}>
              <div style={{ position: 'relative', zIndex: 1, padding: '2rem 2.5rem' }}>
                <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Send Transaction</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Receiver Account Address</label>
                    <input
                      type="text"
                      placeholder="0x..."
                      value={receiver}
                      onChange={(e) => {
                        setReceiver(e.target.value)
                        setFaceOk(null)
                      }}
                      onPaste={handleReceiverPaste}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '11px 16px', color: '#fff', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                    {faceOk === true && (
                      <span style={{ display: 'block', marginTop: 6, fontSize: '0.78rem', color: '#7dffb0' }}>Face verified ✓</span>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Total Amount to Send</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '11px 16px', color: '#fff', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={handleSend}
                      style={{ padding: '11px 32px', borderRadius: 999, border: 'none', background: '#EAB308', color: '#000', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </ElectricBorder>
          </div>

          {/* ── Page overlays with directional transition ── */}
          <AnimatePresence custom={transitionDir} mode="wait">
            {activePage === 'docs' && (
              <motion.div
                key="docs"
                custom={transitionDir}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ position: 'fixed', inset: 0, zIndex: 500 }}
              >
                <Documentation onClose={() => navigateTo(PAGE.HOME, null)} />
              </motion.div>
            )}

            {activePage === 'faq' && (
              <motion.div
                key="faq"
                custom={transitionDir}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ position: 'fixed', inset: 0, zIndex: 500 }}
              >
                <FaqPage onClose={() => navigateTo(PAGE.HOME, null)} />
              </motion.div>
            )}

            {activePage === 'settings' && (
              <motion.div
                key="settings"
                custom={transitionDir}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ position: 'fixed', inset: 0, zIndex: 500 }}
              >
                <Setting user={user} onClose={() => navigateTo(PAGE.HOME, null)} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Transaction flow overlays (dock stays visible above them) ── */}
          {txStep === 'capturing' && (
            <FaceCapture onCapture={onTxFaceCaptured} onCancel={onTxFaceCancelled} />
          )}
          {txStep === 'loading' && <TxLoad />}
          {txStep === 'failed' && (
            <Failed
              onRetry={() => {
                setFaceOk(null)
                setTxStep('capturing')
              }}
            />
          )}
        </>
      )}

      {/* ── Toast notifications (notifi.tsx) ── */}
      <ToastContainer />

      {/* ── Dock — always visible ── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10000, display: 'flex', justifyContent: 'center', paddingBottom: '16px', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }}>
          <Dock items={dockItems} panelHeight={68} baseItemSize={50} magnification={70} />
        </div>
      </div>
    </>
  )
}

export default App
