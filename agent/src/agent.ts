import { fetchPullRequest, postReviewComment, type PrInfo } from './tools/github.js';
import { searchMemory, startRun, completeRun, type MemoryHit } from './tools/devmind.js';
import { reviewPr, renderReviewComment, type ReviewResult } from './tools/llm.js';

export interface ReviewOptions {
  prUrl: string;
  postComment: boolean;
  memoryQuery?: string;
  memoryLimit?: number;
}

export interface AgentOutcome {
  runId: string;
  pr: { owner: string; repo: string; number: number; title: string };
  memories: MemoryHit[];
  review: ReviewResult;
  comment: string;
  reviewPosted: boolean;
  durationMs: number;
}

function summarizeForMemoryQuery(pr: PrInfo, override?: string): string {
  if (override) return override;
  const fileHint = pr.changedFiles.slice(0, 8).join(' ');
  return `${pr.title}\n${pr.body.slice(0, 500)}\nfiles: ${fileHint}`;
}

export async function runReview(options: ReviewOptions): Promise<AgentOutcome> {
  const start = Date.now();
  console.log(`[agent] Fetching PR ${options.prUrl}`);
  const pr = await fetchPullRequest(options.prUrl);

  console.log(`[agent] Starting run for PR #${pr.number} "${pr.title}"`);
  const run = await startRun({
    prNumber: pr.number,
    prTitle: pr.title,
    prUrl: pr.url,
  });

  try {
    const query = summarizeForMemoryQuery(pr, options.memoryQuery);
    console.log(`[agent] Searching DevMind memory…`);
    const memories = await searchMemory(query, options.memoryLimit ?? 5);
    console.log(`[agent]   ${memories.length} relevant memories found`);

    console.log(`[agent] Reasoning with Gemini…`);
    const review = await reviewPr(pr, memories);
    const comment = renderReviewComment(review, memories);

    let reviewPosted = false;
    if (options.postComment) {
      console.log(`[agent] Posting review comment to GitHub…`);
      await postReviewComment({ owner: pr.owner, repo: pr.repo, number: pr.number }, comment);
      reviewPosted = true;
    } else {
      console.log(`[agent] Skipping GitHub comment (--no-post)`);
    }

    const durationMs = Date.now() - start;
    await completeRun(run.id, {
      status: 'completed',
      reasoning: `${review.summary}\n\nVerdict: ${review.verdict}\nConcerns: ${review.concerns.length}, Praise: ${review.praise.length}`,
      comment,
      memoriesQueried: memories.map((m) => m.id),
      reviewPosted,
      durationMs,
    });

    return {
      runId: run.id,
      pr: { owner: pr.owner, repo: pr.repo, number: pr.number, title: pr.title },
      memories,
      review,
      comment,
      reviewPosted,
      durationMs,
    };
  } catch (err) {
    const durationMs = Date.now() - start;
    const errorMessage = err instanceof Error ? err.message : String(err);
    await completeRun(run.id, {
      status: 'failed',
      errorMessage,
      durationMs,
    });
    throw err;
  }
}
