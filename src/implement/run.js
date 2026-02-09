import { validatePaths, loadSlice, extractSliceId, getTemplateKind } from "./slice-loader.js"
import { createModernisationBranch } from "./branch.js"
import { generatePatch } from "./patch-generator.js"
import { savePatch, validatePatchStructure, applyPatchSafely } from "./patch-applier.js"
import { showChangeSummary } from "./change-summary.js"
import { runGateWithAutoFix } from "./gate-runner.js"
import { displayNextSteps } from "./output.js"
import { buildContextPack } from "./context.js"

export async function runImplement({ slicePath, targetDir }) {
  await validatePaths({ slicePath, targetDir })
  
  const slice = await loadSlice(slicePath)
  const sliceId = extractSliceId(slice)
  const templateKind = getTemplateKind(slice.cdp?.template)
  
  console.log(`Creating branch modernise/${sliceId}`)
  await createModernisationBranch(targetDir, sliceId)
  
  const contextPack = await buildContextPack(targetDir)
  const patch = await generatePatch(targetDir, slice, templateKind, contextPack)
  
  const patchPath = await savePatch(patch, targetDir)
  await validatePatchStructure(patch, contextPack)
  await applyPatchSafely(patchPath, targetDir)
  
  await showChangeSummary(targetDir)
  await runGateWithAutoFix(targetDir, sliceId)
  
  displayNextSteps(targetDir, sliceId)
}
