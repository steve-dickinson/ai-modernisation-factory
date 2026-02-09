export function fixDiffHunkHeaders(diffText) {
  const lines = diffText.split("\n")
  const fixed = []
  let i = 0
  let isNewFile = false
  let hadFirstHunk = false

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith("diff --git")) {
      isNewFile = false
      hadFirstHunk = false
      fixed.push(line)
    } else if (line.includes("new file mode")) {
      isNewFile = true
      fixed.push(line)
    } else if (line.startsWith("@@")) {
      const match = line.match(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(.*)/)
      if (match) {
        const [, oldStart, oldCount, newStart, newCount, context] = match
        
        if (isNewFile && hadFirstHunk && oldStart === "0") {
          i++
          continue
        }
        
        if (isNewFile && hadFirstHunk) {
          i++
          continue
        }
        
        let j = i + 1
        let actualOldCount = 0
        let actualNewCount = 0

        while (j < lines.length && !lines[j].startsWith("@@") && !lines[j].startsWith("diff --git")) {
          const hunkLine = lines[j]
          if (hunkLine.startsWith("-")) {
            actualOldCount++
          } else if (hunkLine.startsWith("+")) {
            actualNewCount++
          } else if (hunkLine.startsWith(" ")) {
            actualOldCount++
            actualNewCount++
          } else if (hunkLine.length > 0 && !hunkLine.startsWith("\\")) {
            actualOldCount++
            actualNewCount++
          }
          j++
        }

        const oldPart = oldStart === "0" ? `-0,0` : actualOldCount > 1 ? `-${oldStart},${actualOldCount}` : `-${oldStart}`
        const newPart = newStart === "0" ? `+0,0` : actualNewCount > 1 ? `+${newStart},${actualNewCount}` : `+${newStart}`
        fixed.push(`@@ ${oldPart} ${newPart} @@${context || ""}`)
        
        if (isNewFile) hadFirstHunk = true
      } else {
        fixed.push(line)
      }
    } else {
      fixed.push(line)
    }
    i++
  }

  return fixed.join("\n")
}
