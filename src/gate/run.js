import fs from "fs-extra"
import path from "node:path"
import { execa } from "execa"
import { CONFIG } from "../config.js"

async function ensureNodeDeps(targetDir) {
  const pkgPath = path.join(targetDir, "package.json")
  if (!(await fs.pathExists(pkgPath))) return { installed: false }

  const lockPath = path.join(targetDir, "package-lock.json")
  const nodeModules = path.join(targetDir, "node_modules")

  const hasLock = await fs.pathExists(lockPath)
  const hasModules = await fs.pathExists(nodeModules)

  if (hasModules) return { installed: true }

  if (!hasLock) {
    console.log("No package-lock.json found, running npm install")
    await execa("npm", ["install"], { cwd: targetDir, stdio: "inherit" })
    return { installed: true }
  }

  console.log("Installing dependencies with npm ci")
  await execa("npm", ["ci"], { cwd: targetDir, stdio: "inherit" })
  return { installed: true }
}

async function runIfScriptExists(targetDir, script) {
  const pkgPath = path.join(targetDir, "package.json")
  if (!(await fs.pathExists(pkgPath))) return

  const pkg = await fs.readJSON(pkgPath)
  const scripts = pkg.scripts || {}

  if (!scripts[script]) return

  console.log(`Running: npm run ${script}`)
  try {
    await execa("npm", ["run", script], { cwd: targetDir, stdio: "inherit" })
  } catch (err) {
    const out = (err.stdout ? String(err.stdout) : "") + "\n" + (err.stderr ? String(err.stderr) : "")
    const e = new Error(`Gate failed on npm run ${script}\n\n${out}`)
    e.cause = err
    throw e
  }
}

export async function runGate({ targetDir }) {
  const required = CONFIG.REQUIRED_CDP_FILES
  const missing = []

  for (const f of required) {
    const p = path.join(targetDir, f)
    if (!(await fs.pathExists(p))) missing.push(f)
  }

  if (missing.length) {
    console.error("Standards gate failed (missing files):")
    for (const m of missing) console.error(`- ${m}`)
    throw new Error("Gate failed")
  }

  await ensureNodeDeps(targetDir)

  await runIfScriptExists(targetDir, "lint")
  await runIfScriptExists(targetDir, "test")

  console.log("Standards gate passed")
}
