export function slicePrompt({ schemaPath, intakePath, observePath, adrPath }) {
  return `
You are creating ONE modernization slice as JSON.

Read:
- Slice schema: ${schemaPath}
- Intake: ${intakePath}
- Observe: ${observePath}
- ADR (draft): ${adrPath}

Output:
- Return VALID JSON that conforms to the Slice schema
- Output JSON only

Naming rules (mandatory):
- cdp.repoName MUST be a base capability name only
- Do NOT include suffixes such as:
  - "-backend"
  - "-frontend"
  - "-node"
  - "-api"
  - "-service"
- The factory will append "-backend" or "-frontend" automatically based on template
- Example:
  ✔ "rpa-mit-invoice-importer"
  ✘ "rpa-mit-invoice-importer-node-backend"
  ✘ "rpa-mit-invoice-importer-api"

Baseline exclusion rules (mandatory):
- Do NOT choose health endpoints or logging as the main slice
- Assume CDP templates already provide baseline endpoints (e.g. /health)
- Slice 001 must include at least one business-facing interface from Observe (not health)
- If Observe lists /Uploads/{UserId} or similar business query endpoints, prefer those over health checks


Rules:
- Prefer the lowest risk slice that proves CDP template adoption
- Use Observe interfaces/data/invariants/failureModes to define preserve + acceptance tests
- Keep scope tight
- Every acceptance item must be verifiable locally
- Evidence must be "path:line-line"
- cdp.repoName is a BASE name without "-frontend" or "-backend"
- The factory will append "-frontend" or "-backend" depending on template


Start from this skeleton and fill it:

<json>
{
  "system": {
    "name": "",
    "repo": ""
  },
  "slice": {
    "id": "slice-001",
    "name": "",
    "goal": "",
    "riskLevel": "low"
  },
  "cdp": {
    "template": "cdp-node-backend-template",
    "serviceType": "api",
    "repoName": ""
  },
  "preserve": {
    "interfaces": [""],
    "contracts": [""],
    "invariants": [""]
  },
  "scope": {
    "in": [""],
    "out": [""]
  },
  "acceptance": [
    {
      "test": "",
      "howToVerify": "",
      "evidenceFromObserve": [""]
    },
    {
      "test": "",
      "howToVerify": "",
      "evidenceFromObserve": [""]
    },
    {
      "test": "",
      "howToVerify": "",
      "evidenceFromObserve": [""]
    }
  ],
  "handoff": {
    "nextSliceSuggestion": "",
    "openQuestions": [""]
  }
}
</json>

Replace placeholder strings with real content, but keep required arrays non-empty
`
}
