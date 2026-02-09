import fs from "fs-extra"
import path from "node:path"

export async function rewriteTemplate(targetDir, repoName) {
  const replacements = [
    {
      file: "package.json",
      fn: json => {
        json.name = repoName
        return json
      }
    },
    {
      file: "package-lock.json",
      fn: json => {
        json.name = repoName
        return json
      },
      optional: true
    },
    {
      file: "helm/Chart.yaml",
      fn: text =>
        text
          .replace(/^name:.*$/m, `name: ${repoName}`)
          .replace(/^appVersion:.*$/m, `appVersion: "0.1.0"`)
    },
    {
      file: "helm/values.yaml",
      fn: text =>
        text
          .replace(/^nameOverride:.*$/m, `nameOverride: ${repoName}`)
          .replace(/^fullnameOverride:.*$/m, `fullnameOverride: ${repoName}`)
    },
    {
      file: "catalog-info.yaml",
      fn: text =>
        text
          .replace(/name:\s*cdp-[^\n]+/g, `name: ${repoName}`)
          .replace(/title:\s*.*$/m, `title: ${repoName}`)
    }
  ]

  for (const r of replacements) {
    const filePath = path.join(targetDir, r.file)
    if (!(await fs.pathExists(filePath))) {
      if (r.optional) continue
      console.warn(`Missing ${r.file}`)
      continue
    }

    if (filePath.endsWith(".json")) {
      const json = await fs.readJSON(filePath)
      const updated = r.fn(json)
      await fs.writeJSON(filePath, updated, { spaces: 2 })
    } else {
      const text = await fs.readFile(filePath, "utf8")
      await fs.writeFile(filePath, r.fn(text))
    }
  }
}
