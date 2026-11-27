import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="container">
      <h1 className="page-title">Сторінку не знайдено</h1>
      <p className="muted">
        Такої адреси немає. <Link to="/">Повернутися на головну</Link>
      </p>
    </div>
  );
}

export default NotFoundPage;
