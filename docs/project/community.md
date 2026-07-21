# Community sources and acknowledgements

The documentation is checked against source code, but source code alone does not
show every deployment failure or explain which detail is confusing to an operator.
Community reports provide that missing evidence. This page records the people and
threads that directly shaped the current documentation.

## Contributors referenced in the documentation

| Contributor | Report or discussion | Documentation improved |
| --- | --- | --- |
| [arcoast](https://github.com/arcoast) | [Remote YouTube login, discussion #122](https://github.com/TypeType-Video/TypeType/discussions/122) | WebSocket proxy requirements and the stale-nginx diagnostic |
| [arcoast](https://github.com/arcoast) | [Database variable naming, discussion #123](https://github.com/TypeType-Video/TypeType/discussions/123) | PostgreSQL variables as the single stack-level source of truth |
| [arcoast](https://github.com/arcoast) | [Authelia and Pocket ID OIDC guide, discussion #128](https://github.com/TypeType-Video/TypeType/discussions/128) | Tested provider examples and callback settings |
| [arcoast](https://github.com/arcoast) | [Garage RPC secret, discussion #130](https://github.com/TypeType-Video/TypeType/discussions/130) | Random `GARAGE_RPC_SECRET` generation for manual installs |
| [hugoghx](https://github.com/hugoghx) | [Token container environment, discussion #156](https://github.com/TypeType-Video/TypeType/discussions/156) | Token service naming, internal network boundary, and current hardening limits |
| [hulmgulm](https://github.com/hulmgulm) | [First-admin setup, discussion #151](https://github.com/TypeType-Video/TypeType/discussions/151) | Bootstrap status and exact-origin CORS troubleshooting |
| [Toni-Vide](https://github.com/Toni-Vide) | [Unexpected sign-outs, discussion #162](https://github.com/TypeType-Video/TypeType/discussions/162) | Access-token, refresh-cookie, and session troubleshooting |
| [nanhoes](https://github.com/nanhoes) | [iOS download flow, issue #116](https://github.com/TypeType-Video/TypeType/issues/116) | Authentication propagation and artifact-path review |
| [lelam183](https://github.com/lelam183) | [Imported playlist behavior, issue #135](https://github.com/TypeType-Video/TypeType/issues/135) | Import deduplication, system-playlist mapping, and background metadata repair |
| [hugoghx](https://github.com/hugoghx) | [Livestream playback, issue #145](https://github.com/TypeType-Video/TypeType/issues/145) | Live playback and moving-window review |
| [Priveetee](https://github.com/Priveetee) | [Live quality changes, issue #163](https://github.com/TypeType-Video/TypeType/issues/163) | Live-session and quality-switching concepts in the playback guide |

Thank you to everyone above for publishing reproducible symptoms, configuration
context, and follow-up results. Their reports made the supported workflow clearer for
people who will encounter the same boundary later.

## How community material is used

A discussion or issue is not copied directly into the manual. Before it becomes
documentation:

1. The current owning repository is inspected to confirm the behavior still exists.
2. The central Compose and nginx files are checked for the supported deployment.
3. Sensitive values and instance-specific details are removed.
4. The result is written as a reusable explanation or diagnostic.
5. The original contributor and public thread are linked where the insight is used.

This matters because an older workaround can become harmful after the implementation
changes. For example, the WebSocket investigation in discussion #122 remains useful,
but the supported fix is to use the current bundled nginx configuration rather than
copying the reporter's entire custom stack.

## Issues and discussions

All user-facing reports are centralised in the TypeType repository:

- [Issue tracker](https://github.com/TypeType-Video/TypeType/issues) for bugs,
  features, and documentation gaps.
- [Discussions](https://github.com/TypeType-Video/TypeType/discussions) for operator
  questions, deployment findings, ideas, and configuration examples.

When reporting a problem, include the relevant `/api/version/*` responses and remove
tokens, cookies, passwords, internal hostnames, and private instance URLs. See
[Reporting issues](/self-hosting/reporting-issues) for the full checklist.

## Keeping acknowledgements accurate

If a new report materially changes a documented workflow, add the contributor and
thread here in the same pull request. Link the exact issue or discussion rather than
a search page, and describe the concrete part of the documentation it improved.
