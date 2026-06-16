import { Link } from "react-router-dom";
import type { IdeaSummary } from "../types/idea";

interface IdeaCardProps {
  idea: IdeaSummary;
}

function IdeaCard({ idea }: IdeaCardProps) {
  const preview =
    idea.idea_text.length > 140
      ? `${idea.idea_text.slice(0, 140)}...`
      : idea.idea_text;

  return (
    <article className="idea-card">
      <div className="idea-card-top">
        <span>Startup idea</span>

        {idea.created_at && (
          <small>{new Date(idea.created_at).toLocaleDateString()}</small>
        )}
      </div>

      <p>{preview}</p>

      <Link to={`/ideas/${idea.id}`} className="card-link">
        Open analysis →
      </Link>
    </article>
  );
}

export default IdeaCard;