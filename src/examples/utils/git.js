import fs from "node:fs";
import { system } from "../../utils/system.js";

/**
 * Basic Git Utilities
 * 
 * This module provides a simple and basic interface for git operations.
 * 
 * ====================================================================================================================
 *                                                  ⚠️ WARNING ⚠️
 * ====================================================================================================================
 * This is a quick-and-dirty module that was created simply to keep dependencies to a minimum while providing a simple
 * interface to show how to use the Together API to review code. It has neither tests nor proper type declarations and
 * almost certainly contains bugs and edge-cases that are not handled.
 * 
 * If you actually need a git library, use GitHub's Octokit:
 * https://www.npmjs.com/package/octokit
 * ====================================================================================================================
 */



/**
 * Get all untracked files in the current git repository.
 * 
 * @returns {Promise<string[]>} An array of untracked file names.
 */
async function getUntrackedFiles() {
  const rawOutput = await system.execute("git ls-files --others --exclude-standard");
  return rawOutput.trim().split("\n");
}

/**
 * Get all changed files in the current git repository.
 * 
 * ---
 * 
 * @example
 * ```js
 * const { deleted, changed, untracked } = await getChangedFiles();
 * ```
 * 
 * ---
 * 
 * @returns {Promise<{ deleted: string[], changed: string[], untracked: string[] }>} An object containing three arrays:
 *   - `deleted`: Array of files that were deleted.
 *   - `changed`: Array of files that were changed.
 *   - `untracked`: Array of files that are untracked. (Not yet staged for commit.)
 */
async function getChangedFiles() {
  const rawDiff = await system.execute("git diff --name-status HEAD");
  const lines = rawDiff.trim().split("\n");
  
  const deleted = [];
  const changed = [];
  const untracked = await getUntrackedFiles();

  for (const line of lines) {
    const [status, file] = line.split(/\s+/).map(s => s.trim());
    if (status === "D") {
      deleted.push(file);
    } else if (["M", "A"].includes(status)) {
      changed.push(file);
    } else {
      console.warn(`Unsupported git file status "${status}" for file "${file}". Skipping...`);
    }
  }

  return {
    deleted,
    changed,
    untracked,
  };
}

/**
 * Get the changes in a file.
 * 
 * Uses the `git diff` command to get the changes in a file.
 * 
 * ---
 * 
 * @example
 * ```js
 * const { added, removed } = await getFileChanges("src/index.js");
 * ```
 * 
 * ---
 * 
 * @param {string} file - The file to get the changes from.
 * @returns {Promise<{ added: string[], removed: string[] }>} An object containing two arrays:
 *   - `added`: Array of lines that were added.
 *   - `removed`: Array of lines that were removed.
 */
async function getFileChanges(file) {
  const rawDiff = await system.execute(`git diff --unified=0 -- "${file}"`);
  const lines = rawDiff.split("\n");
  
  const added = [];
  const removed = [];

  for (const line of lines) {
    if (/^\+\s/.test(line)) {
      added.push(line);
    } else if (/^-\s/.test(line)) {
      removed.push(line);
    }
  }
  return {
    added,
    removed,
  };
}


/**
 * Get a human-readable summary of the changes in the current branch.
 * 
 * Uses the `git diff` command to get the changes in the current branch and then formats them into a human-readable
 * summary.
 * 
 * Optionally, you can include files that are not yet staged for commit. This will include new files that have not yet
 * been added to the working tree using `git add`.
 * 
 * ---
 * 
 * @example
 * ```js
 * const { files, changes } = await getDiffSummary({
 *   // Also include newly created files that are not yet staged for commit.
 *   includeUntracked: true,
 * });
 * ```
 * 
 * @param {Object} options - The options for the review.
 * @param {boolean} options.includeUntracked - Whether to include untracked files in the review. (Default: `true`)
 * @returns {Promise<{ files: string[], changes: string }>} An object containing two arrays:
 *   - `files`: Array of files that were changed.
 *   - `changes`: A human-readable summary of the changes.
 */
async function getDiffSummary({ includeUntracked } = { includeUntracked: true }) {
  const changesLines = [];
  const { deleted, changed, untracked } = await git.getChangedFiles();
  const files = [...deleted, ...changed];
  
  // Add deleted files and removed lines to the message
  await Promise.all(deleted.map(async (file) => {
    const { removed } = await git.getFileChanges(file);
    changesLines.push(`Deleted ${file}:`);
    changesLines.push(...removed.map((line) => `\t${line}`));
  }));

  // Add changed files and added/removed lines to the message
  await Promise.all(changed.map(async (file) => {
    const { added, removed } = await git.getFileChanges(file);
    changesLines.push(`${file} (${added.length} additions, ${removed.length} deletions)`);
    changesLines.push("Added:");
    changesLines.push(...added.map((line) => `\t${line}`));
    changesLines.push("Removed:");
    changesLines.push(...removed.map((line) => `\t${line}`));
  }));

  if (includeUntracked) {
    files.push(...untracked);
    // Add new (untracked) files and their contents to the message
    untracked.forEach(async (file) => {
      const content = fs.readFileSync(file, "utf8");
      const lines = content.split("\n");
      changesLines.push(`New file ${file}:`);

      // If a file is empty, add a placeholder
      if (lines.length > 0) {
        changesLines.push(...lines.map((line) => `\t${line}`));
      } else {
        changesLines.push('\t<empty>');
      }
    });
  }

  return {
    files,
    changes: changesLines.join("\n"),
  };
}

export const git = {
  getUntrackedFiles,
  getChangedFiles,
  getFileChanges,
  getDiffSummary,
};
