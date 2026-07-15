import React from 'react';

// Inject CSS keyframes once (no Tailwind needed)
if (typeof document !== 'undefined' && !document.getElementById('canopy-styles')) {
  const s = document.createElement('style');
  s.id = 'canopy-styles';
  s.textContent = `
    @keyframes canopy-h {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }
    @keyframes canopy-v {
      from { transform: translateY(0); }
      to   { transform: translateY(-50%); }
    }
    .canopy-run-h {
      animation: canopy-h var(--canopy-dur, 25s) linear infinite;
    }
    .canopy-run-h.canopy-rev { animation-direction: reverse; }
    .canopy-run-v {
      animation: canopy-v var(--canopy-dur, 25s) linear infinite;
    }
    .canopy-run-v.canopy-rev { animation-direction: reverse; }
    .canopy-wrap:hover .canopy-pause { animation-play-state: paused; }
    .testimonial-card { transition: border-color 0.25s, box-shadow 0.25s; }
    .testimonial-card:hover {
      border-color: #60a5fa !important;
      box-shadow: 0 0 14px rgba(96,165,250,0.45) !important;
    }
  `;
  document.head.appendChild(s);
}

interface Testimonial {
  name: string;
  image: string;
  description: string;
  handle: string;
}

interface AnimatedCanopyProps {
  children: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  style?: React.CSSProperties;
}

const AnimatedCanopy: React.FC<AnimatedCanopyProps> = ({
  children,
  vertical = false,
  repeat = 1,
  pauseOnHover = false,
  reverse = false,
  style,
}) => {
  const runCls = vertical ? 'canopy-run-v' : 'canopy-run-h';
  const revCls = reverse ? 'canopy-rev' : '';
  const pauseCls = pauseOnHover ? 'canopy-pause' : '';

  return (
    <div
      className='canopy-wrap'
      style={{
        display: 'flex',
        flexDirection: vertical ? 'column' : 'row',
        overflow: 'hidden',
        padding: '6px 0',
        width: '100%',
        ...style,
      }}
    >
      {/* Two copies for seamless -50% loop */}
      {[0, 1].map((copy) => (
        <div
          key={copy}
          className={[runCls, revCls, pauseCls].filter(Boolean).join(' ')}
          style={{
            display: 'flex',
            flexDirection: vertical ? 'column' : 'row',
            flexShrink: 0,
            gap: 12,
          }}
        >
          {Array.from({ length: repeat }).map((_, i) => (
            <React.Fragment key={i}>{children}</React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
};

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => (
  <div
    className='testimonial-card'
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      flexShrink: 0,
      width: 300,
      minHeight: 106,
      borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.08)',
      padding: 12,
      cursor: 'pointer',
      boxSizing: 'border-box',
      background: 'rgba(255,255,255,0.02)',
      margin: '0 6px',
    }}
  >
    <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.15)', flexShrink: 0 }}>
      <img src={testimonial.image} alt={testimonial.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>{testimonial.name}</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{testimonial.handle}</span>
      </div>
      <p style={{ marginTop: 4, fontSize: 12, lineHeight: 1.55, color: 'rgba(255,255,255,0.6)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
        {testimonial.description}
      </p>
    </div>
  </div>
);

export const AnimatedTestimonials: React.FC<{
  data: Testimonial[];
  style?: React.CSSProperties;
}> = ({ data, style }) => (
  <div style={{ width: '100%', overflow: 'hidden', padding: '12px 0', ...style }}>
    {[false, true, false].map((reverse, i) => (
      <AnimatedCanopy
        key={i}
        reverse={reverse}
        pauseOnHover
        repeat={2}
        style={{ '--canopy-dur': '30s' } as React.CSSProperties}
      >
        {data.map((t) => (
          <TestimonialCard key={t.name} testimonial={t} />
        ))}
      </AnimatedCanopy>
    ))}
  </div>
);

export default AnimatedTestimonials;
