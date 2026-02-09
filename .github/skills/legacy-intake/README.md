# Skill: Legacy Intake (Evidence-Only)

## Purpose

Produce a **factual, evidence-based understanding** of a legacy system.

This skill exists to answer one question only:

> “What does this system do today, and how do we know?”

It must not propose changes, improvements, or future states.

---

## Scope (Strict)

This skill MAY:

- describe observable system behaviour
- list technologies, infrastructure, and dependencies
- summarise workflows that can be evidenced
- identify unknowns and assumptions
- raise questions that require validation

This skill MUST NOT:

- recommend modernisation approaches
- assess architectural quality
- propose target designs
- suggest vertical slices
- evaluate “good” or “bad” practices
- infer intent without evidence

If modernisation topics arise, they must be recorded as **questions**, not conclusions.

---

## Evidence Rules

All factual claims must be supported by one or more of:

- source files (path + filename)
- configuration files
- pipeline definitions
- README or documentation
- observable repository structure

If evidence cannot be found:

- state this explicitly
- record the item in “Unknowns & Assumptions”

---

## Tone and Style

- Neutral
- Precise
- Factual
- No persuasive language
- No recommendations

The output must be suitable for review by:
- system owners
- architects
- security teams

---

## Output

Populate `intake-template.md`.

Do not create additional sections.
Do not remove sections.
Do not merge sections.

