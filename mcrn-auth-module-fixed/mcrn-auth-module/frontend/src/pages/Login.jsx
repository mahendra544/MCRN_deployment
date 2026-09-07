import { useState } from "react";
import AuthCard from "../components/AuthCard.jsx";
import Field from "../components/Field.jsx";
import Alert from "../components/Alert.jsx";
import { post, TOKEN_KEY } from "../api/client.js";

export default function Login({ go, setSession }) {
  const [f, setF] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const d = await post("/auth/login", f);
      localStorage.setItem(TOKEN_KEY, d.token);
      setSession(d);

if (d.role === "USER") {
  go("notification-test");}
 else if (d.role === "POLICE") {
  go("notification-test");
} else if (d.role === "ADMIN") {
  go("notification-test");
} else {
  go("home");
}
    } catch (x) {
      setErr(x.message === "EMAIL_NOT_VERIFIED" ? "Please verify your email first." : x.message);
      // Fixed: previously redirected using the username as if it were the
      // email, which broke the OTP call whenever username !== email. The
      // backend now returns the account's real email on this error.
      if (x.message === "EMAIL_NOT_VERIFIED" && x.email) {
        go("verify", x.email);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Sign in" subtitle="Use your username and password." onBack={() => go("home")}>
      <Alert msg={err} error />
      <form onSubmit={submit}>
        <Field
          label="Username"
          value={f.username}
          onChange={(v) => setF({ ...f, username: v })}
          placeholder="Your username"
        />
        <Field
          label="Password"
          type="password"
          value={f.password}
          onChange={(v) => setF({ ...f, password: v })}
          placeholder="Your password"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-md bg-brand py-3 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
        <button
          type="button"
          onClick={() => go("forgot")}
          className="mt-2.5 w-full rounded-md py-2.5 text-sm font-semibold text-muted transition hover:text-brand"
        >
          Forgot password?
        </button>
      </form>
    </AuthCard>
  );
}
