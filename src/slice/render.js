const clean = s => String(s ?? "").trim()

function bullets(list) {
  if (!list || !list.length) return "- (none)"
  return list.map(x => `- ${clean(x)}`).join("\n")
}

export function renderSliceMd(slice) {
  return `# ${clean(slice.slice.id)} — ${clean(slice.slice.name)}

- System: ${clean(slice.system.name)}
- Repo: ${clean(slice.system.repo)}
- Risk: ${clean(slice.slice.riskLevel)}
- Goal: ${clean(slice.slice.goal)}

## CDP Target
- Template: ${clean(slice.cdp.template)}
- Service type: ${clean(slice.cdp.serviceType)}
- Proposed repo name: ${clean(slice.cdp.repoName)}

## Preserve
### Interfaces
${bullets(slice.preserve.interfaces)}

### Contracts
${bullets(slice.preserve.contracts)}

### Invariants
${bullets(slice.preserve.invariants)}

## Scope
### In
${bullets(slice.scope.in)}

### Out
${bullets(slice.scope.out)}

## Acceptance
${(slice.acceptance || []).map(a => {
  return `- ${clean(a.test)}\n  - Verify: ${clean(a.howToVerify)}\n  - Evidence: ${(a.evidenceFromObserve || []).join(", ")}`
}).join("\n")}

## Handoff
- Next slice suggestion: ${clean(slice.handoff.nextSliceSuggestion)}

### Open questions
${bullets(slice.handoff.openQuestions)}
`
}
