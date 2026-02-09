# AI Modernisation Factory

An AI-assisted modernisation pipeline for transforming legacy applications into cloud-native services following Defra's Core Delivery Platform (CDP) standards.

## Overview

The Modernisation Factory is a CLI tool that orchestrates GitHub Copilot to systematically modernise legacy applications through a structured, human-supervised workflow. It breaks down the modernisation process into discrete, reviewable phases — from initial analysis through to code generation and validation.

### Key Principles

- **AI-Assisted, Human-Supervised**: All AI outputs are proposals requiring human review and approval
- **CDP-First Architecture**: All modernised services must use Defra CDP templates
- **Evidence-Based Decisions**: Never invent business rules or domain behaviour
- **Vertical Slicing**: Prefer small, deliverable slices over large rewrites
- **Standards Compliance**: Enforce Defra software development standards through automated gates

## Architecture

The factory implements a seven-phase pipeline:

```
intake → observe → adr → slice → seed → implement → gate
```

### Pipeline Phases

1. **intake** — Capture basic metadata about the legacy system
2. **observe** — Deep analysis of architecture, patterns, and dependencies
3. **adr** — Generate Architecture Decision Record proposing modernisation approach
4. **slice** — Define vertical slice of functionality to implement
5. **seed** — Create new CDP-compliant repository from template
6. **implement** — Generate code changes using Copilot, apply as patches
7. **gate** — Validate standards compliance (linting, tests, structure)

Each phase produces JSON artefacts (validated against schemas) and Markdown summaries for human review.

## Installation

```bash
npm install
npm link  # Makes 'modernise' command available globally
```

### Prerequisites

- Node.js v20+
- Git
- GitHub Copilot authentication (SDK uses logged-in GitHub user)
- GitHub Copilot CLI (`gh copilot` command available) — used as fallback if SDK fails
- Access to Defra CDP templates (cdp-node-backend-template, cdp-node-frontend-template)

## Usage

### Full Workflow Example

Modernising a legacy application:

```bash
# 1. Initial intake (captures basic metadata)
modernise intake DEFRA/rpa-mit-invoice-importer

# 2. Deep observation (analyses architecture)
modernise observe DEFRA/rpa-mit-invoice-importer

# 3. Generate ADR (proposes approach)
modernise adr DEFRA/rpa-mit-invoice-importer

# 4. Define vertical slice
modernise slice DEFRA/rpa-mit-invoice-importer

# 5. Seed new CDP repo
modernise seed \
  --slice .modernise/DEFRA__rpa-mit-invoice-importer/slice-001.json \
  --out .modernise \
  --dest ../modernised

# 6. Implement slice into CDP template
modernise implement \
  --slice .modernise/DEFRA__rpa-mit-invoice-importer/slice-001.json \
  --target ../modernised/rpa-mit-invoice-importer-backend

# 7. Validate standards compliance
modernise gate \
  --target ../modernised/rpa-mit-invoice-importer-backend
```

### Command Reference

#### `modernise intake <repo>`

Capture basic metadata about the legacy system.

**Options:**
- `--out <dir>` — Output directory (default: `.modernise`)

**Outputs:**
- `legacy-intake.json` — Structured metadata
- `legacy-intake.md` — Human-readable summary

#### `modernise observe <repo>`

Analyse architecture, technology stack, and dependencies.

**Options:**
- `--out <dir>` — Output directory (default: `.modernise`)

**Outputs:**
- `legacy-observe.json` — Deep analysis results
- `legacy-observe.md` — Human-readable report

#### `modernise adr <repo>`

Generate Architecture Decision Record proposing modernisation approach.

**Options:**
- `--out <dir>` — Output directory (default: `.modernise`)

**Outputs:**
- `adr-0001.json` — Structured decision record
- `adr-0001.md` — Human-readable ADR

#### `modernise slice <repo>`

Define vertical slice of functionality to implement.

**Options:**
- `--out <dir>` — Output directory (default: `.modernise`)

**Outputs:**
- `slice-001.json` — Slice specification
- `slice-001.md` — Human-readable description

#### `modernise seed`

Create new CDP-compliant repository from template.

**Options:**
- `--slice <path>` — Path to slice JSON (required)
- `--out <dir>` — Output directory containing artefacts
- `--dest <dir>` — Destination folder for local CDP repo (required)
- `--org <org>` — GitHub org for template clone (default: `DEFRA`)

**Behaviour:**
- Clones appropriate CDP template (backend/frontend)
- Rewrites template metadata (name, description)
- Initialises local git repository

#### `modernise implement`

Generate code changes using Copilot and apply as patches.

**Options:**
- `--slice <path>` — Path to slice JSON (required)
- `--target <dir>` — Path to seeded CDP repo (required)

**Workflow:**
1. Creates feature branch `modernise/{slice-id}`
2. Invokes GitHub Copilot to generate unified diff
3. Validates and fixes diff structure
4. Applies patch via `git apply`
5. Runs standards gate with auto-fix retry
6. Reports changes and next manual steps

**Safety Features:**
- Validates patch only modifies permitted paths (no `package.json`, `.git/*`)
- Checks patch structure before applying
- Provides detailed failure diagnostics
- Never auto-commits changes

#### `modernise gate`

Validate CDP standards compliance.

**Options:**
- `--target <dir>` — Target repo directory to validate (required)

**Checks:**
- Required files present (README.md, Dockerfile, package.json)
- Dependencies installed
- `npm run lint` passes
- `npm run test` passes

#### `modernise scaffold`

Alternative to manual seed/implement flow — creates repo and implements slice via GitHub API.

**Options:**
- `--slice <path>` — Path to slice JSON (required)
- `--out <dir>` — Output directory containing artefacts
- `--target <dir>` — Target repo directory (if already cloned)
- `--create-repo` — Create new repo via GitHub API
- `--org <org>` — GitHub org for repo creation
- `--clone-dir <dir>` — Where to clone the new repo locally

## Project Structure

```
src/
├── cli.js                 # Commander CLI entry point
├── config.js              # Centralized configuration constants
├── workspace.js           # Workspace directory management
│
├── intake/                # Phase 1: Capture metadata
│   ├── run.js
│   ├── prompt.js
│   └── render.js
│
├── observe/               # Phase 2: Deep analysis
│   ├── run.js
│   ├── prompt.js
│   └── render.js
│
├── adr/                   # Phase 3: Decision record
│   ├── run.js
│   ├── prompt.js
│   └── render.js
│
├── slice/                 # Phase 4: Define scope
│   ├── run.js
│   ├── prompt.js
│   └── render.js
│
├── seed/                  # Phase 5: Create CDP repo
│   ├── run.js
│   └── rewrite.js         # Template metadata rewriting
│
├── implement/             # Phase 6: Generate code
│   ├── run.js             # Orchestrator (31 lines)
│   ├── branch.js          # Git branch management
│   ├── slice-loader.js    # Validation & loading
│   ├── patch-generator.js # Copilot invocation
│   ├── patch-applier.js   # Patch validation & application
│   ├── patch-guard.js     # Safety checks
│   ├── change-summary.js  # Git diff reporting
│   ├── gate-runner.js     # Standards gate with auto-fix
│   ├── output.js          # User instructions
│   ├── context.js         # Context pack building
│   └── fix-prompt.js      # Gate fix prompt
│
├── gate/                  # Phase 7: Standards validation
│   └── run.js
│
├── copilot/               # GitHub Copilot CLI wrapper
│   └── extract.js
│
└── utils/                 # Shared utilities
    ├── diff-extract.js    # Extract diffs from LLM output
    ├── diff-validate.js   # Validate diff structure
    ├── diff-fix.js        # Fix malformed diffs
    ├── json-extract.js    # Extract JSON from LLM output
    └── slug.js            # String slugification
```

## Configuration

All configuration is centralized in [src/config.js](src/config.js):

```javascript
export const CONFIG = {
  COPILOT_TIMEOUT_MS: 300000,           // 5 minutes
  COPILOT_USE_SDK: true,                // Use SDK first, fallback to CLI
  COPILOT_ERROR_PREVIEW_LENGTH: 800,    // Error output truncation
  MAX_GATE_FIX_ATTEMPTS: 2,             // Auto-fix retry limit
  MAX_FILE_CONTENT_LENGTH: 12000,       // Token management
  PATCH_FILENAME: ".modernise.patch",
  FIX_PATCH_FILENAME: ".modernise-fix.patch",
  ALLOWED_PATCH_PATHS: ["src/**"],      // Safety whitelist
  REQUIRED_CDP_FILES: ["README.md", "Dockerfile", "package.json"],
  CDP_TEMPLATES: {
    BACKEND: "cdp-node-backend-template",
    FRONTEND: "cdp-node-frontend-template"
  }
}
```

### GitHub Copilot Integration

The factory uses the **GitHub Copilot SDK** (`@github/copilot-sdk`) as the primary method for AI-assisted code generation, with automatic fallback to the **Copilot CLI** if the SDK fails.

**SDK Advantages:**
- Programmatic control via TypeScript/Node.js API
- Event-based streaming responses
- Better error handling and retry logic
- More stable than subprocess execution

**CLI Fallback:**
- Used when SDK initialization fails
- Supports legacy `prompt` and `interactive` modes
- Invoked via `execa` subprocess

**To disable SDK** (use CLI only), set `COPILOT_USE_SDK: false` in [src/config.js](src/config.js).

**To force CLI fallback** at runtime:
```javascript
await extractWithCopilot(repoDir, prompt, { useSDK: false })
```

## Schemas

All AI-generated JSON is validated against JSON schemas:

- [schemas/legacy-intake.schema.json](schemas/legacy-intake.schema.json) — Intake metadata
- [schemas/legacy-observe.schema.json](schemas/legacy-observe.schema.json) — Architecture analysis
- [schemas/adr.schema.json](schemas/adr.schema.json) — Architecture Decision Records
- [schemas/legacy-slice.schema.json](schemas/legacy-slice.schema.json) — Vertical slice specifications

## Workflow Details

### How Implement Works

The `implement` command is the most complex phase. It:

1. **Validates slice** — Checks JSON structure, extracts template kind (backend/frontend)
2. **Creates branch** — `modernise/{slice-id}` for isolation
3. **Builds context pack** — Gathers existing CDP files to show Copilot current state
4. **Invokes Copilot** — Passes slice requirements + context, requests unified diff
5. **Extracts diff** — Parses LLM output, handles markdown fences and junk
6. **Fixes diff** — Corrects malformed hunk headers (common LLM mistake)
7. **Validates diff** — Checks structure, SHA presence, line counts
8. **Guards patch** — Ensures only `src/**` files modified (no `package.json`, `.git/*`)
9. **Applies patch** — Uses `git apply --whitespace=fix`
10. **Runs gate** — Validates lint/tests pass, auto-fixes if needed
11. **Reports changes** — Shows git diff summary, provides next steps

### Safety Mechanisms

- **Patch Guard**: Blocks modifications to `package.json`, `.git/*`, `node_modules/*`
- **Pre-validation**: `git apply --check` before actual application
- **No Auto-Commit**: All changes remain unstaged for human review
- **Detailed Errors**: Provides diagnostics and manual fallback instructions
- **Hunk Fix**: Recalculates incorrect line counts in LLM-generated diffs

### Known Limitations

- **Placeholder SHAs**: Copilot CLI often generates `abcdefg` instead of real git SHAs, causing new files to remain untracked
- **Context Window**: Large files (>12KB) are truncated to prevent token overflow
- **LLM Accuracy**: Generated patches may not be perfect; human review is mandatory
- **CDP Templates**: Requires access to Defra GitHub organisation

## Development

### Running Commands Locally

```bash
# Without npm link
node src/cli.js implement --slice <path> --target <dir>

# With npm link
modernise implement --slice <path> --target <dir>
```

### Testing Individual Phases

```bash
# Test intake/observe/adr/slice on a public repo
modernise intake microsoft/vscode
modernise observe microsoft/vscode
modernise adr microsoft/vscode
modernise slice microsoft/vscode

# Test gate on an existing CDP repo
modernise gate --target ../modernised/my-backend

# Test implement with a prepared slice
modernise implement \
  --slice tests/fixtures/slice-001.json \
  --target tests/fixtures/cdp-backend
```

### Code Quality

The codebase follows clean code principles:

- **Single Responsibility**: Each module has one clear purpose
- **Self-Documenting**: Function names and structure replace comments
- **Small Functions**: Most functions <50 lines
- **No Magic Numbers**: All constants in `config.js`
- **Explicit Errors**: Detailed error messages with actionable guidance

Example: `implement/run.js` reduced from 231 lines to 31 lines by extracting focused modules.

## Troubleshooting

### Copilot SDK/CLI Issues

**Problem**: `SDK failed, falling back to CLI: ...`

**Solution**: SDK initialization failed but CLI fallback activated automatically. This is expected behavior. If you see this frequently, check GitHub authentication (`gh auth status`).

---

**Problem**: `SDK timeout`

**Solution**: SDK took longer than 5 minutes to respond. Retry or simplify prompt.

---

**Problem**: `SDK session error`

**Solution**: SDK encountered an error during execution. Factory automatically falls back to CLI. To debug, temporarily disable SDK: set `COPILOT_USE_SDK: false` in [src/config.js](src/config.js).

---

### Copilot CLI Errors

**Problem**: `Error: GitHub Copilot returned HTTP 500`

**Solution**: Rate limit or service unavailability. Wait and retry.

---

**Problem**: `No unified diff found in Copilot output`

**Solution**: Copilot didn't generate code. Review prompt, ensure context is sufficient.

---

**Problem**: `Permission denied and could not request permission from user`

**Solution**: Copilot CLI prompt mode failed. Factory falls back to interactive mode automatically.

### Patch Application Failures

**Problem**: `corrupt patch at line N`

**Solution**: LLM generated malformed diff. Review `.modernise.patch`, manually fix, or re-run with different prompt.

---

**Problem**: `git apply --check` fails with `does not match index`

**Solution**: Patch targets wrong file state. Ensure working directory is clean, or regenerate patch.

### Gate Failures

**Problem**: `Standards gate failed (missing files)`

**Solution**: CDP template incomplete. Ensure you're using latest template from Defra.

---

**Problem**: `npm run lint` fails

**Solution**: Generated code has linting errors. Factory auto-fixes once. If still fails, manual review needed.

## Contributing

### Adding New Phases

1. Create directory in `src/` (e.g., `src/refactor/`)
2. Implement `run.js`, `prompt.js`, `render.js`
3. Add schema to `schemas/` if generating JSON
4. Register command in `src/cli.js`
5. Update this README

### Modifying Configuration

All constants are in [src/config.js](src/config.js). Avoid hardcoding values elsewhere.

### Extending Patch Guard

To allow modifications to additional paths, update `CONFIG.ALLOWED_PATCH_PATHS` in [src/config.js](src/config.js).

## References

- [Defra CDP Templates](https://github.com/DEFRA/cdp-node-backend-template)
- [GitHub Copilot CLI](https://docs.github.com/en/copilot/github-copilot-in-the-cli)
- [Unified Diff Format](https://www.gnu.org/software/diffutils/manual/html_node/Unified-Format.html)

## License

ISC

## Support

For questions or issues related to Defra modernisation projects, consult the Defra CDP team and software development standards documentation.