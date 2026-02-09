import fs from "fs-extra"
import { CONFIG } from "../config.js"

export async function validatePaths({ slicePath, targetDir }) {
  if (!(await fs.pathExists(slicePath))) {
    throw new Error(`Slice not found: ${slicePath}`)
  }
  
  if (!(await fs.pathExists(targetDir))) {
    throw new Error(`Target not found: ${targetDir}`)
  }
}

export async function loadSlice(slicePath) {
  return await fs.readJSON(slicePath)
}

export function extractSliceId(slice) {
  return slice.id || "slice-001"
}

export function getTemplateKind(template) {
  if (template === CONFIG.CDP_TEMPLATES.BACKEND) return "backend"
  if (template === CONFIG.CDP_TEMPLATES.FRONTEND) return "frontend"
  return "unknown"
}
