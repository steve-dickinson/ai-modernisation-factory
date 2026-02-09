const clean = s => String(s ?? "").trim()

export function renderAdrMd(adr) {
  return `# ADR ${clean(adr.id)} — ${clean(adr.title)}

- Status: ${clean(adr.status)}

## Context
${adr.context.map(x => `- ${clean(x)}`).join("\n")}

## Decision
${adr.decision.map(x => `- ${clean(x)}`).join("\n")}

## Consequences

### Positive
${adr.consequences.positive.map(x => `- ${clean(x)}`).join("\n")}

### Negative
${adr.consequences.negative.map(x => `- ${clean(x)}`).join("\n")}

### Neutral
${adr.consequences.neutral.map(x => `- ${clean(x)}`).join("\n")}

## Links
${adr.links.map(x => `- ${clean(x)}`).join("\n")}
`
}
