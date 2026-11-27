import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import IdeaCard from "../components/IdeaCard";
import { getIdeas } from "../services/ideaService";
import type { IdeaSummary } from "../types/idea";

function IdeasHistoryPage() {
  const [ideas, setIdeas] = useState<IdeaSummary[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadIdeas() {
      try {
        const data = await getIdeas();
        setIdeas(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не вдалося завантажити ідеї.");
      }
    }

    loadIdeas();
  }, []);

  return (
    <div className="container">
      <Header title="Усі ідеї" />

      {error && <div className="alert-error">{error}</div>}

      {!error && ideas === null && <p className="muted">Завантаження…</p>}

      {!error && ideas !== null && ideas.length === 0 && (
        <p className="muted">
          Ідей ще немає. <Link to="/analyze">Проаналізувати першу</Link>
        </p>
      )}

      {!error && ideas !== null && ideas.length > 0 && (
        <div className="idea-list">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  );
}

export default IdeasHistoryPage;
