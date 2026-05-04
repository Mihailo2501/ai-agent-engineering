import type { RunLine, Verdict } from '../lib/sandbox/types';
import KeyExplainer, { KeyExplainerKey } from '../components/key-explainer';
import Stepper from '../components/stepper';

type PickMemoryFn = (useCase: { kind: string }) => unknown;
type ChunkFn = (text: string, opts: { maxChars: number; overlapChars: number }) => string[];

export function MemoryBucketsDemo() {
  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-1 font-heading text-lg text-ink-900">Demo · Three memory buckets</p>
      <p className="mb-4 text-sm text-ink-700">
        Click a bucket to see storage, retrieval, lifetime, and the most common pitfall.
      </p>
      <KeyExplainer
        entries={[
          {
            id: 'working',
            label: 'Working memory',
            body: 'Storage: the messages array of one session. Retrieval: full attention; the model sees it on every turn. Lifetime: until the session ends or compaction runs. Pitfall: long tool results inflating context faster than you notice. Solution: structured tool outputs (Module 10), summarization, subagents.'
          },
          {
            id: 'episodic',
            label: 'Episodic memory',
            body: 'Storage: a database keyed by user with timestamped session records. Retrieval: by user_id plus time range, optionally with similarity over the session summaries. Lifetime: long-term. Pitfall: dumping every past message as raw text into the prompt. Solution: summary-per-session, retrieve summaries first, fetch full transcripts only when needed.'
          },
          {
            id: 'semantic',
            label: 'Semantic memory',
            body: 'Storage: documents chunked, embedded, indexed in a vector store. Retrieval: top-K similarity per query, optionally hybrid with keyword search and reranking. Lifetime: long-term, separate from any one user. Pitfall: chunk size too big (poor retrieval) or too small (loses context). Solution: ~500-1000 char chunks with ~100 char overlap as a starting point.'
          },
          {
            id: 'summary',
            label: 'Summary',
            body: 'Storage: a single text blob produced by a model from a longer source. Retrieval: included in the prompt as fixed context. Lifetime: as long as the source is current. Pitfall: stale summaries that disagree with the source. Solution: regenerate summaries when the source changes; cite the source for grounding.'
          }
        ]}
      >
        <div className="grid gap-2 md:grid-cols-2">
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="working">Working · current conversation</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="episodic">Episodic · past sessions, per user</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="semantic">Semantic · knowledge base</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="summary">Summary · compressed source</KeyExplainerKey>
          </div>
        </div>
      </KeyExplainer>
    </section>
  );
}

export function RagPipelineDemo() {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-heading text-lg text-ink-900">RAG pipeline walkthrough</p>
        <p className="text-sm text-ink-700">
          Trace a query through the seven stages of a typical retrieval-augmented generation pipeline.
        </p>
      </div>
      <Stepper
        stages={[
          {
            actor: 'team',
            title: '1. Source documents',
            body: 'Start with the corpus: product docs, support tickets, knowledge base articles, customer transcripts. The set you want the agent to be able to answer from.'
          },
          {
            actor: 'team',
            title: '2. Chunking',
            body: (
              <>
                Split each document into chunks of roughly 500 to 1000 characters with 50 to 200 character overlap. Overlap matters: a fact that lands at a chunk boundary should still be retrievable from at least one chunk.
              </>
            )
          },
          {
            actor: 'team',
            title: '3. Embedding',
            body: (
              <>
                Pass each chunk through an embedding model (Voyage, Cohere, OpenAI text-embedding-3) to produce a vector. Cache aggressively: re-embedding the same chunk wastes money.
              </>
            )
          },
          {
            actor: 'team',
            title: '4. Index in a vector store',
            body: (
              <>
                Pinecone, Weaviate, Qdrant, Chroma, pgvector. Pick by your operational comfort. Chroma for prototypes; pgvector for "we already have Postgres"; Pinecone for hosted production with minimal ops.
              </>
            )
          },
          {
            actor: 'user',
            title: '5. Query embedding',
            body: 'A user query arrives. Embed it with the same model used for chunks. Now you have a vector to compare against the index.'
          },
          {
            actor: 'tool',
            title: '6. Top-K retrieval',
            body: (
              <>
                Cosine similarity between the query vector and indexed chunks. Pull the top K (often 5 to 20). Optionally hybrid with keyword search to catch rare terms vectors might miss.
              </>
            )
          },
          {
            actor: 'tool',
            title: '7. Reranking + injection',
            body: (
              <>
                Optionally pass the top K through a reranker (Cohere Rerank, Voyage Rerank) for finer precision. Inject the surviving chunks into the prompt above the user message. Model answers with citations.
              </>
            )
          }
        ]}
      />
    </div>
  );
}

export function testPickMemory(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as PickMemoryFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return pickMemoryShape.' };

  const cases = [
    { task: { kind: 'continue-this-turns-reasoning' }, want: 'working', why: 'Current-turn reasoning lives in the messages array' },
    { task: { kind: 'remember-user-preferences-across-sessions' }, want: 'episodic', why: 'Per-user persistence across sessions is episodic' },
    { task: { kind: 'answer-from-large-knowledge-base' }, want: 'semantic', why: 'Big corpus retrieval is semantic memory + RAG' },
    { task: { kind: 'compress-long-doc-into-paragraph' }, want: 'summary', why: 'Compress-once-and-inject is summarization' },
    { task: { kind: 'recall-past-meetings-with-user' }, want: 'episodic', why: 'Past sessions per user are episodic' },
    { task: { kind: 'lookup-product-docs-on-the-fly' }, want: 'semantic', why: 'On-demand corpus lookup is semantic' }
  ];

  for (const c of cases) {
    const got = fn(c.task);
    if (got !== c.want) {
      return {
        passed: false,
        message: 'Wrong memory shape for kind "' + c.task.kind + '". ' + c.why + '.',
        details: 'expected "' + c.want + '", got ' + JSON.stringify(got)
      };
    }
  }

  const fallback = fn({ kind: 'unspecified' });
  if (fallback !== 'working') {
    return {
      passed: false,
      message: 'Unknown kind should fall back to "working", the cheapest memory bucket and the safe default.',
      details: 'got ' + JSON.stringify(fallback)
    };
  }

  return {
    passed: true,
    message: 'Memory routing matches the three-bucket model: working for now, episodic for past sessions, semantic for knowledge bases, summary for compressed inputs.'
  };
}

export function testChunkDocument(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as ChunkFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return chunkText.' };

  // Empty
  const empty = fn('', { maxChars: 100, overlapChars: 10 });
  if (!Array.isArray(empty) || empty.length !== 0) {
    return {
      passed: false,
      message: 'Empty input must return [].',
      details: 'got ' + JSON.stringify(empty)
    };
  }

  // Short
  const shortIn = 'hello world';
  const short = fn(shortIn, { maxChars: 100, overlapChars: 10 });
  if (!Array.isArray(short) || short.length !== 1 || short[0] !== shortIn) {
    return {
      passed: false,
      message: 'Short text fitting in one chunk should return [text].',
      details: 'got ' + JSON.stringify(short)
    };
  }

  // Long with overlap
  const longText = 'a'.repeat(250);
  const chunks = fn(longText, { maxChars: 100, overlapChars: 20 });
  if (!Array.isArray(chunks) || chunks.length < 2) {
    return {
      passed: false,
      message: '250 chars at maxChars=100 should produce more than one chunk.',
      details: 'got ' + JSON.stringify(chunks)
    };
  }
  for (const chunk of chunks) {
    if (typeof chunk !== 'string' || chunk.length > 100) {
      return {
        passed: false,
        message: 'No chunk may exceed maxChars in length.',
        details: 'chunk lengths: ' + chunks.map((c) => c.length).join(', ')
      };
    }
  }
  // Concatenated unique content (removing overlap) should equal full text
  let reassembled = chunks[0];
  for (let i = 1; i < chunks.length; i++) {
    const prev = chunks[i - 1];
    const cur = chunks[i];
    // The overlap is the last overlapChars of prev which should equal the first overlapChars of cur
    const overlapPrev = prev.slice(prev.length - 20);
    const overlapCur = cur.slice(0, 20);
    if (overlapPrev !== overlapCur) {
      return {
        passed: false,
        message: 'Adjacent chunks should overlap by overlapChars characters at the boundary.',
        details: 'chunk ' + (i - 1) + ' tail: "' + overlapPrev + '", chunk ' + i + ' head: "' + overlapCur + '"'
      };
    }
    reassembled += cur.slice(20);
  }
  if (reassembled !== longText) {
    return {
      passed: false,
      message: 'Chunks should losslessly cover the input when overlap is removed.',
      details: 'reassembled length ' + reassembled.length + ', expected ' + longText.length
    };
  }

  return {
    passed: true,
    message: 'Chunking is correct: respects maxChars, maintains overlap, covers the whole input.'
  };
}
