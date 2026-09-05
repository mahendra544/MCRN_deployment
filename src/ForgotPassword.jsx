/*import { useState } from "react";

export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    alert(`Password reset request sent for: ${email}`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Reset Password 🔐</h1>

        <p>
          Enter your registered admin email address to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Admin Email</label>

          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit">
            Continue
          </button>
        </form>

        <button
          type="button"
          onClick={onBack}
          style={styles.backButton}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f6f8",
  },

  card: {
    width: "400px",
    background: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },

  backButton: {
    marginTop: "20px",
    border: "none",
    background: "transparent",
    color: "#e52529",
    cursor: "pointer",
  },
};*/

import { useState } from "react";

export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to send email");
        return;
      }

      setMessage(data.message || "Password has been sent to your email.");
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Reset Password 🔐</h1>

        <p>
          Enter your registered admin email address to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Admin Email</label>

          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Sending..." : "Continue"}
          </button>
        </form>

        {message && <p style={styles.success}>{message}</p>}

        {error && <p style={styles.error}>{error}</p>}

        <button
          type="button"
          onClick={onBack}
          style={styles.backButton}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f6f8",
  },

  card: {
    width: "400px",
    background: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },

  input: {
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    marginBottom: "20px",
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    background: "#e52529",
    color: "white",
    cursor: "pointer",
  },

  success: {
    color: "green",
    marginTop: "20px",
  },

  error: {
    color: "red",
    marginTop: "20px",
  },

  backButton: {
    marginTop: "20px",
    border: "none",
    background: "transparent",
    color: "#e52529",
    cursor: "pointer",
  },
};
