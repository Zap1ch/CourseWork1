import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <main className="not-found-page">
      <section>
        <p className="eyebrow">404</p>

        <h1>Page not found</h1>

        <p>The page you are looking for does not exist.</p>

        <Link className="primary-link" to="/dashboard">
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}

export default NotFoundPage;