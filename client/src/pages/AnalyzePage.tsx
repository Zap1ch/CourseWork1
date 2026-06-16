import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import AnalysisCard from "../components/AnalysisCard";
import Header from "../components/Header";
import LoadingSpinner from "../components/LoadingSpinner";
import Sidebar from "../components/Sidebar";
import { analyzeIdea } from "../services/ideaService";
import type { AnalyzeIdeaResponse } from "../types/idea";

function AnalyzePage() {
  const [ideaText, setIdeaText] = useState("");
  const [result, setResult] = useState<AnalyzeIdeaResponse | null>(null);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!ideaText.trim()) {
      setError("Please describe your startup idea first.");
      return;
    }

    try {
      setIsLoading(true);

      const data = await analyzeIdea({
        idea_text: ideaText.trim(),
      });

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze idea.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content">
        <Header
          eyebrow="New AI analysis"
          title="Describe your startup idea"
          description="The assistant will analyze your idea using NABC: Need, Approach, Benefit and Competition."
        />

        <div className="analysis-layout">
          <section className="input-panel">
            <form onSubmit={handleSubmit}>
              <label htmlFor="ideaText">Startup idea</label>

              <textarea
                id="ideaText"
                className="idea-textarea"
                rows={11}
                placeholder="Example: An AI assistant that helps small farmers detect crop diseases earlier using photos and weather data..."
                value={ideaText}
                onChange={(event) => setIdeaText(event.target.value)}
              />

              {error && <p className="error-message">{error}</p>}

              <button type="submit" disabled={isLoading}>
                {isLoading ? "Analyzing..." : "Analyze with AI"}
              </button>
            </form>
          </section>

          <section className="result-panel">
            <div className="section-header">
              <div>
                <p className="eyebrow">AI output</p>
                <h2>Analysis result</h2>
              </div>

              {result?.id && (
                <Link className="secondary-link" to={`/ideas/${result.id}`}>
                  Open saved report
                </Link>
              )}
            </div>

            {isLoading && <LoadingSpinner />}

            {!isLoading && !result && (
              <div className="empty-state">
                <h3>No result yet</h3>
                <p>
                  Enter your startup idea and AI will generate a structured NABC
                  analysis.
                </p>
              </div>
            )}

            {!isLoading && result && (
              <div className="result-grid">
                <AnalysisCard index="N" title="Need" text={result.need} />

                <AnalysisCard
                  index="A"
                  title="Approach"
                  text={result.approach}
                />

                <AnalysisCard
                  index="B"
                  title="Benefit"
                  text={result.benefit}
                />

                <AnalysisCard
                  index="C"
                  title="Competition"
                  text={result.competition}
                />
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default AnalyzePage;