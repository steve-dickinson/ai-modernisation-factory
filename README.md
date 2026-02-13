# AI Modernisation Factory

An AI-assisted modernisation pipeline for transforming legacy applications into cloud-native services following Defra's Core Delivery Platform (CDP) standards.

> **💡 New:** Interactive menu-driven mode makes it easy to run the full pipeline or individual phases with guided prompts.

## Table of Contents

- [Quickstart](#quickstart)
- [Glossary](#glossary)
- [Overview](#overview)
- [Interactive Mode](#interactive-mode)
- [Architecture](#architecture)
- [Modernisation Strategy](#modernisation-strategy)
- [Installation](#installation)
- [Usage](#usage)
  - [Command-Line Interface](#command-line-interface)
  - [Command Reference](#command-reference)
- [Common Issues & Solutions](#common-issues--solutions)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [GitHub Copilot Integration](#github-copilot-integration)
- [How Implement Works](#how-implement-works)
- [Code Quality](#code-quality)
- [FAQ](#faq)
- [Advanced Topics](#advanced-topics)
- [Contributing](#contributing)
- [References](#references)

## Quickstart

**Goal:** Run your first modernisation analysis in < 5 minutes.

### Prerequisites

Ensure you have these tools installed:

1. Node.js v20+
   - macOS: `brew install node`
   - Ubuntu: `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs`
   - Windows/Other: Download from [nodejs.org](https://nodejs.org/)

2. Git
   - Usually pre-installed. If not: `brew install git` (macOS) or `sudo apt install git` (Ubuntu)

3. GitHub CLI
   - macOS: `brew install gh`
   - Ubuntu: `sudo apt install gh`
   - Windows: `winget install GitHub.cli`
   - Other: Visit [cli.github.com](https://cli.github.com/)

4. GitHub Authentication
   ```bash
   gh auth login
   ```

5. GitHub Copilot CLI
   ```bash
   gh extension install github/gh-copilot
   ```

6. Verify Setup
```bash
node --version          # v20.0.0 or higher
git --version           # 2.x or higher
gh auth status          # Logged in to github.com
gh copilot --version    # gh extension is installed
```

### Step 1: Install Factory

```bash
npm install && npm link
```

### Step 2: Run First Analysis

```bash
modernise intake DEFRA/rpa-mit-invoice-importer
```

Expected output:

```
Modernisation factory - intake
✓ Workspace prepared
✓ Repository cloned
✓ Analysing with Copilot...
✓ Analysis complete

📄 Outputs:
  .modernise/DEFRA__rpa-mit-invoice-importer/legacy-intake.json
  .modernise/DEFRA__rpa-mit-invoice-importer/legacy-intake.md
```

Takes ~2 minutes. Review the generated JSON and Markdown files.

### Step 3: Try Interactive Mode

```bash
modernise
```

Select option 5 (Observe) to continue with deeper architecture analysis.

## Glossary

- **CDP (Core Delivery Platform)**: Defra's standardized infrastructure templates for cloud-native Node.js services. All modernised applications must use CDP templates (`cdp-node-backend-template` or `cdp-node-frontend-template`).

- **ADR (Architecture Decision Record)**: A document capturing a significant architectural decision, its context, and rationale. The factory generates ADRs proposing modernisation approaches.

- **Vertical Slice**: A complete user-facing feature implemented across all layers (route → handler → service → repository). The factory modernises one slice at a time rather than rewriting entire applications.

- **Unified Diff**: A standardized patch format showing file changes (`diff --git`, `---`, `+++`, `@@` headers). Git uses this format for patches. The factory asks Copilot to generate unified diffs.

- **Hunk**: A section of a unified diff representing contiguous changed lines. Format: `@@ -oldStart,oldCount +newStart,newCount @@`.

- **Scaffold**: The process of preparing a target repository for code generation. Can involve creating a new repo or validating an existing one.

- **Seed**: Creating a new repository from a CDP template and customizing it with project-specific metadata.

- **Gate**: A quality checkpoint that validates standards compliance (linting, testing, file structure). The factory runs gates automatically after code generation.

## Overview

The Modernisation Factory orchestrates GitHub Copilot to systematically modernise legacy applications through a structured, human-supervised workflow. It breaks down the modernisation process into discrete, reviewable phases — from initial analysis through to code generation and validation.

### Key Principles

- **AI-Assisted, Human-Supervised**: All AI outputs are proposals requiring human review and approval
- **CDP-First Architecture**: All modernised services must use Defra CDP templates
- **Evidence-Based Decisions**: Never invent business rules or domain behaviour
- **Vertical Slicing**: Prefer small, deliverable slices over large rewrites
- **Standards Compliance**: Enforce Defra software development standards through automated gates

## Interactive Mode

**When to use:** Learning the workflow, one-off modernisations, manual exploration

Launch with zero arguments for a guided experience:

```bash
modernise
```

Menu options:

- Option 1: Run Full Pipeline (Discovery → Implementation) — Automates all 8 phases
- Option 2: Discovery Phase (Intake → Observe → ADR → Slice) — Analysis only
- Option 3: Implementation Phase (Scaffold → Implement → Gate) — Code generation only
- Options 4-11: Individual phases with context-aware prompts

Example session:

```
╔═══════════════════════════════════════════════════════════════════╗
║            🏭  DEFRA MODERNISATION FACTORY  🏭                    ║
╚═══════════════════════════════════════════════════════════════════╝

  1. Run Full Pipeline
  2. Discovery Phase
  3. Implementation Phase
  4. Phase 1: Intake
  ...

Select an option (0-11): 4

📦 GitHub repository (e.g. DEFRA/rpa-mit-invoice-importer): torvalds/linux
📁 Output directory [.modernise]: 

═══════════════════════════════════════════════════════════════
  PHASE 1/8: INTAKE
═══════════════════════════════════════════════════════════════
✓ Workspace prepared
✓ Repository cloned
✓ Analysis complete
```

Features:

- Visual progress indicators
- Input validation with defaults
- Automatic phase sequencing
- Error handling with retry prompts

## Architecture

The factory implements an eight-phase pipeline:

```
intake → observe → adr → slice → scaffold → seed → implement → gate
```

### Pipeline Phases

1. **intake** — Capture basic metadata about the legacy system
2. **observe** — Deep analysis of architecture, patterns, and dependencies
3. **adr** — Generate Architecture Decision Record proposing modernisation approach
4. **slice** — Define vertical slice of functionality to implement
5. **scaffold** — Prepare target repository (alternative to manual setup)
6. **seed** — Create new CDP-compliant repository from template
7. **implement** — Generate code changes using Copilot, apply as patches
8. **gate** — Validate standards compliance (linting, tests, structure)

Each phase produces JSON artefacts (validated against schemas) and Markdown summaries for human review.

## Modernisation Strategy

### The Multi-Slice Approach

**One slice = One complete user-facing feature.** To modernise an entire application, you'll define and implement **multiple slices** incrementally.

Example progression:

```
Legacy app with 30 endpoints:
├─ Slice 1: GET /users/:id          Week 1  ✅ Deployed
├─ Slice 2: POST /users             Week 2  ✅ Deployed
├─ Slice 3: GET /uploads/:userId    Week 3  ✅ Deployed
├─ Slice 4: POST /auth/login        Week 4  ⏳ In progress
...
└─ Slice 30: Complex workflow       Week 30 📋 Planned
```

Each slice:

- Goes through all layers (route → handler → service → repository)
- Is independently testable and deployable
- Takes ~1 hour total (5 min slice definition + 10 min implement + 45 min review)
- Reduces risk vs "big bang" rewrite

### How Many Slices Will You Need?

| Legacy App Size | Typical Slices | Timeline |
|----------------|---------------|----------|
| Small (5-10 endpoints) | 10-15 slices | 1-2 months |
| Medium (20-30 endpoints) | 30-50 slices | 3-6 months |
| Large (50+ endpoints) | 100+ slices | 6-12 months |

**You don't need to complete all slices before going live!**

### Recommended Slice Sequence

Phase 1: Read-only endpoints (low risk)

- `GET /users/:id`, `GET /uploads/:userId`, `GET /health`
- Safe to deploy early
- Build confidence with team

Phase 2: Simple writes (medium risk)

- `POST /users`, `PUT /users/:id`, `DELETE /users/:id`
- Standard CRUD operations
- Establish patterns

Phase 3: Complex workflows (high risk)

- `POST /auth/login`, `POST /payments/process`
- Authentication, transactions, integrations
- Requires careful review

Phase 4: Infrastructure

- Background jobs, scheduled tasks
- After core features stable

### Incremental Delivery Model

You can deploy incrementally:

```
MVP (20-30% of slices):
├─ Core user journeys work
├─ Most-used endpoints migrated
├─ Legacy handles edge cases
└─ Deploy to production ✅

Feature Parity (70-80% of slices):
├─ All user-facing features
├─ Legacy handles only admin
└─ Majority traffic on new system ✅

Full Migration (100% of slices):
├─ Everything in new system
├─ Legacy decommissioned
└─ Complete modernisation ✅
```

Benefits:

- Users get value early
- Team learns and adapts
- Risk spread over time
- Revenue/efficiency gains sooner

### Working with Multiple Slices

Sequential (typical):

```bash
# Week 1: Slice 1
modernise slice DEFRA/my-app          # Define slice-001.json
modernise implement --slice slice-001.json --target ../new-app
# Review, test, deploy

# Week 2: Slice 2  
modernise slice DEFRA/my-app          # Define slice-002.json
modernise implement --slice slice-002.json --target ../new-app
# Review, test, deploy
```

Parallel (advanced - multiple developers):

```bash
# Developer A: Slice 1
modernise slice DEFRA/my-app --out .modernise/dev-a
modernise implement --slice .modernise/dev-a/slice-001.json --target ../new-app
# Creates branch: modernise/slice-001

# Developer B: Slice 2 (simultaneously)
modernise slice DEFRA/my-app --out .modernise/dev-b  
modernise implement --slice .modernise/dev-b/slice-002.json --target ../new-app
# Creates branch: modernise/slice-002

# Merge branches independently after review
```

### Tracking Progress

Create a slice inventory to manage modernisation:

```markdown
# Modernisation: my-legacy-app

## Completed (15%)
- [x] Slice 1: GET /users/:id ✅ Production
- [x] Slice 2: GET /uploads/:userId ✅ Production  
- [x] Slice 3: POST /users ✅ Production

## In Progress (5%)
- [ ] Slice 4: POST /auth/login (code review)

## Planned (80%)
- [ ] Slice 5: DELETE /users/:id
- [ ] Slice 6: GET /reports
... (40 more slices)
```

Key insight: Modernisation is a marathon, not a sprint. The factory helps you run it efficiently — 10-20 slices per month vs 6+ months for traditional rewrite.

## Installation

```bash
npm install
npm link  # Makes 'modernise' command available globally
```

### Prerequisites

Required:

- Node.js v20+ (tested on v20.20.0)
- Git (any recent version)
- GitHub Copilot Subscription (Pro or Enterprise)
- GitHub Authentication via `gh` CLI

Required for Defra projects:

- Access to Defra GitHub organization
- Access to CDP templates (`cdp-node-backend-template`, `cdp-node-frontend-template`)

Verify your environment:

```bash
# Check Node.js version
node --version
# Expected: v20.0.0 or higher

# Check Git
git --version
# Expected: git version 2.x or higher

# Check GitHub CLI
gh --version
# Expected: gh version 2.x or higher

# Verify GitHub authentication  
gh auth status
# Expected: "Logged in to github.com as <username>"

# Check Copilot CLI
gh copilot --version
# Expected: Shows copilot extension is installed

# Test Copilot access
echo "console.log('hello')" | gh copilot suggest --target shell
# Expected: Copilot suggests a command (confirms subscription active)
```

If checks fail:

- Node.js: Install from [nodejs.org](https://nodejs.org/)
- GitHub CLI: `brew install gh` or see [cli.github.com](https://cli.github.com/)
- Authenticate: `gh auth login`
- Copilot CLI: `gh extension install github/gh-copilot`
- Copilot subscription: Enable at [github.com/features/copilot](https://github.com/features/copilot)

Performance Expectations:

- Disk space: ~500MB per legacy repo clone + ~100MB for CDP templates
- Intake phase: 1-3 minutes (depends on repo size)
- Observe phase: 2-5 minutes
- Implement phase: 3-8 minutes (includes Copilot generation + validation)
- Total pipeline: 15-30 minutes for typical project

## Usage

Two modes available:

1. Interactive Mode (recommended for learning): `modernise` with no arguments
2. Command-Line Interface (recommended for automation): `modernise <command> [options]`

### Command-Line Interface

When to use: CI/CD pipelines, automation, scripting, batch processing

Full Workflow Example:

```bash
# 1. Intake - Capture basic metadata (~2 min)
modernise intake torvalds/linux --out .modernise

# Expected output:
# ✓ Workspace prepared
# ✓ Repository cloned  
# ✓ Analysis complete
# 📄 .modernise/torvalds__linux/legacy-intake.json
# 📄 .modernise/torvalds__linux/legacy-intake.md

# 2. Observe - Deep architecture analysis (~3 min)
modernise observe torvalds/linux --out .modernise

# Expected output:
# ✓ Loading intake data
# ✓ Analysing architecture...
# 📄 .modernise/torvalds__linux/legacy-observe.json
# 📄 .modernise/torvalds__linux/legacy-observe.md

# 3. ADR - Generate Architecture Decision Record (~2 min)
modernise adr torvalds/linux --out .modernise

# Expected output:
# ✓ Generating ADR...
# 📄 .modernise/torvalds__linux/adr-0001.json
# 📄 .modernise/torvalds__linux/adr-0001.md

# 4. Slice - Define vertical slice (~3 min)
modernise slice torvalds/linux --out .modernise

# Expected output:
# ✓ Defining slice...
# 📄 .modernise/torvalds__linux/slice-001.json
# 📄 .modernise/torvalds__linux/slice-001.md

# 5. Seed - Create CDP repo (requires Defra access)
modernise seed \
  --slice .modernise/torvalds__linux/slice-001.json \
  --out .modernise \
  --dest ../modernised \
  --org DEFRA

# Expected output:
# ✓ Cloning CDP template...
# ✓ Rewriting metadata...
# ✓ Repository created at ../modernised/linux-backend

# 6. Implement - Generate code (~5 min)
modernise implement \
  --slice .modernise/torvalds__linux/slice-001.json \
  --target ../modernised/linux-backend

# Expected output:
# ✓ Branch created: modernise/slice-001
# ✓ Generating patch with Copilot...
# ✓ Patch validated
# ✓ Changes applied
# ✓ Tests passed (15/15)
# 📊 Modified: 3 files (+127, -0)

# 7. Gate - Validate standards (~1 min)
modernise gate --target ../modernised/linux-backend

# Expected output:
# ✓ Required files present
# ✓ Dependencies installed
# ✓ Linting passed
# ✓ Tests passed (15/15)
# ✅ All gates passed
```

### Command Reference
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

Options:

- `--out <dir>` — Output directory (default: `.modernise`)

Outputs:

- `legacy-intake.json` — Structured metadata
- `legacy-intake.md` — Human-readable summary

#### `modernise observe <repo>`

Analyse architecture, technology stack, and dependencies.

Options:

- `--out <dir>` — Output directory (default: `.modernise`)

Outputs:

- `legacy-observe.json` — Deep analysis results
- `legacy-observe.md` — Human-readable report

#### `modernise adr <repo>`

Generate Architecture Decision Record proposing modernisation approach.

Options:

- `--out <dir>` — Output directory (default: `.modernise`)

Outputs:

- `adr-0001.json` — Structured decision record
- `adr-0001.md` — Human-readable ADR

#### `modernise slice <repo>`

Define vertical slice of functionality to implement.

Options:

- `--out <dir>` — Output directory (default: `.modernise`)

Outputs:

- `slice-001.json` — Slice specification
- `slice-001.md` — Human-readable description

#### `modernise seed`

Create new CDP-compliant repository from template.

Options:

- `--slice <path>` — Path to slice JSON (required)
- `--out <dir>` — Output directory containing artefacts
- `--dest <dir>` — Destination folder for local CDP repo (required)
- `--org <org>` — GitHub org for template clone (default: `DEFRA`)

Behaviour:

- Clones appropriate CDP template (backend/frontend)
- Rewrites template metadata (name, description)
- Initialises local git repository

#### `modernise implement`

Generate code changes using Copilot and apply as patches.

Options:

- `--slice <path>` — Path to slice JSON (required)
- `--target <dir>` — Path to seeded CDP repo (required)

Workflow:

1. Creates feature branch `modernise/{slice-id}`
2. Invokes GitHub Copilot to generate unified diff
3. Validates and fixes diff structure
4. Applies patch via `git apply`
5. Runs standards gate with auto-fix retry
6. Reports changes and next manual steps

Safety Features:

- Validates patch only modifies permitted paths (no `package.json`, `.git/*`)
- Checks patch structure before applying
- Provides detailed failure diagnostics
- Never auto-commits changes

#### `modernise gate`

Validate CDP standards compliance.

Options:

- `--target <dir>` — Target repo directory to validate (required)

Checks:

- Required files present (README.md, Dockerfile, package.json)
- Dependencies installed
- `npm run lint` passes
- `npm run test` passes

#### `modernise scaffold`

Alternative to manual seed/implement flow — creates repo and implements slice via GitHub API.

Options:

- `--slice <path>` — Path to slice JSON (required)
- `--out <dir>` — Output directory containing artefacts
- `--target <dir>` — Target repo directory (if already cloned)
- `--create-repo` — Create new repo via GitHub API
- `--org <org>` — GitHub org for repo creation
- `--clone-dir <dir>` — Where to clone the new repo locally

## FAQ

### Do I need a GitHub Copilot subscription?

Yes. The factory requires an active GitHub Copilot subscription (Individual, Pro, or Enterprise). Free trial accounts work for testing.

Verify access: `gh copilot suggest --target shell "list files"`

### Can I use this outside of Defra?

Partially. Phases 1-4 (intake, observe, adr, slice) work with any GitHub repository. Phases 5-8 (scaffold, seed, implement, gate) require:

- Access to Defra CDP templates, OR
- Modification of `CDP_TEMPLATES` in config.js to use your own templates

### How long does a full pipeline take?

15-30 minutes for a typical project:

- Discovery phases (1-4): 8-13 minutes
- Implementation phases (5-8): 7-17 minutes

Large repositories (>10K files) may take longer.

### What if I don't have access to the legacy repository?

You need read access to clone and analyze the repository. For private repos, ensure:

1. `gh auth status` shows you're logged in
2. Your GitHub account has read access to the target organization
3. Use organization/repo format (e.g., `DEFRA/my-repo`)

### Can I resume a failed pipeline?

Yes. Each phase is independent. If phase N fails:

1. Review the error output
2. Fix the issue (e.g., validate prerequisites)
3. Re-run that specific phase: `modernise <phase-name> ...`

Generated artifacts persist in `.modernise/` directory.

### Does this work with non-Node.js projects?

No. The factory is designed for modernising legacy applications into Node.js microservices using Defra's CDP templates. Source legacy applications can be any language, but output is always Node.js.

### Is the generated code production-ready?

No. All AI-generated code requires human review and testing. The factory provides:

- Automated linting and unit testing
- Standards compliance checks
- Safe git branching (no auto-commits)

Manual review checklist:

- ✅ Business logic correctness
- ✅ Security (no hardcoded secrets, proper auth)
- ✅ Error handling completeness
- ✅ Performance implications

### Can I customize the prompts?

Yes. Prompts are in `src/*/prompt.js` files:

- `src/intake/prompt.js` - Intake analysis prompt
- `src/observe/prompt.js` - Architecture analysis prompt
- `src/adr/prompt.js` - ADR generation prompt
- `src/slice/prompt.js` - Slice definition prompt
- `src/implement/context.js` - Implementation prompt builder

Edit these files to adjust AI behavior.

### What happens to my data?

- Repository data: Cloned locally to `.modernise/` and temporary directories
- AI prompts: Sent to GitHub Copilot service (subject to GitHub's privacy policy)
- Generated artifacts: Stored locally in `.modernise/` directory
- No telemetry: The factory does not collect or send usage data

## Common Issues & Solutions

### Quick Error Reference

| Error Message | Section | Quick Fix |
|---------------|---------|-----------|
| `SDK timeout` | [#sdk-timeout](#sdk-timeout) | Retry or increase timeout |
| `No unified diff found` | [#no-diff-found](#no-unified-diff-found) | Simplify prompt or add context |
| `corrupt patch at line N` | [#corrupt-patch](#corrupt-patch) | Regenerate patch |
| `git apply --check fails` | [#git-apply-fails](#git-apply-fails) | Clean working directory |
| `SDK failed, falling back to CLI` | [#sdk-fallback](#sdk-fallback) | Normal behavior, no action |
| `Permission denied` | [#permission-denied](#permission-denied) | Check GitHub auth |
| `Standards gate failed` | [#gate-failed](#gate-failed) | Review lint/test errors |

### SDK Timeout

Error: `SDK timeout - operation exceeded 300000ms`

Cause: Copilot took longer than 5 minutes to respond (large context, complex prompt, or service slowdown)

Solutions:

1. Retry immediately - May succeed on second attempt
2. Simplify the request - Break into smaller slices
3. Increase timeout - Edit `COPILOT_TIMEOUT_MS` in `src/config.js`
4. Check context size - Large files are auto-truncated at 12KB

### No Unified Diff Found

Error: `No unified diff found in Copilot output`

Cause: Copilot generated plain text instead of a code patch

Solutions:

1. Review slice definition - Ensure requirements are clear and specific
2. Check existing code - Scaffold phase may have failed
3. Add more context - Copilot needs to see existing file structure
4. Retry - AI responses vary, second attempt may work

Debugging:

```bash
# Check the preview output in error message
# Look for what Copilot actually generated
# If it's explaining instead of coding, prompt is too vague
```

### Corrupt Patch

Error: `corrupt patch at line N` or `malformed hunk header`

Cause: Copilot generated invalid unified diff syntax

Solutions:

1. Auto-fix attempted - Factory tries to fix hunks automatically
2. Review `.modernise.patch` - Manually inspect the patch file
3. Regenerate - Re-run implement phase
4. Manual fallback - Apply changes manually based on Copilot's intent

### Git Apply Fails

Error: `error: patch failed: src/file.js:42` or `does not match index`

Cause: Patch targets wrong file state (dirty working directory or wrong branch)

Solutions:

1. Clean working directory:
   ```bash
   cd ../modernised/target-repo
   git status            # Check for uncommitted changes
   git stash             # Or commit changes
   ```

2. Verify branch:
   ```bash
   git branch            # Should show modernise/slice-XXX
   git checkout main     # Return to baseline if needed
   ```

3. Regenerate patch - May need to re-run implement

### SDK Fallback

Message: `SDK failed, falling back to CLI: ...`

Cause: GitHub Copilot SDK initialization failed

Impact: None - Factory automatically uses CLI fallback. This is expected behavior.

Why it happens:

- First-time SDK usage
- SDK session expiry
- Transient network issues

Action required: None. Watch for CLI fallback success message.

To disable SDK entirely (use CLI only):

```javascript
// src/config.js
export const CONFIG = {
  COPILOT_USE_SDK: false,  // Change to false
  // ...
}
```

### Permission Denied

Error: `Permission denied and could not request permission from user`

Cause: GitHub Copilot CLI couldn't get authorization

Solutions:

1. Check authentication:
   ```bash
   gh auth status
   gh auth login        # If not logged in
   ```

2. Verify Copilot access:
   ```bash
   gh copilot suggest --target shell "test command"
   ```

3. Re-authenticate:
   ```bash
   gh auth logout
   gh auth login
   gh extension install github/gh-copilot
   ```

### Gate Failed

Error: `Standards gate failed (lint errors)` or `Tests failed: 12 passed, 3 failed`

Cause: Generated code doesn't meet quality standards

What the factory does:

1. First attempt: Automatically tries to fix linting issues
2. Second attempt: Re-runs gate after auto-fix
3. Still failing: Reports errors and stops

Solutions:

1. Review errors:
   ```bash
   cd ../modernised/target-repo
   npm run lint         # See specific lint errors
   npm run test         # See test failures
   ```

2. Manual fixes:
   - Edit files based on error messages
   - Run `npm run lint -- --fix` for auto-fixable issues
   - Update tests to match new code

3. Re-run gate:
   ```bash
   modernise gate --target ../modernised/target-repo
   ```

### Missing CDP Templates

Error: `Failed to clone CDP template` or `Repository not found`

Cause: No access to Defra GitHub organization or templates

Solutions:

1. Verify org access:
   ```bash
   gh repo list DEFRA --limit 5
   # Should list repositories if you have access
   ```

2. Request access - Contact Defra CDP team

3. Use custom templates - Edit `src/config.js`:
   ```javascript
   export const CONFIG = {
     CDP_TEMPLATES: {
       BACKEND: "your-org/your-backend-template",
       FRONTEND: "your-org/your-frontend-template"
     }
   }
   ```

## Project Structure

```
src/
├── cli.js                 # Commander CLI entry point
├── interactive.js         # Interactive menu-driven mode
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
├── scaffold/              # Phase 5: Prepare target
│   └── run.js
│
├── seed/                  # Phase 6: Create CDP repo
│   ├── run.js
│   └── rewrite.js         # Template metadata rewriting
│
├── implement/             # Phase 7: Generate code
│   ├── run.js             # Orchestrator
│   ├── context.js         # Context pack building
│   ├── fix-prompt.js      # Gate fix prompt
│   └── patch-guard.js     # Safety checks
│
├── gate/                  # Phase 8: Standards validation
│   └── run.js
│
├── copilot/               # GitHub Copilot integration
│   └── extract.js         # SDK + CLI fallback
│
└── utils/                 # Shared utilities
    ├── diff-extract.js    # Extract diffs from LLM output
    ├── diff-validate.js   # Validate diff structure
    ├── json-extract.js    # Extract JSON from LLM output
    └── slug.js            # String slugification
```

## Configuration

All configuration is centralized in [src/config.js](src/config.js). This eliminates magic numbers and makes the codebase self-documenting:

```javascript
export const CONFIG = {
  COPILOT_TIMEOUT_MS: 300000,              // 5 minutes for AI operations
  COPILOT_USE_SDK: true,                   // Use SDK first, fallback to CLI
  COPILOT_MIN_RESPONSE_LENGTH: 50,         // Minimum valid response length
  COPILOT_ERROR_PREVIEW_LENGTH: 800,       // Error output truncation
  COPILOT_DEBUG_PREVIEW_LENGTH: 1200,      // Debug output truncation
  MAX_GATE_FIX_ATTEMPTS: 2,                // Auto-fix retry limit
  MAX_FILE_CONTENT_LENGTH: 12000,          // Token management
  PATCH_FILENAME: ".modernise.patch",
  FIX_PATCH_FILENAME: ".modernise-fix.patch",
  ALLOWED_PATCH_PATHS: ["src/**"],         // Safety whitelist
  REQUIRED_CDP_FILES: ["README.md", "Dockerfile", "package.json"],
  CDP_TEMPLATES: {
    BACKEND: "cdp-node-backend-template",
    FRONTEND: "cdp-node-frontend-template"
  }
}
```

### GitHub Copilot Integration

The factory uses the GitHub Copilot SDK (`@github/copilot-sdk`) as the primary method for AI-assisted code generation, with automatic fallback to the Copilot CLI if the SDK fails.

SDK Advantages:

- Programmatic control via TypeScript/Node.js API
- Event-based streaming responses
- Better error handling and retry logic
- More stable than subprocess execution

CLI Fallback:

- Used when SDK initialization fails
- Supports legacy `prompt` and `interactive` modes
- Invoked via `execa` subprocess

To disable SDK (use CLI only), set `COPILOT_USE_SDK: false` in [src/config.js](src/config.js).

To force CLI fallback at runtime:

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

The `implement` command is the most complex phase. Here's the detailed workflow:

Phase 1: Validation & Setup (10-20 seconds)

1. Load slice definition - Read and parse slice JSON
2. Validate schema - Check required fields present
3. Extract template kind - Determine backend vs frontend
4. Create feature branch - `modernise/{slice-id}` for isolation
5. Verify clean state - Ensure no uncommitted changes

Phase 2: Context Building (5-15 seconds)

6. Gather existing files - Read current CDP template files
7. Build context pack - Show Copilot the current state
8. Prepare prompt - Combine slice requirements + context
9. Calculate token budget - Truncate large files to fit limits

Phase 3: Code Generation (120-300 seconds)

10. Invoke Copilot SDK - Request unified diff (primary)
11. Fallback to CLI - If SDK fails, use gh copilot (automatic)
12. Stream response - Monitor progress, handle timeouts
13. Capture output - Extract complete LLM response

Phase 4: Diff Processing (5-10 seconds)

14. Extract diff - Find unified diff in response (handles markdown fences)
15. Fix hunks - Correct malformed hunk headers (common AI error)
16. Validate structure - Check for `diff --git`, `---`, `+++`, `@@` headers
17. Check SHAs - Warn about placeholder SHAs but continue

Phase 5: Safety Checks (1-2 seconds)

18. Guard patch - Ensure only `src/**` files modified
19. Block dangerous paths - Reject changes to:
    - `package.json` (dependency changes require manual review)
    - `.git/*` (git internals)
    - `node_modules/*` (generated files)
20. Pre-validate - Run `git apply --check` before applying

Phase 6: Application (2-5 seconds)

21. Apply patch - `git apply --whitespace=fix .modernise.patch`
22. Verify application - Check for errors
23. Report changes - Show git diff stats

Phase 7: Quality Gate (30-60 seconds)

24. Install dependencies - `npm install` if needed
25. Run linter - `npm run lint`
26. Run tests - `npm run test`
27. Auto-fix attempt - If gate fails, try fixing and retry once
28. Final report - Success or detailed failure diagnostics

Phase 8: Completion (1 second)

29. Generate summary - Files changed, lines added/removed
30. Provide next steps - Human review checklist

Total time: 3-8 minutes (mostly waiting for Copilot responses)

### Safety Mechanisms

- **Patch Guard**: Blocks modifications to `package.json`, `.git/*`, `node_modules/*`
- **Pre-validation**: `git apply --check` before actual application
- **No Auto-Commit**: All changes remain unstaged for human review
- **Detailed Errors**: Provides diagnostics and manual fallback instructions
- **Hunk Fix**: Recalculates incorrect line counts in LLM-generated diffs
- **Auto-fix Gate**: One retry with automatic fixes for lint/test failures

### Known Limitations

- Placeholder SHAs: Copilot CLI may generate `abcdefg` instead of real git SHAs
  - Impact: New files remain untracked, must be manually staged
  - Workaround: Run `git add <new-files>` after implementation

- Context Window: Large files (>12KB) truncated to prevent token overflow
  - Impact: Copilot may miss details in very large files
  - Workaround: Split large files or generate smaller slices

- LLM Accuracy: Generated patches may not be perfect
  - Impact: Code may need manual corrections
  - Mitigation: Automated gates catch obvious issues (lint, tests)

- CDP Templates: Requires access to Defra GitHub organisation
  - Workaround: Configure custom templates in `src/config.js`

### Code Quality

The codebase follows clean code principles:

- Single Responsibility: Each module has one clear purpose
- Self-Documenting: Clear naming eliminates need for comments
- No Comments: Code structure and function names explain intent
- Small Functions: Most functions <50 lines
- No Magic Numbers: All constants centralized in `config.js`
- Explicit Errors: Detailed error messages with actionable guidance

Clean Code Achievements:

- Zero inline comments (code is self-explanatory)
- All numeric literals extracted to named constants
- Preview lengths standardized: 800 chars (errors) vs 1200 chars (debug)
- Configuration-driven behavior enables global changes without code search

## Advanced Topics

### Security Considerations

Critical: AI-Generated Code Requires Security Review

The factory automates code generation but does not validate security. Human review must include:

- ✅ No hardcoded secrets - API keys, passwords, tokens
- ✅ Authentication logic - Never trust AI for auth/authz code
- ✅ Input validation - Ensure all user inputs are validated
- ✅ SQL injection - Check database queries use parameterized statements
- ✅ OWASP Top 10 - Validate against common vulnerabilities
- ✅ Dependencies - Review any new packages added to package.json

Recommendation: Run security scanning tools (e.g., `npm audit`, Snyk, SonarQube) after code generation.

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
modernise intake torvalds/linux --out .test
modernise observe torvalds/linux --out .test
modernise adr torvalds/linux --out .test
modernise slice torvalds/linux --out .test

# Test gate on an existing CDP repo
modernise gate --target ../modernised/my-backend

# Test implement with a prepared slice
modernise implement \
  --slice .modernise/slice-001.json \
  --target ../modernised/cdp-backend
```

Testing interactive mode:

```bash
# Launch interactive mode and select individual phases
modernise

# Or test specific menu flows
echo "4" | modernise  # Would select option 4 (if non-interactive input worked)
```

## Development

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