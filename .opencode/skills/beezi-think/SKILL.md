---
name: beezi-think
description: Silent autonomous pre-implementation analysis. Run this BEFORE any code changes. No questions, no waiting, no doc files - pure internal reasoning that outputs structured analysis to terminal, then hands control directly to implementation.
---

# Silent Pre-Implementation Analysis

Run this skill BEFORE writing any code. Do NOT ask the user anything. Do NOT wait for confirmation. Do NOT create files, specs, or documentation. This is a fully autonomous internal reasoning pass - output structured analysis to terminal, then immediately proceed with implementation.

<HARD-GATE>
Do NOT write any code, create any files, run any git commands, or produce any documentation until all 4 phases of this analysis are complete. Execute the analysis autonomously. Then immediately proceed to implementation without asking for confirmation.
</HARD-GATE>

<TIME-BOX>
⏱️ The entire analysis (Phases 1–4) must complete within ~60 seconds. Enforce this by:
- Keeping total output ≤ 500 tokens across all phases.
- Scanning at most 5 key files/imports in Phase 2. Skip exhaustive reads.
- Using only short bullets. No explanations, examples, or meta-commentary.
- Limit context-gathering tool calls to ≤ 2. If uncertain, make a pragmatic assumption and proceed.
- If the model detects it's spending too long, truncate analysis, lock assumptions, and move to implementation immediately.
</TIME-BOX>

---

## Phase 1 - (Task Understanding)

Answer these internally before anything else:

- **What exactly must be done?** State the expected outcome, not the implementation approach.
- **Implicit requirements** - what is obviously needed but not explicitly stated in the task?
- **Edge cases** - what inputs, states, or conditions could cause unexpected behavior?
- **Failure modes** - what could go silently wrong without an obvious error?

Output a concise summary. Max 5 bullet points per sub-section. No padding.

---

## Phase 2 - Context Analysis

Scan the codebase before reasoning. Read CLAUDE.md if present:

- **Files in scope** - which existing files will be touched or affected by this change?
- **Existing similar logic** - is there anything already in the project that does something similar? Do not duplicate it.
- **Component dependencies** - what depends on what you are changing? What callers, consumers, or tests could break?
- **CLAUDE.md rules** - are there project-specific conventions, patterns, or constraints that apply to this task?

Scan imports and usages of all affected modules. Max 5 bullets per sub-section.

---

## Phase 3 - (Approach Selection)

Propose **at least 2 concrete implementation approaches**. For each:

- **Approach name** - one short phrase
- **How it works** - 2-3 sentences describing the mechanism
- **Pros** - real, concrete benefits
- **Cons** - real tradeoffs, not hypothetical concerns
- **Risks** - what could break at runtime or in tests

Then state explicitly:

- **Chosen approach:** [name] - [one-sentence justification]
- **Rejected:** [other approach(es)] - [brief reason: YAGNI / complexity / risk / duplication]

---

## Phase 4 - (Action Plan)

Before writing a single line of code, produce:

- **Files to create** - exact relative paths
- **Files to modify** - exact relative paths + which sections/functions will change
- **Change order** - numbered sequence (what to do first, second, etc.)
- **Breakage risk points** - which existing tests, integrations, or callers might be affected?
- **Verification** - how to confirm the implementation is correct after completion (tests to run, behaviors to check)?

---

## Output Contract

Print each phase as a clearly labelled section with its name. Be terse and specific - no filler, no padding, no meta-commentary about "analyzing now".

After completing all 4 phases, **immediately proceed with implementation**. Do NOT output a summary, do NOT ask for confirmation, do NOT say "analysis complete" - just start coding.
