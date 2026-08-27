---
name: workmate-agent-system-index
description: >
  Master index for the WorkMate AI-agent SDLC. Read this first — it
  tells you which doc to load for which task, in what order, and how
  the docs reference each other. Keeps context loading token-efficient
  by pointing straight to the relevant file instead of loading all
  agent docs at once.
---

# WorkMate Agent System — Index

WorkMate is built by AI agents, approved by humans. No AI is embedded
in the shipped product — WorkMate itself is a plain FAQ-driven React +
FastAPI + MySQL app. The AI lives entirely in *how it gets built*.

## File Map

| Order | File | Agent | Owns |
|---|---|---|---|
| 0 | `workmateprd.md` | PRD Agent | Problem, scope, success metrics |
| 1 | *(Jira/Confluence)* | Content Agent | User stories from PRD, BA approval |
| 2 | `workmatearchitect.md` | Architect Agent | Service boundaries, API contracts, topology |
| 2b | `workmatedb.md` | Database Agent | MySQL schema, migrations, indexing |
| 3a | `workmatebackendcode.md` | Backend Coding Agent | FastAPI implementation |
| 3b | `workmatefrontendcode.md` | Frontend Coding Agent | React implementation |
| 4 | `workmatetesting.md` | Testing Agent | Test execution, QA Sign-off |
| 5 | `workmatedevops.md` | DevOps Agent | Build, migrate, deploy, release |
| — | `workmateorchestrator.md` | Orchestrator | Routes all of the above, enforces gates |

Reference sample tickets: `confluence_user_story_WORKMATE-FAQ-01.md`,
`jira_user_story_WORKMATE-FAQ-01.md` — show the exact shape Content
Agent produces and every downstream agent consumes.

## Pipeline Flow

```
Stakeholder ask
   -> PRD Agent (workmateprd.md)
   -> Content Agent -> Jira + Confluence story  [BA Approval]
   -> Architect Agent (workmatearchitect.md)
      + Database Agent (workmatedb.md)          [Architecture Approval]
   -> Backend Coding Agent (workmatebackendcode.md)   \  parallel,
   -> Frontend Coding Agent (workmatefrontendcode.md) /  both gated by
                                                          Code Review Approval
   -> Testing Agent (workmatetesting.md)         [QA Sign-off]
   -> DevOps Agent (workmatedevops.md)           [Release Approval]
   -> Published
```
Orchestrator (`workmateorchestrator.md`) owns every transition between
the bracketed gates. No agent hands off directly to another — all
routing passes through it.

## How to Use This Efficiently (token discipline)

1. **Load one doc at a time**, matching the task at hand — not the
   whole set. Each doc's own "Skills" section further scopes context
   to one feature at a time within that stage.
2. **Trust upstream docs as contracts, don't re-derive them.** E.g. the
   Backend Coding Agent doesn't re-read Confluence's full history —
   it reads Acceptance Criteria once, then works from
   `workmatearchitect.md` + `workmatedb.md` as binding.
3. **Story ID is the thread.** Every doc references `WORKMATE-###` —
   use it to jump straight to the relevant section in any file instead
   of reading top to bottom.
4. **Compression rules differ per doc but share one shape:** terse for
   routine status/log output, always full detail for security, data
   loss, rollback, and human-facing approval requests. Check the
   "Response Compression" section of the doc you're using before
   assuming brevity is safe.
5. **Guardrails sections are hard stops, not style guidance.** If a
   guardrail in any doc would be violated to complete a task, that's a
   signal to escalate per that doc's Escalation path — not to proceed.

## Cross-Doc Consistency Rules

- **Schema authority:** `workmatedb.md` only. `workmatearchitect.md`
  references it; no other doc redefines a table.
- **API contract authority:** `workmatearchitect.md`'s
  `api-contract-design.md` skill. Backend implements it exactly,
  frontend consumes it exactly — neither invents shapes.
- **Approval gates are uniform** across all docs: BA Approval →
  Architecture Approval → Code Review Approval → QA Sign-off → Release
  Approval. Every doc's Guardrails section treats these as non-waivable.
- **Product principle, non-negotiable everywhere:** WorkMate is guided
  FAQ (search/select), never a free-text chat interface, in any client
  screen, in any doc.

## When Something's Missing or Conflicting

Every doc's Guardrails section has an **Escalation path** — use it
instead of guessing. General rule: conflicts resolve toward the
*earliest* authoritative stage (PRD > BA/Confluence > Architecture >
Code > Test > Deploy), never toward whichever agent is currently under
time pressure.

## Quick Reference: What Never Changes

- No AI chat embedded in the shipped WorkMate product.
- No approval gate is skippable, inferable, or timeout-based.
- No schema/contract is redefined outside its one authoritative doc.
- No secret, key, or PII sits in plain text anywhere in the pipeline.
- Every migration is reversible before it ships.
