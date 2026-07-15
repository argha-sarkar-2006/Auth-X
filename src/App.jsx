import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FlipFadeText from './component/Loadingpage'
import SideRays from './component/SideRays'
import { HeroLogo } from './component/herologo'
import SplashCursor from './component/SplashCursor'
import Dock from './component/Dock'
import { VscHome, VscArchive, VscAccount, VscSettingsGear } from 'react-icons/vsc'
import LoginPage from './component/loginpage'
import Documentation from './component/Documentation'
import FaqPage from './component/FaqPage'
import Setting from './component/setting'
import Wallet from './component/Wallet'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
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

  const dockItems = [
    {
      icon: <VscHome size={18} />,
      label: 'Home',
      onClick: () => {
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
      {/* ── Fluid splash cursor — active on every page ── */}
      <SplashCursor />

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

          {/* Scrollable home layout */}
          <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'stretch', padding: '2rem 1.25rem 8rem', gap: '1.5rem', boxSizing: 'border-box' }}>

            {/* Hero logo */}
            <div style={{ width: '100%' }}>
              <HeroLogo name="AuthX" subtitle="Get started" />
            </div>

            {/* Wallet: account setup / details, send, history */}
            <Wallet user={user} />
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
        </>
      )}

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
