# CLAUDE.md

The project rules live in a single place, `.cursor/rules/*.mdc`, so that Claude Code
and Cursor use the same rules. Change rules **only there** – this file just imports
them. New `.mdc` file → add an import line here.

@.cursor/rules/git-flow.mdc
@.cursor/rules/project.mdc
@.cursor/rules/typescript.mdc
@.cursor/rules/math.mdc
@.cursor/rules/testing.mdc
