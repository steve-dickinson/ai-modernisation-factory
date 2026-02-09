import fs from "fs-extra"
import path from "node:path"
import os from "node:os"
import { execa } from "execa"
import { runScaffold } from "../scaffold/run.js"
import { rewriteTemplate } from "./rewrite.js"
import { CONFIG } from "../config.js"

function deriveRepoName(baseName, template) {
  const base = String(baseName || "").trim()

  if (!base) throw new Error("slice.cdp.repoName missing or empty")

  const suffix = CONFIG.TEMPLATE_SUFFIXES[template]
  if (!suffix) throw new Error(`Unknown template: ${template}`)

  return `${base}${suffix}`
}

async function git(args, cwd) {
  await execa("git", args, { cwd, stdio: "inherit" })
}

export async function runSeed({ slicePath, outDir, destDir, org }) {
  if (!(await fs.pathExists(slicePath))) throw new Error(`Slice file not found: ${slicePath}`)
  if (!(await fs.pathExists(outDir))) throw new Error(`Out dir not found: ${outDir}`)

  const slice = await fs.readJSON(slicePath)

  const baseName = slice.cdp?.repoName
  const template = slice.cdp?.template

  if (!baseName) throw new Error("slice.cdp.repoName missing")
  if (!template) throw new Error("slice.cdp.template missing")

  if (/(backend|frontend|node|api|service)$/i.test(baseName)) {
    throw new Error(
      `slice.cdp.repoName must be a base name only (no suffixes): ${baseName}`
    )
 }

  const repoName = deriveRepoName(baseName, template)

  const templateFull = `${org}/${template}`

  await fs.ensureDir(destDir)

  const targetDir = path.join(destDir, repoName)
  if (await fs.pathExists(targetDir)) {
    throw new Error(`Destination already exists: ${targetDir}`)
  }

  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "modernise-seed-"))
  const templateDir = path.join(tmp, "template")

  console.log(`Cloning CDP template locally: ${templateFull}`)
  await execa("git", ["clone", "--depth", "1", `https://github.com/${templateFull}.git`, templateDir], {
    stdio: "inherit"
  })

  console.log(`Creating local repo: ${targetDir}`)
  await fs.copy(templateDir, targetDir, {
    filter: p => !p.includes(`${path.sep}.git${path.sep}`) && !p.endsWith(`${path.sep}.git`)
  })

  console.log("Rewriting template placeholders")
  await rewriteTemplate(targetDir, repoName)

  console.log("Initialising local git repository")
  await git(["init"], targetDir)
  await git(["checkout", "-b", "main"], targetDir)
  await git(["add", "-A"], targetDir)
  await git(["commit", "-m", "chore: seed from CDP template"], targetDir)

  console.log("Scaffolding modernisation artefacts into CDP repo")
  await runScaffold({ outDir, slicePath, targetDir })

  console.log("Seed complete (local only)")
  console.log(`- ${targetDir}`)
  return { targetDir }
}
