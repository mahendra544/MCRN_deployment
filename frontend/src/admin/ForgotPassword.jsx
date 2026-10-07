import { useState } from "react";

export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [sendingPassword, setSendingPassword] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  /*const sendPassword = async () => {
    setMessage("");
    setError("");
    setSendingPassword(true);

    try {
      const response = await fetch(
        "/api/admin/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email.trim() }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to send password");
        return;
      }

      setMessage(data.message);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the backend.");
    } finally {
      setSendingPassword(false);
    }
  };

  const sendResetLink = async () => {
    setMessage("");
    setError("");
    setSendingReset(true);

    try {
      const response = await fetch(
        "/api/admin/request-reset",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email.trim() }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to send reset link");
        return;
      }

      setMessage(data.message);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the backend.");
    } finally {
      setSendingReset(false);
    }
  };*/
  const sendPassword = async () => {
  setMessage("");
  setError("");
  setSendingPassword(true);

  console.log("➡️ Sending current password request...");

  try {
    const response = await fetch(
      "/api/admin/forgot-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      }
    );

    console.log("⬅️ Password response received:", response.status);

    const data = await response.json();

    console.log("📩 Password response:", data);

    if (!response.ok) {
      setError(data.message || "Failed to send password");
      return;
    }

    setMessage(data.message);

  } catch (error) {
    console.error("❌ Password request error:", error);
    setError("Unable to connect to the backend.");
  } finally {
    setSendingPassword(false);
  }
};


const sendResetLink = async () => {
  setMessage("");
  setError("");
  setSendingReset(true);

  console.log("➡️ Sending reset link request...");

  try {
    const response = await fetch(
      "/api/admin/request-reset",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      }
    );

    console.log("⬅️ Reset response received:", response.status);

    const data = await response.json();

    console.log("📩 Reset response:", data);

    if (!response.ok) {
      setError(data.message || "Failed to send reset link");
      return;
    }

    setMessage(data.message);

  } catch (error) {
    console.error("❌ Reset request error:", error);
    setError("Unable to connect to the backend.");
  } finally {
    setSendingReset(false);
  }
};

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Forgot Password 🔐</h1>

        <p>
          Enter your registered admin email address.
        </p>

        <label>Admin Email</label>

        <input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />

        {/* Send Current Password */}
        <button
          type="button"
          onClick={sendPassword}
          disabled={sendingPassword || sendingReset || !email}
          style={styles.button}
        >
          {sendingPassword ? "Sending Password..." : "Send Current Password"}
        </button>

        {/* Send Reset Link */}
        <button
          type="button"
          onClick={sendResetLink}
          disabled={sendingPassword || sendingReset || !email}
          style={styles.resetButton}
        >
          {sendingReset ? "Sending Reset Link..." : "Send Reset Link"}
        </button>

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
    marginBottom: "15px",
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
    marginBottom: "10px",
  },

  resetButton: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    background: "#333",
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