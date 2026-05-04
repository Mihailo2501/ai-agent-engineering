import { createBrowserRouter } from 'react-router';
import { App } from './app';
import { GlossaryPage } from './pages/glossary';
import { HomePage } from './pages/home';
import { ModulePage } from './pages/module';
import { NotFoundPage } from './pages/not-found';

// Single source of truth for routes.
// Module slugs come from src/data/modules.ts.

export const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      { index: true, Component: HomePage },
      { path: 'glossary', Component: GlossaryPage },
      { path: 'm/:slug', Component: ModulePage },
      { path: '*', Component: NotFoundPage }
    ]
  }
]);
