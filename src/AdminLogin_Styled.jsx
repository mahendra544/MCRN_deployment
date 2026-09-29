import React, { useState } from "react";
import SecurityVerification from "./SecurityVerification";
export default function AdminLogin({onLogin,onForgotPassword}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
const [showVerification, setShowVerification] = useState(false);
  const validate = () => {
    const next = {};

    if (!email.trim()) {
      next.email = "Enter your admin email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Enter a valid email address.";
    }

    if (!password) {
      next.password = "Enter your password.";
    }

    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const next = validate();

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    // KEEP ME SIGNED IN MUST BE CHECKED
    if (!remember) {
      setErrors({
        remember: "Please select 'Keep me signed in' to continue.",
      });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          password: data.message || "Login failed.",
        });

        setSubmitting(false);
        return;
      }

      // Login successful
localStorage.setItem("adminLoggedIn", "true");
localStorage.setItem("adminLoggedIn", "true");

localStorage.setItem(
    "adminData",
    JSON.stringify(data.admin)
);

setSubmitting(false);

setShowVerification(true);
setSubmitting(false);

// Show Security Verification page
setShowVerification(true);

    } catch (error) {
      console.error("Login error:", error);

      setErrors({
        password: "Unable to connect to the server.",
      });

      setSubmitting(false);
    }
  };
if (showVerification) {
    return (
        <SecurityVerification
            adminName="Administrator"
            role="Super Administrator"
            securityLevel="Level 5"
            onVerified={() => onLogin()}
        />
    );
}
  return (
    <div style={styles.page} className="login-page-animation">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: 'Inter', sans-serif;
          background: #f5f6f8;
        }

        .admin-login-input {
          width: 100%;
          height: 48px;
          border: 1px solid #dfe3e8;
          border-radius: 7px;
          background: #ffffff;
          color: #172033;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          padding: 0 14px;
          outline: none;
          transition: 0.2s ease;
        }

        .admin-login-input::placeholder {
          color: #9aa3af;
        }

        .admin-login-input:focus {
          border-color: #e52529;
          box-shadow: 0 0 0 3px rgba(229, 37, 41, 0.10);
        }

        .admin-login-input.has-error {
          border-color: #e52529;
        }

        .admin-login-button {
          width: 100%;
          height: 48px;
          border: none;
          border-radius: 7px;
          background: #e52529;
          color: white;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .admin-login-button:hover {
          background: #cf1e22;
          transform: translateY(-1px);
        }

        .admin-login-button:active {
          transform: translateY(0);
        }

        .admin-login-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .show-password {
          border: none;
          background: transparent;
          color: #e52529;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        .show-password:hover {
          text-decoration: underline;
        }

        .forgot-link {
          color: #e52529;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
        }

        .forgot-link:hover {
          text-decoration: underline;
        }

        .remember-checkbox {
          width: 15px;
          height: 15px;
          accent-color: #e52529;
          cursor: pointer;
        }

        @media (max-width: 700px) {
          .admin-login-card {
            width: calc(100vw - 32px) !important;
          }

          .admin-login-page {
            padding: 16px !important;
          }
        }

  /* ================= LOGIN PAGE ANIMATIONS ================= */

  .login-page-animation {
    animation: pageFadeIn 0.7s ease-in-out;
  }

  .topbar-animation {
    animation: topSlideDown 0.7s ease-out;
  }

  .login-card-animation {
    opacity: 0;
    animation: cardSlideUp 0.8s ease-out forwards;
  }

  .side-panel-animation {
    animation: panelSlideLeft 0.9s ease-out;
  }

  .form-area-animation {
    opacity: 0;
    animation: formSlideRight 0.9s ease-out forwards;
    animation-delay: 0.3s;
  }

  @keyframes pageFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes topSlideDown {
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes cardSlideUp {
    from {
      opacity: 0;
      transform: translateY(45px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes panelSlideLeft {
    from {
      opacity: 0;
      transform: translateX(-50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes formSlideRight {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

`}
      </style>

      <div style={styles.topBar} className="topbar-animation">
        <div style={styles.brand}>

          <div style={styles.logo}>
            <img
              src="src/logo.png"
              alt="Missing Child Rescue Network"
              style={styles.logoImage}
            />
          </div>

          <div>
            <div style={styles.brandTitle}>
              Missing Child
            </div>

            <div style={styles.brandSubtitle}>
              Rescue Network
            </div>
          </div>

        </div>

        <div style={styles.secureBadge}>
          <span style={styles.greenDot}></span>
          Secure Admin Portal
        </div>
      </div>

      <main
        className="admin-login-page"
        style={styles.main}
      >

        <div
  className="admin-login-card login-card-animation"
  style={styles.card}
>

          <div style={styles.sidePanel} className="side-panel-animation">

            <div style={styles.sideIcon}>
              🛡️
            </div>

            <h2 style={styles.sideHeading}>
              Admin Portal
            </h2>

            <p style={styles.sideText}>
              Manage missing child cases, verify reports and coordinate
              rescue operations securely.
            </p>

            <div style={styles.sideDivider}></div>

            <div style={styles.sidePoint}>
              <span style={styles.checkCircle}>
                ✓
              </span>
              Case verification
            </div>

            <div style={styles.sidePoint}>
              <span style={styles.checkCircle}>
                ✓
              </span>
              Police coordination
            </div>

            <div style={styles.sidePoint}>
              <span style={styles.checkCircle}>
                ✓
              </span>
              Rescue management
            </div>

          </div>

          <div style={styles.formArea} className="form-area-animation">

            <div style={styles.statusRow}>
              <span style={styles.statusDot}></span>

              <span style={styles.statusText}>
                NETWORK STATUS — OPERATIONAL
              </span>
            </div>

            <h1 style={styles.heading}>
              Welcome back, Admin 👋
            </h1>

            <p style={styles.subtext}>
              Sign in to access the Missing Child Rescue Network admin dashboard.
            </p>

            <form
              onSubmit={handleSubmit}
              noValidate
              style={{ marginTop: 28 }}
            >

              {/* EMAIL */}

              <div style={styles.field}>

                <label
                  htmlFor="email"
                  style={styles.label}
                >
                  Admin Email
                </label>

                <input
                  id="email"
                  type="email"
                  className={`admin-login-input${
                    errors.email ? " has-error" : ""
                  }`}
                  placeholder="admin@rescuenetwork.org"
                  value={email}
                  onChange={(e) => {

                    setEmail(e.target.value);

                    if (errors.email) {
                      setErrors((prev) => ({
                        ...prev,
                        email: "",
                      }));
                    }

                  }}
                  autoComplete="username"
                />

                {errors.email && (
                  <p style={styles.errorText}>
                    {errors.email}
                  </p>
                )}

              </div>


              {/* PASSWORD */}

              <div
                style={{
                  ...styles.field,
                  marginTop: 18
                }}
              >

                <div style={styles.labelRow}>

                  <label
                    htmlFor="password"
                    style={styles.label}
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="show-password"
                    onClick={() =>
                      setShowPassword((s) => !s)
                    }
                  >
                    {showPassword ? "Show" : "Hide"}
                  </button>

                </div>

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  className={`admin-login-input${
                    errors.password
                      ? " has-error"
                      : ""
                  }`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {

                    setPassword(e.target.value);

                    if (errors.password) {
                      setErrors((prev) => ({
                        ...prev,
                        password: "",
                      }));
                    }

                  }}
                  autoComplete="current-password"
                />

                {errors.password && (
                  <p style={styles.errorText}>
                    {errors.password}
                  </p>
                )}

              </div>


              {/* KEEP ME SIGNED IN */}

              <div style={styles.optionsRow}>

                <div>

                  <label style={styles.rememberLabel}>

                    <input
                      type="checkbox"
                      className="remember-checkbox"
                      checked={remember}
                      onChange={(e) => {

                        setRemember(e.target.checked);

                        if (e.target.checked) {
                          setErrors((prev) => ({
                            ...prev,
                            remember: "",
                          }));
                        }

                      }}
                    />

                    Keep me signed in

                  </label>

                  {errors.remember && (
                    <p style={styles.errorText}>
                      {errors.remember}
                    </p>
                  )}

                </div>

                <button
                      type="button"
                      className="forgot-link"
                      onClick={onForgotPassword}
                      style={{
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                 padding: 0,
                              }}
                  >
                      Forgot password?
                </button>
              </div>


              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="admin-login-button"
                disabled={submitting}
                style={{ marginTop: 24 }}
              >
                {submitting
                  ? "Signing in..."
                  : "Sign in to Admin Portal"}
              </button>

            </form>


            {/* FOOTER */}

            <div style={styles.footer}>

              <span style={styles.lockIcon}>
                🔒
              </span>

              <p style={styles.footerText}>
                Restricted to authorized personnel. All access is logged and
                monitored.
              </p>

            </div>

          </div>

        </div>

      </main>

      <footer style={styles.bottomFooter}>
        Missing Child Rescue Network • Admin Access
      </footer>

    </div>
  );
}


const styles = {

  page: {
    minHeight: "100vh",
    width: "100%",
    background: "#f5f6f8",
    color: "#172033",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Inter', sans-serif",
  },

  topBar: {
    height: 76,
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 6%",
    flexShrink: 0,
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 11,
  },

  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    background: "#e52529",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 13,
    boxShadow: "0 4px 10px rgba(229, 37, 41, 0.18)",
  },

  logoImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    borderRadius: 8,
  },

  brandTitle: {
    color: "#e52529",
    fontSize: 16,
    fontWeight: 800,
    lineHeight: 1.15,
  },

  brandSubtitle: {
    color: "#667085",
    fontSize: 11,
    fontWeight: 600,
    marginTop: 2,
  },

  secureBadge: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    color: "#667085",
    fontSize: 12,
    fontWeight: 600,
  },

  greenDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#16a34a",
    display: "inline-block",
  },

  main: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "45px 24px",
  },

  card: {
    width: "min(900px, 100%)",
    minHeight: 500,
    background: "#ffffff",
    border: "1px solid #e1e5ea",
    borderRadius: 12,
    display: "grid",
    gridTemplateColumns: "38% 62%",
    overflow: "hidden",
    boxShadow: "0 12px 35px rgba(16, 24, 40, 0.08)",
  },

  sidePanel: {
    background: "#e52529",
    color: "#ffffff",
    padding: "42px 36px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  sideIcon: {
    width: 52,
    height: 52,
    borderRadius: 10,
    background: "rgba(255,255,255,0.16)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 25,
    marginBottom: 22,
  },

  sideHeading: {
    margin: 0,
    fontSize: 25,
    fontWeight: 800,
  },

  sideText: {
    margin: "12px 0 0",
    fontSize: 13,
    lineHeight: 1.65,
    color: "rgba(255,255,255,0.88)",
  },

  sideDivider: {
    width: "100%",
    height: 1,
    background: "rgba(255,255,255,0.22)",
    margin: "30px 0 22px",
  },

  sidePoint: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 12.5,
    fontWeight: 600,
    marginBottom: 15,
  },

  checkCircle: {
    width: 21,
    height: 21,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
  },

  formArea: {
    padding: "44px 52px 32px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#16a34a",
    display: "inline-block",
  },

  statusText: {
    color: "#98a2b3",
    fontSize: 9.5,
    fontWeight: 700,
    letterSpacing: "0.06em",
  },

  heading: {
    margin: 0,
    color: "#172033",
    fontSize: 25,
    lineHeight: 1.25,
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },

  subtext: {
    margin: "9px 0 0",
    color: "#667085",
    fontSize: 13,
    lineHeight: 1.55,
    maxWidth: 440,
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },

  label: {
    color: "#344054",
    fontSize: 12.5,
    fontWeight: 700,
  },

  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  errorText: {
    margin: "1px 0 0",
    color: "#e52529",
    fontSize: 11.5,
    fontWeight: 500,
  },

  optionsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 17,
  },

  rememberLabel: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    color: "#667085",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
  },

  footer: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    borderTop: "1px solid #edf0f2",
    marginTop: 27,
    paddingTop: 18,
  },

  lockIcon: {
    fontSize: 12,
    marginTop: 1,
  },

  footerText: {
    margin: 0,
    color: "#98a2b3",
    fontSize: 10.5,
    lineHeight: 1.55,
  },

  bottomFooter: {
    textAlign: "center",
    padding: "0 20px 20px",
    color: "#98a2b3",
    fontSize: 10.5,
  },
}
