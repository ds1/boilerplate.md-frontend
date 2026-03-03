// data.js — All config content from ds1/boilerplate.md embedded as JS objects
// Last synced: 2026-03-03

const CONFIG_DATA = {
  // ── CLAUDE.md sections ──────────────────────────────────────────────
  claudeMd: [
    {
      id: "preference-persistence",
      title: "Preference Persistence",
      description: "Auto-save user preferences globally instead of per-session. Adds a third option to Yes/No prompts.",
      recommended: true,
      category: "core",
      content: `## Preference Persistence

When offering Yes/No options with a "during this session" scope, always include a third option to save the preference globally. For example:

\`\`\`
1. Yes
2. Yes, always do this (session only)
3. Yes, always do this (save globally)
\`\`\`

If the user picks option 3:
- **Behavioral preferences** (e.g., "always run tests after changes", "don't ask before committing") -> append to this file (\`~/.claude/CLAUDE.md\`)
- **Tool permissions** (e.g., "allow rm commands", "allow docker") -> add to \`~/.claude/settings.json\` under \`permissions.allow\`

Default to recommending option 3 over option 2. Session-only preferences are lost on context compression and /clear, making them unreliable. Prefer durable persistence.`
    },
    {
      id: "writing-style",
      title: "Writing Style",
      description: "No em dashes, minimal hyphens. Clean, direct prose.",
      recommended: false,
      category: "style",
      content: `## Writing Style

- Never use em dashes (\u2014). Use periods, commas, or restructure the sentence instead.
- Minimize hyphen usage. Prefer spelling out compound modifiers or restructuring.`
    },
    {
      id: "safety-net",
      title: "Safety Net",
      description: "Guardrails for bypassPermissions mode: announce destructive actions, atomic commits, no force-push without confirmation.",
      recommended: true,
      category: "core",
      dependencies: [],
      content: `## Safety Net (bypassPermissions mode is ON)

Since all actions are auto-approved, follow these guardrails:
- **Announce destructive actions** (rm, git reset, drop table, etc.) before executing. Give the user a moment to cancel.
- **Commit atomically.** Make small, focused commits so any change can be cleanly reverted with \`git revert\`.
- **Never force-push to main/master** without explicit confirmation.
- **Never delete files outside the project directory** without explicit confirmation.
- **Never modify \`~/.claude/settings.json\` or \`~/.claude/CLAUDE.md\`** without showing the proposed change first and getting a yes.`
    },
    {
      id: "project-state",
      title: "Project State Management",
      description: "CLAUDE.md for stable instructions only. Use STATUS.md, CHANGELOG.md, and _planning/ for dynamic state.",
      recommended: true,
      category: "core",
      content: `## Project State Management

**CLAUDE.md is for stable instructions only.** Never store TODOs, changelogs, sprint status, session context, or completed work in CLAUDE.md. These change frequently and burn context window on every conversation.

Use this consistent file structure across all projects:

\`\`\`
project/
\u251c\u2500\u2500 CLAUDE.md           # Stable: commands, conventions, architecture, gotchas
\u251c\u2500\u2500 STATUS.md           # Active: current TODOs, in-progress work, blockers
\u251c\u2500\u2500 CHANGELOG.md        # History: versioned release notes, completed milestones
\u251c\u2500\u2500 _planning/          # Planning (optional, for larger projects)
\u2502   \u251c\u2500\u2500 backlog.md      # Prioritized feature backlog
\u2502   \u251c\u2500\u2500 sprint.md       # Current sprint scope and progress
\u2502   \u251c\u2500\u2500 plans/          # Saved plans from Plan Mode (auto-saved here)
\u2502   \u2502   \u2514\u2500\u2500 YYYY-MM-DD-plan-name.md
\u2502   \u2514\u2500\u2500 research/       # Research docs, vendor analysis, etc.
\`\`\`

Rules:
- If content changes more than once a month, it does NOT belong in CLAUDE.md
- CLAUDE.md should reference state files (e.g., "See STATUS.md for current work")
- When starting a session, read both CLAUDE.md and STATUS.md for full context
- When wrapping up significant work, update STATUS.md and CHANGELOG.md, not CLAUDE.md

### Plan Mode Persistence

When exiting Plan Mode, always save the plan to \`_planning/plans/YYYY-MM-DD-descriptive-name.md\`. Each plan file must include:
- A title and date
- The objective/goal
- Implementation steps with checkboxes (\`- [ ]\` / \`- [x]\`)
- Update checkboxes as steps are completed during implementation

Slash commands for managing project state: \`/status\`, \`/update-status\`, \`/log\`, \`/backlog\`, \`/plans\``
    },
    {
      id: "context-preservation",
      title: "Context Preservation",
      description: "Auto-save session state before context compaction. Saves STATUS.md, plans, memory, and CHANGELOG.",
      recommended: true,
      category: "core",
      content: `## Context Preservation (Auto-Save Before Compaction)

A \`PreCompact\` hook is configured in settings.json that fires before auto-compaction. When you see \`CONTEXT_SAVE_TRIGGERED\` or sense the conversation is very long, immediately save all session state:

1. **STATUS.md** \u2014 Update with current in-progress work, blockers, and what was just completed
2. **Plan files** \u2014 If a plan is active, save/update it in \`_planning/plans/\` with current checkbox states
3. **Memory** \u2014 Write any new learnings, patterns, or gotchas discovered this session to the project's \`memory/MEMORY.md\`
4. **CHANGELOG.md** \u2014 Log any completed features or fixes not yet recorded

After saving, inform the user: "Context is getting large. I've saved current state to STATUS.md, plans, and memory. Safe to /clear or continue."

Do NOT wait for the user to ask. Do this automatically.`
    },
    {
      id: "token-optimization",
      title: "Token Optimization",
      description: "Read files with targeted ranges, delegate to subagents, don't re-read after editing.",
      recommended: true,
      category: "efficiency",
      content: `## Token Optimization

- Read files with targeted line ranges (\`offset\`/\`limit\`) when possible, not entire files.
- Delegate broad codebase exploration to subagents to protect main context.
- Don't re-read files immediately after editing them.
- When showing results, summarize rather than dumping raw output.
- Prefer pasting error text over screenshots when communicating issues.`
    },
    {
      id: "communication-style",
      title: "Communication Style",
      description: "Be concise. Don't narrate, just show results. Skip preamble.",
      recommended: true,
      category: "style",
      content: `## Communication Style

- Be concise. Don't explain what you're about to do, just do it. Skip preamble.
- Don't narrate your thought process or list what you're about to do. Just show results and summarize what changed.`
    },
    {
      id: "default-stack",
      title: "Default Stack",
      description: "Default to Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Vercel.",
      recommended: false,
      category: "preferences",
      content: `## Default Stack

Default to Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase, and Vercel unless the project already uses something else. Use npm as the default package manager.`
    },
    {
      id: "git-conventions",
      title: "Git Conventions",
      description: "Conventional commits (feat:, fix:, etc.), branch naming format, don't commit unless asked.",
      recommended: true,
      category: "core",
      content: `## Git Conventions

- Use conventional commits: \`feat:\`, \`fix:\`, \`chore:\`, \`docs:\`, \`refactor:\`, \`test:\`. Keep messages under 72 chars.
- Don't commit unless asked.
- When creating branches, use format: \`feat/description\`, \`fix/description\`, \`chore/description\`.`
    },
    {
      id: "error-recovery",
      title: "Error Recovery",
      description: "Try to fix once. If second attempt fails, pause and explain. Don't loop.",
      recommended: true,
      category: "core",
      content: `## Error Recovery

When a command or approach fails, try to fix it once. If the second attempt fails, pause and explain:
- What was attempted
- What remains unknown
- Ask if the user can provide input to assist troubleshooting, such as error logs, browser console messages, screenshots, or other context.

Do NOT loop on the same failing approach.`
    },
    {
      id: "code-quality",
      title: "Code Quality",
      description: "Auto-lint after edits, run tests, co-locate files, treat warnings as errors.",
      recommended: true,
      category: "core",
      content: `## Code Quality

- After editing code files, run the project's linter if one exists. Fix lint errors automatically without asking.
- Run existing tests after code changes. Don't write new tests unless asked.
- When creating new components, co-locate related files (component, hook, types) rather than separating by type.
- **Treat build warnings as errors.** Never dismiss, rationalize, or skip over warnings in build output, linter output, or compiler output. Every warning must be investigated and resolved. Do not say "this warning is safe to ignore." Fix it. If a warning truly cannot be resolved, explain why specifically and ask the user to confirm it's acceptable.`
    },
    {
      id: "documentation",
      title: "Documentation (Auto-Update)",
      description: "Automatically update README and docs when code changes. Delegate to background subagent.",
      recommended: false,
      category: "efficiency",
      content: `## Documentation (Auto-Update)

Keep end-user documentation and README.md current with code changes. When significant code changes are made:

1. **Delegate to a background subagent** to update docs without blocking the main conversation.
2. The subagent should:
   - Update \`README.md\` to reflect new features, changed APIs, or removed functionality
   - Update any user-facing docs (Docusaurus, docs/, etc.) to match the code changes
   - Update \`CHANGELOG.md\` with the changes
   - Commit doc updates separately from code commits (e.g., \`docs: update README for new auth flow\`)
3. This ensures docs are always current for end users and release notes can be generated from the changelog.

Slash commands: \`/docs\` to manually trigger documentation updates, \`/deploy\` for production deploys, \`/pr\` for pull requests, \`/cleanup\` for code quality sweeps.`
    },
    {
      id: "security",
      title: "Security",
      description: "Never commit secrets, check .gitignore, flag exposed keys, create .gitattributes.",
      recommended: true,
      category: "core",
      content: `## Security

- **Never commit secrets.** Before any git commit, verify that \`.env\`, \`.env.local\`, \`.env.production\`, \`credentials.json\`, API keys, and similar files are in \`.gitignore\`. If they aren't, add them before committing and warn the user.
- **Check .gitignore on project init.** When creating a new project or adding environment variables for the first time, ensure \`.gitignore\` exists and covers: \`.env*\`, \`*.pem\`, \`*.key\`, \`node_modules/\`, \`.vercel/\`, \`.supabase/\`.
- **Create .gitattributes on project init.** When initializing a new project or repo, create a \`.gitattributes\` file with \`* text=auto\` to normalize line endings across platforms.
- **Flag exposed secrets.** If you encounter hardcoded API keys, tokens, passwords, or connection strings in source code, flag them immediately and move them to environment variables.
- **No secrets in CLAUDE.md or memory files.** Never write API keys, passwords, or tokens to any CLAUDE.md or memory file.`
    }
  ],

  // ── settings.json groups ────────────────────────────────────────────
  settings: [
    {
      id: "permissions-core-tools",
      title: "Core Tool Permissions",
      description: "Allow npm, npx, node, git, gh, curl, and basic filesystem commands. Uses wildcards (<code>curl:*</code>, <code>node:*</code>) that allow any arguments.",
      recommended: true,
      category: "permissions",
      content: [
        "Bash(npm:*)",
        "Bash(npx:*)",
        "Bash(node:*)",
        "Bash(git:*)",
        "Bash(gh:*)",
        "Bash(curl:*)",
        "Bash(ls:*)",
        "Bash(mkdir:*)",
        "Bash(cp:*)",
        "Bash(mv:*)",
        "Bash(cat:*)",
        "Bash(pwd:*)",
        "Bash(which:*)",
        "Bash(where:*)",
        "Bash(dir:*)",
        "Bash(type:*)",
        "Bash(find:*)",
        "Bash(grep:*)",
        "Bash(echo:*)",
        "Bash(tree:*)"
      ]
    },
    {
      id: "permissions-web",
      title: "Web Search & Fetch",
      description: "Allow web search and URL fetching for research.",
      recommended: true,
      category: "permissions",
      content: [
        "WebSearch",
        "WebFetch"
      ]
    },
    {
      id: "permissions-nextjs",
      title: "Next.js & shadcn/ui Permissions",
      description: "Allow create-next-app, shadcn CLI, and Next.js build commands.",
      recommended: false,
      category: "permissions",
      content: [
        "Bash(npx create-next-app:*)",
        "Bash(npx create-next-app@latest:*)",
        "Bash(npx shadcn@latest init -d)",
        "Bash(npx shadcn@latest add:*)",
        "Bash(npx next build:*)"
      ]
    },
    {
      id: "permissions-extended",
      title: "Extended Tool Permissions",
      description: "Python, pip, cargo, rustup, openssl, tsx, and other dev tools. Uses broad wildcards (<code>python:*</code>, <code>openssl:*</code>) that allow any arguments.",
      recommended: false,
      category: "permissions",
      content: [
        "Bash(openssl:*)",
        "Bash(python:*)",
        "Bash(pip:*)",
        "Bash(cargo:*)",
        "Bash(rustup:*)",
        "Bash(npx tsx:*)",
        "Bash(npx md-to-pdf:*)",
        "Bash(node -e:*)",
        "Bash(timeout:*)",
        "Bash(ping:*)",
        "Bash(source:*)",
        "Bash(export:*)"
      ]
    },
    {
      id: "permissions-git-advanced",
      title: "Advanced Git Permissions",
      description: "Git status, diff, checkout, pull, merge, fetch, reset, restore, clean, grep, mv.",
      recommended: true,
      category: "permissions",
      content: [
        "Bash(git status:*)",
        "Bash(git diff:*)",
        "Bash(git checkout:*)",
        "Bash(git pull:*)",
        "Bash(git merge:*)",
        "Bash(git fetch:*)",
        "Bash(git reset:*)",
        "Bash(git restore:*)",
        "Bash(git clean:*)",
        "Bash(git grep:*)",
        "Bash(git mv:*)"
      ]
    },
    {
      id: "permissions-npm-scripts",
      title: "npm Script Permissions",
      description: "Allow npm run dev, start, lint, build, test, ls, view, and uninstall.",
      recommended: true,
      category: "permissions",
      content: [
        "Bash(npm run dev:*)",
        "Bash(npm run start)",
        "Bash(npm run lint)",
        "Bash(npm run build)",
        "Bash(npm run test:*)",
        "Bash(npm ls:*)",
        "Bash(npm view:*)",
        "Bash(npm uninstall:*)"
      ]
    },
    {
      id: "permissions-deploy",
      title: "Deploy & Platform Permissions",
      description: "Vercel CLI, pnpm commands, and system process tools.",
      recommended: false,
      category: "permissions",
      content: [
        "Bash(pnpm build:*)",
        "Bash(pnpm install:*)",
        "Bash(pnpm typecheck:*)",
        "Bash(pnpm test:*)",
        "Bash(vercel:*)",
        "Bash(taskkill:*)",
        "Bash(tasklist:*)",
        "Bash(netstat:*)",
        "Bash(findstr:*)",
        "Bash(nslookup:*)",
        "Bash(copy:*)"
      ]
    },
    {
      id: "permissions-deny",
      title: "Denied Commands (Safety)",
      description: "Block rm -rf, force-push, hard reset, and drop table. Only 4 patterns. Consider adding more for your stack.",
      recommended: true,
      category: "safety",
      content: [
        "Bash(rm -rf:*)",
        "Bash(git push --force:*)",
        "Bash(git reset --hard:*)",
        "Bash(drop table:*)"
      ]
    },
    {
      id: "settings-bypass",
      title: "Bypass Permissions Mode",
      description: "Auto-approve all tool calls without prompting. <strong>Security note:</strong> Claude can execute any command immediately. Pair with Safety Net section in CLAUDE.md for guardrails.",
      recommended: false,
      category: "mode",
      dependsOn: ["safety-net"],
      content: {
        key: "permissions.defaultMode",
        value: "bypassPermissions"
      }
    },
    {
      id: "settings-precompact-hook",
      title: "PreCompact Hook",
      description: "Fire a hook before context compaction to trigger auto-save of session state.",
      recommended: true,
      dependsOn: ["context-preservation"],
      category: "hooks",
      content: {
        key: "hooks.PreCompact",
        value: [
          {
            matcher: "auto",
            hooks: [
              {
                type: "command",
                command: "echo CONTEXT_SAVE_TRIGGERED"
              }
            ]
          }
        ]
      }
    },
    {
      id: "settings-thinking",
      title: "Always Thinking Mode",
      description: "Enable extended thinking for all responses.",
      recommended: false,
      category: "mode",
      content: {
        key: "alwaysThinkingEnabled",
        value: true
      }
    }
  ],

  // ── Slash commands ──────────────────────────────────────────────────
  commands: [
    {
      id: "cmd-backlog",
      title: "/backlog",
      filename: "backlog.md",
      description: "Review project backlog and upcoming work.",
      recommended: true,
      category: "project-management",
      content: `# Review Backlog

Review the project backlog and upcoming work.

## Steps

1. Check for backlog in this priority order:
   - \`_planning/backlog.md\`
   - \`_planning/sprint.md\`
   - \`STATUS.md\` (the "Up Next" section)
   - GitHub Issues (run \`gh issue list --limit 20\` if the above don't exist)

2. Present the backlog organized by priority:
   - **Current Sprint** — what's committed for this cycle
   - **High Priority** — should be done soon
   - **Medium Priority** — planned but not urgent
   - **Low Priority / Ideas** — nice to have

3. If the user asks to reprioritize, update the source file accordingly.

4. If no backlog exists anywhere, offer to create \`_planning/backlog.md\` from the user's input or by scanning STATUS.md and GitHub Issues.

---

*By [@ds1](https://github.com/ds1) — [boilerplate.md](https://github.com/ds1/boilerplate.md)*`
    },
    {
      id: "cmd-cleanup",
      title: "/cleanup",
      filename: "cleanup.md",
      description: "Run lint, format, remove unused imports across changed files.",
      recommended: true,
      category: "project-management",
      content: `# Code Cleanup

Run lint, format, and remove unused imports across changed files.

## Steps

1. Identify changed files:
   - \`git diff --name-only\` for unstaged changes
   - \`git diff --cached --name-only\` for staged changes
   - If nothing is changed, run against all source files

2. Run available tools in order:
   - **Linter**: \`npm run lint -- --fix\` (or eslint, biome, etc.)
   - **Formatter**: \`npx prettier --write\` on changed files (if prettier is installed)
   - **Unused imports**: Check for and remove unused imports in changed TypeScript/JavaScript files
   - **Type check**: \`npx tsc --noEmit\` to verify no type errors

3. Show a summary of what was fixed:
   - Files modified
   - Number of lint errors fixed
   - Number of unused imports removed
   - Any remaining errors that need manual attention

4. Do NOT commit automatically. Let the user decide when to commit.

---

*By [@ds1](https://github.com/ds1) — [boilerplate.md](https://github.com/ds1/boilerplate.md)*`
    },
    {
      id: "cmd-deploy",
      title: "/deploy",
      filename: "deploy.md",
      description: "Deploy the current project to production.",
      recommended: false,
      category: "project-management",
      content: `# Deploy to Production

Deploy the current project to production.

## Steps

1. Detect the deployment platform by checking for:
   - \`vercel.json\` or \`.vercel/\` -> Vercel (\`npx vercel --prod\`)
   - \`netlify.toml\` -> Netlify
   - \`Dockerfile\` -> Docker-based
   - \`package.json\` scripts for \`deploy\`
   - Fall back to asking the user

2. Pre-deploy checks:
   - Run \`npm run build\` (or equivalent) to verify the build succeeds
   - Check for uncommitted changes — warn if working tree is dirty
   - Show the current branch and last commit

3. Confirm with the user: "Ready to deploy [branch] to production via [platform]. Proceed?"

4. Run the deployment command.

5. If the project has a docs site (Docusaurus in \`docs/\`), ask if docs should be deployed too.

6. After deployment, update STATUS.md with the deployment timestamp.

---

*By [@ds1](https://github.com/ds1) — [boilerplate.md](https://github.com/ds1/boilerplate.md)*`
    },
    {
      id: "cmd-dev",
      title: "/dev",
      filename: "dev.md",
      description: "Launch dev server in a new terminal and open browser.",
      recommended: true,
      category: "project-management",
      content: `# Launch Dev Server

Start the development server in a separate terminal window and open the browser.

## Steps

1. Read \`package.json\` to detect the dev command and port:
   - Look for \`scripts.dev\` to determine the command
   - Check for port hints in the dev script (default to \`3000\`)
   - If no \`package.json\` exists, ask the user for the command and port

2. Launch the dev server in a new terminal window:
   - **Windows (PowerShell)**:
     \`\`\`
     Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd \\"PROJECT_PATH\\"; npm run dev'
     \`\`\`
   - **macOS/Linux**:
     Open a new terminal tab/window with the dev command.

   This opens a separate terminal that stays open independently.

3. Wait 3 seconds for the server to start, then open the browser:
   - **Windows**: \`Start-Process "http://localhost:PORT"\`
   - **macOS**: \`open http://localhost:PORT\`
   - **Linux**: \`xdg-open http://localhost:PORT\`

4. Confirm to the user: "Dev server running in a new terminal. Browser opened to http://localhost:PORT. This chat session remains available."

Keep the chat unblocked. Never run the dev server in the foreground of this session.

---

*By [@ds1](https://github.com/ds1) — [boilerplate.md](https://github.com/ds1/boilerplate.md)*`
    },
    {
      id: "cmd-docs",
      title: "/docs",
      filename: "docs.md",
      description: "Manually trigger documentation updates to match current code.",
      recommended: false,
      category: "project-management",
      content: `# Update Documentation

Manually trigger documentation updates to match current code state.

## Steps

1. Scan recent git changes to understand what has changed:
   - \`git log --oneline -10\` for recent commits
   - \`git diff HEAD~5 --stat\` for files changed

2. Identify documentation that needs updating:
   - **README.md** — project overview, setup instructions, features list, API docs
   - **User-facing docs** — Docusaurus/docs folder if it exists
   - **CHANGELOG.md** — any unreleased changes not yet logged

3. Delegate updates to a background subagent using the Task tool with \`run_in_background: true\`:
   - The subagent reads the changed code and updates all relevant docs
   - Updates should reflect what end users need to know, not implementation details
   - If README.md doesn't exist, create one with: project name, description, setup/install, usage, tech stack, and license

4. The subagent should commit doc changes separately:
   - \`docs: update README for [feature/change]\`
   - \`docs: update user docs for [feature/change]\`

5. Report back to the user what was updated.

---

*By [@ds1](https://github.com/ds1) — [boilerplate.md](https://github.com/ds1/boilerplate.md)*`
    },
    {
      id: "cmd-init",
      title: "/init",
      filename: "init.md",
      description: "Scaffold standard project file structure (STATUS.md, CHANGELOG, .gitignore, etc.).",
      recommended: true,
      category: "project-management",
      content: `# Initialize Project Structure

Scaffold the standard file structure for a new project.

## Steps

1. Detect project context:
   - Read \`package.json\` or other config files to determine project name and description
   - Check what already exists — don't overwrite existing files
   - Determine the tech stack from existing files

2. Create the following files if they don't exist:

   **\`.gitignore\`** — with at minimum:
   \`\`\`
   node_modules/
   .env*
   .vercel/
   .supabase/
   *.pem
   *.key
   .DS_Store
   Thumbs.db
   \`\`\`
   Add framework-specific entries based on detected stack (e.g., \`.next/\` for Next.js, \`dist/\` for builds).

   **\`.gitattributes\`**:
   \`\`\`
   * text=auto
   \`\`\`

   **\`STATUS.md\`**:
   \`\`\`markdown
   # Project Status

   Last updated: YYYY-MM-DD HH:MM

   ## In Progress
   _None yet_

   ## Blockers
   _None_

   ## Up Next
   - [ ] Initial project setup

   ## Recently Completed
   \`\`\`

   **\`CHANGELOG.md\`**:
   \`\`\`markdown
   # Changelog

   All notable changes to this project are documented here.

   ## [Unreleased]

   ### Added
   - Initial project setup
   \`\`\`

   **\`README.md\`** — with:
   - Project name (from package.json or directory name)
   - Brief description (ask user if not obvious)
   - Tech stack
   - Setup/install instructions (\`npm install\`, env vars needed)
   - Development commands (\`npm run dev\`, etc.)
   - Deployment info if detectable

   **\`_planning/\`** directory with:
   - \`backlog.md\` — empty template:
     \`\`\`markdown
     # Backlog

     ## High Priority

     ## Medium Priority

     ## Low Priority / Ideas
     \`\`\`
   - \`plans/\` — empty directory (create with a \`.gitkeep\`)

   **\`CLAUDE.md\`** — if it doesn't exist, create a starter:
   \`\`\`markdown
   # Project Name

   Brief description.

   ## Commands
   - Dev: \`npm run dev\`
   - Build: \`npm run build\`
   - Lint: \`npm run lint\`

   ## Architecture
   <!-- Add project structure and key patterns here -->

   ## Current Status
   See \`STATUS.md\` for current work and \`CHANGELOG.md\` for completed milestones.
   \`\`\`
   If CLAUDE.md already exists, just ensure it has the STATUS.md/CHANGELOG.md reference line.

3. Initialize git if not already a repo (\`git init\`).

4. Report what was created, listing each file.

---

*By [@ds1](https://github.com/ds1) — [boilerplate.md](https://github.com/ds1/boilerplate.md)*`
    },
    {
      id: "cmd-log",
      title: "/log",
      filename: "log.md",
      description: "Add an entry to CHANGELOG.md with version tagging support.",
      recommended: true,
      category: "project-management",
      content: `# Add Changelog Entry

Add an entry to \`CHANGELOG.md\` documenting completed work.

## Steps

1. Read the current \`CHANGELOG.md\`. If it doesn't exist, create one with this format:

\`\`\`markdown
# Changelog

All notable changes to this project are documented here.

## [Unreleased]

### Added
- New feature description

### Changed
- Change description

### Fixed
- Bug fix description
\`\`\`

2. Determine the entry type from the user's input or recent git history:
   - **Added** — new features or capabilities
   - **Changed** — modifications to existing functionality
   - **Fixed** — bug fixes
   - **Removed** — removed features or deprecated items

3. Add the entry under \`[Unreleased]\` in the appropriate category. Use concise, user-facing language (not implementation details).

4. **Version tagging:** Always ask the user if this should be tagged as a release. If yes (or if they specify a version), move all \`[Unreleased]\` items under a new version heading:
   \`\`\`markdown
   ## [1.3.0] - 2026-02-11

   ### Added
   - Feature description

   ### Fixed
   - Bug fix description
   \`\`\`
   Then create a fresh empty \`[Unreleased]\` section above it. Suggest semver bumps:
   - **Patch** (1.0.X) — bug fixes only
   - **Minor** (1.X.0) — new features, backwards compatible
   - **Major** (X.0.0) — breaking changes

5. Show what was added.

---

*By [@ds1](https://github.com/ds1) — [boilerplate.md](https://github.com/ds1/boilerplate.md)*`
    },
    {
      id: "cmd-plans",
      title: "/plans",
      filename: "plans.md",
      description: "List and open saved plans from Plan Mode.",
      recommended: true,
      category: "project-management",
      content: `# View Plans

List and open saved plans from Plan Mode.

## Steps

1. Look for plans in \`_planning/plans/\`. If the directory doesn't exist or is empty, say "No plans saved yet. Plans are automatically saved here when exiting Plan Mode."

2. List all plan files with a numbered index, showing for each:
   - **#** — selection number
   - **Date** — from filename
   - **Name** — human-readable name from filename
   - **Status** — count completed vs total checkboxes (e.g., "3/7 done", "Complete")

   Example output:
   \`\`\`
   # Saved Plans

   | # | Date       | Plan                          | Progress   |
   |---|------------|-------------------------------|------------|
   | 1 | 2026-02-11 | Add user authentication       | 3/7 steps  |
   | 2 | 2026-02-09 | Refactor billing system       | Complete   |
   | 3 | 2026-02-05 | Domain search optimization    | 0/5 steps  |
   \`\`\`

3. Ask the user which plan to open by number.

4. When a plan is opened, display its full contents and highlight:
   - Remaining unchecked items (\`- [ ]\`) as **TODO**
   - Any items that appear blocked or dependent on other work
   - Offer to resume implementation if there are incomplete steps

---

*By [@ds1](https://github.com/ds1) — [boilerplate.md](https://github.com/ds1/boilerplate.md)*`
    },
    {
      id: "cmd-pr",
      title: "/pr",
      filename: "pr.md",
      description: "Create a pull request with standardized format.",
      recommended: true,
      category: "project-management",
      content: `# Create Pull Request

Create a pull request with a standardized format.

## Steps

1. Gather context:
   - Current branch name and base branch
   - All commits since diverging from base (\`git log base..HEAD --oneline\`)
   - Full diff summary (\`git diff base...HEAD --stat\`)
   - Check if branch is pushed to remote; push with \`-u\` if not

2. Draft the PR:
   - **Title**: Derive from branch name or commits. Use conventional format: \`feat: ...\`, \`fix: ...\`, etc. Under 70 characters.
   - **Body**: Use this template:

\`\`\`markdown
## Summary
<1-3 bullet points describing what this PR does>

## Changes
<bulleted list of specific changes, grouped by area>

## Test Plan
<how to verify these changes work>
\`\`\`

3. Create the PR:
   \`\`\`
   gh pr create --title "..." --body "..."
   \`\`\`

4. Return the PR URL to the user.

---

*By [@ds1](https://github.com/ds1) — [boilerplate.md](https://github.com/ds1/boilerplate.md)*`
    },
    {
      id: "cmd-remember",
      title: "/remember",
      filename: "remember.md",
      description: "Save a global preference to the right config file (settings.json, CLAUDE.md, or memory).",
      recommended: true,
      category: "project-management",
      content: `# Remember Global Preference

Save a global preference or behavior based on the user's natural language description.

## Usage
\`/remember <description of desired behavior>\`

## Steps

1. Parse the user's description and classify it:

   **Tool permission** (goes in \`~/.claude/settings.json\` under \`permissions.allow\`):
   - "allow rm commands" -> add \`Bash(rm:*)\`
   - "allow docker" -> add \`Bash(docker:*)\`
   - "let me use bun" -> add \`Bash(bun:*)\`
   - Any request to auto-approve a specific command or tool

   **Behavioral instruction** (goes in \`~/.claude/CLAUDE.md\`):
   - "always run tests after changes"
   - "prefer bun over npm"
   - "don't auto-commit"
   - "use tabs not spaces"
   - Any preference about how Claude should work, communicate, or make decisions

   **Project memory** (goes in the current project's \`memory/MEMORY.md\`):
   - "this project uses port 4000"
   - "the API is at /v2 not /v1"
   - Any fact specific to the current project, not global

2. Show the user:
   - What will be saved
   - Where it will be saved (file path)
   - The exact content being added

3. Save it to the appropriate file:
   - **settings.json**: Add to the \`permissions.allow\` array
   - **CLAUDE.md**: Append under the most relevant existing section, or create a new \`## User Preferences\` section if none fits
   - **memory/MEMORY.md**: Append under a relevant heading or create one

4. Confirm: "Saved to [file]. This will persist across all future sessions."

## Classification Priority
If unclear, default to \`~/.claude/CLAUDE.md\`. Behavioral instructions are the most common case.

---

*By [@ds1](https://github.com/ds1) — [boilerplate.md](https://github.com/ds1/boilerplate.md)*`
    },
    {
      id: "cmd-status",
      title: "/status",
      filename: "status.md",
      description: "Read and summarize current project state from STATUS.md.",
      recommended: true,
      category: "project-management",
      content: `# Review Project Status

Read the current project state and summarize it concisely.

1. Read \`STATUS.md\` in the project root. If it doesn't exist, say so and offer to create one.
2. Optionally scan recent git log (last 5 commits) for additional context.
3. Present a summary:
   - **In Progress** — what's actively being worked on
   - **Blockers** — anything stuck or waiting on input
   - **Up Next** — what's queued after current work
   - **Recent Completions** — last few finished items

Keep the summary short and actionable. Don't read CLAUDE.md for status. That's not where it lives.

---

*By [@ds1](https://github.com/ds1) — [boilerplate.md](https://github.com/ds1/boilerplate.md)*`
    },
    {
      id: "cmd-update-status",
      title: "/update-status",
      filename: "update-status.md",
      description: "Update STATUS.md with current project state.",
      recommended: true,
      category: "project-management",
      content: `# Update Project Status

Update \`STATUS.md\` to reflect current project state. The user may provide specific updates, or you may infer from recent work.

## Steps

1. Read the current \`STATUS.md\`. If it doesn't exist, create one with this template:

\`\`\`markdown
# Project Status

Last updated: YYYY-MM-DD HH:MM

## In Progress
- [ ] Item description

## Blockers
_None_

## Up Next
- [ ] Item description

## Recently Completed
- [x] Item description (YYYY-MM-DD HH:MM)
\`\`\`

2. Apply the user's updates:
   - Move completed items from "In Progress" to "Recently Completed" with date and time (YYYY-MM-DD HH:MM)
   - Add new items to the appropriate section
   - Update the "Last updated" timestamp with date and time
   - Keep "Recently Completed" trimmed to the last 10 items. Older ones belong in CHANGELOG.md

Do NOT put any of this information in CLAUDE.md.

---

*By [@ds1](https://github.com/ds1) — [boilerplate.md](https://github.com/ds1/boilerplate.md)*`
    },
    {
      id: "cmd-probe-start",
      title: "/probe-start",
      filename: "probe-start.md",
      description: "Launch 6 parallel Socratic evaluation agents, then synthesize findings.",
      recommended: false,
      category: "socratic-probes",
      content: `# Probe: Full Socratic Analysis

Launch 6 parallel Socratic evaluation agents to analyze a document, then synthesize findings.

## Usage
\`\`\`
/probe-start <path-to-document> <output-directory>
\`\`\`

## Arguments
- \`$ARGUMENTS\` - Path to document to analyze and output directory (space-separated)

## Prompt

You are orchestrating a comprehensive Socratic analysis. Parse the arguments to get:
1. The document path (first argument)
2. The output directory (second argument)

### Step 1: Launch 6 Parallel Analysis Agents

Use the Task tool to launch 6 subagents in parallel. Each agent should:
- Read the source document
- Apply their specialized Socratic questioning technique
- Write their evaluation as a markdown file to the output directory

**Agent 1: Clarify Thinking** -> \`socratic-1-clarify-thinking.md\`
Examine arguments by asking: "What do you mean by...?", "What is the source of this idea?", "How did you come to this conclusion?"
- Identify key claims needing clarification
- Question definitions and terminology
- Trace origin of conclusions (primary research vs. inference)
- Examine reasoning chains
- Highlight ambiguities

**Agent 2: Challenge Assumptions** -> \`socratic-2-challenge-assumptions.md\`
Ask: "What are you assuming here?", "How do you know this is true?", "What if you were wrong?"
- Identify hidden assumptions
- Question foundational premises
- Challenge comparison methodology
- Test robustness of conclusions

**Agent 3: Evidence Basis** -> \`socratic-3-evidence-basis.md\`
Ask: "What evidence supports this?", "Is this evidence sufficient?", "What would disprove this?"
- Audit sources for bias and reliability
- Identify unsupported assertions
- Evaluate evidence quality for key claims
- Assess completeness of evidence

**Agent 4: Alternative Viewpoints** -> \`socratic-4-alternative-viewpoints.md\`
Ask: "What is the counter-argument?", "Who would disagree?", "What are other ways to look at this?"
- Present strongest counter-arguments
- Identify unrepresented stakeholder perspectives
- Explore internal contradictions
- Steel-man rejected options

**Agent 5: Implications & Consequences** -> \`socratic-5-implications-consequences.md\`
Ask: "What follows from this?", "What are the consequences?", "What are the long-term effects?"
- Trace first and second-order implications
- Identify unintended consequences
- Explore consequences of being wrong
- Map downstream effects

**Agent 6: Question the Question** -> \`socratic-6-question-the-question.md\`
Ask: "Is this the right question?", "What does this question assume?", "What question should we ask instead?"
- Examine the framing of the research question
- Challenge scope and timing
- Identify questions not asked
- Propose alternative framing

### Step 2: Create Synthesis Document

After all 6 agents complete, read all 6 evaluation files and create \`socratic-synthesis.md\` in the output directory that consolidates:

1. **Executive Summary** - Bottom-line assessment in 2-3 sentences

2. **Critical Findings Table** - One row per evaluation summarizing the key insight:
   | # | Evaluation | Key Finding |
   |---|------------|-------------|

3. **Evidence Quality Assessment** - Summary of source reliability and gaps

4. **Assumption Risk Matrix** - Key assumptions and what happens if they're wrong

5. **Unexplored Alternatives** - Options the original document didn't consider

6. **Hidden Costs & Consequences** - Implications not addressed in the original

7. **The Meta-Question** - Is the original document asking the right question?

8. **Decision Framework** - What should be validated before proceeding

9. **Stakeholder Questions** - Key questions for CEO, CTO, CFO, Product

10. **Final Verdict** - Assessment of whether the recommendation is ready for action

The synthesis should be actionable, providing a clear checklist of what needs validation before the recommendation can be confidently accepted or rejected.

---

*By [@ds1](https://github.com/ds1) — from [socratic-probes](https://github.com/ds1/socratic-probes)*`
    },
    {
      id: "cmd-probe-clarify",
      title: "/probe-clarify",
      filename: "probe-clarify.md",
      description: "Analyze a document by clarifying thinking and exploring origin of ideas.",
      recommended: false,
      category: "socratic-probes",
      content: `# Probe: Clarify Thinking

Analyze a document by clarifying thinking and exploring the origin of ideas.

## Usage
\`\`\`
/probe-clarify <path-to-document>
\`\`\`

## Prompt

You are a Socratic analyst specializing in **clarifying thinking and exploring the origin of ideas**.

Read the document at: $ARGUMENTS

Create a detailed Socratic evaluation that:

1. **Identifies key claims and concepts** that need clarification
2. **Questions definitions** - What exactly is meant by key terms? How are they being defined?
3. **Traces origin of conclusions** - Where do assertions come from? Primary research, vendor marketing, or inference?
4. **Examines reasoning chains** - How does the document get from premises to conclusions?
5. **Highlights ambiguities** in terminology or logic
6. **Assesses conceptual clarity** - Are terms used consistently throughout?

Structure your evaluation with:
- Direct quotes from the document
- Probing questions that reveal unclear or unexamined thinking
- Assessment of whether reasoning is sound

Output the evaluation as markdown.

---

*By [@ds1](https://github.com/ds1) — from [socratic-probes](https://github.com/ds1/socratic-probes)*`
    },
    {
      id: "cmd-probe-assume",
      title: "/probe-assume",
      filename: "probe-assume.md",
      description: "Analyze a document by challenging its assumptions.",
      recommended: false,
      category: "socratic-probes",
      content: `# Probe: Challenge Assumptions

Analyze a document by challenging its assumptions.

## Usage
\`\`\`
/probe-assume <path-to-document>
\`\`\`

## Prompt

You are a Socratic analyst specializing in **challenging assumptions**.

Read the document at: $ARGUMENTS

Create a detailed Socratic evaluation that:

1. **Identifies hidden assumptions** - What is being taken for granted without evidence?
2. **Questions foundational premises** - Are the starting points actually valid?
3. **Challenges comparison methodology** - Are things being compared fairly?
4. **Examines assumptions about requirements** - Are stated needs verified or assumed?
5. **Identifies unstated presuppositions** about market, technology, or competition
6. **Tests robustness** - What if key assumptions are wrong? Does the conclusion still hold?

Structure your evaluation with:
- Specific quotes showing assumptions
- Probing questions that reveal flawed or unexamined premises
- Analysis of what happens if assumptions prove false

Output the evaluation as markdown.

---

*By [@ds1](https://github.com/ds1) — from [socratic-probes](https://github.com/ds1/socratic-probes)*`
    },
    {
      id: "cmd-probe-evidence",
      title: "/probe-evidence",
      filename: "probe-evidence.md",
      description: "Analyze a document by examining evidence and basis for arguments.",
      recommended: false,
      category: "socratic-probes",
      content: `# Probe: Evidence Basis

Analyze a document by examining the evidence and basis for arguments.

## Usage
\`\`\`
/probe-evidence <path-to-document>
\`\`\`

## Prompt

You are a Socratic analyst specializing in **examining evidence and basis for arguments**.

Read the document at: $ARGUMENTS

Create a detailed Socratic evaluation that:

1. **Audits sources** - Categorize by type (vendor marketing, independent research, primary data). Assess bias.
2. **Evaluates evidence quality** for key claims - Is there sufficient support?
3. **Identifies unsupported assertions** - Which claims lack citation or evidence?
4. **Questions reliability** of self-published or vendor content as evidence
5. **Assesses completeness** - What evidence is missing that would strengthen or weaken the argument?
6. **Examines numerical claims** - Are calculations verifiable? Are inputs sourced?

Structure your evaluation with:
- Source categorization table
- Specific analysis of cited sources
- Identification of evidentiary gaps
- Reliability assessment

Output the evaluation as markdown.

---

*By [@ds1](https://github.com/ds1) — from [socratic-probes](https://github.com/ds1/socratic-probes)*`
    },
    {
      id: "cmd-probe-implications",
      title: "/probe-implications",
      filename: "probe-implications.md",
      description: "Analyze a document by exploring implications and consequences.",
      recommended: false,
      category: "socratic-probes",
      content: `# Probe: Implications & Consequences

Analyze a document by exploring implications and consequences.

## Usage
\`\`\`
/probe-implications <path-to-document>
\`\`\`

## Prompt

You are a Socratic analyst specializing in **exploring implications and consequences**.

Read the document at: $ARGUMENTS

Create a detailed Socratic evaluation that:

1. **Traces first-order implications** - What directly follows from the recommendation?
2. **Examines second-order effects** - What happens downstream? What if conditions change?
3. **Identifies unintended consequences** - What problems might this create?
4. **Explores consequences of being wrong** - What if key claims are false?
5. **Considers regulatory/compliance implications** - What legal exposure exists?
6. **Maps downstream effects** - Impact on roadmap, hiring, technical debt, operations

Structure your evaluation with:
- Consequence chains (if X then Y then Z)
- Scenario analysis (what if...)
- Risk assessment matrix
- Timeline of implications

Output the evaluation as markdown.

---

*By [@ds1](https://github.com/ds1) — from [socratic-probes](https://github.com/ds1/socratic-probes)*`
    },
    {
      id: "cmd-probe-pov",
      title: "/probe-pov",
      filename: "probe-pov.md",
      description: "Analyze a document by discovering alternative viewpoints.",
      recommended: false,
      category: "socratic-probes",
      content: `# Probe: Alternative Points of View

Analyze a document by discovering alternative viewpoints and conflicts.

## Usage
\`\`\`
/probe-pov <path-to-document>
\`\`\`

## Prompt

You are a Socratic analyst specializing in **discovering alternative viewpoints, perspectives, and conflicts**.

Read the document at: $ARGUMENTS

Create a detailed Socratic evaluation that:

1. **Presents strongest counter-arguments** - Steel-man the opposing positions
2. **Identifies stakeholder perspectives** not represented (customers, employees, competitors, regulators)
3. **Explores internal contradictions** - Are there conflicts within the analysis?
4. **Considers alternative approaches** - What other solutions weren't explored?
5. **Questions the framing** - Is this the only valid lens? What about other criteria?
6. **Steel-mans rejected options** - Present the best possible case for each alternative

Structure your evaluation with:
- Articulated counter-arguments
- Multiple stakeholder perspectives
- Internal contradiction analysis
- Alternative approaches table

Output the evaluation as markdown.

---

*By [@ds1](https://github.com/ds1) — from [socratic-probes](https://github.com/ds1/socratic-probes)*`
    },
    {
      id: "cmd-probe-qq",
      title: "/probe-qq",
      filename: "probe-qq.md",
      description: "Analyze a document by questioning the question itself.",
      recommended: false,
      category: "socratic-probes",
      content: `# Probe: Question the Question

Analyze a document by questioning the question itself.

## Usage
\`\`\`
/probe-qq <path-to-document>
\`\`\`

## Prompt

You are a Socratic analyst specializing in **questioning the question itself**.

Read the document at: $ARGUMENTS

Create a detailed Socratic evaluation that:

1. **Examines the framing** - Is this the right question to ask? What does it assume?
2. **Challenges scope** - Why these options and not others? Is the scope too narrow or too broad?
3. **Questions timing** - Is now the right time? What information would help?
4. **Explores meta-questions** - What's the real problem being solved? Is this approach necessary?
5. **Identifies questions not asked** - What important questions were overlooked?
6. **Proposes alternative framing** - What questions might lead to better clarity?

Structure your evaluation with:
- Analysis of the question's embedded assumptions
- Alternative questions that might be more useful
- Meta-level strategic considerations
- Reframed decision framework

Output the evaluation as markdown.

---

*By [@ds1](https://github.com/ds1) — from [socratic-probes](https://github.com/ds1/socratic-probes)*`
    },
    {
      id: "cmd-probe-synthesis",
      title: "/probe-synthesis",
      filename: "probe-synthesis.md",
      description: "Synthesize findings from existing Socratic evaluation files.",
      recommended: false,
      category: "socratic-probes",
      content: `# Probe: Synthesis

Synthesize findings from existing Socratic evaluation files into a consolidated summary.

## Usage
\`\`\`
/probe-synthesis <directory-containing-evaluations>
\`\`\`

## Prompt

You are synthesizing findings from 6 Socratic evaluations into a comprehensive summary document.

Look in the directory: $ARGUMENTS

Find and read these evaluation files:
- \`socratic-1-clarify-thinking.md\`
- \`socratic-2-challenge-assumptions.md\`
- \`socratic-3-evidence-basis.md\`
- \`socratic-4-alternative-viewpoints.md\`
- \`socratic-5-implications-consequences.md\`
- \`socratic-6-question-the-question.md\`

Create \`socratic-synthesis.md\` in the same directory that consolidates:

1. **Executive Summary** - Bottom-line assessment in 2-3 sentences. What's the verdict?

2. **Critical Findings Table**
   | # | Evaluation | Key Finding |
   |---|------------|-------------|
   | 1 | Clarify Thinking | ... |
   | 2 | Challenge Assumptions | ... |
   | 3 | Evidence Basis | ... |
   | 4 | Alternative Viewpoints | ... |
   | 5 | Implications | ... |
   | 6 | Question the Question | ... |

3. **Evidence Quality Assessment** - Summary of source reliability, bias, and gaps

4. **Assumption Risk Matrix** - Key assumptions ranked by impact if wrong
   | Assumption | Confidence | Impact if Wrong |
   |------------|------------|-----------------|

5. **Unexplored Alternatives** - Options the original document didn't consider

6. **Hidden Costs & Consequences** - Implications not addressed in the original

7. **The Meta-Question** - Is the original document asking the right question? What should it ask instead?

8. **Decision Framework** - Checklist of what must be validated before proceeding
   - [ ] Item 1
   - [ ] Item 2
   - [ ] ...

9. **Stakeholder Questions**
   - **For the CEO:** ...
   - **For the CTO:** ...
   - **For the CFO:** ...
   - **For Product:** ...

10. **Final Verdict** - Is the recommendation ready for action, or does it need more work?

The synthesis should be actionable, providing a clear path forward for decision-makers.

---

*By [@ds1](https://github.com/ds1) — from [socratic-probes](https://github.com/ds1/socratic-probes)*`
    }
  ],

  // ── Presets ─────────────────────────────────────────────────────────
  presets: {
    full: {
      name: "Full",
      description: "Everything. All CLAUDE.md sections, all settings, all commands.",
      icon: "\u2b50"
    },
    recommended: {
      name: "Recommended",
      description: "Core sections, essential settings, project management commands. Good starting point.",
      icon: "\u2705"
    },
    minimal: {
      name: "Minimal",
      description: "Core CLAUDE.md sections and basic settings only. No commands.",
      icon: "\ud83d\udce6"
    },
    commandsOnly: {
      name: "Commands Only",
      description: "Just the slash commands. No CLAUDE.md or settings changes.",
      icon: "\u26a1"
    }
  }
};
