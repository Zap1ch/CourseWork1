import { Link } from "react-router-dom";

interface HeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
}

// Заголовок сторінки
function Header({ title, description, actionLabel, actionTo }: HeaderProps) {
  return (
    <>
      <h1 className="page-title">{title}</h1>

      {description && <p className="muted">{description}</p>}

      {actionLabel && actionTo && (
        <Link className="button" to={actionTo}>
          {actionLabel}
        </Link>
      )}
    </>
  );
}

export default Header;
