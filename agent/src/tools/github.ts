import { Octokit } from 'octokit';
import { getEnv } from '../config.js';

let cached: Octokit | null = null;

function getOctokit(): Octokit {
  if (cached) return cached;
  const env = getEnv();
  cached = new Octokit({ auth: env.GITHUB_APP_TOKEN });
  return cached;
}

export interface PrInfo {
  owner: string;
  repo: string;
  number: number;
  title: string;
  body: string;
  url: string;
  diff: string;
  changedFiles: string[];
  author: string;
  baseRef: string;
  headRef: string;
}

/**
 * Parse a GitHub PR URL like https://github.com/owner/repo/pull/42
 */
export function parsePrUrl(url: string): { owner: string; repo: string; number: number } {
  const m = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (!m) throw new Error(`Invalid GitHub PR URL: ${url}`);
  return { owner: m[1], repo: m[2], number: Number(m[3]) };
}

export async function fetchPullRequest(url: string): Promise<PrInfo> {
  const { owner, repo, number } = parsePrUrl(url);
  const octokit = getOctokit();

  const { data: pr } = await octokit.rest.pulls.get({ owner, repo, pull_number: number });

  // Fetch diff as text (custom Accept header)
  const diffRes = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
    owner,
    repo,
    pull_number: number,
    mediaType: { format: 'diff' },
  });

  const { data: files } = await octokit.rest.pulls.listFiles({ owner, repo, pull_number: number });

  return {
    owner,
    repo,
    number,
    title: pr.title,
    body: pr.body ?? '',
    url: pr.html_url,
    diff: diffRes.data as unknown as string,
    changedFiles: files.map((f) => f.filename),
    author: pr.user?.login ?? 'unknown',
    baseRef: pr.base.ref,
    headRef: pr.head.ref,
  };
}

export async function postReviewComment(pr: { owner: string; repo: string; number: number }, body: string): Promise<void> {
  const octokit = getOctokit();
  await octokit.rest.issues.createComment({
    owner: pr.owner,
    repo: pr.repo,
    issue_number: pr.number,
    body,
  });
}
