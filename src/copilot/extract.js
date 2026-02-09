import { execa } from "execa"
import { CONFIG } from "../config.js"

export async function extractWithCopilot(repoDir, prompt, opts = {}) {
  const mode = opts.mode ?? "prompt"

  try {
    if (mode === "prompt") {
      const { stdout } = await execa("copilot", ["-p", prompt], {
        cwd: repoDir,
        timeout: CONFIG.COPILOT_TIMEOUT_MS
      })
      return stdout
    }

    if (mode === "interactive") {
      const { stdout } = await execa("copilot", ["-i"], {
        cwd: repoDir,
        timeout: CONFIG.COPILOT_TIMEOUT_MS,
        input: prompt + "\n"
      })
      return stdout
    }

    throw new Error(`Unknown Copilot mode: ${mode}`)
  } catch (err) {
    const stderr = err.stderr ? String(err.stderr) : ""
    const stdout = err.stdout ? String(err.stdout) : ""

    console.error("\nCopilot invocation failed")
    console.error("Exit code:", err.exitCode)
    console.error("Command:", err.command)
    if (stderr) console.error("\n--- Copilot stderr ---\n" + stderr)
    if (stdout) console.error("\n--- Copilot stdout (preview) ---\n" + stdout.slice(0, CONFIG.COPILOT_ERROR_PREVIEW_LENGTH))

    throw err
  }
}
