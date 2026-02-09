import fs from "fs-extra"
import path from "node:path"
import Ajv from "ajv"
import addFormats from "ajv-formats"
import { extractWithCopilot } from "../copilot/extract.js"
import { extractFirstJson } from "../utils/json-extract.js"
import { adrPrompt } from "./prompt.js"
import { renderAdrMd } from "./render.js"
import { CONFIG } from "../config.js"

export async function runAdr({ repoDir, outDir }) {
  const schemaPath = path.resolve("schemas/adr.schema.json")
  const schema = await fs.readJSON(schemaPath)

  const intakePath = path.join(outDir, "legacy-intake.json")
  const observePath = path.join(outDir, "legacy-observe.json")

  if (!(await fs.pathExists(intakePath))) throw new Error(`Missing ${intakePath} (run intake first)`)
  if (!(await fs.pathExists(observePath))) throw new Error(`Missing ${observePath} (run observe first)`)

  const schemaInRepo = path.join(repoDir, ".modernise-adr.schema.json")
  const intakeInRepo = path.join(repoDir, ".modernise-legacy-intake.json")
  const observeInRepo = path.join(repoDir, ".modernise-legacy-observe.json")

  await fs.writeFile(schemaInRepo, JSON.stringify(schema, null, 2), "utf8")
  await fs.copy(intakePath, intakeInRepo)
  await fs.copy(observePath, observeInRepo)

  const prompt = adrPrompt({
    schemaPath: schemaInRepo,
    intakePath: intakeInRepo,
    observePath: observeInRepo
  })

  console.log("Drafting ADR JSON via Copilot...")
  const raw = await extractWithCopilot(repoDir, prompt, { mode: "prompt" })

  let json
  try {
    json = extractFirstJson(raw)
  } catch (e) {
    console.error("No JSON found in Copilot output")
    console.error(String(raw).slice(0, CONFIG.COPILOT_DEBUG_PREVIEW_LENGTH))
    throw e
  }

  const ajv = new Ajv({ allErrors: true, strict: false })
  addFormats(ajv)
  const validate = ajv.compile(schema)

  if (!validate(json)) {
    console.error("ADR JSON failed schema validation:")
    console.error(validate.errors)
    throw new Error("Schema validation failed")
  }

  const adrJsonPath = path.join(outDir, "adr-0001.json")
  const adrMdPath = path.join(outDir, "adr-0001.md")

  await fs.writeJSON(adrJsonPath, json, { spaces: 2 })
  await fs.writeFile(adrMdPath, renderAdrMd(json), "utf8")

  console.log("ADR draft complete")
  console.log(`- ${adrJsonPath}`)
  console.log(`- ${adrMdPath}`)

  return { adrJsonPath, adrMdPath }
}
