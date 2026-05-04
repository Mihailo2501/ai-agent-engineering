import { Link } from 'react-router';
import { reset as resetProgress } from '../lib/progress';

export default function Footer() {
  return (
    <footer className="py-12 text-center text-sm text-ink-500">
      <p>
        <Link to="/" className="hover:text-accent-coral">Home</Link>{' '}
        <span aria-hidden="true">|</span>{' '}
        <Link to="/glossary" className="hover:text-accent-coral">Glossary</Link>{' '}
        <span aria-hidden="true">|</span>{' '}
        <a
          href="https://github.com/Mihailo2501/ai-agent-engineering"
          className="hover:text-accent-coral"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>{' '}
        <span aria-hidden="true">|</span>{' '}
        <button
          type="button"
          onClick={resetProgress}
          className="cursor-pointer underline-offset-4 hover:text-accent-coral hover:underline"
        >
          Reset progress
        </button>{' '}
        <span aria-hidden="true">|</span> MIT License <span aria-hidden="true">|</span> Clone and run locally
      </p>
    </footer>
  );
}
