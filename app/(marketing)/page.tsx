"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLenis } from "lenis/react";

import { Hero } from "../components/marketing/Hero";
import {
  HEADER_HEIGHT,
  useLenisScrollTo,
  useReveal,
} from "@/hooks/marketingHooks";
import Image from "next/image";
import { z } from "zod";
import { postEarlyAccess } from "@/lib/actions/early-access";

const logo = "/brand/skilltrail-logo.svg";
const logoWhite = "/brand/skilltrail-logo-white.svg";

// ─── Reveal hook ─────────────────────────────────────────────────────────────

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
  {
    n: "01",
    label: "What You Built",
    desc: "The problem, the decision, the thing you shipped.",
  },
  {
    n: "02",
    label: "What You Learned",
    desc: "What surprised you. What you figured out along the way.",
  },
  {
    n: "03",
    label: "What Was Interesting",
    desc: "The angle worth pulling out. The part worth saying.",
  },
  { n: "04", label: "The Story", desc: "Draft. Your voice. The right depth." },
  {
    n: "05",
    label: "Worth Sharing",
    desc: "Something real. Something that sounds like you.",
  },
];

// ─── Subcomponents ────────────────────────────────────────────────────────────

function SectionLabel({
  children,
  light = false,
}: {
  children: string;
  light?: boolean;
}) {
  return (
    <p
      style={{
        fontFamily: "var(--f-mono)",
        fontSize: 11,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: light ? "rgba(255,255,255,0.45)" : "var(--c-muted)",
        marginBottom: 28,
      }}
    >
      {children}
    </p>
  );
}

// ─── Hero Visual ─────────────────────────────────────────────────────────────
// Work + learning fragments converge into Insights, then into a coherent story.

function TrailStep({
  step,
  isLast,
  delay,
}: {
  step: (typeof STEPS)[number];
  isLast: boolean;
  delay: number;
}) {
  return (
    <div
      className="node-appear"
      style={{
        animationDelay: `${delay}s`,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        flex: 1,
        minWidth: 0,
        position: "relative",
      }}
    >
      {/* Connector line */}
      {!isLast && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 10,
            left: "50%",
            right: "-50%",
            height: 1,
            background: "var(--c-line)",
          }}
        />
      )}

      {/* Node */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: isLast ? 20 : 12,
            height: isLast ? 20 : 12,
            borderRadius: "50%",
            background: isLast ? "var(--c-orange)" : "var(--c-white)",
            border: isLast ? "none" : "1.5px solid var(--c-line)",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "var(--f-mono)",
            fontSize: 10,
            color: "var(--c-muted)",
            letterSpacing: "0.1em",
          }}
        >
          {step.n}
        </span>
      </div>

      <p
        style={{
          fontFamily: "var(--f-sans)",
          fontWeight: 500,
          fontSize: 14,
          color: isLast ? "var(--c-orange)" : "var(--c-charcoal)",
          marginBottom: 8,
          lineHeight: 1.3,
        }}
      >
        {step.label}
      </p>
      <p
        style={{
          fontFamily: "var(--f-sans)",
          fontSize: 13,
          color: "var(--c-muted)",
          lineHeight: 1.55,
        }}
      >
        {step.desc}
      </p>
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const scrollTo = useLenisScrollTo();

  useLenis((lenis) => {
    const next = lenis.scroll > 10;
    setScrolled((prev) => (prev === next ? prev : next));
  });

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: `1px solid ${scrolled ? "var(--c-line)" : "transparent"}`,
        transition: "border-color 0.3s ease",
        padding: "0 clamp(24px, 5vw, 80px)",
        background: "var(--c-paper)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: HEADER_HEIGHT,
        }}
      >
        <Link href="#" aria-label="SkillTrail home">
          <Image
            src={logo}
            alt="SkillTrail"
            width={250}
            height={250}
            loading="eager"
            style={{ display: "block", userSelect: "none" }}
            className="md:w-50 w-30"
          />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-sans text-muted-foreground">
          <a
            href="#problem"
            onClick={scrollTo("#problem")}
            className="hover:text-foreground transition-colors duration-150"
          >
            The Problem
          </a>
          <a
            href="#how-it-works"
            onClick={scrollTo("#how-it-works")}
            className="hover:text-foreground transition-colors duration-150"
          >
            How it works
          </a>
          <a
            href="#why"
            onClick={scrollTo("#why")}
            className="hover:text-foreground transition-colors duration-150"
          >
            Why
          </a>
        </div>

        <a
          href="#join"
          onClick={scrollTo("#join")}
          style={{
            fontFamily: "var(--f-sans)",
            fontWeight: 500,
            fontSize: 14,
            color: "var(--c-orange)",
            textDecoration: "none",
            padding: "7px 18px",
            border: "1px solid var(--c-orange)",
            borderRadius: 4,
            letterSpacing: "0.01em",
            transition: "background 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.background = "var(--c-orange)";
            el.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.background = "transparent";
            el.style.color = "var(--c-orange)";
          }}
        >
          Join the first developers
        </a>
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
// in comps folder

// ─── Problem ──────────────────────────────────────────────────────────────────

function Problem() {
  const { ref, visible } = useReveal();

  return (
    <section
      id="problem"
      style={{
        background: "var(--c-ink)",
        padding: "clamp(72px, 10vw, 120px) clamp(24px, 5vw, 80px)",
        borderBottom: "1px solid #1d2030",
      }}
    >
      <div
        ref={ref}
        className={`reveal${visible ? " in" : ""}`}
        style={{ maxWidth: 1200, margin: "0 auto" }}
      >
        <SectionLabel light>The problem</SectionLabel>

        <div
          style={{
            borderLeft: "3px solid var(--c-orange)",
            paddingLeft: "clamp(24px, 3vw, 48px)",
            marginBottom: "clamp(32px, 4vw, 52px)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--f-display)",
              fontWeight: 600,
              fontSize: "clamp(32px, 4.5vw, 60px)",
              lineHeight: 1.1,
              letterSpacing: "-0.015em",
              color: "#E7E3DA",
              maxWidth: "22ch",
            }}
          >
            Building and talking about what you built are different skills.
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "clamp(32px, 4vw, 64px)",
          }}
        >
          <p
            style={{
              fontFamily: "var(--f-sans)",
              fontSize: "clamp(16px, 1.4vw, 18px)",
              lineHeight: 1.75,
              color: "#9A9690",
            }}
          >
            You can spend days solving a hard engineering problem and still
            struggle to explain why it mattered. What was actually interesting?
            What's the story? What's worth sharing?
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              "What was actually interesting?",
              "What's the story worth telling?",
              "How do you explain it without losing your voice?",
              "How do you keep doing it consistently?",
            ].map((q) => (
              <div
                key={q}
                style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "var(--c-orange)",
                    marginTop: 9,
                    flexShrink: 0,
                  }}
                />
                <p
                  style={{
                    fontFamily: "var(--f-sans)",
                    fontSize: 15,
                    color: "#9A9690",
                    lineHeight: 1.6,
                  }}
                >
                  {q}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Work → Story ─────────────────────────────────────────────────────────────

function WorkToStory() {
  const { ref, visible } = useReveal();

  return (
    <section
      id="how-it-works"
      style={{
        padding: "clamp(72px, 10vw, 120px) clamp(24px, 5vw, 80px)",
        borderBottom: "1px solid var(--c-line)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <SectionLabel>From work → story</SectionLabel>

        <h2
          style={{
            fontFamily: "var(--f-display)",
            fontWeight: 600,
            fontSize: "clamp(28px, 3vw, 44px)",
            letterSpacing: "-0.015em",
            color: "var(--c-ink)",
            marginBottom: "clamp(48px, 6vw, 80px)",
            lineHeight: 1.15,
            maxWidth: "30ch",
          }}
        >
          The work already exists. SkillTrail helps uncover the story inside it.
        </h2>

        {/* Desktop trail */}
        <div
          ref={ref}
          className={`trail-steps reveal${visible ? " in" : ""}`}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 0,
          }}
        >
          {STEPS.map((step, i) => (
            <TrailStep
              key={step.n}
              step={step}
              isLast={i === STEPS.length - 1}
              delay={visible ? i * 0.15 + 0.1 : 0}
            />
          ))}
        </div>

        {/* Mobile trail */}
        <div
          className="trail-steps-mobile"
          style={{ display: "none", flexDirection: "column", gap: 0 }}
        >
          {STEPS.map((step, i) => (
            <div key={step.n} style={{ display: "flex", gap: 20 }}>
              {/* Vertical connector */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: i === STEPS.length - 1 ? 20 : 12,
                    height: i === STEPS.length - 1 ? 20 : 12,
                    borderRadius: "50%",
                    background:
                      i === STEPS.length - 1
                        ? "var(--c-orange)"
                        : "var(--c-white)",
                    border:
                      i === STEPS.length - 1
                        ? "none"
                        : "1.5px solid var(--c-line)",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />
                {i < STEPS.length - 1 && (
                  <div
                    style={{
                      width: 1,
                      flex: 1,
                      background: "var(--c-line)",
                      marginTop: 6,
                      marginBottom: 6,
                      minHeight: 32,
                    }}
                  />
                )}
              </div>
              <div style={{ paddingBottom: i < STEPS.length - 1 ? 20 : 0 }}>
                <span
                  style={{
                    fontFamily: "var(--f-mono)",
                    fontSize: 10,
                    color: "var(--c-muted)",
                    letterSpacing: "0.1em",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  {step.n}
                </span>
                <p
                  style={{
                    fontFamily: "var(--f-sans)",
                    fontWeight: 500,
                    fontSize: 15,
                    color:
                      i === STEPS.length - 1
                        ? "var(--c-orange)"
                        : "var(--c-charcoal)",
                    marginBottom: 4,
                    lineHeight: 1.3,
                  }}
                >
                  {step.label}
                </p>
                <p
                  style={{
                    fontFamily: "var(--f-sans)",
                    fontSize: 14,
                    color: "var(--c-muted)",
                    lineHeight: 1.55,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <style>{`
          @media (max-width: 700px) {
            .trail-steps { display: none !important; }
            .trail-steps-mobile { display: flex !important; }
          }
        `}</style>
      </div>
    </section>
  );
}

// ─── Founder ──────────────────────────────────────────────────────────────────

function Founder() {
  const { ref, visible } = useReveal();

  return (
    <section
      id="why"
      style={{
        padding: "clamp(72px, 10vw, 120px) clamp(24px, 5vw, 80px)",
        borderBottom: "1px solid var(--c-line)",
      }}
    >
      <div
        ref={ref}
        className={`reveal${visible ? " in" : ""} founder-grid`}
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(160px, 200px) 1fr",
          gap: "clamp(32px, 5vw, 96px)",
          alignItems: "start",
        }}
      >
        {/* Left label column */}
        <div style={{ paddingTop: 4 }}>
          <p
            style={{
              fontFamily: "var(--f-mono)",
              fontSize: 11,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--c-muted)",
              lineHeight: 1.6,
            }}
          >
            Why I'm
            <br />
            building it
          </p>
          <div
            style={{
              marginTop: 24,
              width: 32,
              height: 1,
              background: "var(--c-orange)",
            }}
          />
        </div>

        {/* Right content */}
        <div>
          <blockquote
            style={{
              fontFamily: "var(--f-display)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(26px, 3vw, 40px)",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              color: "var(--c-ink)",
              margin: "0 0 clamp(20px, 3vw, 32px)",
              padding: 0,
              border: "none",
            }}
          >
            "I'm building this because I needed it too."
          </blockquote>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              maxWidth: "56ch",
            }}
          >
            <p
              style={{
                fontFamily: "var(--f-sans)",
                fontSize: "clamp(15px, 1.3vw, 17px)",
                lineHeight: 1.75,
                color: "var(--c-charcoal)",
              }}
            >
              I'm a developer who knows how to build things, but struggled to
              turn that work into stories, a personal brand, and a consistent
              presence online. SkillTrail started with that problem.
            </p>
            <p
              style={{
                fontFamily: "var(--f-sans)",
                fontSize: "clamp(15px, 1.3vw, 17px)",
                lineHeight: 1.75,
                color: "var(--c-charcoal)",
              }}
            >
              Now I'm building it for developers who have the same problem — one
              iteration at a time, based on what actually helps.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .founder-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
      `}</style>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

function CTA() {
  const { ref, visible } = useReveal();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const validation = emailSchema.safeParse({ email });
    if (!validation.success) {
      setMessage({ type: "error", text: validation.error.issues[0].message });
      return;
    }

    setLoading(true);
    try {
      const res = await postEarlyAccess({ email });
      if (res?.success) {
        setDone(true);
      } else if (res?.error === "ALREADY_SUBSCRIBED") {
        setMessage({
          type: "success",
          text: "You are already signed up for early access 🚀",
        });
      } else {
        setMessage({
          type: "error",
          text: "Something went wrong. Please try again.",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="join"
      style={{
        background: "var(--c-charcoal)",
        padding: "clamp(80px, 12vw, 140px) clamp(24px, 5vw, 80px)",
      }}
    >
      <div
        ref={ref}
        className={`reveal${visible ? " in" : ""}`}
        style={{ maxWidth: 720, margin: "0 auto" }}
      >
        <SectionLabel light>Early access</SectionLabel>

        <h2
          style={{
            fontFamily: "var(--f-display)",
            fontWeight: 700,
            fontSize: "clamp(30px, 4vw, 52px)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "#E7E3DA",
            marginBottom: "clamp(20px, 3vw, 28px)",
          }}
        >
          Help shape SkillTrail from the beginning.
        </h2>

        <p
          style={{
            fontFamily: "var(--f-sans)",
            fontSize: "clamp(15px, 1.3vw, 18px)",
            lineHeight: 1.7,
            color: "#9A9690",
            marginBottom: "clamp(36px, 5vw, 52px)",
            maxWidth: "50ch",
          }}
        >
          I'm looking for the first developers who have this problem too —
          people willing to try it, give honest feedback, and help shape what
          gets built next.
        </p>

        {done ? (
          <div
            style={{
              padding: "24px 32px",
              border: "1px solid rgba(180, 72, 34, 0.4)",
              borderRadius: 4,
              background: "rgba(180, 72, 34, 0.08)",
              maxWidth: 480,
            }}
          >
            <p
              style={{
                fontFamily: "var(--f-display)",
                fontStyle: "italic",
                fontSize: 20,
                color: "#E7E3DA",
                lineHeight: 1.4,
              }}
            >
              You're in. I'll be in touch when early access opens.
            </p>
            <p
              style={{
                fontFamily: "var(--f-mono)",
                fontSize: 13,
                color: "var(--c-orange)",
                marginTop: 12,
                letterSpacing: "0.1em",
                fontWeight: 700,
              }}
            >
              Iteration 01 · building in public
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              maxWidth: 480,
            }}
          >
            <div style={{ display: "flex", gap: 0, flexDirection: "column" }}>
              <label
                htmlFor="email"
                className="sr-only"
                style={{
                  position: "absolute",
                  width: 1,
                  height: 1,
                  overflow: "hidden",
                  clip: "rect(0,0,0,0)",
                }}
              >
                Your email
              </label>
              <div style={{ display: "flex", gap: 0, width: "100%" }}>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (message) setMessage(null);
                  }}
                  placeholder="your@email.dev"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "13px 18px",
                    background: "rgba(255,255,255,0.07)",
                    borderWidth: "1px 0 1px 1px",
                    borderStyle: "solid",
                    borderColor:
                      message?.type === "error"
                        ? "#ef4444"
                        : "rgba(255,255,255,0.12)",
                    borderRadius: "4px 0 0 4px",
                    fontFamily: "var(--f-sans)",
                    fontSize: 15,
                    color: "#E7E3DA",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    if (message?.type !== "error")
                      (e.target as HTMLInputElement).style.borderColor =
                        "rgba(180,72,34,0.5)";
                  }}
                  onBlur={(e) => {
                    if (message?.type !== "error")
                      (e.target as HTMLInputElement).style.borderColor =
                        "rgba(255,255,255,0.12)";
                  }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "13px 24px",
                    background: "var(--c-orange)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "0 4px 4px 0",
                    fontFamily: "var(--f-sans)",
                    fontWeight: 500,
                    fontSize: 15,
                    cursor: loading ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap",
                    transition: "opacity 0.2s",
                    width: "10rem",
                    opacity: loading ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!loading)
                      (e.currentTarget as HTMLButtonElement).style.opacity =
                        "0.88";
                  }}
                  onMouseLeave={(e) => {
                    if (!loading)
                      (e.currentTarget as HTMLButtonElement).style.opacity =
                        "1";
                  }}
                >
                  {loading ? "Joining..." : "Build it with me →"}
                </button>
              </div>
              {message?.type === "error" && (
                <p
                  style={{
                    fontFamily: "var(--f-sans)",
                    fontSize: 13,
                    color: "#ef4444",
                    marginTop: 8,
                  }}
                >
                  {message.text}
                </p>
              )}
              {message?.type === "success" && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "12px 16px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderLeft: "2px solid var(--c-orange)",
                    borderRadius: 4,
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--f-sans)",
                      fontSize: 14,
                      color: "#E7E3DA",
                      margin: 0,
                    }}
                  >
                    {message.text}
                  </p>
                </div>
              )}
            </div>

            <p
              style={{
                fontFamily: "var(--f-mono)",
                fontSize: 11,
                color: "rgba(154,150,144,0.7)",
                letterSpacing: "0.1em",
              }}
            >
              Early access · Built in public · Feedback welcome
            </p>
          </form>
        )}
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer
      style={{
        background: "var(--c-ink)",
        borderTop: "1px solid #1d2030",
        padding: "clamp(48px, 6vw, 80px) clamp(24px, 5vw, 80px)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <Image
          src={logoWhite}
          alt="SkillTrail"
          width={1800}
          height={346}
          className="block select-none h-auto w-full"
        />

        <div
          style={{
            width: 48,
            height: 1,
            background: "var(--c-orange)",
            opacity: 0.5,
          }}
        />

        <p
          style={{
            fontFamily: "var(--f-sans)",
            fontSize: 15,
            color: "#9A9690",
            lineHeight: 1.7,
            maxWidth: "44ch",
          }}
        >
          You build things. SkillTrail helps you tell the story.
        </p>

        <p
          style={{
            fontFamily: "var(--f-mono)",
            fontSize: 11,
            color: "#4a4d52",
            letterSpacing: "0.1em",
          }}
        >
          © 2026 SkillTrail
        </p>
      </div>
    </footer>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div
      style={{
        fontFamily: "var(--f-sans)",
        background: "var(--c-paper)",
        color: "var(--c-ink)",
      }}
    >
      <Header />
      {/* overflow-x on a wrapper below the header — not on sticky’s ancestor */}
      <div style={{ overflowX: "hidden" }}>
        <Hero />
        <Problem />
        <WorkToStory />
        <Founder />
        <CTA />
        <Footer />
      </div>
    </div>
  );
}
