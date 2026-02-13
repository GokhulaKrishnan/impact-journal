# Impact Journal

**Automatically track your GitHub activity. Generate standups, summaries, and performance-ready narratives — instantly.**

Impact Journal is a developer-focused CLI tool and MCP server that turns raw GitHub activity into structured, actionable insights. It eliminates the manual effort of recalling work, preparing standups, or writing performance review narratives.

---

## Why This Exists

Developers consistently lose time and clarity trying to reconstruct their own work:

- **Daily Standups** — "What did I do yesterday?"
- **Performance Reviews** — digging through old PRs and commits
- **Interviews** — struggling to recall project details
- **Resume Updates** — manually rewriting accomplishments
- **Code Changes** — accidentally destabilizing stable files

This creates friction, reduces accuracy, and leads to under-reported impact.

---

## What Impact Journal Does

Impact Journal automatically pulls your GitHub activity and generates:

- Daily standups
- Weekly/monthly summaries
- AI-powered narratives for performance reviews
- File risk analysis to prevent code destabilization
- Repository-level breakdowns of commits, PRs, and reviews
- Clipboard-ready outputs for Slack, Notion, or email

Designed for reliability, speed, and zero manual tracking.

---

## Installation

```bash
npm install -g impact-journal
```

Or build locally:

```bash
git clone https://github.com/GokhulaKrishnan/impact-journal.git
cd impact-journal
pnpm install
pnpm build
```

---

## Quick Start

```bash
# 1. Authenticate with GitHub
impact login

# 2. Sync your activity
impact sync

# 3. Generate summaries
impact summary -p week

# 4. Check file risk before making changes
impact file-risk src/auth.ts
```

---

## Commands

### Authentication

```bash
impact login      # Connect GitHub account via OAuth Device Flow
impact logout     # Disconnect account
impact status     # View current authentication state
```

### Data Sync

```bash
impact sync       # Fetch latest GitHub commits, PRs, and reviews
```

### Summaries

```bash
impact summary                  # Default: this week
impact summary -p today         # Today's work
impact summary -p week          # Weekly summary
impact summary -p month         # Monthly summary
impact summary --ai             # AI-generated narrative
impact summary --copy           # Copy output to clipboard
```

### Standups

```bash
impact standup                  # Generate standup message
impact standup --copy           # Copy to clipboard
```

### File Risk Analysis

```bash
impact file-risk <filename>     # Analyze file stability and risk level
```

**Check if a file is safe to modify:**

```bash
impact file-risk packages/core/src/services/github.ts
```

**Output:**

```
Activity (last 90 days): 3 commits
Repository average: 1.3 commits
This file: 2.3x above average [WARNING]

Bug fixes: 0/3 commits (0%)
Repository average: 0%

Stability trend:
Baseline: 0 commits
Recent: 3 commits
Trend: Increasing (100%)

RISK LEVEL: MEDIUM

Reasons:
  • Activity 2.3x above average
  • Activity is increasing
```

**What it analyzes:**

- Change frequency (vs repository average)
- Bug fix density (% of commits fixing bugs)
- Activity trends (stable → unstable transitions)
- Risk assessment (HIGH/MEDIUM/LOW)

**Use cases:**

- Before refactoring stable code
- Before touching unfamiliar files
- Before making breaking changes
- Identifying files in constant bug-fix mode

---

## Example Output

### Weekly Summary

```
Date range: Sun Jan 26 2026 – Sat Feb 01 2026

Total commits: 8

By repository:
  impact-journal: 6 commits
    - feat: add OAuth login flow
    - feat: add sync command
    - feat: add AI summaries
  slack-bot: 2 commits
    - fix: message formatting
    - feat: add slash commands

Pull requests: 1
  - Add user dashboard [open] (impact-journal)
```

### AI Narrative

```
This week I focused on expanding Impact Journal's core capabilities,
including secure GitHub OAuth authentication and a robust sync pipeline
for fetching repository activity. I also integrated AI-powered summaries
using Groq, enabling developers to generate polished narratives for
performance reviews with a single command.
```

### Standup

```
STANDUP

Yesterday:
  - feat: add AI summaries (impact-journal)
  - fix: date filtering bug (impact-journal)

Today:
  - Work on: Add user dashboard (#42)

Blockers:
  - None
```

---

## MCP Integration (Claude Desktop)

Impact Journal exposes an MCP server for conversational access.

### Setup

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "impact-journal": {
      "command": "node",
      "args": ["/path/to/impact-journal/packages/mcp-server/dist/index.js"]
    }
  }
}
```

### Usage

Ask Claude:

- "What did I work on this week?"
- "Generate a standup for me"
- "Summarize my work this month"
- "Should I modify bluetooth/connection.ts?"
- "What's the risk of editing packages/core/src/services/github.ts?"

### Available MCP Tools

1. **get_summary** - Get work summary for a time period (today/week/month)
2. **get_standup** - Generate standup message with yesterday's work
3. **analyze_file_risk** - Analyze file stability and risk level

---

## Architecture

```
impact-journal/
├── packages/
│   ├── core/           # Shared business logic (GitHub API, parsing, summaries, file analysis)
│   ├── cli/            # Command-line interface (Commander.js)
│   └── mcp-server/     # MCP server for Claude Desktop
```

### Design Principles

- Separation of concerns via pnpm workspaces
- Deterministic output for summaries and standups
- Local-first storage for reliability and offline access
- Extensible architecture for future integrations (web dashboard, AI agents)

---

## Tech Stack

- **Language**: TypeScript
- **CLI Framework**: Commander.js
- **AI**: Groq (Llama 3.3)
- **Auth**: GitHub OAuth Device Flow
- **Testing**: Jest
- **Monorepo**: pnpm workspaces

---

## Development

```bash
pnpm install
pnpm build

# Run tests
cd packages/core && pnpm test

# Run CLI locally
node packages/cli/dist/index.js summary -p week
```

---

## Environment Variables

Create `.env` in project root:

```
GROQ_API_KEY=your_groq_api_key_here
```

Get a free API key at [console.groq.com](https://console.groq.com)

---

## Features

- GitHub OAuth Device Flow authentication
- Automatic data sync (commits, PRs, reviews with file details)
- Work summaries (daily/weekly/monthly)
- AI-powered summaries using Groq LLM
- Standup message generation
- File risk analysis and stability detection
- MCP server for Claude Desktop integration
- Copy to clipboard support

---

## License

MIT

---

## Author

Built by Gokhula Krishnan Thangavel

---

## Contributing

Contributions welcome — please open an issue to discuss proposed changes.
