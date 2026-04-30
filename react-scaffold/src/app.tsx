import { Outlet } from 'react-router';
import Footer from './components/footer';
import ProgressStrip from './components/progress-strip';

export function App() {
  return (
    <div className="min-h-screen bg-clay-bg text-ink-900">
      <ProgressStrip />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
