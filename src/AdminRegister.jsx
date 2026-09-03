import React, { useState } from "react";

export default function AdminRegister({onRegister}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};

    if (!name.trim()) {
      next.name = "Enter admin name.";
    }

    if (!email.trim()) {
      next.email = "Enter admin email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Enter a valid email address.";
    }

    if (!password) {
      next.password = "Enter a password.";
    } else if (password.length < 6) {
      next.password = "Password must contain at least 6 characters.";
    }

    if (!confirmPassword) {
      next.confirmPassword = "Confirm your password.";
    } else if (password !== confirmPassword) {
      next.confirmPassword = "Passwords do not match.";
    }

    return next;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const next = validate();
    setErrors(next);

    if (Object.keys(next).length > 0) return;

    setSubmitting(true);

    // Later connect this to your backend:
    // POST /api/admin/register

    setTimeout(() => {
      setSubmitting(false);
      alert("Admin account created successfully!");
      onRegister();
    }, 900);
  };

  return (
    <div style={styles.page}>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: #f5f6f8;
        }

        .register-input {
          width: 100%;
          height: 45px;
          border: 1px solid #dfe3e8;
          border-radius: 7px;
          background: #ffffff;
          color: #172033;
          font-size: 13px;
          padding: 0 13px;
          outline: none;
          transition: 0.2s;
        }

        .register-input:focus {
          border-color: #e52529;
          box-shadow: 0 0 0 3px rgba(229, 37, 41, 0.10);
        }

        .register-input.has-error {
          border-color: #e52529;
        }

        .register-input::placeholder {
          color: #9aa3af;
        }

        .register-button {
          width: 100%;
          height: 46px;
          border: none;
          border-radius: 7px;
          background: #e52529;
          color: white;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }

        .register-button:hover {
          background: #cf1e22;
          transform: translateY(-1px);
        }

        .register-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .show-button {
          border: none;
          background: none;
          color: #e52529;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .login-link {
          color: #e52529;
          text-decoration: none;
          font-weight: 700;
        }

        .login-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 700px) {
          .register-card {
            grid-template-columns: 1fr !important;
          }

          .register-side {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.logo}>
            <img src="src/logo.png" alt="Missing Child Rescue Network" style={styles.logoImage} />
        
          </div>

          <div>
            <div style={styles.brandTitle}>Missing Child</div>
            <div style={styles.brandSubtitle}>
              Rescue Network
            </div>
          </div>
        </div>

        <div style={styles.secure}>
          <span style={styles.greenDot}></span>
          Secure Admin Portal
        </div>
      </header>

      {/* Main */}
      <main style={styles.main}>
        <div
          className="register-card"
          style={styles.card}
        >
          {/* Left red section */}
          <div
            className="register-side"
            style={styles.side}
          >
            <div style={styles.icon}>🛡️</div>

            <h2 style={styles.sideTitle}>
              Create Admin Account
            </h2>

            <p style={styles.sideText}>
              Register an authorized administrator to manage
              missing child cases and coordinate rescue operations.
            </p>

            <div style={styles.line}></div>

            <div style={styles.feature}>
              <span style={styles.check}>✓</span>
              Secure account access
            </div>

            <div style={styles.feature}>
              <span style={styles.check}>✓</span>
              Case management
            </div>

            <div style={styles.feature}>
              <span style={styles.check}>✓</span>
              Police coordination
            </div>

            <div style={styles.feature}>
              <span style={styles.check}>✓</span>
              Rescue operations
            </div>
          </div>

          {/* Registration form */}
          <div style={styles.formArea}>
            <div style={styles.status}>
              <span style={styles.statusDot}></span>
              NETWORK STATUS — OPERATIONAL
            </div>

            <h1 style={styles.heading}>
              Create Admin Account
            </h1>

            <p style={styles.subtitle}>
              Register a new administrator for the rescue network.
            </p>

            <form onSubmit={handleSubmit} noValidate>

              {/* Name */}
              <div style={styles.field}>
                <label style={styles.label}>
                  Admin Name
                </label>

                <input
                  type="text"
                  className={`register-input ${
                    errors.name ? "has-error" : ""
                  }`}
                  placeholder="Enter admin name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                {errors.name && (
                  <span style={styles.error}>
                    {errors.name}
                  </span>
                )}
              </div>

              {/* Email */}
              <div style={styles.field}>
                <label style={styles.label}>
                  Admin Email
                </label>

                <input
                  type="email"
                  className={`register-input ${
                    errors.email ? "has-error" : ""
                  }`}
                  placeholder="admin@rescuenetwork.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                {errors.email && (
                  <span style={styles.error}>
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Password */}
              <div style={styles.field}>
                <div style={styles.labelRow}>
                  <label style={styles.label}>
                    Password
                  </label>

                  <button
                    type="button"
                    className="show-button"
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                  >
                    {showPassword ? "Show" : "Hide"}
                  </button>
                </div>

                <input
                  type={showPassword ? "text" : "password"}
                  className={`register-input ${
                    errors.password ? "has-error" : ""
                  }`}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {errors.password && (
                  <span style={styles.error}>
                    {errors.password}
                  </span>
                )}
              </div>

              {/* Confirm password */}
              <div style={styles.field}>
                <div style={styles.labelRow}>
                  <label style={styles.label}>
                    Confirm Password
                  </label>

                  <button
                    type="button"
                    className="show-button"
                    onClick={() =>
                      setShowConfirmPassword((value) => !value)
                    }
                  >
                    {showConfirmPassword ? "Show" : "Hide"}
                  </button>
                </div>

                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  className={`register-input ${
                    errors.confirmPassword
                      ? "has-error"
                      : ""
                  }`}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                />

                {errors.confirmPassword && (
                  <span style={styles.error}>
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="register-button"
                disabled={submitting}
                style={{ marginTop: 22 }}
              >
                {submitting
                  ? "Creating Account..."
                  : "Create Admin Account"}
              </button>
            </form>

            {/* Login link */}
            <p style={styles.loginText}>
              Already have an admin account?{" "}
              <a
                href="#admin-login"
                className="login-link"
              >
                Sign in
              </a>
            </p>

            <div style={styles.footer}>
              🔒 Your account information is securely protected.
            </div>
          </div>
        </div>
      </main>

      <footer style={styles.bottom}>
        Missing Child Rescue Network • Admin Access
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f6f8",
    display: "flex",
    flexDirection: "column",
    color: "#172033",
  },

  header: {
    height: 76,
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 6%",
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
    fontSize: 13,
    fontWeight: 800,
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
  },

  brandSubtitle: {
    color: "#667085",
    fontSize: 11,
    marginTop: 2,
  },

  secure: {
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
  },

  main: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "38px 20px",
  },

  card: {
    width: "min(900px, 100%)",
    minHeight: 570,
    background: "#ffffff",
    border: "1px solid #e1e5ea",
    borderRadius: 12,
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns: "38% 62%",
    boxShadow: "0 12px 35px rgba(16,24,40,0.08)",
  },

  side: {
    background: "#e52529",
    color: "#ffffff",
    padding: "42px 36px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  icon: {
    width: 52,
    height: 52,
    borderRadius: 10,
    background: "rgba(255,255,255,0.16)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    marginBottom: 20,
  },

  sideTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 800,
  },

  sideText: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 1.65,
    color: "rgba(255,255,255,0.9)",
  },

  line: {
    height: 1,
    background: "rgba(255,255,255,0.22)",
    margin: "25px 0 20px",
  },

  feature: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 12.5,
    fontWeight: 600,
    marginBottom: 14,
  },

  check: {
    width: 21,
    height: 21,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  formArea: {
    padding: "38px 50px 28px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  status: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#98a2b3",
    fontSize: 9.5,
    fontWeight: 700,
    letterSpacing: "0.05em",
    marginBottom: 18,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#16a34a",
  },

  heading: {
    margin: 0,
    fontSize: 24,
    fontWeight: 800,
  },

  subtitle: {
    margin: "8px 0 24px",
    color: "#667085",
    fontSize: 13,
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 15,
  },

  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    color: "#344054",
    fontSize: 12,
    fontWeight: 700,
  },

  error: {
    color: "#e52529",
    fontSize: 11,
  },

  loginText: {
    textAlign: "center",
    color: "#667085",
    fontSize: 12,
    marginTop: 20,
  },

  footer: {
    borderTop: "1px solid #edf0f2",
    marginTop: 18,
    paddingTop: 14,
    color: "#98a2b3",
    fontSize: 10.5,
    textAlign: "center",
  },

  bottom: {
    textAlign: "center",
    paddingBottom: 18,
    color: "#98a2b3",
    fontSize: 10.5,
  },
};