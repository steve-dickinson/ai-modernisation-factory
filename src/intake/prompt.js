export function intakePrompt(schemaPath) {
  return `
Extract OBSERVABLE FACTS only.

Read the JSON Schema from:
${schemaPath}

Return VALID JSON that conforms to that schema.

IMPORTANT:
- Output ONLY JSON.
- If any extra text is produced, wrap the JSON between tags exactly like:

<json>
{ ... }
</json>

Rules:
- No recommendations, no risks, no roadmaps, no "should".
- Each purpose item must include evidence as "path:line-line".
- unknowns must be non-empty.
`
}

