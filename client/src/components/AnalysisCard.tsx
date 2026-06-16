interface AnalysisCardProps {
  title: string;
  text?: string;
  index?: string;
}

function AnalysisCard({ title, text, index }: AnalysisCardProps) {
  return (
    <article className="analysis-card">
      <div className="analysis-card-header">
        {index && <span>{index}</span>}
        <h3>{title}</h3>
      </div>

      <p>{text || "No data yet."}</p>
    </article>
  );
}

export default AnalysisCard;