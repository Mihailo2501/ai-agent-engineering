import { Outlet } from 'react-router';

// Root layout. The progress strip, footer, and badge toast container
// will live here once the design system is locked. For now this is
// a minimal shell so routes resolve and the app boots.

export function App() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 px-6 py-3 text-sm font-mono">
        AI Agent Engineering · scaffold (design pending)
      </header>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <Outlet />
      </main>
      <footer className="border-t border-neutral-200 px-6 py-4 text-xs text-neutral-500">
        MIT · Clone and run locally · 25 modules across 5 tracks
      </footer>
    </div>
  );
}
