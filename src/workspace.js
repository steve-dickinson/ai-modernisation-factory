import path from "node:path"
import fs from "fs-extra"
import { execa } from "execa"
import { repoSlug } from "./utils/slug.js"

class WorkspaceError extends Error {
  constructor(message) {
    super(message)
    this.name = "WorkspaceError"
  }
}

function buildGitHubUrl(repo) {
  return `https://github.com/${repo}.git`
}

async function cloneRepository(repoUrl, targetPath) {
  await execa("git", ["clone", repoUrl, targetPath], { stdio: "inherit" })
}

async function ensureWorkspaceDoesNotExist(repoDir) {
  if (await fs.pathExists(repoDir)) {
    throw new WorkspaceError(
      `Workspace already exists: ${repoDir}\n` +
      `Remove it manually if you want to start fresh: rm -rf ${repoDir}`
    )
  }
}

export async function prepareWorkspace(outDir, repo) {
  const slug = repoSlug(repo)
  const root = path.resolve(outDir, slug)
  const repoDir = path.join(root, "repo")

  await fs.ensureDir(root)
  await ensureWorkspaceDoesNotExist(repoDir)

  console.log(`Cloning ${repo}`)
  await cloneRepository(buildGitHubUrl(repo), repoDir)

  return { root, repoDir }
}

export { WorkspaceError }
