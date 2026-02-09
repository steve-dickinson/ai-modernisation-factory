import fs from "fs-extra"
import path from "node:path"
import { execa } from "execa"
import { validateDiff, suggestDiffFixes } from "../utils/diff-validate.js"
import { assertPatchAllowed } from "./patch-guard.js"
import { CONFIG } from "../config.js"

export async function savePatch(diff, targetDir, filename = CONFIG.PATCH_FILENAME) {
  const patchPath = path.join(targetDir, filename)
  await fs.writeFile(patchPath, diff)
  return patchPath
}

function displayValidationWarnings(validation) {
  console.warn("Patch validation warnings:")
  for (const issue of validation.issues.filter(i => i.includes("Warning"))) {
    console.warn(`  ${issue}`)
  }
}

function displayValidationErrors(validation, diff, contextPack) {
  console.error("Patch validation failed:")
  for (const issue of validation.issues.filter(i => !i.includes("Warning"))) {
    console.error(`  ${issue}`)
  }
  
  const fixes = suggestDiffFixes(diff, contextPack)
  if (fixes.suggestions.length > 0) {
    console.error("\nSuggestions:")
    for (const suggestion of fixes.suggestions) {
      console.error(`  ${suggestion}`)
    }
  }
}

export async function validatePatchStructure(diff, contextPack) {
  console.log("Validating patch...")
  const validation = validateDiff(diff)
  
  if (validation.hasWarnings) {
    displayValidationWarnings(validation)
  }

  if (!validation.valid) {
    displayValidationErrors(validation, diff, contextPack)
    throw new Error("Generated patch has validation errors")
  }
  
  assertPatchAllowed(diff, CONFIG.ALLOWED_PATCH_PATHS)
}

async function checkPatchCanApply(patchFilename, targetDir) {
  await execa("git", ["apply", "--check", patchFilename], {
    cwd: targetDir,
    stdio: "pipe"
  })
}

async function applyPatch(patchFilename, targetDir) {
  await execa("git", ["apply", "--whitespace=fix", patchFilename], {
    cwd: targetDir,
    stdio: "inherit"
  })
}

function displayPatchFailureHelp(patchPath, error) {
  console.error("Failed to apply patch")
  console.error("\nPatch content saved to:", patchPath)
  
  if (error.stderr) {
    console.error("\nGit apply error:")
    console.error(error.stderr)
  }
  
  console.error("\nSuggestions:")
  console.error("  1. Review the patch file: .modernise.patch")
  console.error("  2. Apply manually: cd target && git apply --reject .modernise.patch")
  console.error("  3. Regenerate with better context")
}

export async function applyPatchSafely(patchPath, targetDir) {
  const patchFilename = path.basename(patchPath)
  
  console.log("Applying patch")
  try {
    await checkPatchCanApply(patchFilename, targetDir)
    await applyPatch(patchFilename, targetDir)
  } catch (error) {
    displayPatchFailureHelp(patchPath, error)
    throw new Error("Failed to apply patch - see .modernise.patch for details")
  }
}
