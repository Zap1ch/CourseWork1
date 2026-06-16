import { useEffect, useState } from "react";
import AnalysisCard from "../components/AnalysisCard";
import Header from "../components/Header";
import IdeaCard from "../components/IdeaCard";
import Sidebar from "../components/Sidebar";
import { getIdeas } from "../services/ideaService";
import type { IdeaSummary } from "../types/idea";

function DashboardPage() {
  const [ideas, setIdeas] = useState<IdeaSummary[]>([]);
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

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content">
        <Header
          eyebrow="AI-powered startup validation"
          title="Build and validate better startup ideas"
          description="Use AI and the NABC framework to analyze need, approach, benefits and competition."
          actionLabel="Analyze new idea"
          actionTo="/analyze"
        />

        <section className="hero-card">
          <div className="hero-content">
            <p className="eyebrow">Full-stack AI project</p>
            <h2>Your startup validation assistant is ready to analyze ideas.</h2>
            <p>
              This dashboard connects React, TypeScript, Express, MySQL, Gemini
              and a custom RAG knowledge base into one product.
            </p>
          </div>

          <div className="hero-panel">
            <span>Saved ideas</span>
            <strong>{ideas.length}</strong>
            <small>from your personal account</small>
          </div>
        </section>

        <section className="cards-grid">
          <AnalysisCard
            index="N"
            title="Need"
            text="Find the real customer pain, urgency and market opportunity."
          />

          <AnalysisCard
            index="A"
            title="Approach"
            text="Evaluate the technical solution, business model and scalability."
          />

          <AnalysisCard
            index="B"
            title="Benefit"
            text="Compare value against costs, time, effort and risk."
          />

          <AnalysisCard
            index="C"
            title="Competition"
            text="Check direct competitors, alternatives and the status quo."
          />
        </section>

        <section className="page-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Recent work</p>
              <h2>Latest ideas</h2>
            </div>
          </div>

          {isLoading && <p className="muted-text">Loading ideas...</p>}
          {error && <p className="error-message">{error}</p>}

          {!isLoading && !error && ideas.length === 0 && (
            <div className="empty-state">
              <h3>No ideas yet</h3>
              <p>Create your first startup idea analysis.</p>
            </div>
          )}

          <div className="idea-grid">
            {ideas.slice(0, 3).map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;