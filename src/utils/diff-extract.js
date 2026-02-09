import { CONFIG } from "../config.js"

export function extractUnifiedDiff(output) {
  const text = String(output || "")

  const fenceMatch = text.match(/```(?:diff)?\n(diff --git[\s\S]*?)```/)
  if (fenceMatch) {
    return cleanDiff(fenceMatch[1])
  }

  const lines = text.split("\n")
  let startIdx = -1
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("diff --git")) {
      const next3Lines = lines.slice(i + 1, i + 4).join("\n")
      if (next3Lines.match(/^(index |new file mode|deleted file mode|--- )/m)) {
        startIdx = i
        break
      }
    }
  }
  
  if (startIdx === -1) {
    const preview = text.slice(0, CONFIG.COPILOT_DEBUG_PREVIEW_LENGTH)
    throw new Error(`No unified diff found in Copilot output\n\nPreview:\n${preview}`)
  }

  let diff = lines.slice(startIdx).join("\n")
  
  const endFenceIdx = diff.indexOf("```")
  if (endFenceIdx > 0) {
    diff = diff.slice(0, endFenceIdx)
  }

  return cleanDiff(diff)
}

function cleanDiff(diff) {
  diff = diff.replace(/^(diff --git .+)\n(?!diff|index|---|@|new|deleted|similarity)/gm, '$1 ')
  return diff.trim() + "\n"
}
