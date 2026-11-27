import { Link } from "react-router-dom";
import type { IdeaSummary } from "../types/idea";
import { formatDate } from "../utils/date";

interface IdeaCardProps {
  idea: IdeaSummary;
}

// Рядок у списку «Усі ідеї»: дата і текст ідеї
function IdeaCard({ idea }: IdeaCardProps) {
  return (
    <Link className="idea-row" to={`/ideas/${idea.id}`}>
      <span className="idea-date">
        {idea.created_at ? formatDate(idea.created_at) : ""}
      </span>
      <span className="idea-text">{idea.idea_text}</span>
    </Link>
  );
}

export default IdeaCard;
