// data.js — All config content from ds1/claude-code-config embedded as JS objects
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
      description: "Allow npm, npx, node, git, gh, curl, and basic filesystem commands.",
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
      description: "Python, pip, cargo, rustup, openssl, tsx, and other dev tools.",
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
      description: "Block rm -rf, force-push, hard reset, and drop table.",
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
      description: "Auto-approve all tool calls. Pair with Safety Net section in CLAUDE.md.",
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
   - **Current Sprint** \u2014 what's committed for this cycle
   - **High Priority** \u2014 should be done soon
   - **Medium Priority** \u2014 planned but not urgent
   - **Low Priority / Ideas** \u2014 nice to have

3. If the user asks to reprioritize, update the source file accordingly.

4. If no backlog exists anywhere, offer to create \`_planning/backlog.md\` from the user's input or by scanning STATUS.md and GitHub Issues.

---

*By [@ds1](https://github.com/ds1) \u2014 [claude-code-config](https://github.com/ds1/claude-code-config)*`
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

*By [@ds1](https://github.com/ds1) \u2014 [claude-code-config](https://github.com/ds1/claude-code-config)*`
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
   - Check for uncommitted changes \u2014 warn if working tree is dirty
   - Show the current branch and last commit

3. Confirm with the user: "Ready to deploy [branch] to production via [platform]. Proceed?"

4. Run the deployment command.

5. If the project has a docs site (Docusaurus in \`docs/\`), ask if docs should be deployed too.

6. After deployment, update STATUS.md with the deployment timestamp.

---

*By [@ds1](https://github.com/ds1) \u2014 [claude-code-config](https://github.com/ds1/claude-code-config)*`
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
     Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd "PROJECT_PATH"; npm run dev'
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

*By [@ds1](https://github.com/ds1) \u2014 [claude-code-config](https://github.com/ds1/claude-code-config)*`
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
   - **README.md** \u2014 project overview, setup instructions, features list, API docs
   - **User-facing docs** \u2014 Docusaurus/docs folder if it exists
   - **CHANGELOG.md** \u2014 any unreleased changes not yet logged

3. Delegate updates to a background subagent using the Task tool with \`run_in_background: true\`:
   - The subagent reads the changed code and updates all relevant docs
   - Updates should reflect what end users need to know, not implementation details
   - If README.md doesn't exist, create one with: project name, description, setup/install, usage, tech stack, and license

4. The subagent should commit doc changes separately:
   - \`docs: update README for [feature/change]\`
   - \`docs: update user docs for [feature/change]\`

5. Report back to the user what was updated.

---

*By [@ds1](https://github.com/ds1) \u2014 [claude-code-config](https://github.com/ds1/claude-code-config)*`
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
   - Check what already exists \u2014 don't overwrite existing files
   - Determine the tech stack from existing files

2. Create the following files if they don't exist:

   **\`.gitignore\`** \u2014 with at minimum:
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

   **\`STATUS.md\`**, **\`CHANGELOG.md\`**, **\`README.md\`**, **\`_planning/\`** directory, and **\`CLAUDE.md\`** starter.

3. Initialize git if not already a repo (\`git init\`).

4. Report what was created, listing each file.

---

*By [@ds1](https://github.com/ds1) \u2014 [claude-code-config](https://github.com/ds1/claude-code-config)*`
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

1. Read the current \`CHANGELOG.md\`. If it doesn't exist, create one.
2. Determine the entry type: Added, Changed, Fixed, or Removed.
3. Add the entry under \`[Unreleased]\` in the appropriate category.
4. **Version tagging:** Ask if this should be tagged as a release. Suggest semver bumps (patch/minor/major).
5. Show what was added.

---

*By [@ds1](https://github.com/ds1) \u2014 [claude-code-config](https://github.com/ds1/claude-code-config)*`
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

1. Look for plans in \`_planning/plans/\`. If empty, say "No plans saved yet."
2. List all plan files with date, name, and progress (e.g., "3/7 done").
3. Ask the user which plan to open by number.
4. Display full contents and highlight remaining TODOs.

---

*By [@ds1](https://github.com/ds1) \u2014 [claude-code-config](https://github.com/ds1/claude-code-config)*`
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

1. Gather context: branch, commits, diff summary.
2. Draft title (conventional format, under 70 chars) and body (Summary, Changes, Test Plan).
3. Create the PR with \`gh pr create\`.
4. Return the PR URL.

---

*By [@ds1](https://github.com/ds1) \u2014 [claude-code-config](https://github.com/ds1/claude-code-config)*`
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

## Steps

1. Parse and classify: tool permission (settings.json), behavioral instruction (CLAUDE.md), or project memory (memory/MEMORY.md).
2. Show what will be saved and where.
3. Save to the appropriate file.
4. Confirm persistence.

---

*By [@ds1](https://github.com/ds1) \u2014 [claude-code-config](https://github.com/ds1/claude-code-config)*`
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

1. Read \`STATUS.md\` in the project root. If it doesn't exist, offer to create one.
2. Optionally scan recent git log (last 5 commits).
3. Present: In Progress, Blockers, Up Next, Recent Completions.

---

*By [@ds1](https://github.com/ds1) \u2014 [claude-code-config](https://github.com/ds1/claude-code-config)*`
    },
    {
      id: "cmd-update-status",
      title: "/update-status",
      filename: "update-status.md",
      description: "Update STATUS.md with current project state.",
      recommended: true,
      category: "project-management",
      content: `# Update Project Status

Update \`STATUS.md\` to reflect current project state.

## Steps

1. Read current \`STATUS.md\` or create from template.
2. Move completed items, add new items, update timestamp.
3. Keep "Recently Completed" trimmed to last 10 items.

---

*By [@ds1](https://github.com/ds1) \u2014 [claude-code-config](https://github.com/ds1/claude-code-config)*`
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
\`/probe-start <path-to-document> <output-directory>\`

Launches agents for: Clarify Thinking, Challenge Assumptions, Evidence Basis, Alternative Viewpoints, Implications & Consequences, Question the Question. Creates synthesis document.

---

*By [@ds1](https://github.com/ds1) \u2014 from [socratic-probes](https://github.com/ds1/socratic-probes)*`
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
\`/probe-clarify <path-to-document>\`

Identifies key claims, questions definitions, traces conclusion origins, examines reasoning chains, highlights ambiguities.

---

*By [@ds1](https://github.com/ds1) \u2014 from [socratic-probes](https://github.com/ds1/socratic-probes)*`
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
\`/probe-assume <path-to-document>\`

Identifies hidden assumptions, questions premises, challenges comparison methodology, tests robustness.

---

*By [@ds1](https://github.com/ds1) \u2014 from [socratic-probes](https://github.com/ds1/socratic-probes)*`
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
\`/probe-evidence <path-to-document>\`

Audits sources, evaluates evidence quality, identifies unsupported assertions, assesses completeness.

---

*By [@ds1](https://github.com/ds1) \u2014 from [socratic-probes](https://github.com/ds1/socratic-probes)*`
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
\`/probe-implications <path-to-document>\`

Traces first/second-order implications, identifies unintended consequences, maps downstream effects.

---

*By [@ds1](https://github.com/ds1) \u2014 from [socratic-probes](https://github.com/ds1/socratic-probes)*`
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
\`/probe-pov <path-to-document>\`

Presents counter-arguments, identifies unrepresented stakeholders, explores contradictions, steel-mans alternatives.

---

*By [@ds1](https://github.com/ds1) \u2014 from [socratic-probes](https://github.com/ds1/socratic-probes)*`
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
\`/probe-qq <path-to-document>\`

Examines framing, challenges scope, questions timing, explores meta-questions, proposes alternative framing.

---

*By [@ds1](https://github.com/ds1) \u2014 from [socratic-probes](https://github.com/ds1/socratic-probes)*`
    },
    {
      id: "cmd-probe-synthesis",
      title: "/probe-synthesis",
      filename: "probe-synthesis.md",
      description: "Synthesize findings from existing Socratic evaluation files.",
      recommended: false,
      category: "socratic-probes",
      content: `# Probe: Synthesis

Synthesize findings from 6 Socratic evaluations into a consolidated summary.

## Usage
\`/probe-synthesis <directory-containing-evaluations>\`

Creates executive summary, critical findings table, assumption risk matrix, decision framework, stakeholder questions, and final verdict.

---

*By [@ds1](https://github.com/ds1) \u2014 from [socratic-probes](https://github.com/ds1/socratic-probes)*`
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
