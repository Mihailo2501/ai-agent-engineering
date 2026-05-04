import type { RunLine, Verdict } from '../lib/sandbox/types';
import KeyExplainer, { KeyExplainerKey } from '../components/key-explainer';

type PickModalityFn = (task: { kind: string }) => unknown;

export const FORTY_TWO_PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAGAAAAAwCAAAAADLfSATAAAB8klEQVR42u3WP2gTYRjH8e9dQ4KxLpL0jyghQwkVqjgUlwy2S82gCA4O2kUcWjIIRQsdHUQFS4fq1KGLtJR2EiEi6mCwVHCpFKEOomAIAU2K0ESbtI+DevdWc+WSN9fpnul+3J/Pe9z7vPcagrcVaODaT3OZXD4YPZW6HGrgLtmjVto4aIXqhPH3nthzcV17AZs92MB2ShlVKNMSYBQFuA103/9QLmYGgEihBcBTFCAfhMQXERHZGQHS+kDxiArcBWP5z/FWAsLftYFLcMAGzkDSOjUJPHEJmE6za36BzjE7rsKgFU4Day5nqROQS8NMxIqlEvRa6TBQ1APkaolr5+y8AUSt9A04pNfJD58Rn1JyfNeK8hKIa3XyehgzKzKl9IFSG51g5HU+cm24zM2k05BqwwW42KXzBrfgxE9xeIPSWaB9XafR3gYIrooD8DoOmIs6a1GlF+5JfaAy3gaEl7RW0+uQ3K4PLCcAjr8THeCFQftHqQds3TABc6wsOkDtGMxIPeBzP0DfiogWUPl/osV+98ZRIHSnKh4BX2PAyTURr4ALwPlN0QfUmrW/QRYYqjb+fOf/wT81DR2PAk3si1wC5ccwEcE74NUPzCt4CLyBnaih1oPWAu+b3pu6BHJNA4bXu2sTH/ABH/ABH/CBfQB+AbT1iTQEe8/oAAAAAElFTkSuQmCC';

const cellClass =
  'rounded-lg bg-clay-cream px-3 py-3 text-center text-sm text-ink-900 transition-colors hover:bg-clay-peach';
const rareCellClass =
  'rounded-lg bg-white/40 px-3 py-3 text-center text-sm italic text-ink-500 transition-colors hover:bg-clay-peach';
const headerClass = 'text-center text-xs uppercase tracking-widest text-ink-700';
const rowHeaderClass = 'self-center text-xs uppercase tracking-widest text-ink-700';

export function ModalityMatrix() {
  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-1 font-heading text-lg text-ink-900">Demo · Modality matrix</p>
      <p className="mb-4 text-sm text-ink-700">
        Click a cell. Each combination has its own production tooling, cost band, and use case. Cells in italic are real but rare in 2026; do not plan an architecture around them yet.
      </p>
      <KeyExplainer
        entries={[
          {
            id: 'text-text',
            label: 'text-in, text-out',
            body: 'Chat and completion. Every frontier model: Claude Opus 4.7, Sonnet 4.6, Haiku 4.5; OpenAI GPT-x; Gemini; everything else. The default mode and the cheapest cost band per token. Use case: every conversational and structured-output workflow in this course.'
          },
          {
            id: 'text-image',
            label: 'text-in, image-out',
            body: 'Image generation. OpenAI gpt-image-2, Black Forest Labs Flux, Stable Diffusion XL successors, Google nano-banana. Cost is per-image and varies wildly by quality. Use case: marketing assets, UI mockups, illustration, the design pass that becomes input to image-to-code.'
          },
          {
            id: 'text-audio',
            label: 'text-in, audio-out',
            body: 'Text-to-speech. ElevenLabs and OpenAI TTS are the production defaults; many smaller open-source options exist. Cost is per-character. Use case: voicebot output, narration, accessibility. Module 14 covers production voice agents end to end.'
          },
          {
            id: 'image-text',
            label: 'image-in, text-out',
            body: 'Vision. The most common multimodal pattern in production. All frontier chat models accept image content blocks. Use case: extract data from a screenshot, read a chart, navigate a page (think Stagehand and browser agents), photo-based product search.'
          },
          {
            id: 'image-image',
            label: 'image-in, image-out',
            body: 'Edit and inpaint. gpt-image-2, Flux variants. Take an image plus a prompt, produce a modified image. Cost similar to image generation. Use case: targeted edits, style transfers, "change the background to a meeting room."'
          },
          {
            id: 'image-audio',
            label: 'image-in, audio-out',
            body: 'Rare in production. Some research demos exist (image-to-narration), but there is no canonical API for this yet. Treat the cell as not yet a pattern.'
          },
          {
            id: 'audio-text',
            label: 'audio-in, text-out',
            body: 'Automatic speech recognition. OpenAI Whisper is the default; Anthropic and Google have their own ASR endpoints. Cost is per-minute or per-second of audio. Use case: meeting transcription, voicemail summarization, the input side of any voice agent.'
          },
          {
            id: 'audio-image',
            label: 'audio-in, image-out',
            body: 'Effectively absent in production. You cascade through text instead: ASR, then text-to-image. Treat the cell as not a real pattern.'
          },
          {
            id: 'audio-audio',
            label: 'audio-in, audio-out',
            body: 'Voice agents. OpenAI Realtime API, Vapi, Retell. Two-way streaming audio with the model in the middle. Cost is per-minute and considerably higher than text-only. Use case: phone agents, real-time meeting copilots, accessibility tools. Module 14 deep dive.'
          }
        ]}
      >
        <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-2">
          <div></div>
          <div className={headerClass}>text-out</div>
          <div className={headerClass}>image-out</div>
          <div className={headerClass}>audio-out</div>

          <div className={rowHeaderClass}>text-in</div>
          <div className={cellClass}>
            <KeyExplainerKey id="text-text">chat</KeyExplainerKey>
          </div>
          <div className={cellClass}>
            <KeyExplainerKey id="text-image">image gen</KeyExplainerKey>
          </div>
          <div className={cellClass}>
            <KeyExplainerKey id="text-audio">TTS</KeyExplainerKey>
          </div>

          <div className={rowHeaderClass}>image-in</div>
          <div className={cellClass}>
            <KeyExplainerKey id="image-text">vision</KeyExplainerKey>
          </div>
          <div className={cellClass}>
            <KeyExplainerKey id="image-image">edit / inpaint</KeyExplainerKey>
          </div>
          <div className={rareCellClass}>
            <KeyExplainerKey id="image-audio">rare</KeyExplainerKey>
          </div>

          <div className={rowHeaderClass}>audio-in</div>
          <div className={cellClass}>
            <KeyExplainerKey id="audio-text">ASR</KeyExplainerKey>
          </div>
          <div className={rareCellClass}>
            <KeyExplainerKey id="audio-image">rare</KeyExplainerKey>
          </div>
          <div className={cellClass}>
            <KeyExplainerKey id="audio-audio">voice</KeyExplainerKey>
          </div>
        </div>
      </KeyExplainer>
    </section>
  );
}

export function ReasoningSplit() {
  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-1 font-heading text-lg text-ink-900">Demo · Reasoning vs vanilla, side by side</p>
      <p className="mb-4 text-sm text-ink-700">
        Same prompt, two models. Reasoning emits a hidden thinking block before the visible answer; both billing and latency count those tokens. Vanilla answers directly with no hidden block.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-white/70 p-5">
          <p className="mb-3 font-heading text-base text-ink-900">Vanilla generation</p>
          <div className="space-y-2 text-sm">
            <div className="rounded-lg bg-clay-cream p-3">
              <p className="text-xs uppercase tracking-widest text-ink-700">user</p>
              <p className="mt-1 text-ink-900">"What is 27 * 41 + 3, then mod 7?"</p>
            </div>
            <div className="rounded-lg bg-clay-mint p-3">
              <p className="text-xs uppercase tracking-widest text-ink-700">assistant</p>
              <p className="mt-1 text-ink-900">"27 * 41 = 1107. Plus 3 is 1110. 1110 mod 7 is 4."</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-ink-500">~140 output tokens, single text block, ~1s wall time.</p>
        </div>
        <div className="rounded-xl bg-white/70 p-5">
          <p className="mb-3 font-heading text-base text-ink-900">Extended thinking</p>
          <div className="space-y-2 text-sm">
            <div className="rounded-lg bg-clay-cream p-3">
              <p className="text-xs uppercase tracking-widest text-ink-700">user</p>
              <p className="mt-1 text-ink-900">"What is 27 * 41 + 3, then mod 7?"</p>
            </div>
            <div className="rounded-lg border border-dashed border-ink-500/30 bg-white/40 p-3 italic text-ink-500">
              <p className="text-xs uppercase tracking-widest not-italic text-ink-700">thinking (hidden block)</p>
              <p className="mt-1">
                "Break 27 * 41 into 27 * 40 + 27 = 1080 + 27 = 1107. Add 3: 1110. Now 1110 / 7. 7 * 158 = 1106; 1110 minus 1106 is 4. Double-check: 1110 / 7 ≈ 158.57; 0.57 * 7 ≈ 4. Confirmed remainder 4."
              </p>
            </div>
            <div className="rounded-lg bg-clay-mint p-3">
              <p className="text-xs uppercase tracking-widest text-ink-700">assistant</p>
              <p className="mt-1 text-ink-900">"4."</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-ink-500">
            ~640 output tokens (~500 of them in the hidden thinking block), ~5s wall time. Harness chooses whether to surface the thinking trace.
          </p>
        </div>
      </div>
      <p className="mt-4 text-xs text-ink-500">
        Both answers are correct on this prompt; the visible difference is structural. The reasoning model logs its work in a billable but hidden channel. On harder prompts (multi-constraint planning, debugging, hard math) the thinking block raises accuracy enough to justify the markup. On easy prompts it is wasted budget.
      </p>
    </section>
  );
}

export function testPickModality(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as PickModalityFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return pickModality.' };

  const cases = [
    {
      task: { kind: 'extract-from-pdf' },
      want: 'doc-in-text-out',
      why: 'Document understanding APIs preserve layout; raw vision loses paragraph and table structure'
    },
    {
      task: { kind: 'extract-from-screenshot' },
      want: 'vision-in-text-out',
      why: 'Screenshots are flat images; vision models read them directly'
    },
    {
      task: { kind: 'generate-ui-mockup' },
      want: 'text-in-image-out',
      why: 'A description of a UI is text; the desired output is an image'
    },
    {
      task: { kind: 'transcribe-meeting' },
      want: 'audio-in-text-out',
      why: 'Audio recording in, transcript out, ASR territory'
    },
    {
      task: { kind: 'phone-agent' },
      want: 'audio-in-audio-out',
      why: 'Live phone call needs streaming audio in and audio out'
    },
    {
      task: { kind: 'summarize-news-article' },
      want: 'text-in-text-out',
      why: 'Article text in, summary text out, no other modality involved'
    }
  ];

  for (const c of cases) {
    const got = fn(c.task);
    if (got !== c.want) {
      return {
        passed: false,
        message: 'Wrong modality for kind "' + c.task.kind + '". ' + c.why + '.',
        details: 'expected "' + c.want + '", got ' + JSON.stringify(got)
      };
    }
  }

  const fallback = fn({ kind: 'something-else' });
  if (fallback !== 'text-in-text-out') {
    return {
      passed: false,
      message: 'Unknown kind should fall back to "text-in-text-out", the safe default.',
      details: 'got ' + JSON.stringify(fallback)
    };
  }

  return {
    passed: true,
    message: 'You picked the right input and output for each task. Most production multimodal is one of these six combos.'
  };
}

export function testVisionExtract(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  if (typeof result !== 'string') {
    return {
      passed: false,
      message: 'Return the assistant text as a string.',
      details: 'got ' + JSON.stringify(result)
    };
  }
  if (!result.includes('42')) {
    return {
      passed: false,
      message:
        'The model should recognize "42" in the image. Make sure the image content block comes before the text question and that you returned the first text block from response.content.',
      details: 'got: ' + JSON.stringify(result)
    };
  }
  return {
    passed: true,
    message: 'Vision-in worked. The model read "42" from the base64 image and returned it.'
  };
}
