import fs from "fs-extra"
import path from "node:path"
import { CONFIG } from "../config.js"

const defaultPaths = [
  "package.json",
  "README.md",
  "docker-compose.yaml",
  "catalog-info.yaml",
  "src/index.js",
  "src/server.js",
  "src/routes.js",
  "src/plugins",
  "src/plugins/router.js",
  "src/routes",
  "src/services",
  "src/repositories",
  "test"
]

async function safeRead(targetDir, rel) {
  const p = path.join(targetDir, rel)
  if (!(await fs.pathExists(p))) return null

  const stat = await fs.stat(p)
  if (stat.isDirectory()) {
    const files = (await fs.readdir(p)).slice(0, CONFIG.MAX_DIR_FILES_TO_LIST)
    return { path: rel, type: "dir", files }
  }

  const text = await fs.readFile(p, "utf8")
  return { path: rel, type: "file", text: text.slice(0, CONFIG.MAX_FILE_CONTENT_LENGTH) }
}

export async function buildContextPack(targetDir, extraPaths = []) {
  const paths = [...defaultPaths, ...extraPaths]
  const items = []

  for (const rel of paths) {
    const item = await safeRead(targetDir, rel)
    if (item) items.push(item)
  }

  return items
}
