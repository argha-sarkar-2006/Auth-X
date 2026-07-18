import FlipFadeText from './Loadingpage'

// Words shown while a transaction is being processed. The total splash time is
// TX_WORDS.length * TX_WORD_INTERVAL ms — App.jsx uses the same numbers to know
// when the sequence is done.
export const TX_WORDS = ['REQ GENERATION', 'X402 RUNNING', 'ECDSA AUTO SIGN', 'VALIDATION', 'DONE']
export const TX_WORD_INTERVAL = 1400
export const TX_LOAD_DURATION = TX_WORDS.length * TX_WORD_INTERVAL

// Full-screen transaction loading page. Sits below the dock (zIndex 10000) so
// the dock stays visible while the words cycle.
export default function TxLoad() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-background, #0a0a0a)',
      }}
    >
      <FlipFadeText words={TX_WORDS} interval={TX_WORD_INTERVAL} />
    </div>
  )
}
