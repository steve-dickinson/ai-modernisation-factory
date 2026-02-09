import fs from "fs-extra"
import path from "node:path"
import { execa } from "execa"
import { runGate } from "../gate/run.js"
import { extractWithCopilot } from "../copilot/extract.js"
import { extractUnifiedDiff } from "../utils/diff-extract.js"
import { buildFixPrompt } from "./fix-prompt.js"
import { CONFIG } from "../config.js"

async function applyFixPatch(targetDir, fixDiff) {
  const fixPatchFile = CONFIG.FIX_PATCH_FILENAME
  await fs.writeFile(path.join(targetDir, fixPatchFile), fixDiff)
  await execa("git", ["apply", "--whitespace=fix", fixPatchFile], {
    cwd: targetDir,
    stdio: "inherit"
  })
}

async function generateAndApplyFix(targetDir, sliceId, error) {
  const failureOutput = String(error.message || "")
  console.log("Gate failed, generating fix patch")

  const fixPrompt = buildFixPrompt({ sliceId, failureOutput })
  const rawFix = await extractWithCopilot(targetDir, fixPrompt, { mode: "prompt" })
  const fixDiff = extractUnifiedDiff(rawFix)

  console.log("Applying fix patch")
  await applyFixPatch(targetDir, fixDiff)
}

export async function runGateWithAutoFix(targetDir, sliceId) {
  console.log("Running standards gate")
  
  let attempts = 0
  const maxAttempts = CONFIG.MAX_GATE_FIX_ATTEMPTS
  
  while (true) {
    try {
      console.log("Running standards gate")
      await runGate({ targetDir })
      break
    } catch (error) {
      attempts++
      if (attempts >= maxAttempts) throw error
      
      await generateAndApplyFix(targetDir, sliceId, error)
    }
  }
}
