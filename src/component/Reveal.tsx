import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
}

const Reveal = ({ children }: RevealProps) => {
  return (
    <div style={{ position: "relative" }}>
      {children}

      {/* Primary curtain — wipes left to right */}
      <motion.div
        initial={{ x: "0%" }}
        animate={{ x: "105%" }}
        transition={{
          duration: 0.9,
          ease: [0.76, 0, 0.24, 1],
          delay: 0.05,
        }}
        style={{
          position: "fixed",
          inset: 0,
          background: "#0a0a0a",
          zIndex: 9990,
          pointerEvents: "none",
        }}
      />

      {/* Trailing edge — slightly behind, gives a layered depth feel */}
      <motion.div
        initial={{ x: "0%" }}
        animate={{ x: "105%" }}
        transition={{
          duration: 0.75,
          ease: [0.76, 0, 0.24, 1],
          delay: 0,
        }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(255,255,255,0.06)",
          zIndex: 9989,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default Reveal;
