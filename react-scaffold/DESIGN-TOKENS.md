## 1. Color palette

| Token name | Hex | Use |
|---|---:|---|
| `clay-peach` | `#FDF1EF` | Track 5 Applied band, peach badges, soft warm panels |
| `clay-mint` | `#F2F7ED` | Track 1 Foundations band, complete states, soft green panels |
| `clay-lavender` | `#F7F1FA` | Track 2 Interfaces band, purple badges, coming-soon panels |
| `clay-sky` | `#EFF8FC` | Track 3 Building band, blue utility panels |
| `clay-cream` | `#FDF3E2` | Track 4 Production band, warm card highlights |
| `clay-bg` | `#FBEEDD` | Warm off-white page background |
| `ink-900` | `#20303C` | Deep blue-black headings, body, primary icons |
| `ink-700` | `#58636B` | Secondary copy, labels, progress text |
| `ink-500` | `#8B9092` | Muted metadata, unavailable states |
| `accent-coral` | `#F78E6B` | CTA buttons, progress fill, active states |
| `state-success` | `#7FAE74` | Completion checkmarks, success badges |

```css
--color-clay-peach: #FDF1EF;
--color-clay-mint: #F2F7ED;
--color-clay-lavender: #F7F1FA;
--color-clay-sky: #EFF8FC;
--color-clay-cream: #FDF3E2;
--color-clay-bg: #FBEEDD;
--color-ink-900: #20303C;
--color-ink-700: #58636B;
--color-ink-500: #8B9092;
--color-accent-coral: #F78E6B;
--color-state-success: #7FAE74;
```

## 2. Typography

- Heading family: `Nunito Sans`, weights `700`, `800`, `900`.
- Body family: `Inter`, weights `400`, `500`.
- Font lock: `Nunito Sans` for headings; it matches the rounded mockup letterforms better than `Geist Sans` or `Inter Display`.

| Token | Size | Line-height | Use |
|---|---:|---:|---|
| `xs` | `0.75rem` | `1rem` | Status pills, small labels |
| `sm` | `0.875rem` | `1.25rem` | Module metadata, footer, compact controls |
| `base` | `1rem` | `1.625rem` | Body copy, card descriptions |
| `lg` | `1.125rem` | `1.75rem` | Lead copy, large labels |
| `xl` | `1.25rem` | `1.875rem` | Card titles, stat labels |
| `2xl` | `1.5rem` | `2rem` | Track titles, stat numbers |
| `3xl` | `1.875rem` | `2.25rem` | Section h2, mobile hero |
| `4xl` | `2.5rem` | `3rem` | Tablet hero, large section headings |
| `5xl` | `4rem` | `4.4rem` | Desktop hero headline |

```css
--font-heading: 'Nunito Sans', 'Inter', system-ui, sans-serif;
--font-body: 'Inter', system-ui, sans-serif;
--font-sans: 'Inter', system-ui, sans-serif;
--text-xs: 0.75rem;
--text-xs--line-height: 1rem;
--text-sm: 0.875rem;
--text-sm--line-height: 1.25rem;
--text-base: 1rem;
--text-base--line-height: 1.625rem;
--text-lg: 1.125rem;
--text-lg--line-height: 1.75rem;
--text-xl: 1.25rem;
--text-xl--line-height: 1.875rem;
--text-2xl: 1.5rem;
--text-2xl--line-height: 2rem;
--text-3xl: 1.875rem;
--text-3xl--line-height: 2.25rem;
--text-4xl: 2.5rem;
--text-4xl--line-height: 3rem;
--text-5xl: 4rem;
--text-5xl--line-height: 4.4rem;
--tracking-normal: 0em;
```

## 3. Border radius scale

| Token | Value | Use |
|---|---:|---|
| `none` | `0` | Square utility surfaces only |
| `sm` | `0.5rem` | Small chips, nested controls |
| `md` | `0.75rem` | Inputs, compact cards |
| `lg` | `1rem` | Module cards, stat cards |
| `xl` | `1.5rem` | Track bands, hero panels |
| `2xl` | `2rem` | Large clay panels, mascot containers |
| `pill` | `9999px` | Badges, CTA buttons, progress pills |

```css
--radius-none: 0;
--radius-sm: 0.5rem;
--radius-md: 0.75rem;
--radius-lg: 1rem;
--radius-xl: 1.5rem;
--radius-2xl: 2rem;
--radius-pill: 9999px;
```

## 4. Shadow style

Use soft brown shadows for separation; no hard 1px borders.

| Token | Value | Use |
|---|---|---|
| `shadow-soft` | `0 2px 4px rgba(70, 45, 24, 0.06), 0 10px 28px rgba(70, 45, 24, 0.08)` | Resting cards, stats, module tiles |
| `shadow-medium` | `0 6px 16px rgba(70, 45, 24, 0.09), 0 18px 42px rgba(70, 45, 24, 0.10)` | Hero panels, track bands |
| `shadow-lift` | `0 10px 22px rgba(70, 45, 24, 0.12), 0 26px 60px rgba(70, 45, 24, 0.14)` | Hovered cards, active CTA |

```css
--shadow-soft: 0 2px 4px rgba(70, 45, 24, 0.06), 0 10px 28px rgba(70, 45, 24, 0.08);
--shadow-medium: 0 6px 16px rgba(70, 45, 24, 0.09), 0 18px 42px rgba(70, 45, 24, 0.10);
--shadow-lift: 0 10px 22px rgba(70, 45, 24, 0.12), 0 26px 60px rgba(70, 45, 24, 0.14);
```

## 5. Spacing scale

| Token | Rem | Px | Use |
|---|---:|---:|---|
| `1` | `0.25rem` | `4px` | Tight icon gaps |
| `2` | `0.5rem` | `8px` | Badge padding, small gaps |
| `3` | `0.75rem` | `12px` | Compact card padding |
| `4` | `1rem` | `16px` | Standard control padding |
| `5` | `1.25rem` | `20px` | Module card padding |
| `6` | `1.5rem` | `24px` | Track band padding |
| `8` | `2rem` | `32px` | Card grid gaps |
| `10` | `2.5rem` | `40px` | Section internal spacing |
| `12` | `3rem` | `48px` | Hero content gaps |
| `16` | `4rem` | `64px` | Section spacing |
| `20` | `5rem` | `80px` | Large viewport spacing |
| `24` | `6rem` | `96px` | Hero vertical rhythm |
| `32` | `8rem` | `128px` | Page-level section spacing |

```css
--spacing-1: 0.25rem;
--spacing-2: 0.5rem;
--spacing-3: 0.75rem;
--spacing-4: 1rem;
--spacing-5: 1.25rem;
--spacing-6: 1.5rem;
--spacing-8: 2rem;
--spacing-10: 2.5rem;
--spacing-12: 3rem;
--spacing-16: 4rem;
--spacing-20: 5rem;
--spacing-24: 6rem;
--spacing-32: 8rem;
```

## 6. Per-track pastel grouping

| Track id | Name | Pastel token | Hex | Rationale |
|---|---|---|---:|---|
| `foundations` | Foundations | `clay-mint` | `#F2F7ED` | Track 1 uses sprout, target, and complete-success cues; mint keeps it grounded and optimistic. |
| `interfaces` | Interfaces | `clay-lavender` | `#F7F1FA` | Track 2 uses plug, speech bubble, puzzle, and MCP-style purple cues; lavender matches the interface layer. |
| `building` | Building | `clay-sky` | `#EFF8FC` | Track 3 uses tools, cloud, browser, voice, and clock icons; sky blue fits utility and construction. |
| `production` | Production | `clay-cream` | `#FDF3E2` | Track 4 uses shield, cost, lock, and bar chart icons; cream-gold matches operational maturity. |
| `applied` | Applied | `clay-peach` | `#FDF1EF` | Track 5 uses rocket, GTM builds, and case study cards; peach gives the applied row forward motion. |
