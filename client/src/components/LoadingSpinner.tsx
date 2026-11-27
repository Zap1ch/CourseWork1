interface LoadingSpinnerProps {
  text?: string;
}

// Відповідь асистента, поки AI ще думає: три анімовані крапки
function LoadingSpinner({ text = "Аналізую ідею…" }: LoadingSpinnerProps) {
  return (
    <div className="message-ai">
      <img className="brand-mark ai-mark" src="/logo.jpg" alt="" />
      <div className="ai-body">
        <div className="ai-title">{text}</div>
        <div className="typing">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}

export default LoadingSpinner;
