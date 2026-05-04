import {
  createContext,
  type KeyboardEvent,
  type ReactNode,
  useContext,
  useEffect,
  useState
} from 'react';

interface KeyExplainerEntry {
  id: string;
  label: string;
  body: ReactNode;
}

interface KeyExplainerProps {
  entries: KeyExplainerEntry[];
  children: ReactNode;
}

interface KeyExplainerKeyProps {
  id: string;
  children: ReactNode;
}

interface KeyExplainerContextValue {
  activeId: string | null;
  setActiveId: (id: string) => void;
}

const KeyExplainerContext = createContext<KeyExplainerContextValue | null>(null);

function useKeyExplainer() {
  const context = useContext(KeyExplainerContext);
  if (!context) {
    throw new Error('KeyExplainerKey must be used inside KeyExplainer.');
  }
  return context;
}

export default function KeyExplainer({ entries, children }: KeyExplainerProps) {
  const [activeId, setActiveId] = useState<string | null>(entries[0]?.id ?? null);

  useEffect(() => {
    if (entries.length === 0) {
      setActiveId(null);
      return;
    }

    setActiveId((id) =>
      id && entries.some((entry) => entry.id === id) ? id : entries[0].id
    );
  }, [entries]);

  const activeEntry = entries.find((entry) => entry.id === activeId);

  return (
    <KeyExplainerContext.Provider value={{ activeId, setActiveId }}>
      <span>{children}</span>
      {activeEntry ? (
        <aside className="mt-4 rounded-xl bg-clay-cream p-5 shadow-soft">
          <p className="mb-2 font-heading text-lg text-ink-900">
            {activeEntry.label}
          </p>
          <div className="text-sm text-ink-700">{activeEntry.body}</div>
        </aside>
      ) : null}
    </KeyExplainerContext.Provider>
  );
}

export function KeyExplainerKey({ id, children }: KeyExplainerKeyProps) {
  const { activeId, setActiveId } = useKeyExplainer();
  const isActive = activeId === id;

  function handleKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setActiveId(id);
    }
  }

  return (
    <span
      role="button"
      tabIndex={0}
      className={`cursor-pointer border-b border-dotted underline-offset-4 transition-colors ${
        isActive
          ? 'border-accent-coral text-accent-coral'
          : 'border-current/60 text-current hover:border-accent-coral hover:text-accent-coral'
      }`}
      onClick={() => setActiveId(id)}
      onFocus={() => setActiveId(id)}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setActiveId(id)}
    >
      {children}
    </span>
  );
}
