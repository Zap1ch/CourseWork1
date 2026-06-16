import { Link } from "react-router-dom";

interface HeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
}

function Header({
  eyebrow,
  title,
  description,
  actionLabel,
  actionTo,
}: HeaderProps) {
  return (
    <header className="app-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>

      {actionLabel && actionTo && (
        <Link className="primary-link" to={actionTo}>
          {actionLabel}
        </Link>
      )}
    </header>
  );
}

export default Header;