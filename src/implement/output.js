export function displayNextSteps(targetDir, sliceId) {
  console.log("Implement complete (local only)")
  console.log("")
  console.log("Next (human):")
  console.log(`- Review: cd ${targetDir} && git status && git diff`)
  console.log(`- Commit: git add -A && git commit -m "feat: implement ${sliceId}"`)
}
