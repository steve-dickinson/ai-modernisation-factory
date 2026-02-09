export function adrPrompt({ schemaPath, intakePath, observePath }) {
  return `
You are drafting an Architecture Decision Record (ADR) as JSON.

Read these files:
- ADR schema: ${schemaPath}
- Intake (what exists): ${intakePath}
- Observe (what must not break): ${observePath}

Output:
- Return VALID JSON that conforms to the ADR schema
- Output JSON only (no markdown, no commentary)
- status must be "draft"

Grounding rules:
- Base context on observable facts, interfaces, data contracts, invariants, and failure modes found in intake/observe
- Do not invent platform capabilities, domain rules, or integration partners
- If something is unknown, capture it in context as an explicit unknown

Interpret Observe fields:
- interfaces[] are the externally visible entry points and user touchpoints (http/queue/ui/manual/schedule/file-drop/etc)
- data.inputs/outputs/stores describe data flow and where state lives
- invariants describe behaviours/contracts expected to remain true through modernisation
- failureModes describe observed error behaviours to preserve (or consciously change later with agreement)

Title rules:
- Title must describe the business capability or system role being modernised
- Title must be technology-agnostic
- Do NOT reference implementation technologies (e.g. Azure, .NET, Functions, Access, Excel, serverless, containers)
- Focus on what must be preserved (contracts, behaviour, invariants)

Decision rules:
- The decision must describe a target direction in plain terms (not a detailed implementation plan)
- Preserve interfaces and data contracts unless explicitly called out as intentionally changed
- Prefer statements like "Preserve <contract>" and "Provide <capability>" rather than naming specific products

Required content:
- Context must mention: key interfaces, key data inputs/outputs/stores, and the most important invariants/failure modes
- Decision must mention: what stays compatible (interfaces/contracts) and what changes (target direction)
- Consequences must include positive, negative, neutral and all must be non-empty
- Links should cite the most relevant files and/or documents referenced in intake/observe
`
}
