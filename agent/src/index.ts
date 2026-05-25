import { runReview } from './agent.js';

interface CliArgs {
  prUrl: string;
  postComment: boolean;
  query?: string;
  limit?: number;
}

function parseArgs(argv: string[]): CliArgs {
  const args: Partial<CliArgs> = { postComment: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--pr' || a === '-p') args.prUrl = argv[++i];
    else if (a === '--post') args.postComment = true;
    else if (a === '--no-post') args.postComment = false;
    else if (a === '--query' || a === '-q') args.query = argv[++i];
    else if (a === '--limit' || a === '-l') args.limit = Number(argv[++i]);
    else if (a === '--help' || a === '-h') {
      printHelp();
      process.exit(0);
    } else if (a.startsWith('https://github.com/') && !args.prUrl) {
      args.prUrl = a;
    }
  }
  if (!args.prUrl) {
    printHelp();
    process.exit(1);
  }
  return args as CliArgs;
}

function printHelp() {
  console.log(`DevMind PR Reviewer Agent

Usage:
  pnpm review <pr-url> [--post] [--query "..."] [--limit 5]

Options:
  --pr, -p <url>       GitHub PR URL (or pass as first positional arg)
  --post               Post the review comment to GitHub (default: dry-run)
  --no-post            Skip posting to GitHub (default)
  --query, -q <text>   Override the memory search query
  --limit, -l <n>      Max memories to retrieve (default 5)
  --help, -h           Show this help

Env vars required (loaded from ../.env):
  DEVMIND_API_BASE_URL   default http://localhost:3001
  DEVMIND_API_TOKEN      dm_sk_* token from /connect
  DEVMIND_WORKSPACE_ID   target workspace
  GITHUB_APP_TOKEN       PAT with repo scope
  GEMINI_API_KEY         Gemini API key
  GEMINI_CHAT_MODEL      default gemini-2.5-flash

Example:
  pnpm review https://github.com/owner/repo/pull/42
  pnpm review https://github.com/owner/repo/pull/42 --post --limit 8
`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  try {
    const outcome = await runReview({
      prUrl: args.prUrl,
      postComment: args.postComment,
      memoryQuery: args.query,
      memoryLimit: args.limit,
    });

    console.log('\n=== Review complete ===');
    console.log(`Run ID:        ${outcome.runId}`);
    console.log(`PR:            ${outcome.pr.owner}/${outcome.pr.repo}#${outcome.pr.number}`);
    console.log(`Verdict:       ${outcome.review.verdict}`);
    console.log(`Memories used: ${outcome.memories.length}`);
    console.log(`Posted:        ${outcome.reviewPosted ? 'yes' : 'no (dry-run)'}`);
    console.log(`Duration:      ${outcome.durationMs}ms`);
    console.log('\n--- Comment preview ---\n');
    console.log(outcome.comment);
  } catch (err) {
    console.error('\n[agent] Failed:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

main();
