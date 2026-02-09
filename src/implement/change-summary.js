import { execa } from "execa"

async function getGitDiffStat(targetDir) {
  const { stdout } = await execa("git", ["diff", "--stat"], { cwd: targetDir })
  return stdout
}

async function getChangedFiles(targetDir) {
  const { stdout } = await execa("git", ["diff", "--name-only"], { cwd: targetDir })
  return stdout.split("\n").map(s => s.trim()).filter(Boolean)
}

export async function showChangeSummary(targetDir) {
  console.log("What changed")
  
  const stat = await getGitDiffStat(targetDir)
  console.log(stat || "(no changes)")

  const files = await getChangedFiles(targetDir)
  
  if (files.length) {
    console.log("Files touched:")
    for (const file of files) {
      console.log(`- ${file}`)
    }
  } else {
    console.log("No files touched")
  }
}
