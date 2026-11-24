# Security policy

## Supported versions

geo.js is before 1.0. Security fixes are made for the latest released version only.

| Version | Supported |
|---------|-----------|
| latest `0.x` release | yes |
| older releases | no |

## Reporting a vulnerability

**Please do not open a public issue, pull request or discussion for security problems.**

Report it privately through GitHub instead:
[Report a vulnerability](https://github.com/janwalenda/geo.js/security/advisories/new)
(repository tab *Security* → *Report a vulnerability*).

Please include:

- the affected version or commit,
- a description of the problem and its impact,
- steps or a minimal example to reproduce it.

You can expect a first answer within 7 days. Once the problem is confirmed, a fix is
prepared in a private fork, released, and published as a GitHub security advisory.
Reporters are credited in the advisory unless they prefer otherwise.

## Scope

geo.js renders scenes to Canvas 2D and SVG in the browser. Relevant are for example:

- markup injection through values that end up in generated SVG (colors, image URLs, text),
- problems in the published npm package or the build/release pipeline.

Out of scope: bugs without security impact (please open a normal issue) and problems in
applications that pass untrusted input to geo.js without validating it.
