import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">404</h1>
      <p className="text-neutral-600">No route matches that path.</p>
      <Link to="/" className="underline">course hub</Link>
    </div>
  );
}
