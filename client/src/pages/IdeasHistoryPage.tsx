import { useEffect, useState } from "react";
import Header from "../components/Header";
import IdeaCard from "../components/IdeaCard";
import Sidebar from "../components/Sidebar";
import { getIdeas } from "../services/ideaService";
import type { IdeaSummary } from "../types/idea";

function IdeasHistoryPage() {
  const [ideas, setIdeas] = useState<IdeaSummary[]>([]);
  const [search, setSearch] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadIdeas() {
      try {
        const data = await getIdeas();
        setIdeas(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load ideas.");
      } finally {
        setIsLoading(false);
      }
    }

    loadIdeas();
  }, []);

  const filteredIdeas = ideas.filter((idea) =>
    idea.idea_text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content">
        <Header
          eyebrow="Saved analyses"
          title="Ideas history"
          description="Open your previous startup ideas and review AI-generated NABC reports."
          actionLabel="Analyze new idea"
          actionTo="/analyze"
        />

        <section className="page-section">
          <div className="toolbar">
            <input
              type="search"
              placeholder="Search ideas..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {isLoading && <p className="muted-text">Loading ideas...</p>}
          {error && <p className="error-message">{error}</p>}

          {!isLoading && !error && filteredIdeas.length === 0 && (
            <div className="empty-state">
              <h3>No ideas found</h3>
              <p>Try another search or create a new analysis.</p>
            </div>
          )}

          <div className="idea-grid">
            {filteredIdeas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default IdeasHistoryPage;