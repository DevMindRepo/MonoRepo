# DevMind PR Reviewer Agent

Autonomous code reviewer that reads a GitHub PR, queries DevMind memory for related team decisions, reasons with Gemini, and posts a review comment.

## How it works

```
GitHub PR URL
     ↓
[fetch PR diff + metadata] (Octokit)
     ↓
[POST /agent-runs] → run record (status: running)
     ↓
[POST /memories/search] → top-N relevant memories
     ↓
[Gemini gemini-2.5-flash] → review JSON
     ↓
[optional: post comment to GitHub]
     ↓
[PATCH /agent-runs/:id] → status: completed, comment, memoriesQueried[]
```

Every run is logged to the DevMind backend, so the dashboard `/agent-timeline` shows every review the agent did.

## Setup

Required env vars (read from `../.env` at the monorepo root):

```
DEVMIND_API_BASE_URL=http://localhost:3001
DEVMIND_API_TOKEN=dm_sk_...           # generate at /connect
DEVMIND_WORKSPACE_ID=cmpkopbkn0001...  # target workspace
GITHUB_APP_TOKEN=ghp_...              # PAT with `repo` scope
GEMINI_API_KEY=...                    # https://aistudio.google.com/apikey
GEMINI_CHAT_MODEL=gemini-2.5-flash    # optional
```

Build (only required for `start`, dev mode uses tsx):

```bash
pnpm build
```

## Usage

Dry-run (no comment posted to GitHub):

```bash
pnpm review https://github.com/DevMindRepo/backend/pull/1
```

Post the review comment to the PR:

```bash
pnpm review https://github.com/DevMindRepo/backend/pull/1 --post
```

Override the memory search query (useful when the PR title is ambiguous):

```bash
pnpm review <pr-url> --query "auth middleware decision"
```

Tune how many memories to retrieve:

```bash
pnpm review <pr-url> --limit 8
```

## Output

The agent prints the verdict, memory IDs used, duration, and the rendered comment. It also writes a row to the `AgentRun` table — visit `http://localhost:3000/agent-timeline` to see the execution history in the dashboard.

## How to trigger from a webhook

The current MVP is CLI-only. To wire to the GitHub App webhook:

1. Install the GitHub App on a test repo (see `backend/src/routes/webhook/github.ts`).
2. Have the webhook handler enqueue PR URLs into Redis (or call `runReview()` inline).
3. Run this agent as a long-lived worker that polls the queue.

For the hackathon demo, **manual CLI invocation is the recommended flow** — it lets you stage the demo deterministically.
