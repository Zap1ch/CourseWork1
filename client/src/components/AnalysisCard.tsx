interface AnalysisCardProps {
  title: string;
  text?: string;
  index?: string;
}

// Один розділ NABC: кольорова літера, назва і текст
function AnalysisCard({ title, text, index }: AnalysisCardProps) {
  const letterClass = `nabc-letter nabc-${(index || "").toLowerCase()}`;

  return (
    <section className="nabc-section">
      <h3>
        {index && <span className={letterClass}>{index}</span>}
        {title}
      </h3>
      <p>{text || "—"}</p>
    </section>
  );
}

export default AnalysisCard;
