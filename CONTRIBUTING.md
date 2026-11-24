# Contributing to geo.js

Thanks for your interest! Bug reports, ideas and pull requests are welcome.
By taking part you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Reporting bugs and ideas

- **Security problems:** never in public – see [SECURITY.md](SECURITY.md).
- **Bugs and feature requests:** open an [issue](https://github.com/janwalenda/geo.js/issues/new/choose)
  using one of the templates. Please search for existing issues first.
- For larger changes, open an issue before writing code so we can agree on the approach.

## Pull requests

Only the maintainer can push to this repository. Everyone else contributes through a
**fork**:

1. Fork the repository, clone your fork and add this repository as `upstream`:
   ```bash
   git remote add upstream https://github.com/janwalenda/geo.js.git
   ```
2. Create a branch from `develop` (not `main`):
   ```bash
   git checkout develop
   git checkout -b feature/short-name   # or bugfix/short-name
   ```
3. Make your change, with tests (see below).
4. Run the full check locally:
   ```bash
   npm ci
   npm run check   # typecheck, lint, format check, tests, build
   ```
5. Push to your fork and open a pull request **against `develop`**.

What happens next:

- CI runs on your pull request. For first-time contributors a maintainer has to approve
  the run first – that is a security measure, not a judgement.
- A maintainer reviews the change. `develop` and `main` are protected: a pull request
  needs green CI, an approving review and resolved conversations before it is merged.
- The history of `develop` and `main` is linear. Pull requests are merged with
  **"Squash and merge"**: your branch becomes one commit, and the **PR title becomes its
  subject** – so please write the title as a Conventional Commit, e.g.
  `fix(svg): escape image URLs`.
- Keep your branch up to date by **rebasing** onto `develop`, not by merging `develop` into it:
  ```bash
  git fetch upstream
  git rebase upstream/develop
  git push --force-with-lease
  ```
- Please keep a pull request focused on one logical change.

## Rules for code changes

- **Tests are required.** Every feature needs tests for the new behaviour, every bug fix
  a regression test that fails without the fix. All tests live in `test/`, mirroring `src/`.
- **Canvas and SVG must produce the same image** for the same scene.
- Layers below `src/renderers/` must not use the DOM (they are tested in Node).
- Code style is enforced by ESLint and Prettier: run `npm run format` and
  `npm run lint:fix`, then fix what remains by hand. Lines are at most 80
  characters; one class per file; exported types live in the folder's
  `types.ts`; every public method has JSDoc. Details in
  [`.cursor/rules/typescript.mdc`](.cursor/rules/typescript.mdc).
- TypeScript `strict`, no `any`, named exports only.
- Public API is exported only through `src/index.ts`; update `README.md` examples
  (they are executed by `test/readme.test.ts`) when the API changes.
- Note user-visible changes in the `[Unreleased]` section of [CHANGELOG.md](CHANGELOG.md).
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):
  `feat(render): …`, `fix(svg): …`, `docs: …`, `test: …`.

The full project conventions are in [`.cursor/rules/`](.cursor/rules/).

## Dependencies and workflows

To keep the supply chain small, please do not add runtime dependencies. New dev
dependencies or changes to `.github/workflows/` need a short justification in the pull
request and get an extra careful review.

## License

By contributing you agree that your contribution is licensed under the
[MIT License](LICENSE) of this project.
