<!-- Pull requests go against `develop`. Security problems: see SECURITY.md, not a PR. -->

## What and why

<!-- What does this change, and why? Link the issue: "Closes #123". -->

## Tests

<!-- Which tests were added or changed? Bug fixes need a test that fails without the fix. -->

## Checklist

- [ ] Branch is rebased on the current `develop` and the PR targets `develop`
- [ ] PR title is a Conventional Commit (it becomes the squash commit subject)
- [ ] `npm run check` is green locally
- [ ] Tests added / updated
- [ ] Canvas and SVG output checked (for rendering changes)
- [ ] `CHANGELOG.md` (`[Unreleased]`) and `README.md` updated if needed
- [ ] No new runtime dependencies; workflow / dependency changes are explained above
