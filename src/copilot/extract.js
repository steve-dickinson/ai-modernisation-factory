import { execa } from "execa"
import { CopilotClient } from "@github/copilot-sdk"
import { CONFIG } from "../config.js"

async function extractWithSDK(repoDir, prompt) {
  const client = new CopilotClient()
  
  try {
    await client.start()
    
    const session = await client.createSession({
      model: "gpt-5"
    })
    
    let response = ""
    
    const done = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("SDK timeout"))
      }, CONFIG.COPILOT_TIMEOUT_MS)
      
      session.on("assistant.message", (event) => {
        response += event.data.content
      })
      
      session.on("session.idle", () => {
        clearTimeout(timeout)
        resolve()
      })
      
      session.on("error", (event) => {
        clearTimeout(timeout)
        reject(new Error(event.data?.message || "SDK session error"))
      })
    })
    
    await session.send({ prompt })
    await done
    await session.destroy()
    
    return response
  } finally {
    await client.stop()
  }
}

async function extractWithCLI(repoDir, prompt, mode = "prompt") {
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
}

export async function extractWithCopilot(repoDir, prompt, opts = {}) {
  const mode = opts.mode ?? "prompt"
  const useSDK = opts.useSDK ?? CONFIG.COPILOT_USE_SDK
  
  if (useSDK) {
    try {
      console.log("Using Copilot SDK...")
      const sdkResponse = await extractWithSDK(repoDir, prompt)
      
      if (!sdkResponse || !String(sdkResponse).trim()) {
        throw new Error("SDK returned empty response")
      }
      
      if (!sdkResponse.includes("diff --git") && sdkResponse.length < CONFIG.COPILOT_MIN_RESPONSE_LENGTH) {
        throw new Error("SDK response too short or missing diff content")
      }
      
      return sdkResponse
    } catch (sdkError) {
      console.warn("SDK failed, falling back to CLI:", sdkError.message)
    }
  }
  
  try {
    console.log("Using Copilot CLI...")
    return await extractWithCLI(repoDir, prompt, mode)
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
