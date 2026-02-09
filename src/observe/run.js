import fs from "fs-extra"
import path from "node:path"
import Ajv from "ajv"
import addFormats from "ajv-formats"
import { extractWithCopilot } from "../copilot/extract.js"
import { extractFirstJson } from "../utils/json-extract.js"
import { observePrompt } from "./prompt.js"
import { renderObserveMd } from "./render.js"

export async function runObserve(repoDir, outDir, repo) {
  const schemaPath = path.resolve("schemas/legacy-observe.schema.json")
  const schema = await fs.readJSON(schemaPath)

  const schemaInRepoPath = path.join(repoDir, ".modernise-legacy-observe.schema.json")
  await fs.writeFile(schemaInRepoPath, JSON.stringify(schema, null, 2), "utf8")

  const prompt = observePrompt(schemaInRepoPath, repo)

  console.log("Extracting observe JSON via Copilot...")

    let raw = ""
    try {
        raw = await extractWithCopilot(repoDir, prompt, { mode: "prompt" })
    } catch (e) {
        const stderr = String(e.stderr ?? e.message ?? "")
        if (stderr.includes("requested model is not supported") || stderr.includes("model is not supported")) {
            console.log("Model not supported in prompt mode, retrying in interactive mode...")
            raw = await extractWithCopilot(repoDir, prompt, { mode: "interactive" })
        } else {
            throw e
        }
    }


    if (!raw || !String(raw).trim()) {
        console.log("Empty output in prompt mode, retrying in interactive mode...")
        raw = await extractWithCopilot(repoDir, prompt, { mode: "interactive" })
    }

  let json
  try {
    json = extractFirstJson(raw)
  } catch (e) {
    console.error("No JSON found in Copilot output")
    console.error("Raw output (first 1200 chars):")
    console.error(String(raw).slice(0, 1200))
    throw e
  }

  const ajv = new Ajv({ allErrors: true, strict: false })
  addFormats(ajv)
  const validate = ajv.compile(schema)

  if (!validate(json)) {
    console.error("Observe JSON failed schema validation:")
    console.error(validate.errors)
    throw new Error("Schema validation failed")
  }

  const jsonPath = path.join(outDir, "legacy-observe.json")
  const mdPath = path.join(outDir, "legacy-observe.md")

  await fs.writeJSON(jsonPath, json, { spaces: 2 })
  await fs.writeFile(mdPath, renderObserveMd(json), "utf8")

  console.log("Observe complete")
  console.log(`- ${jsonPath}`)
  console.log(`- ${mdPath}`)

  return { jsonPath, mdPath }
}
