export function observePrompt(schemaPath, repoHint) {
  return `
Extract OBSERVABLE CONSTRAINTS only.

Read the JSON Schema from:
${schemaPath}

Return VALID JSON that conforms to that schema.

Interpretation rules:
- interfaces: how the system is triggered or used (HTTP, queue, schedule, manual, UI, file-drop, database-trigger)
- data.inputs: what it consumes (files, spreadsheets, messages, recordsets)
- data.outputs: what it produces (files, messages, reports, emails)
- data.stores: where state lives (Access tables, DBs, blob storage, files)
- invariants: behaviours/contracts expected to remain true through modernisation
- failureModes: what happens on error (observed behaviour only)
- assumptions: only if evidence is missing, explain rationale
- unknowns must be non-empty

Rules:
- Output JSON only
- No recommendations, no "should", no plans
- Evidence must be path:line-line (use the same number twice if needed).
- If the system exposes HTTP endpoints or long-lived listeners, classification should be ‘service’ or ‘mixed’, not ‘batch’.

Start from this skeleton and fill it:

<json>
{
  "system": {
    "name": "${repoHint}",
    "repo": "${repoHint}",
    "classification": "unknown"
  },
  "interfaces": [
    { "type": "other", "name": "", "contract": "", "evidence": [""] }
  ],
  "data": {
    "inputs": [
      { "type": "other", "name": "", "format": "", "contract": "", "schemaHints": [], "pathHints": [], "evidence": [""] }
    ],
    "outputs": [
      { "type": "other", "name": "", "format": "", "contract": "", "schemaHints": [], "pathHints": [], "evidence": [""] }
    ],
    "stores": [
      { "type": "other", "name": "", "direction": "readwrite", "contract": "", "pathHints": [], "evidence": [""] }
    ]
  },
  "invariants": [
    { "statement": "", "evidence": [""] }
  ],
  "assumptions": [
    { "statement": "", "evidenceOrRationale": "" }
  ],
  "failureModes": [
    { "trigger": "", "observedBehaviour": "", "evidence": [""] }
  ],
  "unknowns": [ "" ]
}
</json>

Replace or remove placeholder items, but keep required arrays non-empty
`
}

