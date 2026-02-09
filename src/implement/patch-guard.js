export function assertPatchAllowed(diffText, allowPrefixes) {
  const lines = String(diffText).split("\n")
  const touched = new Set()

  for (const l of lines) {
    if (l.startsWith("+++ b/")) {
      const file = l.replace("+++ b/", "").trim()
      if (file !== "/dev/null") touched.add(file)
    }
  }

  const bad = [...touched].filter(f => !allowPrefixes.some(p => f.startsWith(p)))
  if (bad.length) {
    throw new Error(`Patch touched disallowed files:\n${bad.map(x => `- ${x}`).join("\n")}`)
  }
}
