export function repoSlug(repo) {
  return String(repo || "")
    .trim()
    .replaceAll("/", "__")
    .replaceAll(" ", "-")
}
