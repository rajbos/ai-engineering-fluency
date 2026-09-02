# Security Policy

## Supported Versions

Only the latest released version of each component is supported with security fixes:

- **VS Code extension** — latest version published on the [VS Code Marketplace](https://marketplace.visualstudio.com/) and [Open VSX Registry](https://open-vsx.org/)
- **CLI** — latest version published on [npm](https://www.npmjs.com/)
- **JetBrains plugin** — latest version published on the [JetBrains Marketplace](https://plugins.jetbrains.com/)
- **Visual Studio extension** — latest version published on the [Visual Studio Marketplace](https://marketplace.visualstudio.com/)

Older releases do not receive security patches. Please upgrade to the latest version before reporting a vulnerability.

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please **do not** open a public GitHub issue.

Instead, report it privately using GitHub's [private vulnerability reporting](https://github.com/rajbos/ai-engineering-fluency/security/advisories/new) feature. This creates a private draft security advisory that only the maintainers can see, so the issue can be discussed and fixed before it's disclosed publicly.

Please include as much detail as possible:

- A description of the vulnerability and its potential impact
- Steps to reproduce it (affected component, version, and environment)
- Any relevant logs, screenshots, or proof-of-concept code

We aim to acknowledge reports promptly and will keep you updated as the issue is investigated and resolved.

## Other Security Features

- [Secret scanning](https://docs.github.com/en/code-security/secret-scanning) is enabled on this repository.
- Dependencies are kept up to date via Dependabot and reviewed with `dependency-review` on pull requests.

For general bug reports and support questions that are not security-related, please use [GitHub Issues](https://github.com/rajbos/ai-engineering-fluency/issues) as described in [SUPPORT.md](./SUPPORT.md).
