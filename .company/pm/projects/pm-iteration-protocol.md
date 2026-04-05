---
created: "2026-03-29"
project: "pm-iteration-protocol"
status: in-progress
tags: ["pm", "protocol", "iteration", "workflow"]
---

# PM Iteration Protocol

## Purpose

Make repeated PM work easy to resume with a consistent cycle instead of re-planning from scratch every turn.

## When To Use

Use this protocol when the request is effectively:

- "to pm 作業せよ"
- "反復で作業をせよ"
- "次の改善候補を進めよ"
- "全体の修正点を回し続けよ"

## Minimalist Iteration Sequence

1. Read `secretary/inbox/handoff-latest.md` (The "Last Work" summary).
2. Read the current status of the target project (e.g., `pm/projects/workspace-continuous-improvement.md`).
3. **DO NOT** read the entire history of iterations. Only look at the "Current Focus" and the "Latest Iteration".
4. After implementation, update `handoff-latest.md` for the next role or turn.
5. Archive the completed ticket/iteration using the `Blind Append` command (`echo "..." >> pm/projects/archive-improvement-history.md`).

## Start Sequence

1. **Context Health Check:** Check if `handoff-latest.md` or active project files need archiving/compression (per `AGENTS.md` rules). Perform cleanup if necessary using the Blind Append command.
2. Read `secretary/inbox/handoff-latest.md` for the latest context.
3. Follow the **Minimalist Iteration Sequence** above.
3. Choose one of the following actions:
   - update PM records only
   - refine next candidates
   - set execution order
   - hand off the next candidate into implementation work

## One Iteration Definition

One PM iteration should do at least one of these:

- identify a new concrete fix or improvement candidate
- replace a vague candidate with a specific one
- reprioritize the active project queue
- record blockers, dependencies, or cross-repo checks
- close one candidate and nominate the next one

## Minimum Outputs

Each iteration should leave behind:

- one PM-facing update in `pm/projects/` or `pm/tickets/`
- one secretary-facing summary note when the direction changed materially

## Candidate Quality Bar

A candidate is good enough only if it is:

- specific enough to implement without another broad discovery pass
- narrow enough to fit in a small execution cycle
- tied to one repository unless cross-repo linkage is actually required

## Execution Order Rule

- Prefer the highest user-facing value that can move with low coordination cost.
- If a portal depends on tool wording, stabilize the tool wording first.
- Keep `.company/` cleanup running, but do not let it block product-facing improvements unless it prevents coordination.

## Automatic Handoff Rule (Chain Execution)

To maintain continuous development momentum:

- **Immediate Handoff:** Once a PM ticket or plan reaches the `execution-ready` status, the PM role must not stop. It must immediately transition to the assigned department (e.g., Engineering) to begin implementation.
- **Role Switching:** The agent should switch its internal context (e.g., "Acting as Engineering") and proceed with the assigned task in the same session.
- **Deferred Reporting:** Do not report completion to the user until the entire chain (Planning -> Implementation -> Validation) is finished, unless a critical blocker is hit that requires user decision.

## Orchestration Phase (Parallelism)
- **Task Splitting:** If the "Execution Order" contains more than one independent item, the PM must split the turn into a parallel dispatch.
- **Specialist Selection:** Analyze each task to choose between **Codex-Specialist** (specs/boilerplate) and **Gemini-Specialist** (logic/research).
- **Commanding via cc-company:** Assign roles (e.g., `Engineering-A`, `Engineering-B`) to sub-agents. Record each command, worker role, `Origin Agent`, and `Delegation Depth: 1` in `secretary/inbox/handoff-latest.md`.
- **Loop Guard:** Before dispatching, verify that the current agent is the "Main Orchestrator" (Depth 0). Sub-agents (Depth 1) are FORBIDDEN from spawning further sub-agents.
- **Consolidated Reporting:** Wait for all parallel sub-agents to finish their independent validation before synthesizing the final report for the user.

## Close Conditions

An iteration can be considered complete when:

- the next candidate is clearer than before, or
- the execution order is more actionable than before, or
- a blocker was converted into a tracked PM item

## Suggested User Prompt

To continue this loop later, a minimal prompt is enough:

- `cc-company to pm 作業せよ`
- `cc-company to pm 反復で作業をせよ`

The PM side should resume from the latest protocol state rather than starting over.
