interface TocItem {
  href: string;
  label: string;
}

interface TocProps {
  items: TocItem[];
}

export default function Toc({ items }: TocProps) {
  return (
    <nav className="rounded-xl bg-clay-bg p-6 shadow-soft" aria-label="Module sections">
      <h2 className="mb-4 text-sm font-bold text-ink-900">In this module</h2>
      <ol className="list-decimal space-y-2 pl-5">
        {items.map((item) => (
          <li key={item.href} className="text-sm text-ink-700">
            <a
              href={item.href}
              className="transition-colors hover:text-accent-coral"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
