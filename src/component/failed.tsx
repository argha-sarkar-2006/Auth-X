import FuzzyText from './FuzzyText'

interface FailedProps {
  onRetry?: () => void
}

// Full-screen failure page shown when the live face capture doesn't match the
// vector saved with the account. Sits below the dock (zIndex 10000) so the
// dock stays visible.
export default function Failed({ onRetry }: FailedProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        background: 'var(--color-background, #0a0a0a)',
        padding: '2rem',
      }}
    >
      <FuzzyText
        fontSize="clamp(1.8rem, 7vw, 5rem)"
        fontWeight={900}
        color="#ff4d4d"
        baseIntensity={0.18}
        hoverIntensity={0.5}
      >
        User doesn&apos;t match
      </FuzzyText>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            padding: '11px 30px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'transparent',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      )}
    </div>
  )
}
