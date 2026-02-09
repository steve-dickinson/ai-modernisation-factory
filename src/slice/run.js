import fs from "fs-extra"
import path from "node:path"
import Ajv from "ajv"
import addFormats from "ajv-formats"
import { extractWithCopilot } from "../copilot/extract.js"
import { extractFirstJson } from "../utils/json-extract.js"
import { slicePrompt } from "./prompt.js"
import { renderSliceMd } from "./render.js"

function looksHealthOnly(slice) {
  const preserve = (slice.preserve?.interfaces || []).join(" ").toLowerCase()
  const scopeIn = (slice.scope?.in || []).join(" ").toLowerCase()
  const text = `${preserve} ${scopeIn}`

  const mentionsHealth = text.includes("health")
  const mentionsBusiness = text.includes("uploads") || text.includes("uploadedfile") || text.includes("queue") || text.includes("import")

  return mentionsHealth && !mentionsBusiness
}

export async function runSlice({ repoDir, outDir, repo }) {
  const schemaPath = path.resolve("schemas/legacy-slice.schema.json")
  const schema = await fs.readJSON(schemaPath)

  const intakePath = path.join(outDir, "legacy-intake.json")
  const observePath = path.join(outDir, "legacy-observe.json")
  const adrPath = path.join(outDir, "adr-0001.json")

  if (!(await fs.pathExists(intakePath))) throw new Error(`Missing ${intakePath} (run intake first)`)
  if (!(await fs.pathExists(observePath))) throw new Error(`Missing ${observePath} (run observe first)`)
  if (!(await fs.pathExists(adrPath))) throw new Error(`Missing ${adrPath} (run adr first)`)

  const schemaInRepo = path.join(repoDir, ".modernise-legacy-slice.schema.json")
  const intakeInRepo = path.join(repoDir, ".modernise-legacy-intake.json")
  const observeInRepo = path.join(repoDir, ".modernise-legacy-observe.json")
  const adrInRepo = path.join(repoDir, ".modernise-adr.json")

  await fs.writeFile(schemaInRepo, JSON.stringify(schema, null, 2), "utf8")
  await fs.copy(intakePath, intakeInRepo)
  await fs.copy(observePath, observeInRepo)
  await fs.copy(adrPath, adrInRepo)

  const prompt = slicePrompt({
    schemaPath: schemaInRepo,
    intakePath: intakeInRepo,
    observePath: observeInRepo,
    adrPath: adrInRepo
  })

  console.log("Generating slice JSON via Copilot...")
  const raw = await extractWithCopilot(repoDir, prompt, { mode: "prompt" })

  let json
  try {
    json = extractFirstJson(raw)
  } catch (e) {
    console.error("No JSON found in Copilot output")
    console.error(String(raw).slice(0, 1200))
    throw e
  }

  const ajv = new Ajv({ allErrors: true, strict: false })
  addFormats(ajv)
  const validate = ajv.compile(schema)

    if (!validate(json)) {
    console.error("Slice JSON failed schema validation:")
    console.error(JSON.stringify(validate.errors, null, 2))

    console.error("\n--- Parsed JSON (first 1200 chars) ---")
    console.error(JSON.stringify(json, null, 2).slice(0, 1200))

    console.error("\n--- Schema path ---")
    console.error(schemaPath)

    throw new Error("Schema validation failed")
  }

  if (looksHealthOnly(json)) {
    throw new Error("Slice appears to only implement template baseline health checks. Regenerate slice with a business-facing interface.")
  }


  if (!json.system?.repo) json.system = { ...(json.system || {}), repo }
  if (!json.system?.name) json.system = { ...(json.system || {}), name: repo }

  const sliceJsonPath = path.join(outDir, "slice-001.json")
  const sliceMdPath = path.join(outDir, "slice-001.md")

  await fs.writeJSON(sliceJsonPath, json, { spaces: 2 })
  await fs.writeFile(sliceMdPath, renderSliceMd(json), "utf8")

  console.log("Slice complete")
  console.log(`- ${sliceJsonPath}`)
  console.log(`- ${sliceMdPath}`)

  return { sliceJsonPath, sliceMdPath }
}
