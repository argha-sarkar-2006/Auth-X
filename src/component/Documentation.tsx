"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeroLogo } from "./herologo";
import SideRays from "./SideRays";
import GradualBlur from "./GradualBlur";

interface Section {
  id: string;
  title: string;
  content: ReactNode;
}

const SECTIONS: Section[] = [
  {
    id: "intro",
    title: "Introduction — Overview of AuthX",
    content: (
      <>
        <p>
          <strong>AuthX</strong> is an AI-powered autonomous payment platform
          that combines biometric authentication, ERC-4337 Smart Accounts, and
          the x402 payment protocol to enable secure, seamless crypto
          transactions on the modern web.
        </p>
        <p>
          By verifying users through facial recognition before authorizing
          payments, AuthX eliminates the friction of repeated wallet
          confirmations while significantly reducing fraud and improving the
          overall Web3 payment experience.
        </p>
        <h4>Core Capabilities</h4>
        <ul>
          <li>
            <strong>Biometric authentication</strong> — facial recognition
            verifies the payer before any transaction leaves the device.
          </li>
          <li>
            <strong>ERC-4337 Smart Accounts</strong> — programmable wallets
            enabling batched, sponsored, and policy-controlled transactions.
          </li>
          <li>
            <strong>QR-addressable accounts</strong> — every smart account
            surfaces its address as a scannable QR for instant off-chain
            handoff.
          </li>
          <li>
            <strong>x402 payment protocol</strong> — HTTP-native payments where
            the payer proves willingness with a signed intent instead of a
            full checkout flow.
          </li>
          <li>
            <strong>ECDSA auto-signing</strong> — post-biometric authorization,
            transactions are signed autonomously within a bounded policy.
          </li>
          <li>
            <strong>Paymaster support</strong> — gas fees can be sponsored so
            the end user never touches gas tokens.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "key-concepts",
    title: "Key Concepts — ERC-4337, x402 & more",
    content: (
      <>
        <h4>ERC-4337 (Account Abstraction)</h4>
        <p>
          ERC-4337 introduces account abstraction on Ethereum without changes to
          the consensus layer. Instead of externally-owned accounts (EOAs)
          signing raw transactions, users interact through{" "}
          <em>UserOperations</em> that flow through a public mempool and are
          bundled by <em>bundlers</em> into standard L1 transactions. This
          enables:
        </p>
        <ul>
          <li>Programmable validation logic (e.g. biometric + policy).</li>
          <li>Batched operations in a single atomic call.</li>
          <li>Sponsored gas via <em>Paymasters</em>.</li>
          <li>Social recovery and key rotation without seed phrases.</li>
        </ul>

        <h4>x402 (HTTP-native Payments)</h4>
        <p>
          x402 revives HTTP status code <code>402 Payment Required</code> as a
          first-class part of the web. Servers reply with a payment challenge;
          the client presents a signed payment intent; the server verifies and
          fulfils the request in the same round-trip.
        </p>

        <h4>ECDSA Signing</h4>
        <p>
          Elliptic Curve Digital Signature Algorithm (secp256k1) is the
          signature scheme underlying Ethereum. AuthX generates signatures
          in-device only after a successful biometric check, so the private key
          never leaves the secure enclave.
        </p>

        <h4>Paymaster</h4>
        <p>
          A Paymaster is a smart contract that agrees to pay the gas fee for a
          UserOperation. This lets AuthX offer <strong>gas-free UX</strong> —
          the user just approves, the sponsor pays.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security & Biometrics — Auth layers",
    content: (
      <>
        <p>
          AuthX layers defenses so that no single compromise unlocks a user's
          funds. The full authorization stack is:
        </p>
        <ol>
          <li>
            <strong>Device attestation</strong> — the client runs on a
            hardware-backed keystore (Secure Enclave / StrongBox).
          </li>
          <li>
            <strong>Biometric proof</strong> — facial recognition unlocks the
            signing key. The biometric template never leaves the device.
          </li>
          <li>
            <strong>Liveness detection</strong> — anti-spoofing checks prevent
            photo, video, and mask-based replays.
          </li>
          <li>
            <strong>Policy validation</strong> — the ERC-4337 Smart Account
            enforces per-txn caps, allowlists, and cooldowns before broadcast.
          </li>
          <li>
            <strong>Anomaly signals</strong> — the ML risk model can require
            a second factor for high-risk contexts (new device, unusual
            geo, out-of-pattern amount).
          </li>
        </ol>
        <p>
          Combined, this reduces fraud without asking the user to repeatedly
          confirm every step — the wallet acts on their behalf, but only when
          all layers agree.
        </p>
      </>
    ),
  },
  {
    id: "x402",
    title: "x402 Payment Protocol — Deep dive",
    content: (
      <>
        <p>
          The x402 protocol re-uses the HTTP request/response cycle as the
          payment rail. It removes the checkout page entirely — payment is
          negotiated at the transport layer.
        </p>

        <h4>Flow</h4>
        <ol>
          <li>Client requests a paid resource.</li>
          <li>
            Server responds with <code>402 Payment Required</code> and a
            payment challenge (asset, amount, recipient, expiry).
          </li>
          <li>
            Client constructs a payment intent, has AuthX biometrically
            authorize the ECDSA signature, then re-requests the resource with
            the signed intent in an <code>X-Payment</code> header.
          </li>
          <li>
            Server verifies the intent against on-chain state (or with a
            paymaster/facilitator) and returns <code>200 OK</code>.
          </li>
        </ol>

        <h4>Why it matters</h4>
        <ul>
          <li>
            <strong>Machine-native payments</strong> — agents and services can
            pay per request without a UI.
          </li>
          <li>
            <strong>No checkout redirects</strong> — payment lives in the same
            HTTP call.
          </li>
          <li>
            <strong>Composable with ERC-4337</strong> — signed intents can be
            bundled and gas-sponsored, so the payer never touches gas.
          </li>
        </ul>
      </>
    ),
  },
];

interface DocumentationProps {
  onClose?: () => void;
}

const Documentation = ({ onClose }: DocumentationProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggle = (i: number) => {
    setActiveIndex(activeIndex === i ? null : i);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflowY: "auto",
        background: "#0a0a0a",
        color: "#ffffff",
        zIndex: 500,
        fontFamily: "inherit",
      }}
    >
      {/* SideRays background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <SideRays speed={2.5} rayColor1="#EAB308" rayColor2="#96c8ff" intensity={2} spread={2} origin="top-right" tilt={0} saturation={1.5} blend={0.75} falloff={1.6} opacity={1} />
      </div>

      {/* Gradual blur — bottom edge */}
      <GradualBlur target="page" position="bottom" height="8rem" strength={2} divCount={5} curve="bezier" exponential opacity={1} />

      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 900,
          height: 400,
          background:
            "radial-gradient(ellipse at center, rgba(100,160,255,0.12) 0%, transparent 60%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* Close button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          title="Close documentation"
          style={{
            position: "fixed",
            top: 20,
            left: 20,
            zIndex: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 16px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(20,20,22,0.65)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            color: "#ffffff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.2s ease, border-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(20,20,22,0.65)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
      )}

      <div
        style={{
          position: "relative",
          maxWidth: 960,
          margin: "0 auto",
          padding: "80px 32px 120px",
        }}
      >
        {/* Hero */}
        <HeroLogo name="AuthX" subtitle="Documentation" />

        {/* Description block */}
        <div
          style={{
            maxWidth: 780,
            margin: "40px auto 60px",
            textAlign: "center",
            color: "rgba(255,255,255,0.7)",
            fontSize: 16,
            lineHeight: 1.7,
          }}
        >
          An AI-powered autonomous payment platform that combines biometric
          authentication, ERC-4337 Smart Accounts (address also available in QR
          format), the x402 payment protocol, and ECDSA auto-signing to enable
          secure, seamless crypto transactions — with Paymaster support for
          gas-free UX.
        </div>

        {/* Sections */}
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {SECTIONS.map((section, index) => {
            const isActive = activeIndex === index;
            return (
              <li
                key={section.id}
                style={{
                  position: "relative",
                  display: "flex",
                  borderBottom:
                    index < SECTIONS.length - 1
                      ? "1px solid rgba(255,255,255,0.08)"
                      : "none",
                  background: "transparent",
                  listStyle: "none",
                }}
              >
                {/* Thin white left line */}
                <div
                  style={{
                    width: 2,
                    flexShrink: 0,
                    marginRight: 20,
                    background: isActive
                      ? "rgba(255,255,255,0.85)"
                      : "rgba(255,255,255,0.08)",
                    transition: "background 0.25s ease",
                    alignSelf: "stretch",
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <button
                    onClick={() => toggle(index)}
                    aria-expanded={isActive}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      textAlign: "left",
                      padding: "22px 20px 22px 0",
                      gap: 16,
                      cursor: "pointer",
                      outline: "none",
                      border: "none",
                      background: "transparent",
                      color: "inherit",
                      font: "inherit",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 22,
                        fontWeight: 300,
                        lineHeight: 1,
                        color: isActive ? "#ffffff" : "rgba(255,255,255,0.4)",
                        width: 22,
                        flexShrink: 0,
                        textAlign: "center",
                        transition: "color 0.2s ease",
                      }}
                    >
                      {isActive ? "−" : "+"}
                    </span>

                    <span
                      style={{
                        flex: 1,
                        fontSize: 18,
                        fontWeight: 600,
                        color: isActive ? "#ffffff" : "rgba(255,255,255,0.55)",
                        transition: "color 0.2s ease",
                      }}
                    >
                      {section.title}
                    </span>

                    <motion.span
                      animate={{ rotate: isActive ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      style={{
                        display: "inline-flex",
                        color: isActive ? "#ffffff" : "rgba(255,255,255,0.35)",
                        flexShrink: 0,
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M4 6l4 4 4-4"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.35,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                        style={{ overflow: "hidden" }}
                      >
                        <div
                          className="docs-body"
                          style={{
                            paddingLeft: 47,
                            paddingRight: 20,
                            paddingBottom: 32,
                            paddingTop: 0,
                            fontSize: 15,
                            lineHeight: 1.75,
                            color: "rgba(255,255,255,0.72)",
                          }}
                        >
                          {section.content}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <style>{`
        .docs-body h4 {
          color: #ffffff;
          font-size: 15px;
          font-weight: 700;
          margin: 22px 0 10px;
          letter-spacing: 0.01em;
        }
        .docs-body p {
          margin: 0 0 14px;
        }
        .docs-body ul,
        .docs-body ol {
          margin: 8px 0 16px;
          padding-left: 22px;
        }
        .docs-body li {
          margin-bottom: 8px;
        }
        .docs-body code {
          background: rgba(255,255,255,0.08);
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 13px;
          color: #cbd5ff;
        }
        .docs-body strong {
          color: rgba(255,255,255,0.95);
        }
        .docs-body em {
          color: rgba(255,255,255,0.85);
        }
      `}</style>
    </div>
  );
};

export default Documentation;