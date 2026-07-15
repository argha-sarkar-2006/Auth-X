"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

export interface FaqAccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: FaqItem[];
  title?: string;
}

const DEFAULT_ITEMS: FaqItem[] = [
  { question: "What is Vengeance UI?", answer: "Vengeance UI is a high-performance, dark-mode first component library designed for the next generation of web applications." },
  { question: "Can I use it with Tailwind CSS?", answer: "Yes! All components are built on top of Tailwind CSS and highly customizable using utility classes." },
  { question: "Are the components accessible?", answer: "Accessibility is a core focus. We ensure proper ARIA attributes, keyboard navigation, and semantic HTML structure." },
  { question: "Do I need to install a heavy npm package?", answer: "No. Vengeance UI provides a CLI that lets you copy and paste only the components you need directly into your project." },
  { question: "Is it compatible with React and Next.js?", answer: "Absolutely. The library is built with React in mind and perfectly supports Next.js Server Components and client-side rendering." },
];

export function FaqAccordion({
  items = DEFAULT_ITEMS,
  title = "Vengeance UI FAQs",
  className,
  style,
  ...props
}: FaqAccordionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div
      className={className}
      style={{
        width: "100%",
        maxWidth: 900,
        margin: "0 auto",
        padding: "48px 16px",
        fontFamily: "inherit",
        color: "#ffffff",
        ...style,
      }}
      {...props}
    >
      {title && (
        <h2
          style={{
            textAlign: "center",
            fontWeight: 700,
            fontSize: 32,
            marginBottom: 48,
            color: "#ffffff",
          }}
        >
          {title}
        </h2>
      )}

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <li
              key={index}
              style={{
                position: "relative",
                display: "flex",
                borderBottom:
                  index < items.length - 1
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
                {/* Header button */}
                <button
                  onClick={() => toggleItem(index)}
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
                  {/* Plus / Minus */}
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 300,
                      lineHeight: 1,
                      color: isActive ? "#ffffff" : "rgba(255,255,255,0.4)",
                      width: 18,
                      flexShrink: 0,
                      textAlign: "center",
                      transition: "color 0.2s ease",
                    }}
                  >
                    {isActive ? "−" : "+"}
                  </span>

                  {/* Question - immediately after +/- */}
                  <span
                    style={{
                      flex: 1,
                      fontSize: 18,
                      fontWeight: 600,
                      color: isActive ? "#ffffff" : "rgba(255,255,255,0.55)",
                      transition: "color 0.2s ease",
                    }}
                  >
                    {item.question}
                  </span>

                  {/* Chevron */}
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

                {/* Answer with smooth expand */}
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                      style={{ overflow: "hidden" }}
                    >
                      <div
                        style={{
                          paddingLeft: 34,
                          paddingRight: 20,
                          paddingBottom: 28,
                          paddingTop: 0,
                          fontSize: 14,
                          lineHeight: 1.7,
                          color: "rgba(255,255,255,0.55)",
                        }}
                      >
                        {item.answer}
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
  );
}

export default FaqAccordion;
