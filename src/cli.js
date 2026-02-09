import { Command } from "commander"
import { prepareWorkspace } from "./workspace.js"
import { runIntake } from "./intake/run.js"
import { runObserve } from "./observe/run.js"
import { runAdr } from "./adr/run.js"
import { runSlice } from "./slice/run.js"
import { runScaffold } from "./scaffold/run.js"
import { runGate } from "./gate/run.js"
import { runSeed } from "./seed/run.js"
import { runImplement } from "./implement/run.js"

const program = new Command()

program
  .name("modernise")
  .description("Defra modernisation factory CLI")
  .version("0.1.0")

program
  .command("intake")
  .argument("<repo>", "GitHub repo, e.g. DEFRA/rpa-mit-invoice-importer")
  .option("--out <dir>", "Output directory", ".modernise")
  .action(async (repo, opts) => {
    console.log("Modernisation factory - intake")
    const ws = await prepareWorkspace(opts.out, repo)
    await runIntake(ws.repoDir, ws.root)
  })

program
  .command("observe")
  .argument("<repo>", "GitHub repo, e.g. DEFRA/rpa-mit-invoice-importer")
  .option("--out <dir>", "Output directory", ".modernise")
  .action(async (repo, opts) => {
    console.log("Modernisation factory - observe")
    const ws = await prepareWorkspace(opts.out, repo)
    await runObserve(ws.repoDir, ws.root, repo)
  })

program
  .command("adr")
  .argument("<repo>", "GitHub repo, e.g. DEFRA/rpa-mit-invoice-importer")
  .option("--out <dir>", "Output directory", ".modernise")
  .action(async (repo, opts) => {
    console.log("Modernisation factory - adr")
    const ws = await prepareWorkspace(opts.out, repo)
    await runAdr({ repoDir: ws.repoDir, outDir: ws.root })
  })

program
  .command("slice")
  .argument("<repo>", "GitHub repo, e.g. DEFRA/rpa-mit-invoice-importer")
  .option("--out <dir>", "Output directory", ".modernise")
  .action(async (repo, opts) => {
    console.log("Modernisation factory - slice")
    const ws = await prepareWorkspace(opts.out, repo)
    await runSlice({ repoDir: ws.repoDir, outDir: ws.root, repo })
  })

program
  .command("scaffold")
  .requiredOption("--slice <path>", "Path to slice JSON")
  .option("--out <dir>", "Output directory containing artefacts", ".modernise")
  .option("--target <dir>", "Target repo directory (already cloned)")
  .option("--create-repo", "Create a new repo from CDP template and clone it locally", false)
  .option("--org <org>", "GitHub org for repo creation (e.g. DEFRA)")
  .option("--clone-dir <dir>", "Where to clone the new repo locally (e.g. ../modernised)")
  .action(async opts => {
    console.log("Modernisation factory - scaffold")
    await runScaffold({
      outDir: opts.out,
      slicePath: opts.slice,
      targetDir: opts.target,
      createRepo: opts.createRepo,
      org: opts.org,
      cloneDir: opts.cloneDir
    })
  })

program
  .command("gate")
  .requiredOption("--target <dir>", "Target repo directory to validate")
  .action(async opts => {
    console.log("Modernisation factory - gate")
    await runGate({ targetDir: opts.target })
  })

program
  .command("seed")
  .requiredOption("--slice <path>", "Path to slice JSON")
  .requiredOption("--out <dir>", "Output dir containing intake/observe/adr artefacts")
  .requiredOption("--dest <dir>", "Destination folder where local CDP repo will be created")
  .option("--org <org>", "GitHub org for template clone", "DEFRA")
  .action(async opts => {
    console.log("Modernisation factory - seed (local only)")
    await runSeed({
      slicePath: opts.slice,
      outDir: opts.out,
      destDir: opts.dest,
      org: opts.org
    })
  })

program
  .command("implement")
  .requiredOption("--slice <path>", "Path to slice JSON")
  .requiredOption("--target <dir>", "Path to seeded CDP repo")
  .action(async opts => {
    console.log("Modernisation factory - implement")
    await runImplement({
      slicePath: opts.slice,
      targetDir: opts.target
    })
  })

program.parse()
