import type { ReactNode } from 'react';

interface GLinkProps {
  slug: string;
  children: ReactNode;
}

export default function GLink({ slug, children }: GLinkProps) {
  return (
    <a
      href={`#glossary-${slug}`}
      className="border-b border-accent-coral text-ink-900 transition-colors hover:text-accent-coral"
    >
      {children}
    </a>
  );
}
