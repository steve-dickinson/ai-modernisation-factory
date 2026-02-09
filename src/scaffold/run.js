import fs from "fs-extra"
import path from "node:path"

export async function runScaffold({ outDir, slicePath, targetDir }) {
  if (!(await fs.pathExists(slicePath))) throw new Error(`Slice file not found: ${slicePath}`)

  const slice = await fs.readJSON(slicePath)

  let resolvedTarget = targetDir

  if (!resolvedTarget) throw new Error("Provide --target or use --create-repo")
  if (!(await fs.pathExists(resolvedTarget))) throw new Error(`Target directory not found: ${resolvedTarget}`)

  const docsRoot = path.join(resolvedTarget, "docs", "modernisation")
  const contractsDir = path.join(docsRoot, "contracts")

  await fs.ensureDir(docsRoot)
  await fs.ensureDir(contractsDir)

  const sliceMd = path.join(outDir, "slice-001.md")
  const intakeJson = path.join(outDir, "legacy-intake.json")
  const observeJson = path.join(outDir, "legacy-observe.json")
  const adrMd = path.join(outDir, "adr-0001.md")
  const adrJson = path.join(outDir, "adr-0001.json")

  if (await fs.pathExists(sliceMd)) await fs.copy(sliceMd, path.join(docsRoot, "slice-001.md"))
  await fs.copy(slicePath, path.join(contractsDir, "slice-001.json"))

  if (await fs.pathExists(intakeJson)) await fs.copy(intakeJson, path.join(contractsDir, "legacy-intake.json"))
  if (await fs.pathExists(observeJson)) await fs.copy(observeJson, path.join(contractsDir, "legacy-observe.json"))
  if (await fs.pathExists(adrMd)) await fs.copy(adrMd, path.join(contractsDir, "adr-0001.md"))
  if (await fs.pathExists(adrJson)) await fs.copy(adrJson, path.join(contractsDir, "adr-0001.json"))

  console.log("Scaffold complete")
  console.log(`- Wrote docs to ${docsRoot}`)

  return { docsRoot, targetDir: resolvedTarget }
}
