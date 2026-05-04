/// <reference types="vite/client" />

import { lazy, Suspense, useEffect, useMemo, type ComponentType } from 'react';
import { Link, useParams } from 'react-router';
import { getModuleBySlug } from '../data/modules';

interface MdxModule {
  default: ComponentType;
}

const mdxModules = import.meta.glob<MdxModule>('../content/*.mdx', { eager: false });

function loaderForSlug(slug: string) {
  const matchingPath = Object.keys(mdxModules).find(
    (path) => path.includes(`-${slug}.mdx`) || path.endsWith(`/${slug}.mdx`)
  );
  return matchingPath ? mdxModules[matchingPath] : null;
}

function ModuleLoading() {
  return (
    <div className="rounded-2xl bg-clay-bg p-8 shadow-soft">
      <p className="text-sm text-ink-700">Loading module...</p>
    </div>
  );
}

export function ModulePage() {
  const { slug } = useParams<{ slug: string }>();
  const mod = slug ? getModuleBySlug(slug) : undefined;

  const Content = useMemo(() => {
    if (!mod) return null;
    const loader = loaderForSlug(mod.slug);
    return loader ? lazy(loader) : null;
  }, [mod]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [slug]);

  if (!mod) {
    return (
      <article className="space-y-4">
        <p className="font-heading text-2xl text-ink-900">Module not found</p>
        <Link to="/" className="text-sm text-accent-coral underline">
          course hub
        </Link>
      </article>
    );
  }

  if (Content) {
    return (
      <article className="space-y-10">
        <Suspense fallback={<ModuleLoading />}>
          <Content />
        </Suspense>
      </article>
    );
  }

  return (
    <article className="space-y-8">
      <header className="rounded-2xl bg-clay-cream p-12 shadow-soft">
        <p className="mb-3 text-xs uppercase tracking-widest text-ink-700">
          Module {mod.num} · {mod.track}
        </p>
        <h1 className="mb-4 font-heading text-4xl text-ink-900">{mod.title}</h1>
        <p className="text-lg text-ink-700">{mod.lead}</p>
      </header>
      <section className="rounded-2xl bg-clay-bg p-8 shadow-soft">
        <p className="font-heading text-2xl text-ink-900">Content coming soon</p>
      </section>
    </article>
  );
}
