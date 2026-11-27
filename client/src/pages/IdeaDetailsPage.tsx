import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnalysisCard from "../components/AnalysisCard";
import { getIdeaById } from "../services/ideaService";
import type { Idea } from "../types/idea";
import { formatDate } from "../utils/date";

function IdeaDetailsPage() {
  const { id } = useParams();

  const [idea, setIdea] = useState<Idea | null>(null);
  const [error, setError] = useState("");

  // Завантажується знову при кожній зміні id в адресі
  useEffect(() => {
    async function loadIdea() {
      setIdea(null);
      setError("");

      try {
        const data = await getIdeaById(id || "");
        setIdea(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Не вдалося завантажити ідею.";
        setError(message === "Not found" ? "Ідею не знайдено." : message);
      }
    }

    loadIdea();
  }, [id]);

  if (error) {
    return (
      <div className="container">
        <div className="alert-error">{error}</div>
        <div className="chat-footer">
          <Link className="button" to="/analyze">
            Нова ідея
          </Link>
        </div>
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="container">
        <p className="muted">Завантаження…</p>
      </div>
    );
  }

  return (
    <div className="container">
      {idea.created_at && <div className="meta">{formatDate(idea.created_at, ", ")}</div>}

      <div className="message-user">
        <div className="bubble">{idea.idea_text}</div>
      </div>

      <div className="message-ai">
        <img className="brand-mark ai-mark" src="/logo.jpg" alt="" />
        <div className="ai-body">
          <div className="ai-title">Аналіз за методикою NABC</div>

          <div className="nabc">
            <AnalysisCard index="N" title="Need — потреба" text={idea.need} />
            <AnalysisCard index="A" title="Approach — підхід" text={idea.approach} />
            <AnalysisCard index="B" title="Benefit — вигоди на витрати" text={idea.benefit} />
            <AnalysisCard index="C" title="Competition — конкуренція" text={idea.competition} />
          </div>
        </div>
      </div>

      <div className="chat-footer">
        <Link className="button" to="/analyze">
          + Нова ідея
        </Link>
      </div>
    </div>
  );
}

export default IdeaDetailsPage;
