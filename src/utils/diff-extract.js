export function extractUnifiedDiff(output) {
  const text = String(output || "")

  // Try to find diff within markdown code fences first
  const fenceMatch = text.match(/```(?:diff)?\n(diff --git[\s\S]*?)```/)
  if (fenceMatch) {
    return cleanDiff(fenceMatch[1])
  }

  // Find all occurrences of "diff --git" and validate them
  const lines = text.split("\n")
  let startIdx = -1
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("diff --git")) {
      // Check if the next few lines look like a valid diff header
      // Valid patterns: index, new file mode, deleted file mode, ---
      const next3Lines = lines.slice(i + 1, i + 4).join("\n")
      if (next3Lines.match(/^(index |new file mode|deleted file mode|--- )/m)) {
        startIdx = i
        break
      }
    }
  }
  
  if (startIdx === -1) {
    const preview = text.slice(0, 1200)
    throw new Error(`No unified diff found in Copilot output\n\nPreview:\n${preview}`)
  }

  let diff = lines.slice(startIdx).join("\n")
  
  // If there's a closing code fence, truncate there
  const endFenceIdx = diff.indexOf("```")
  if (endFenceIdx > 0) {
    diff = diff.slice(0, endFenceIdx)
  }

  return cleanDiff(diff)
}

function cleanDiff(diff) {
  // Fix wrapped diff headers (common with terminal output)
  // Pattern: "diff --git a/file.js b/file.js\n" should not be broken
  diff = diff.replace(/^(diff --git .+)\n(?!diff|index|---|@|new|deleted|similarity)/gm, '$1 ')
  
  // Remove any trailing whitespace but ensure final newline
  return diff.trim() + "\n"
}
