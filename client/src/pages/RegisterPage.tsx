import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getConfirmError, getEmailError, getPasswordError } from "../utils/validation";

function RegisterPage() {
  const navigate = useNavigate();
  const { register, login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
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
    const confirmMessage = getConfirmError(password, confirmPassword);
    setEmailError(emailMessage);
    setPasswordError(passwordMessage);
    setConfirmError(confirmMessage);

    if (emailMessage || passwordMessage || confirmMessage) {
      return;
    }

    try {
      setIsLoading(true);
      await register({ email: email.trim(), password });

      // Одразу входимо новим акаунтом
      await login({ email: email.trim(), password });
      navigate("/analyze");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не вдалося зареєструватися.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <img className="brand-mark" src="/logo.jpg" alt="Startup Validator" />
          <h1 className="auth-title">Створити акаунт</h1>
          <p className="auth-sub">AI-аналіз ідей стартапів за методикою NABC</p>
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
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {passwordError && <div className="validation-message">{passwordError}</div>}
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Повторіть пароль</label>
            <input
              id="confirmPassword"
              type="password"
              className={confirmError ? "input invalid" : "input"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            {confirmError && <div className="validation-message">{confirmError}</div>}
          </div>

          {error && <div className="alert-error">{error}</div>}

          <button type="submit" className="button button-primary" disabled={isLoading}>
            {isLoading ? "Реєстрація..." : "Зареєструватися"}
          </button>
        </form>

        <p className="auth-switch">
          Вже є акаунт? <Link to="/login">Увійти</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
