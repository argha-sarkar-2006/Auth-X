"use client";

import React from "react";
import { HeroLogo } from "./herologo";
import FaqAccordion, { FaqItem } from "./faq";
import { AnimatedTestimonials } from "./coments";
import SideRays from "./SideRays";
import GradualBlur from "./GradualBlur";

// ── Images ────────────────────────────────────────────────────────────────
import meImg from "../assets/me.png";
import prarImg from "../assets/prar.png";
import profileImg from "../assets/image.png";

// ── FAQ data ──────────────────────────────────────────────────────────────
const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is AuthX?",
    answer:
      "AuthX is an AI-powered autonomous payment platform that combines biometric authentication, ERC-4337 Smart Accounts, and the x402 payment protocol to enable secure, seamless crypto transactions on the modern web.",
  },
  {
    question: "How does biometric authentication work in AuthX?",
    answer:
      "AuthX uses facial recognition to verify the payer before authorising any transaction. The biometric template never leaves your device — it unlocks a signing key stored in the secure enclave. After a successful biometric check, the ECDSA signature is generated on-device and the transaction is broadcast autonomously.",
  },
  {
    question: "What is ERC-4337 and why does AuthX use it?",
    answer:
      "ERC-4337 introduces account abstraction on Ethereum without requiring changes to the consensus layer. It allows AuthX to provide programmable wallet policies, batched operations, social recovery, and gas sponsorship (Paymaster) — so you never need to manage raw ETH for gas.",
  },
  {
    question: "Is my private key ever exposed?",
    answer:
      "No. Your private key is generated and stored inside the device's Secure Enclave / StrongBox and never leaves it. The biometric check unlocks the key in-device; only the resulting signature is sent to the network.",
  },
  {
    question: "What is the x402 payment protocol?",
    answer:
      "x402 revives HTTP status code 402 Payment Required as a first-class part of the web. Servers respond with a payment challenge; AuthX constructs a signed payment intent after biometric authorisation and re-sends the request with the signature in the X-Payment header — no checkout page needed.",
  },
  {
    question: "How do I get started with AuthX?",
    answer:
      "Log in with your email and follow the on-screen setup to create your ERC-4337 Smart Account. Your QR-addressable wallet address is generated automatically. Scan the QR code from the home screen to share your address for payments.",
  },
];

// ── Testimonials / Comments data ──────────────────────────────────────────
const COMMENTS_DATA = [
  {
    name: "Argha Sarkar",
    handle: "@arghasarkar",
    image: profileImg,
    description:
      "AuthX makes crypto payments feel as natural as tapping your face to unlock your phone. Incredible UX with real security.",
  },
  {
    name: "Prar",
    handle: "@prar",
    image: profileImg,
    description:
      "The biometric + ERC-4337 combination is exactly what Web3 needs. No seed phrases, no gas confusion — just pay.",
  },
  {
    name: "Dev User",
    handle: "@devuser",
    image: profileImg,
    description:
      "Finally a wallet that doesn't ask me to confirm every single step. AuthX's policy-controlled signing is brilliant.",
  },
  {
    name: "Web3 Fan",
    handle: "@web3fan",
    image: profileImg,
    description:
      "x402 payment protocol + biometrics = the future of machine-native payments. AuthX is ahead of the curve.",
  },
  {
    name: "Crypto Builder",
    handle: "@cryptobuild",
    image: profileImg,
    description:
      "Gas-free UX via Paymaster support is a game changer for onboarding new users. No ETH needed upfront!",
  },
  {
    name: "Security Pro",
    handle: "@secpro",
    image: profileImg,
    description:
      "Layered security — device attestation, biometric proof, liveness detection, and on-chain policy. Rock solid.",
  },
];

// ── GitHub repo URL ───────────────────────────────────────────────────────
// Replace with your actual repository URL
const GITHUB_REPO = "https://github.com/arghasarkar/authx";

// ── Contributor card content ──────────────────────────────────────────────
interface ContributorInfo {
  name: string;
  handle: string;
  role: string;
  image: string;
  githubUrl: string;
}

const CONTRIBUTORS: ContributorInfo[] = [
  {
    name: "Argha Sarkar",
    handle: "@arghasarkar",
    role: "BackEnd ,Web3 Contributor",
    image: meImg,
    githubUrl: GITHUB_REPO,
  },
  {
    name: "Prar",
    handle: "@prar",
    role: "Auth & Verification Contributor",
    image: prarImg,
    githubUrl: GITHUB_REPO,
  },
];

// ── FaqPage ───────────────────────────────────────────────────────────────
interface FaqPageProps {
  onClose?: () => void;
  transitionDir?: number; // 1 = entered from left (going right), -1 = entered from right (going left)
}

const FaqPage: React.FC<FaqPageProps> = ({ onClose }) => {
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
            "radial-gradient(ellipse at center, rgba(100,160,255,0.1) 0%, transparent 60%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      {/* Back button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          title="Close FAQ"
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
          padding: "80px 32px 140px",
        }}
      >
        {/* ── 1. Hero ── */}
        <HeroLogo name="AuthX" subtitle="Frequently Asked Questions" />

        {/* ── 2. FAQ Accordion ── */}
        <div style={{ marginTop: 24 }}>
          <FaqAccordion
            items={FAQ_ITEMS}
            title="AuthX FAQs"
          />
        </div>

        {/* ── Divider ── */}
        <div
          style={{
            margin: "60px auto",
            height: 1,
            maxWidth: 640,
            background: "linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent)",
          }}
        />

        {/* ── 3. Comments / Testimonials ── */}
        <section>
          <h2
            style={{
              textAlign: "center",
              fontSize: 28,
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: 8,
            }}
          >
            What People Are Saying
          </h2>
          <p
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.5)",
              fontSize: 15,
              marginBottom: 32,
            }}
          >
            Real feedback from the community
          </p>
          <AnimatedTestimonials data={COMMENTS_DATA} />
        </section>

        {/* ── Divider ── */}
        <div
          style={{
            margin: "60px auto",
            height: 1,
            maxWidth: 640,
            background: "linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent)",
          }}
        />

        {/* ── 4. Contributors ── */}
        <section>
          <h2
            style={{
              textAlign: "center",
              fontSize: 28,
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: 8,
            }}
          >
            Contributors
          </h2>
          <p
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.5)",
              fontSize: 15,
              marginBottom: 40,
            }}
          >
            The people who built AuthX — click to visit the GitHub repo
          </p>

          {/* Two separate cards side by side */}
          <div
            style={{
              display: "flex",
              gap: 24,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {CONTRIBUTORS.map((contributor) => (
              <a
                key={contributor.name}
                href={contributor.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", width: 280, flexShrink: 0 }}
                title={`View ${contributor.name} on GitHub`}
              >
                <div
                  style={{
                    height: 300,
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "#09090b",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "32px 24px",
                    gap: 16,
                    boxSizing: "border-box",
                    cursor: "pointer",
                    userSelect: "none",
                    transition: "border-color 0.25s ease, background 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.22)";
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.1)";
                    (e.currentTarget as HTMLDivElement).style.background = "#09090b";
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2px solid rgba(255,255,255,0.15)",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={contributor.image}
                      alt={contributor.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      draggable={false}
                    />
                  </div>

                  {/* Name + handle */}
                  <div style={{ textAlign: "center" }}>
                    <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em" }}>
                      {contributor.name}
                    </h3>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
                      {contributor.handle}
                    </p>
                  </div>

                  {/* Role badge */}
                  <div
                    style={{
                      padding: "5px 14px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    {contributor.role}
                  </div>

                  {/* GitHub hint */}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                    </svg>
                    View on GitHub
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>

      {/* Shared prose styles */}
      <style>{`
        .faq-page-prose h4 {
          color: #ffffff;
          font-size: 15px;
          font-weight: 700;
          margin: 22px 0 10px;
        }
        .faq-page-prose p { margin: 0 0 14px; }
      `}</style>
    </div>
  );
};

export default FaqPage;
