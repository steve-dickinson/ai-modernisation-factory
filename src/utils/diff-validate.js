export function validateDiff(diffText) {
  const text = String(diffText || "")
  const issues = []

  if (!text.includes("diff --git")) {
    issues.push("No valid diff header found (must start with 'diff --git')")
    return { valid: false, issues }
  }

  const lines = text.split("\n")
  const files = []
  let currentFile = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Track files being modified
    if (line.startsWith("diff --git")) {
      const match = line.match(/diff --git a\/(.*) b\/(.*)/)
      if (match) {
        currentFile = { path: match[2], lineNum: i }
        files.push(currentFile)
      }
    }

    // Check for placeholder SHAs
    if (line.startsWith("index ")) {
      const match = line.match(/index ([a-f0-9]+)\.\.([a-f0-9]+)/)
      if (match) {
        const [, oldSha, newSha] = match
        // Warn about placeholder SHAs but don't fail (git apply --3way might work)
        if (oldSha === "0000000" || newSha === "1234567" || newSha === "0000000") {
          issues.push(
            `Warning: ${currentFile?.path || "unknown file"} has placeholder SHA. ` +
            `This may cause 'git apply' to fail. Consider regenerating patch.`
          )
        }
      }
    }

    // Check for malformed hunk headers
    if (line.startsWith("@@")) {
      const match = line.match(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/)
      if (!match) {
        issues.push(
          `Malformed hunk header at line ${i + 1}: ${line}`
        )
      }
    }
  }

  // Check for common issues
  if (files.length === 0) {
    issues.push("No files found in diff")
  }

  const hasPlaceholderWarnings = issues.some((i) => i.includes("Warning"))
  const hasErrors = issues.some((i) => !i.includes("Warning"))

  return {
    valid: !hasErrors,
    issues,
    files: files.map((f) => f.path),
    hasWarnings: hasPlaceholderWarnings
  }
}

export function suggestDiffFixes(diffText, contextPack) {
  const validation = validateDiff(diffText)
  const suggestions = []

  if (validation.hasWarnings) {
    suggestions.push(
      "Patch contains placeholder SHAs. To fix:",
      "1. Ensure Context Pack includes current file content",
      "2. Instruct LLM to use actual file content for proper diff generation",
      "3. Consider using 'git diff' on applied changes rather than LLM-generated diffs"
    )
  }

  return { validation, suggestions }
}
