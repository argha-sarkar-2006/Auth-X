import { useState, type FormEvent } from "react";
import { signIn, signUp } from "../lib/auth";

type Mode = "login" | "signup";

interface LoginPageProps {
  onAuthed?: (uid: string) => void;
}

const LoginPage = ({ onAuthed }: LoginPageProps) => {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const user =
        mode === "login"
          ? await signIn(email, password)
          : await signUp(email, password);
      onAuthed?.(user.uid);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Authentication failed.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        zIndex: 10000,
        padding: 20,
        fontFamily: "inherit",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 600,
          background:
            "radial-gradient(circle, rgba(100,160,255,0.12) 0%, transparent 60%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      <form
        onSubmit={handleSubmit}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 420,
          padding: "40px 36px",
          borderRadius: 16,
          background: "rgba(20,20,22,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            {isLogin ? "Welcome back" : "Create account"}
          </h1>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: 14,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            {isLogin
              ? "Sign in to continue to AuthX"
              : "Sign up to get started with AuthX"}
          </p>
        </div>

        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete={isLogin ? "current-password" : "new-password"}
        />

        {error && (
          <div
            role="alert"
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              background: "rgba(220,80,80,0.12)",
              border: "1px solid rgba(220,80,80,0.3)",
              color: "#ff9b9b",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: "100%",
            padding: "13px 16px",
            borderRadius: 10,
            border: "none",
            background: submitting
              ? "rgba(255,255,255,0.6)"
              : "#ffffff",
            color: "#0a0a0a",
            fontSize: 15,
            fontWeight: 700,
            cursor: submitting ? "not-allowed" : "pointer",
            transition: "opacity 0.2s ease, transform 0.1s ease",
            marginTop: 4,
          }}
        >
          {submitting
            ? isLogin
              ? "Signing in…"
              : "Creating account…"
            : isLogin
            ? "Sign in"
            : "Sign up"}
        </button>

        <div
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "rgba(255,255,255,0.5)",
          }}
        >
          {isLogin ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setMode(isLogin ? "signup" : "login");
              setError(null);
            }}
            style={{
              background: "none",
              border: "none",
              color: "#ffffff",
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
              font: "inherit",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            {isLogin ? "Create account" : "Sign in"}
          </button>
        </div>
      </form>
    </div>
  );
};

interface FieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}

const Field = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: FieldProps) => {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "rgba(255,255,255,0.7)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(255,255,255,0.04)",
          color: "#ffffff",
          fontSize: 15,
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.2s ease, background 0.2s ease",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
          e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        }}
      />
    </label>
  );
};

export default LoginPage;
