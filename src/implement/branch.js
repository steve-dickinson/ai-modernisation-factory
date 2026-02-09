import { execa } from "execa"

async function executeGitCommand(args, cwd) {
  await execa("git", args, { cwd, stdio: "inherit" })
}

export async function createModernisationBranch(targetDir, sliceId) {
  const branchName = `modernise/${sliceId}`
  await executeGitCommand(["checkout", "-B", branchName], targetDir)
  return branchName
}
