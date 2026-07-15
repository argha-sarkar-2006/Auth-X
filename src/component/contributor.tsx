'use client';
import React, { useRef, createContext, useContext, useCallback } from 'react';
import {
  motion,
  AnimatePresence,
  PanInfo,
  useSpring,
  useMotionTemplate,
  useTransform,
} from 'motion/react';

// ── Local cn helper (no Tailwind / @/lib/utils needed) ────────────────────
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

// ── Self-contained Card components (replace @/components/ui/card) ─────────
const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className, style }) => (
  <div
    className={className}
    style={{
      borderRadius: '0.5rem',
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'transparent',
      color: '#ffffff',
      boxShadow: 'none',
      width: '100%',
      height: '100%',
      boxSizing: 'border-box' as const,
      ...style,
    }}
  >
    {children}
  </div>
);

const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className, style }) => (
  <div className={className} style={{ padding: 0, width: '100%', height: '100%', ...style }}>
    {children}
  </div>
);

const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className, style }) => (
  <div
    className={className}
    style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '24px 24px 0', ...style }}
  >
    {children}
  </div>
);

const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className, style }) => (
  <div
    className={className}
    style={{ display: 'flex', alignItems: 'center', padding: '0 24px 24px', ...style }}
  >
    {children}
  </div>
);

const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className, style }) => (
  <h3
    className={className}
    style={{ fontSize: 20, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.01em', margin: 0, color: '#ffffff', ...style }}
  >
    {children}
  </h3>
);

const CardDescription: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className, style }) => (
  <p className={className} style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: 0, ...style }}>
    {children}
  </p>
);

// ── Context ───────────────────────────────────────────────────────────────
interface BorderGlideContextType {
  currentIndex: number;
  direction: number;
  handleDragEnd: (
    e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => void;
  totalItems: number;
}

const BorderGlideContext = createContext<BorderGlideContextType | undefined>(
  undefined,
);

const useBorderGlideContext = () => {
  const context = useContext(BorderGlideContext);
  if (!context) {
    throw new Error('BorderGlide components must be used within BorderGlide');
  }
  return context;
};

// ── Moving Border ─────────────────────────────────────────────────────────
const MovingBorder: React.FC<{
  children: React.ReactNode;
  duration?: number;
  rx?: string;
  ry?: string;
  color?: string;
  width?: string;
  height?: string;
  opacity?: number;
}> = ({
  children,
  duration = 3000,
  rx = '1.5rem',
  ry = '1.5rem',
  color = '#3b82f6',
  width = '12rem',
  height = '0.5rem',
  opacity = 0.8,
}) => {
  const pathRef = useRef<SVGRectElement>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const time = useSpring(0, { stiffness: 100, damping: 20, mass: 0.5 });

  const animate = useCallback(() => {
    const elapsed = Date.now() - startTimeRef.current;
    const speed = 1000 / duration;
    time.set(elapsed * speed);
    animationRef.current = requestAnimationFrame(animate);
  }, [time, duration]);

  React.useLayoutEffect(() => {
    startTimeRef.current = Date.now();
    animate();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [animate]);

  const progress = useTransform(time, (val) => {
    if (!pathRef.current) return 0;
    const length = pathRef.current.getTotalLength();
    return val % length;
  });

  const x = useTransform(progress, (val) => {
    if (!pathRef.current) return 0;
    return pathRef.current.getPointAtLength(val).x;
  });

  const y = useTransform(progress, (val) => {
    if (!pathRef.current) return 0;
    return pathRef.current.getPointAtLength(val).y;
  });

  const angle = useTransform(progress, (val) => {
    if (!pathRef.current) return 0;
    const length = pathRef.current.getTotalLength();
    const p1 = pathRef.current.getPointAtLength(val);
    const p2 = pathRef.current.getPointAtLength((val + 1) % length);
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
  });

  const transform = useMotionTemplate`
    translateX(${x}px)
    translateY(${y}px)
    translateX(-50%)
    translateY(-50%)
    rotate(${angle}deg)
  `;

  const getBackgroundStyle = (c: string) => {
    if (c.includes('gradient')) return c;
    return `radial-gradient(${c} 40%, transparent 60%)`;
  };

  return (
    <>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        preserveAspectRatio='none'
        style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <rect fill='none' width='100%' height='100%' rx={rx} ry={ry} ref={pathRef} />
      </svg>
      <motion.div style={{ position: 'absolute', top: 0, left: 0, transform, willChange: 'transform' }}>
        <div
          style={{
            height,
            width,
            opacity,
            background: getBackgroundStyle(color),
            borderRadius: '50%',
          }}
        />
      </motion.div>
    </>
  );
};

// ── BorderGlide (Carousel) ────────────────────────────────────────────────
interface BorderGlideProps {
  children: React.ReactNode;
  className?: string;
  autoPlayInterval?: number;
  borderDuration?: number;
  borderColor?: string;
  borderWidth?: string;
  borderHeight?: string;
  borderOpacity?: number;
  style?: React.CSSProperties;
}

const BorderGlide: React.FC<BorderGlideProps> = ({
  children,
  className,
  autoPlayInterval = 5000,
  borderDuration = 3000,
  borderColor = '#3b82f6',
  borderWidth = '6rem',
  borderHeight = '6rem',
  borderOpacity = 0.8,
  style,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const childrenArray = React.Children.toArray(children);
  const totalItems = childrenArray.length;

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;

  const paginate = useCallback(
    (newDirection: number) => {
      setDirection(newDirection);
      if (newDirection === 1) {
        setCurrentIndex((prev) => (prev === totalItems - 1 ? 0 : prev + 1));
      } else {
        setCurrentIndex((prev) => (prev === 0 ? totalItems - 1 : prev - 1));
      }
    },
    [totalItems],
  );

  const handleDragEnd = useCallback(
    (_e: MouseEvent | TouchEvent | PointerEvent, { offset, velocity }: PanInfo) => {
      const swipe = swipePower(offset.x, velocity.x);
      if (swipe < -swipeConfidenceThreshold) paginate(1);
      else if (swipe > swipeConfidenceThreshold) paginate(-1);
    },
    [paginate],
  );

  const setupAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    if (autoPlayInterval > 0 && totalItems > 1) {
      autoPlayRef.current = setInterval(() => paginate(1), autoPlayInterval);
    }
  }, [autoPlayInterval, totalItems, paginate]);

  React.useLayoutEffect(() => {
    setupAutoPlay();
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [setupAutoPlay]);

  const contextValue: BorderGlideContextType = { currentIndex, direction, handleDragEnd, totalItems };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0, scale: 0.95 }),
    center: { zIndex: 1, x: '0%', opacity: 1, scale: 1 },
    exit: (dir: number) => ({ zIndex: 0, x: dir < 0 ? '100%' : '-100%', opacity: 0, scale: 0.95 }),
  };

  const spring = { type: 'spring' as const, stiffness: 300, damping: 30, mass: 0.8 };

  return (
    <BorderGlideContext.Provider value={contextValue}>
      <div className={cn(className)} style={{ position: 'relative', width: '100%', ...style }}>
        {/* Outer wrapper with border glow */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: 14,
            background: 'transparent',
            padding: 2,
            boxSizing: 'border-box',
          }}
        >
          {/* Moving border */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <MovingBorder
              duration={borderDuration}
              rx='0.75rem'
              ry='0.75rem'
              color={borderColor}
              width={borderWidth}
              height={borderHeight}
              opacity={borderOpacity}
            >
              <div />
            </MovingBorder>
          </div>

          {/* Slide area */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: 12,
              overflow: 'hidden',
              background: '#09090b',
            }}
          >
            <AnimatePresence initial={false} custom={direction} mode='wait'>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial='enter'
                animate='center'
                exit='exit'
                transition={spring}
                drag='x'
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                style={{ position: 'absolute', inset: 0, cursor: 'grab', willChange: 'transform' }}
              >
                {childrenArray[currentIndex]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Dot indicators */}
        {totalItems > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            {Array.from({ length: totalItems }).map((_, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
                style={{
                  width: i === currentIndex ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === currentIndex ? '#3b82f6' : 'rgba(255,255,255,0.25)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </BorderGlideContext.Provider>
  );
};

// ── Typed sub-components ──────────────────────────────────────────────────
interface BorderGlideCardProps   { children: React.ReactNode; className?: string; style?: React.CSSProperties }
interface BorderGlideContentProps { children: React.ReactNode; className?: string; style?: React.CSSProperties }
interface BorderGlideHeaderProps  { children: React.ReactNode; className?: string; style?: React.CSSProperties }
interface BorderGlideFooterProps  { children: React.ReactNode; className?: string; style?: React.CSSProperties }
interface BorderGlideTitleProps   { children: React.ReactNode; className?: string; style?: React.CSSProperties }
interface BorderGlideDescriptionProps { children: React.ReactNode; className?: string; style?: React.CSSProperties }

const BorderGlideCard: React.FC<BorderGlideCardProps> = ({ children, className, style }) => (
  <Card className={className} style={{ background: 'transparent', border: 'none', ...style }}>{children}</Card>
);
const BorderGlideContent: React.FC<BorderGlideContentProps> = ({ children, className, style }) => (
  <CardContent className={className} style={style}>{children}</CardContent>
);
const BorderGlideHeader: React.FC<BorderGlideHeaderProps> = ({ children, className, style }) => (
  <CardHeader className={className} style={style}>{children}</CardHeader>
);
const BorderGlideFooter: React.FC<BorderGlideFooterProps> = ({ children, className, style }) => (
  <CardFooter className={className} style={style}>{children}</CardFooter>
);
const BorderGlideTitle: React.FC<BorderGlideTitleProps> = ({ children, className, style }) => (
  <CardTitle className={className} style={style}>{children}</CardTitle>
);
const BorderGlideDescription: React.FC<BorderGlideDescriptionProps> = ({ children, className, style }) => (
  <CardDescription className={className} style={style}>{children}</CardDescription>
);

export {
  BorderGlide,
  BorderGlideCard,
  BorderGlideContent,
  BorderGlideHeader,
  BorderGlideFooter,
  BorderGlideTitle,
  BorderGlideDescription,
};
