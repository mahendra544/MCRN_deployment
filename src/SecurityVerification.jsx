import React, { useEffect, useRef, useState } from "react";

/**
 * SecurityVerification
 * Boot / access-verification splash screen for the
 * Missing Child Rescue Network admin dashboard.
 *
 * Usage:
 *   <SecurityVerification
 *     adminName="Admin"
 *     role="Super Administrator"
 *     securityLevel="Level 5"
 *     loginTime="08 Sep 2026 | 01:45 PM"
 *     onVerified={() => navigate("/dashboard")}
 *   />
 */

const CHECKS = [
  "Administrator Verified",
  "Security Token Generated",
  "Permissions Loaded",
  "Database Connected",
  "Audit Session Started",
];

export default function SecurityVerification({
  adminName = "Admin",
  role = "Super Administrator",
  securityLevel = "Level 5",
  loginTime,
  onVerified,
}) {
  const [visibleChecks, setVisibleChecks] = useState(0);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("checking"); // checking -> loading -> done
  const timers = useRef([]);

  const resolvedLoginTime =
    loginTime ||
    new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).replace(",", " |");

  useEffect(() => {
    CHECKS.forEach((_, i) => {
      const t = setTimeout(() => setVisibleChecks(i + 1), 420 * (i + 1));
      timers.current.push(t);
    });

    const startLoading = setTimeout(() => setPhase("loading"), 420 * CHECKS.length + 400);
    timers.current.push(startLoading);

    return () => timers.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase !== "loading") return;
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + 4, 100);
        if (next === 100) {
          clearInterval(interval);
          setTimeout(() => setPhase("done"), 300);
        }
        return next;
      });
    }, 45);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase === "done" && onVerified) {
      const t = setTimeout(() => onVerified(), 700);
      timers.current.push(t);
      return () => clearTimeout(t);
    }
  }, [phase, onVerified]);

  return (
    <div className="sv-screen">
      <style>{`
        /* ===========================
   Global Reset
=========================== */
*,
*::before,
*::after{
    box-sizing:border-box;
    margin:0;
    padding:0;
}

/* ===========================
   Global Font
=========================== */
body{
    font-family:"Poppins",sans-serif;
    font-size:15px;
    font-weight:400;
    line-height:1.6;
    background:#f5f7fb;
    color:#1f2937;
}

/* ===========================
   Security Screen
=========================== */
.sv-screen{
    --sv-red: #E31E24;
    --sv-red-dark: #B31317;
    --sv-red-light: #FFF1F1;
    --sv-red-border: #F5B5B7;

    --sv-bg: #F6F8FC;
    --sv-panel: #FFFFFF;
    --sv-border: #E4E8F0;

    --sv-text: #1F2937;
    --sv-text-dim: #6B7280;


    min-height:100vh;
    width:100%;
    display:flex;
    justify-content:center;
    align-items:center;
    background:var(--sv-bg);
    padding:32px 16px;
}

        .sv-screen {
          --sv-red: #c0272d;
          --sv-red-dark: #8f1a1f;
          --sv-red-light: #fdecec;
          --sv-red-border: #c98083ff;
          --sv-bg: #f4f5f9;
          --sv-panel: #ffffff;
          --sv-border: #e7e9f0;
          --sv-text: #1f2430;
          --sv-text-dim: #7a8194;

          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--sv-bg);
          padding: 32px 16px;
        }

        .sv-panel {
          position: relative;
          width: 100%;
          max-width: 440px;
          background: var(--sv-panel);
          border: 2px solid #E02323;
          border-radius: 14px;
          padding: 36px 32px 28px;
          box-shadow: 0 8px 28px rgba(31, 36, 48, 0.08);
        }

        .sv-badge-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 22px;
        }

        .sv-shield {
          width: 52px;
          height: 52px;
          margin-bottom: 14px;
          flex-shrink: 0;
        }
        .sv-title{
              color:#E31E24;
              font-size:22px;
              font-weight:700;
        }

        .sv-subtitle {
          font-size: 13px;
          color: var(--sv-text-dim);
          margin-top: 5px;
        }

        .sv-log {
          background: var(--sv-red-light);
          border: 1px solid var(--sv-red-border);
          border-radius: 10px;
          padding: 14px 16px;
          margin-bottom: 18px;
        }

        .sv-log-line {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13.5px;
          font-weight: 500;
          color: var(--sv-text);
          opacity: 0;
          transform: translateY(2px);
          animation: sv-line-in 0.35s ease forwards;
          padding: 4px 0;
        }

        @keyframes sv-line-in {
          to { opacity: 1; transform: translateY(0); }
        }

        .sv-check {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--sv-red);
          color: #fff;
          font-size: 11px;
          line-height: 18px;
          text-align: center;
          flex-shrink: 0;
        }

        .sv-divider {
          height: 1px;
          background: var(--sv-border);
          margin: 18px 0;
        }

        .sv-grid {
          display: grid;
          grid-template-columns: auto 1fr;
          row-gap: 10px;
          column-gap: 14px;
          font-size: 13.5px;
          margin-bottom: 18px;
        }

        .sv-grid dt {
          color: var(--sv-text-dim);
        }

        .sv-grid dd {
          color: var(--sv-text);
          font-weight: 500;
          text-align: right;
        }

        .sv-grid dd.sv-role{
    color:#E31E24;
    font-weight:600;
}

        .sv-load-label {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          font-size: 12.5px;
          color: var(--sv-text-dim);
          margin-bottom: 8px;
        }

        .sv-load-label span.sv-pct {
          color: var(--sv-red);
          font-weight: 600;
        }

        .sv-track {
              height: 7px;
              background: var(--sv-red-light);
              border: 1px solid var(--sv-red-border);
              border-radius: 4px;
              overflow: hidden;
            }

       stroke="#E31E24"
        fill="#FFF1F1"

        .sv-status {
          text-align: center;
          margin-top: 16px;
          font-size: 12.5px;
          font-weight: 500;
          color: var(--sv-text-dim);
        }

        .sv-status.sv-granted {
          color: var(--sv-red);
          font-weight: 600;
        }

        .sv-blink {
          animation: sv-blink 1.1s steps(1) infinite;
        }

        @keyframes sv-blink {
          50% { opacity: 0.3; }
        }

        @media (prefers-reduced-motion: reduce) {
          .sv-log-line { animation: none; opacity: 1; transform: none; }
          .sv-blink { animation: none; }
          .sv-fill { transition: none; }
        }
          .sv-fill {
                    height: 100%;
                    background: #E02323;
                    transition: width 0.05s linear;
                }
      `}</style>

      <div className="sv-panel">
        <div className="sv-badge-row">
          <svg className="sv-shield" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M24 4L40 10V22C40 32.5 33.4 40.8 24 44C14.6 40.8 8 32.5 8 22V10L24 4Z"
              stroke="#e02323"
              strokeWidth="2"
              fill="#fdecec"
            />
            <path
              d="M17 24L22 29L32 18"
              stroke="#c0272d"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h1 className="sv-title">Security Verification</h1>
          <p className="sv-subtitle">Missing Child Rescue Network — Admin Portal</p>
        </div>

        <div className="sv-log">
          {CHECKS.slice(0, visibleChecks).map((line) => (
            <div className="sv-log-line" key={line}>
              <span className="sv-check">✓</span>
              <span>{line}</span>
            </div>
          ))}
        </div>

        <div className="sv-divider" />

        <dl className="sv-grid">
          <dt>Administrator</dt>
          <dd>{adminName}</dd>
          <dt>Role</dt>
          <dd className="sv-role">{role}</dd>
          <dt>Security</dt>
          <dd>{securityLevel}</dd>
          <dt>Login Time</dt>
          <dd>{resolvedLoginTime}</dd>
        </dl>

        <div className="sv-divider" />

        <div className="sv-load-label">
          <span>{phase === "done" ? "Secure Dashboard Ready" : "Loading Secure Dashboard..."}</span>
          <span className="sv-pct">{progress}%</span>
        </div>
        <div className="sv-track">
          <div className="sv-fill" style={{ width: `${progress}%` }} />
        </div>

        <p className={`sv-status ${phase === "done" ? "sv-granted" : ""}`}>
          {phase === "done" ? "Access granted" : <span className="sv-blink">Please wait...</span>}
        </p>
      </div>
    </div>
  );
}
