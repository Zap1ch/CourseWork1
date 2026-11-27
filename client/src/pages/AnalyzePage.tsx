import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { analyzeIdea } from "../services/ideaService";
import { getIdeaError } from "../utils/validation";

function AnalyzePage() {
  const navigate = useNavigate();

  const [ideaText, setIdeaText] = useState("");
  // Текст, який зараз аналізується (показується як повідомлення)
  const [pendingText, setPendingText] = useState("");

  const [ideaError, setIdeaError] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const message = getIdeaError(ideaText);
    setIdeaError(message);

    if (message) {
      return;
    }

    const text = ideaText.trim();
    setPendingText(text);

    try {
      const data = await analyzeIdea({ idea_text: text });

      // Відкрити збережений аналіз, бічна панель оновиться сама
      navigate(`/ideas/${data.id}`);
    } catch (err) {
      setPendingText("");
      setError(err instanceof Error ? err.message : "Не вдалося проаналізувати ідею.");
    }
  }

  if (pendingText) {
    return (
      <div className="container">
        <div className="message-user">
          <div className="bubble">{pendingText}</div>
        </div>

        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container empty-state">
      <h1 className="greeting">Яку ідею перевіримо?</h1>
      <p className="greeting-sub">
        Опишіть, для кого продукт, яку проблему він вирішує і як заробляє.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="composer">
          <textarea
            placeholder="Наприклад: мобільний застосунок, який допомагає студентам…"
            value={ideaText}
            onChange={(event) => setIdeaText(event.target.value)}
          />
          <button type="submit" className="send-button" title="Аналізувати">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" />
            </svg>
          </button>
        </div>

        {ideaError && <div className="validation-message">{ideaError}</div>}
      </form>

      {error && <div className="alert-error">{error}</div>}

      <p className="composer-hint">
        AI оцінює ідею за методикою NABC: потреба, підхід, вигоди, конкуренція.
      </p>
    </div>
  );
}

export default AnalyzePage;
