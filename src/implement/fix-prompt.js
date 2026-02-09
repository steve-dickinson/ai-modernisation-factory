export function buildFixPrompt({ sliceId, failureOutput }) {
  return `
You are fixing lint/test failures after applying patch for ${sliceId}

CRITICAL OUTPUT RULES:
- Output ONLY a valid unified diff
- NO markdown code fences (no \`\`\`diff)
- NO commentary or explanations
- NO preamble or postamble
- Start IMMEDIATELY with "diff --git"

Goal:
- Make lint and tests pass
- Minimal changes only
- Follow existing repo patterns

Failure output:
${failureOutput}

Rules:
- Do not add new dependencies
- Do not change scope beyond lint/test fixes
- Prefer fixing exports/imports and unused variables
- Output format: unified diff starting with "diff --git"
`.trim()
}
