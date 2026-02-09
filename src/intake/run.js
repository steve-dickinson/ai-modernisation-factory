import fs from "fs-extra"
import path from "node:path"
import Ajv from "ajv"
import addFormats from "ajv-formats"
import { extractWithCopilot } from "../copilot/extract.js"
import { intakePrompt } from "./prompt.js"
import { renderIntakeMd } from "./render.js"
import { extractFirstJson } from "../utils/json-extract.js";
import { CONFIG } from "../config.js"

export async function runIntake(repoDir, outDir) {
  const schemaPath = path.resolve("schemas/legacy-intake.schema.json")
  const schema = await fs.readJSON(schemaPath)

  const schemaInRepoPath = path.join(repoDir, ".modernise-legacy-intake.schema.json")
  await fs.writeFile(schemaInRepoPath, JSON.stringify(schema, null, 2), "utf8")

  const prompt = intakePrompt(schemaInRepoPath)

  console.log("Extracting intake JSON via Copilot...")
  const raw = await extractWithCopilot(repoDir, prompt)

  let json
  try {
    json = extractFirstJson(raw)
  } catch (e) {
    console.error("Copilot output contained no parseable JSON.");
    console.error("Raw output (first 800 chars):")
    console.error(String(raw).slice(0, CONFIG.COPILOT_ERROR_PREVIEW_LENGTH))
    throw e
 }

  const ajv = new Ajv({ allErrors: true, strict: false })
  addFormats(ajv)
  const validate = ajv.compile(schema)

  if (!validate(json)) {
    console.error("Intake JSON failed schema validation:")
    console.error(validate.errors)
    throw new Error("Schema validation failed")
  }

  const jsonPath = path.join(outDir, "legacy-intake.json")
  const mdPath = path.join(outDir, "legacy-intake.md")

  await fs.writeJSON(jsonPath, json, { spaces: 2 })
  await fs.writeFile(mdPath, renderIntakeMd(json), "utf8")

  console.log("Intake complete")
  console.log(`- ${jsonPath}`)
  console.log(`- ${mdPath}`)

  return { jsonPath, mdPath }
}
