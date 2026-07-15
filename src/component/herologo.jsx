
import { useId } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { motion, useAnimation } from "motion/react";

export const SparklesCore = ({
  id,
  className,
  background,
  minSize,
  maxSize,
  speed,
  particleColor,
  particleDensity,
  style,
}) => {
  const controls = useAnimation();
  const generatedId = useId();

  const particlesLoaded = async (container) => {
    if (container) {
      controls.start({ opacity: 1, transition: { duration: 1 } });
    }
  };

  return (
    <ParticlesProvider init={loadSlim}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={controls}
        className={className}
        style={style}
      >
        <Particles
          id={id || generatedId}
          particlesLoaded={particlesLoaded}
          options={{
            background: { color: { value: background || "transparent" } },
            fullScreen: { enable: false },
            fpsLimit: 120,
            particles: {
              color: { value: particleColor || "#ffffff" },
              move: {
                enable: true,
                direction: "none",
                speed: { min: 0.1, max: speed || 1 },
                outModes: { default: "out" },
              },
              number: {
                density: { enable: true, width: 400, height: 400 },
                value: particleDensity || 120,
              },
              opacity: {
                value: { min: 0.1, max: 1 },
                animation: {
                  enable: true,
                  speed: speed || 4,
                  sync: false,
                  mode: "auto",
                  startValue: "random",
                },
              },
              size: {
                value: { min: minSize || 1, max: maxSize || 3 },
              },
              shape: { type: "circle" },
            },
            detectRetina: true,
          }}
        />
      </motion.div>
    </ParticlesProvider>
  );
};

export const HeroLogo = ({ name = "AuthX", subtitle, children }) => {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
        minHeight: 320,
      }}
    >
      <SparklesCore
        background="transparent"
        minSize={0.4}
        maxSize={1.6}
        particleDensity={100}
        particleColor="#ffffff"
        speed={1.5}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          paddingTop: 32,
        }}
      >
        <h1
          style={{
            fontSize: "clamp(3rem, 10vw, 7rem)",
            fontWeight: 900,
            color: "#ffffff",
            margin: 0,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            textAlign: "center",
          }}
        >
          {name}
        </h1>

        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 600,
            height: 2,
            margin: "12px 0 20px",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to right, transparent, rgba(100,160,255,0.15), rgba(120,180,255,0.9), rgba(200,220,255,1), rgba(120,180,255,0.9), rgba(100,160,255,0.15), transparent)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -16,
              left: "50%",
              transform: "translateX(-50%)",
              width: 200,
              height: 32,
              background:
                "radial-gradient(ellipse at center, rgba(100,160,255,0.4) 0%, transparent 70%)",
            }}
          />
        </div>

        {subtitle && (
          <p
            style={{
              color: "rgba(255,255,255,0.75)",
              fontSize: "clamp(0.9rem, 2.5vw, 1.25rem)",
              margin: 0,
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
};

export default SparklesCore;
