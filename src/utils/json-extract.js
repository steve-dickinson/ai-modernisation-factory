export function extractFirstJson(text) {
  const s = String(text ?? "")

  const tagged = extractTaggedJson(s)
  if (tagged) return tagged

  const untagged = extractByBrackets(s)
  if (untagged) return untagged

  throw new Error("No valid JSON found in Copilot output")
}

function extractTaggedJson(s) {
  const startTag = "<json>"
  const endTag = "</json>"

  const start = s.indexOf(startTag)
  const end = s.indexOf(endTag)

  if (start === -1 || end === -1 || end <= start) return null

  const payload = s.slice(start + startTag.length, end).trim()

  try {
    return JSON.parse(payload)
  } catch (_) {
    return null
  }
}

function extractByBrackets(s) {
  const starts = []
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (c === "{" || c === "[") starts.push(i)
  }

  for (const start of starts) {
    const slice = s.slice(start)

    try {
      return JSON.parse(slice)
    } catch (_) {
      const candidate = balancedJsonPrefix(slice)
      if (candidate) {
        try {
          return JSON.parse(candidate)
        } catch (_) {}
      }
    }
  }

  return null
}

function balancedJsonPrefix(s) {
  let depthObj = 0
  let depthArr = 0
  let inString = false
  let escape = false

  for (let i = 0; i < s.length; i++) {
    const c = s[i]

    if (inString) {
      if (escape) escape = false
      else if (c === "\\") escape = true
      else if (c === '"') inString = false
      continue
    }

    if (c === '"') inString = true
    else if (c === "{") depthObj++
    else if (c === "}") depthObj--
    else if (c === "[") depthArr++
    else if (c === "]") depthArr--

    if (depthObj === 0 && depthArr === 0 && (c === "}" || c === "]")) {
      return s.slice(0, i + 1)
    }
  }

  return null
}

