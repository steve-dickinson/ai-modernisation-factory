const clean = (s) => String(s ?? "").replace(/\s+/g, " ").trim()

export function renderIntakeMd(intake) {
  return `# Legacy Intake — ${clean(intake.system.name)}

- Repo: ${clean(intake.system.repo)}
- Owner: ${clean(intake.system.owner)}
- Lifecycle: ${clean(intake.system.lifecycle)}

## Purpose
${intake.purpose
  .map((x) => `- ${clean(x.statement)}\n  - Evidence: ${x.evidence.join(", ")}`)
  .join("\n")}

## Entry Points

### Queue
${
  (intake.entryPoints.queue ?? []).length
    ? (intake.entryPoints.queue ?? []).map((x) => `- ${JSON.stringify(x)}`).join("\n")
    : "- (none observed)"
}

### HTTP
${
  (intake.entryPoints.http ?? []).length
    ? (intake.entryPoints.http ?? []).map((x) => `- ${JSON.stringify(x)}`).join("\n")
    : "- (none observed)"
}

## Unknowns
${intake.unknowns.map((u) => `- ${clean(u)}`).join("\n")}
`
}
