# security policy

## reporting

Report security issues privately by emailing **mmmskendzic@gmail.com**. You can also use GitHub Security Advisories: https://github.com/Mihailo2501/ai-agent-engineering/security/advisories

Do not open a public GitHub issue for a vulnerability.

Sandbox code runs in this page's context. Do not paste code from sources you do not trust.

## scope

**In scope:**

- Anything that could leak the user's BYOK Anthropic API key stored in `sessionStorage` or `localStorage`.
- XSS vectors in the CodeMirror sandbox UI.
- Exfiltration of `localStorage` or `sessionStorage` data.

**Out of scope:**

- The user's own Anthropic account security.
- Third-party API rate limits.
- Issues with the user's local environment.

## response time

Best-effort within 7 days.

## responsible disclosure

Standard responsible disclosure norms apply. Coordinated disclosure is preferred. Do not open a public issue for a vulnerability.
