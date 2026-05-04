interface CodeBlockProps {
  children: string;
  lang?: string;
}

export default function CodeBlock({ children, lang }: CodeBlockProps) {
  return (
    <pre className="relative overflow-x-auto rounded-xl bg-[#1A2530] p-6 font-mono text-sm text-white">
      {lang ? (
        <span className="absolute right-3 top-2 text-xs text-ink-500">{lang}</span>
      ) : null}
      <code className="block pr-12">{children}</code>
    </pre>
  );
}
