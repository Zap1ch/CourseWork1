import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getEmailError, getPasswordError } from "../utils/validation";

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/analyze");
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const emailMessage = getEmailError(email);
    const passwordMessage = getPasswordError(password);
    setEmailError(emailMessage);
    setPasswordError(passwordMessage);

    if (emailMessage || passwordMessage) {
      return;
    }

    try {
      setIsLoading(true);
      await login({ email: email.trim(), password });
      navigate("/analyze");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося увійти.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <img className="brand-mark" src="/logo.jpg" alt="Startup Validator" />
          <h1 className="auth-title">З поверненням</h1>
          <p className="auth-sub">Увійдіть, щоб перевіряти ідеї стартапів</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className={emailError ? "input invalid" : "input"}
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {emailError && <div className="validation-message">{emailError}</div>}
          </div>

          <div className="field">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              className={passwordError ? "input invalid" : "input"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {passwordError && <div className="validation-message">{passwordError}</div>}
          </div>

          {error && <div className="alert-error">{error}</div>}

          <button type="submit" className="button button-primary" disabled={isLoading}>
            {isLoading ? "Вхід..." : "Увійти"}
          </button>
        </form>

        <p className="auth-switch">
          Немає акаунта? <Link to="/register">Зареєструватися</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
