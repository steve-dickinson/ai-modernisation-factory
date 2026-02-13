import readline from "readline"
import { prepareWorkspace } from "./workspace.js"
import { runIntake } from "./intake/run.js"
import { runObserve } from "./observe/run.js"
import { runAdr } from "./adr/run.js"
import { runSlice } from "./slice/run.js"
import { runScaffold } from "./scaffold/run.js"
import { runGate } from "./gate/run.js"
import { runSeed } from "./seed/run.js"
import { runImplement } from "./implement/run.js"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve))
}

function showBanner() {
  console.clear()
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║            🏭  DEFRA MODERNISATION FACTORY  🏭                    ║
║                                                                   ║
║        AI-Assisted Legacy Application Transformation              ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
`)
}

function showMainMenu() {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  MAIN MENU
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  1. Run Full Pipeline (Discovery → Slice → Implementation)
  2. Discovery Phase (Intake → Observe → ADR → Slice)
  3. Implementation Phase (Scaffold → Implement → Gate)
  
  ── Individual Phases ──────────────────────────────────────────────
  
  4. Phase 1: Intake (Capture basic metadata)
  5. Phase 2: Observe (Deep architecture analysis)
  6. Phase 3: ADR (Architecture Decision Record)
  7. Phase 4: Slice (Define vertical slice)
  8. Phase 5: Scaffold (Prepare target repository)
  9. Phase 6: Seed (Create CDP repo from template)
  10. Phase 7: Implement (Generate code)
  11. Phase 8: Gate (Validate quality)
  
  ───────────────────────────────────────────────────────────────────
  
  0. Exit

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
}

async function getCommonInputs() {
  const repo = await question("\n📦 GitHub repository (e.g. DEFRA/rpa-mit-invoice-importer): ")
  const outDir = await question("📁 Output directory [.modernise]: ") || ".modernise"
  return { repo: repo.trim(), outDir }
}

async function getImplementationInputs() {
  const slicePath = await question("\n📄 Slice JSON path: ")
  const targetDir = await question("📁 Target repository directory: ")
  return { slicePath: slicePath.trim(), targetDir: targetDir.trim() }
}

async function runFullPipeline() {
  console.log("\n╔══════════════════════════════════════════════════╗")
  console.log("║  FULL PIPELINE: Discovery → Implementation      ║")
  console.log("╚══════════════════════════════════════════════════╝\n")
  
  const { repo, outDir } = await getCommonInputs()
  
  console.log("\n" + "═".repeat(70))
  console.log("  PHASE 1/7: INTAKE")
  console.log("═".repeat(70))
  const ws = await prepareWorkspace(outDir, repo)
  await runIntake(ws.repoDir, ws.root)
  
  console.log("\n" + "═".repeat(70))
  console.log("  PHASE 2/7: OBSERVE")
  console.log("═".repeat(70))
  await runObserve(ws.repoDir, ws.root, repo)
  
  console.log("\n" + "═".repeat(70))
  console.log("  PHASE 3/7: ADR")
  console.log("═".repeat(70))
  await runAdr({ repoDir: ws.repoDir, outDir: ws.root })
  
  console.log("\n" + "═".repeat(70))
  console.log("  PHASE 4/7: SLICE")
  console.log("═".repeat(70))
  await runSlice({ repoDir: ws.repoDir, outDir: ws.root, repo })
  
  console.log("\n\n✅ Discovery phase complete!")
  console.log("\nNext steps for implementation:")
  console.log("  1. Review slice definition in:", `${outDir}/${repo.replace("/", "__")}/slice-001.json`)
  console.log("  2. Run implementation phase (Option 3 from main menu)")
  
  await question("\nPress Enter to continue...")
}

async function runDiscoveryPhase() {
  console.log("\n╔══════════════════════════════════════════════════╗")
  console.log("║  DISCOVERY PHASE                                 ║")
  console.log("╚══════════════════════════════════════════════════╝\n")
  
  const { repo, outDir } = await getCommonInputs()
  
  console.log("\n" + "═".repeat(70))
  console.log("  PHASE 1/4: INTAKE")
  console.log("═".repeat(70))
  const ws = await prepareWorkspace(outDir, repo)
  await runIntake(ws.repoDir, ws.root)
  
  console.log("\n" + "═".repeat(70))
  console.log("  PHASE 2/4: OBSERVE")
  console.log("═".repeat(70))
  await runObserve(ws.repoDir, ws.root, repo)
  
  console.log("\n" + "═".repeat(70))
  console.log("  PHASE 3/4: ADR")
  console.log("═".repeat(70))
  await runAdr({ repoDir: ws.repoDir, outDir: ws.root })
  
  console.log("\n" + "═".repeat(70))
  console.log("  PHASE 4/4: SLICE")
  console.log("═".repeat(70))
  await runSlice({ repoDir: ws.repoDir, outDir: ws.root, repo })
  
  console.log("\n\n✅ Discovery phase complete!")
  await question("\nPress Enter to continue...")
}

async function runImplementationPhase() {
  console.log("\n╔══════════════════════════════════════════════════╗")
  console.log("║  IMPLEMENTATION PHASE                            ║")
  console.log("╚══════════════════════════════════════════════════╝\n")
  
  const { slicePath, targetDir } = await getImplementationInputs()
  
  console.log("\n" + "═".repeat(70))
  console.log("  PHASE 1/3: SCAFFOLD")
  console.log("═".repeat(70))
  await runScaffold({
    slicePath,
    targetDir,
    createRepo: false
  })
  
  console.log("\n" + "═".repeat(70))
  console.log("  PHASE 2/3: IMPLEMENT")
  console.log("═".repeat(70))
  await runImplement({ slicePath, targetDir })
  
  console.log("\n" + "═".repeat(70))
  console.log("  PHASE 3/3: GATE")
  console.log("═".repeat(70))
  await runGate({ targetDir })
  
  console.log("\n\n✅ Implementation phase complete!")
  await question("\nPress Enter to continue...")
}

async function runIndividualPhase(phase) {
  console.log(`\n╔══════════════════════════════════════════════════╗`)
  console.log(`║  PHASE: ${phase.toUpperCase().padEnd(42)} ║`)
  console.log(`╚══════════════════════════════════════════════════╝\n`)
  
  switch(phase) {
    case "intake": {
      const { repo, outDir } = await getCommonInputs()
      const ws = await prepareWorkspace(outDir, repo)
      await runIntake(ws.repoDir, ws.root)
      break
    }
    case "observe": {
      const { repo, outDir } = await getCommonInputs()
      const ws = await prepareWorkspace(outDir, repo)
      await runObserve(ws.repoDir, ws.root, repo)
      break
    }
    case "adr": {
      const { repo, outDir } = await getCommonInputs()
      const ws = await prepareWorkspace(outDir, repo)
      await runAdr({ repoDir: ws.repoDir, outDir: ws.root })
      break
    }
    case "slice": {
      const { repo, outDir } = await getCommonInputs()
      const ws = await prepareWorkspace(outDir, repo)
      await runSlice({ repoDir: ws.repoDir, outDir: ws.root, repo })
      break
    }
    case "scaffold": {
      const { slicePath, targetDir } = await getImplementationInputs()
      await runScaffold({ slicePath, targetDir, createRepo: false })
      break
    }
    case "seed": {
      const slicePath = await question("\n📄 Slice JSON path: ")
      const outDir = await question("📁 Output directory [.modernise]: ") || ".modernise"
      const destDir = await question("📁 Destination directory (where CDP repo will be created): ")
      const org = await question("🏢 GitHub org [DEFRA]: ") || "DEFRA"
      await runSeed({ slicePath: slicePath.trim(), outDir, destDir: destDir.trim(), org })
      break
    }
    case "implement": {
      const { slicePath, targetDir } = await getImplementationInputs()
      await runImplement({ slicePath, targetDir })
      break
    }
    case "gate": {
      const targetDir = await question("\n📁 Target repository directory: ")
      await runGate({ targetDir: targetDir.trim() })
      break
    }
  }
  
  console.log("\n✅ Phase complete!")
  await question("\nPress Enter to continue...")
}

export async function startInteractive() {
  try {
    while (true) {
      showBanner()
      showMainMenu()
      
      const choice = await question("Select an option (0-11): ")
      
      switch(choice.trim()) {
        case "1":
          await runFullPipeline()
          break
        case "2":
          await runDiscoveryPhase()
          break
        case "3":
          await runImplementationPhase()
          break
        case "4":
          await runIndividualPhase("intake")
          break
        case "5":
          await runIndividualPhase("observe")
          break
        case "6":
          await runIndividualPhase("adr")
          break
        case "7":
          await runIndividualPhase("slice")
          break
        case "8":
          await runIndividualPhase("scaffold")
          break
        case "9":
          await runIndividualPhase("seed")
          break
        case "10":
          await runIndividualPhase("implement")
          break
        case "11":
          await runIndividualPhase("gate")
          break
        case "0":
          console.log("\n👋 Goodbye!\n")
          rl.close()
          process.exit(0)
        default:
          console.log("\n❌ Invalid option. Please select 0-11.")
          await question("\nPress Enter to continue...")
      }
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message)
    rl.close()
    process.exit(1)
  }
}
