import type { RunLine, Verdict } from '../lib/sandbox/types';
import KeyExplainer, { KeyExplainerKey } from '../components/key-explainer';
import Stepper from '../components/stepper';

interface LatencyInput {
  asrMs: number;
  llmTtftMs: number;
  ttsTtftMs: number;
}

type PickArchFn = (useCase: { kind: string }) => unknown;
type LatencyFn = (input: LatencyInput) => number;
type AcceptableFn = (totalMs: number) => boolean;

interface LatencyExports {
  voiceLatencyBudget: LatencyFn;
  isAcceptable: AcceptableFn;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function VoiceArchitectureDemo() {
  return (
    <section className="rounded-2xl bg-clay-bg p-6 shadow-soft">
      <p className="mb-1 font-heading text-lg text-ink-900">Demo · Voice architecture choices</p>
      <p className="mb-4 text-sm text-ink-700">
        Click a shape to see its latency profile, complexity, ideal use case, and common pitfalls.
      </p>
      <KeyExplainer
        entries={[
          {
            id: 'realtime',
            label: 'OpenAI Realtime API',
            body: 'WebSocket session: audio in, audio out, function calling preserved. Lowest latency end-to-end (single provider, integrated VAD, streaming all the way through). Wins for bespoke voice in your own product where you own the UX. Costs more per minute than the ASR-LLM-TTS pipeline; provider lock-in to OpenAI for that path.'
          },
          {
            id: 'managed',
            label: 'Managed (Vapi, Retell, Bland)',
            body: 'A platform orchestrates ASR + LLM + TTS plus phone integration, call routing, and voice infra. Wins when you want phone agents at scale with less engineering: outbound sales, inbound support, IVR replacement. Trade: less control over the loop, platform-specific config, billing varies wildly between providers.'
          },
          {
            id: 'pipeline',
            label: 'ASR + LLM + TTS pipeline (DIY)',
            body: 'You wire Whisper or Deepgram to your LLM call to ElevenLabs or OpenAI TTS yourself. Wins for one-off transcription with simple action, or for stacks where you genuinely need provider-by-provider control. Trade: latency adds up across services, you own the streaming and barge-in plumbing, every provider change is real engineering work.'
          },
          {
            id: 'text',
            label: 'Text-only (skip voice)',
            body: 'Often the right answer. Voice is wrong for dense info, multi-step decisions with visual reference, and contexts where typing is faster. Many "voice agent" demos exist because voice was novel; the production version of the same workflow is text. Default to text unless voice is actually the right interface.'
          }
        ]}
      >
        <div className="grid gap-2 md:grid-cols-2">
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="realtime">Realtime API · WebSocket audio</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="managed">Managed · Vapi / Retell / Bland</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="pipeline">ASR + LLM + TTS pipeline</KeyExplainerKey>
          </div>
          <div className="rounded-lg bg-clay-cream px-4 py-3 text-sm text-ink-900">
            <KeyExplainerKey id="text">Text-only (skip voice)</KeyExplainerKey>
          </div>
        </div>
      </KeyExplainer>
    </section>
  );
}

export function VoicePipelineStepperDemo() {
  return (
    <div className="space-y-4">
      <div>
        <p className="font-heading text-lg text-ink-900">Voice pipeline stage by stage</p>
        <p className="text-sm text-ink-700">
          Trace one user utterance through the six stages of a voice agent, with rough millisecond budgets per stage.
        </p>
      </div>
      <Stepper
        stages={[
          {
            actor: 'user',
            title: '1. User starts speaking',
            body: 'A microphone in the browser, app, or PSTN gateway captures audio. The voice activity detector (VAD) sees the speech rise above the silence threshold and starts forwarding audio frames to the ASR. Latency contribution: VAD detection roughly 50 to 150 ms.'
          },
          {
            actor: 'tool',
            title: '2. ASR transcribes streaming',
            body: (
              <>
                The ASR (Whisper, Deepgram, AssemblyAI, OpenAI Realtime ASR) returns partial transcripts every few hundred ms. The downstream pipeline can act on partials. Latency contribution: ~150 to 400 ms to first partial; faster on streaming-native ASR like Deepgram or Realtime API.
              </>
            )
          },
          {
            actor: 'model',
            title: '3. LLM receives partial transcript',
            body: 'Once the user pauses (or VAD declares end-of-utterance), the most recent partial transcript becomes the input to the LLM call. Some stacks fire the LLM call earlier on a complete-thought heuristic to save latency. Latency contribution: end-of-utterance detection, ~150 to 400 ms.'
          },
          {
            actor: 'model',
            title: '4. LLM emits partial response',
            body: (
              <>
                Streaming response begins. Time-to-first-token (TTFT) for a low-latency model is roughly 200 to 500 ms; faster on Haiku-class models, slower on Opus or with extended thinking. Tool calls may interleave; each tool call is its own roundtrip.
              </>
            )
          },
          {
            actor: 'tool',
            title: '5. TTS synthesizes streaming',
            body: (
              <>
                As tokens stream from the LLM, the TTS (ElevenLabs streaming, OpenAI TTS streaming, Cartesia) begins producing audio chunks. TTS time-to-first-audible roughly 150 to 400 ms once tokens start arriving.
              </>
            )
          },
          {
            actor: 'user',
            title: '6. User hears response',
            body: 'The audio plays through the speaker or phone line. The user can interrupt (barge-in) at any moment; the VAD detects the new speech and the pipeline cancels TTS and restarts at stage 1. Total perceived latency budget under 700 ms is the target for natural conversation; over 1 second feels slow; over 2 seconds feels broken.'
          }
        ]}
      />
    </div>
  );
}

export function testPickVoiceArch(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const fn = result as PickArchFn;
  if (typeof fn !== 'function') return { passed: false, message: 'Return pickVoiceArch.' };

  const cases = [
    { task: { kind: 'customer-service-phone-agent-at-scale' }, want: 'vapi-or-retell', why: 'Phone agents at scale belong on a managed voice platform' },
    { task: { kind: 'bespoke-streaming-voice-in-product' }, want: 'realtime-api', why: 'Bespoke streaming voice in your own UX is Realtime API territory' },
    { task: { kind: 'one-off-transcription-with-simple-action' }, want: 'asr-llm-tts-pipeline', why: 'Simple one-off jobs do not justify Realtime API or a managed platform' },
    { task: { kind: 'voice-not-needed' }, want: 'text-only', why: 'When voice is not actually needed, skip it' },
    { task: { kind: 'inbound-support-call-routing' }, want: 'vapi-or-retell', why: 'Inbound phone routing is the core managed-platform use case' }
  ];

  for (const c of cases) {
    const got = fn(c.task);
    if (got !== c.want) {
      return {
        passed: false,
        message: 'Wrong architecture for kind "' + c.task.kind + '". ' + c.why + '.',
        details: 'expected "' + c.want + '", got ' + JSON.stringify(got)
      };
    }
  }

  return {
    passed: true,
    message: 'Voice architecture routing matches the trade-offs: managed for phone-at-scale, Realtime for bespoke product, pipeline for one-off, text-only when voice is not the right interface.'
  };
}

export function testLatencyBudget(result: unknown, lines: RunLine[]): Verdict {
  void lines;
  const exports = asRecord(result) as unknown as LatencyExports | null;
  if (!exports || typeof exports.voiceLatencyBudget !== 'function' || typeof exports.isAcceptable !== 'function') {
    return {
      passed: false,
      message: 'Return an object { voiceLatencyBudget, isAcceptable } with both functions.'
    };
  }

  const total1 = exports.voiceLatencyBudget({ asrMs: 200, llmTtftMs: 250, ttsTtftMs: 200 });
  if (total1 !== 650) {
    return {
      passed: false,
      message: 'voiceLatencyBudget should return the sum of the three stages.',
      details: 'expected 650, got ' + JSON.stringify(total1)
    };
  }

  if (exports.isAcceptable(650) !== true) {
    return {
      passed: false,
      message: '650 ms total should be acceptable (under 700 ms).',
      details: 'got ' + JSON.stringify(exports.isAcceptable(650))
    };
  }

  if (exports.isAcceptable(750) !== false) {
    return {
      passed: false,
      message: '750 ms total should not be acceptable (over the 700 ms budget).',
      details: 'got ' + JSON.stringify(exports.isAcceptable(750))
    };
  }

  if (exports.isAcceptable(700) !== false) {
    return {
      passed: false,
      message: '700 ms is the cutoff; isAcceptable should be strict (must be under 700, not equal).',
      details: 'got ' + JSON.stringify(exports.isAcceptable(700))
    };
  }

  return {
    passed: true,
    message: 'Latency budget math holds: sum the stages, accept under 700 ms strictly.'
  };
}
