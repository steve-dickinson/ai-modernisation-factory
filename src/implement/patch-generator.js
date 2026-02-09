import { extractWithCopilot } from "../copilot/extract.js"
import { extractUnifiedDiff } from "../utils/diff-extract.js"
import { fixDiffHunkHeaders } from "../utils/diff-fix.js"

function extractExistingFiles(contextPack) {
  return contextPack
    .filter(item => item.type === "file")
    .map(item => item.path)
}

function formatContextPack(contextPack) {
  return contextPack.map(item => {
    if (item.type === "dir") {
      return `DIR ${item.path}\nFILES:\n${item.files.join("\n")}\n`
    }
    return `FILE ${item.path}\n---\n${item.text}\n---\n`
  }).join("\n")
}

function buildPromptTemplate(slice, templateKind, existingFiles, formattedContext) {
  const sliceJson = JSON.stringify(slice, null, 2)
  
  return `
You are implementing a modernisation slice into an existing CDP ${templateKind} repo.

You MUST output a SINGLE unified diff ONLY.
No markdown, no commentary, no code fences.

CRITICAL diff generation rules:
1. Before modifying a file, check if it exists in Context Pack
2. For EXISTING files (in Context Pack):
   - Generate proper unified diff with actual line numbers
   - Include surrounding context (3+ lines before/after changes)
   - Use format: @@ -oldStart,oldCount +newStart,newCount @@
   - Example: @@ -1,10 +1,15 @@ means old file lines 1-10, new file lines 1-15
3. For NEW files:
   - Use: @@ -0,0 +1,N @@ where N is number of new lines
4. NEVER use placeholder SHAs like "1234567" or "0000000" in index lines
5. Match exact whitespace and indentation from existing files

Existing files in Context Pack:
${existingFiles.map(f => `- ${f}`).join("\n")}

Baseline rule:
- Do not implement health endpoints unless Slice explicitly requires new behaviour beyond the template baseline

Non-negotiable rules:
- Follow the existing repo structure and patterns shown in the Context Pack
- Prefer modifying existing files over creating new ones
- Do NOT introduce alternative frameworks or architectures
- Do NOT add new runtime dependencies unless the repo already uses them
- If the template uses MongoDB, use the existing Mongo connection/repository pattern (do not replace it)
- CDP runs on AWS: avoid Azure-specific constructs. Use env config and localstack patterns if they already exist

File change allowlist:
- src/** (routes, handlers, services, repositories)
- test/** (tests)
- docs/modernisation/** (docs)
Do NOT change Docker/HelM/pipeline files unless slice explicitly requires it

Slice JSON:
${sliceJson}

Context Pack (existing patterns you must follow):
${formattedContext}

Output:
- unified diff beginning with "diff --git"
`.trim()
}

export async function generatePatch(targetDir, slice, templateKind, contextPack) {
  const existingFiles = extractExistingFiles(contextPack)
  const formattedContext = formatContextPack(contextPack)
  const prompt = buildPromptTemplate(slice, templateKind, existingFiles, formattedContext)
  
  console.log("Generating patch via Copilot")
  const rawOutput = await extractWithCopilot(targetDir, prompt, { mode: "prompt" })
  
  const extractedDiff = extractUnifiedDiff(rawOutput)
  
  console.log("Fixing hunk headers...")
  return fixDiffHunkHeaders(extractedDiff)
}
