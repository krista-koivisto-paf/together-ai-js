/**
 * Get a pull request from a GitHub repository.
 * 
 * @param {string} repo - The repository name in the format "owner/repo".
 * @param {number} prNumber - The pull request number.
 * @returns {Promise<Object>} The pull request object.
 */
async function getPullRequest(repo, prNumber) {
  const pr = await fetch(`https://api.github.com/repos/${repo}/pulls/${prNumber}`);
  return pr.json();
}

/**
 * Get the contents of a file from a GitHub repository.
 * 
 * @param {string} repo - The repository name in the format "owner/repo".
 * @param {string} path - The path to the file.
 * @returns {Promise<string>} The contents of the file.
 */
async function getFileContents(repo, path) {
  const file = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`);
  return file.json();
}

export const github = {
  getPullRequest,
  getFileContents,
};
