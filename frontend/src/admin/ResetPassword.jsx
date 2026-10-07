import { useState } from "react";

export default function ResetPassword({ onBack }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = window.location.pathname.split("/").pop();

  const handleReset = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Please enter both password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/admin/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            newPassword: newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to reset password.");
        return;
      }

      setMessage(
        "Password reset successfully! You can now login with your new password."
      );

      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Reset password error:", error);
      setError("Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <h1>Reset Password 🔐</h1>

        <p style={styles.description}>
          Create a new password for your Admin Portal.
        </p>

        <form onSubmit={handleReset}>

          <label style={styles.label}>
            New Password
          </label>

          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={styles.input}
          />

          <label style={styles.label}>
            Confirm Password
          </label>

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={styles.input}
          />

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

        </form>

        {message && (
          <p style={styles.success}>
            {message}
          </p>
        )}

        {error && (
          <p style={styles.error}>
            {error}
          </p>
        )}

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

  description: {
    color: "#555",
    marginBottom: "25px",
  },

  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "18px",
    boxSizing: "border-box",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "15px",
  },

  button: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    background: "#e52529",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
  },

  success: {
    color: "green",
    marginTop: "20px",
    lineHeight: "1.5",
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
    fontSize: "14px",
  },
};