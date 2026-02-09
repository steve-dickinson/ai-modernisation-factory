const clean = s => String(s ?? "").replace(/\s+/g, " ").trim()

function section(title, body) {
  return `## ${title}\n${body}\n`
}

function bullets(arr, mapFn) {
  if (!arr || !arr.length) return "- (none observed)"
  return arr.map(x => `- ${mapFn(x)}`).join("\n")
}

export function renderObserveMd(obs) {
  const sys = obs.system || {}

  const interfaces = bullets(obs.interfaces, i =>
    `${clean(i.type)}: ${clean(i.name)}\n  - Contract: ${clean(i.contract)}\n  - Evidence: ${(i.evidence || []).join(", ")}`
  )

  const inputs = bullets(obs.data?.inputs || [], d => {
    const hints = (d.schemaHints || []).length ? `\n  - Schema hints: ${(d.schemaHints || []).map(clean).join(", ")}` : ""
    const paths = (d.pathHints || []).length ? `\n  - Path hints: ${(d.pathHints || []).map(clean).join(", ")}` : ""
    return `${clean(d.type)}: ${clean(d.name)} (format: ${clean(d.format)})\n  - Contract: ${clean(d.contract)}\n  - Evidence: ${(d.evidence || []).join(", ")}${hints}${paths}`
  })

  const outputs = bullets(obs.data?.outputs || [], d => {
    const hints = (d.schemaHints || []).length ? `\n  - Schema hints: ${(d.schemaHints || []).map(clean).join(", ")}` : ""
    const paths = (d.pathHints || []).length ? `\n  - Path hints: ${(d.pathHints || []).map(clean).join(", ")}` : ""
    return `${clean(d.type)}: ${clean(d.name)} (format: ${clean(d.format)})\n  - Contract: ${clean(d.contract)}\n  - Evidence: ${(d.evidence || []).join(", ")}${hints}${paths}`
  })

  const stores = bullets(obs.data?.stores || [], s => {
    const paths = (s.pathHints || []).length ? `\n  - Path hints: ${(s.pathHints || []).map(clean).join(", ")}` : ""
    return `${clean(s.type)}: ${clean(s.name)} (direction: ${clean(s.direction)})\n  - Contract: ${clean(s.contract)}\n  - Evidence: ${(s.evidence || []).join(", ")}${paths}`
  })

  const invariants = bullets(obs.invariants, x =>
    `${clean(x.statement)}\n  - Evidence: ${(x.evidence || []).join(", ")}`
  )

  const assumptions = bullets(obs.assumptions || [], a =>
    `${clean(a.statement)}\n  - Evidence/rationale: ${clean(a.evidenceOrRationale)}`
  )

  const failures = bullets(obs.failureModes, f =>
    `Trigger: ${clean(f.trigger)}\n  - Behaviour: ${clean(f.observedBehaviour)}\n  - Evidence: ${(f.evidence || []).join(", ")}`
  )

  const unknowns = bullets(obs.unknowns, u => clean(u))

  return `# Legacy Observe — ${clean(sys.name)}

- Repo: ${clean(sys.repo)}
- Classification: ${clean(sys.classification || "unknown")}

${section("Interfaces", interfaces)}
${section("Data Inputs", inputs)}
${section("Data Outputs", outputs)}
${section("Data Stores", stores)}
${section("Invariants", invariants)}
${section("Failure Modes", failures)}
${section("Assumptions", assumptions)}
${section("Unknowns", unknowns)}
`
}
