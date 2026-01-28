# Regain Hermes™ Governance

This document describes the governance model for the Regain Hermes™ project.

## Overview

Regain Hermes™ is the open protocol for clinical AI supervision, enabling safe communication between clinical agents (TA1) and supervisory agents (TA2).

The project is maintained by Regain, Inc. with input from the community.

## Roles

### Maintainers

Maintainers have write access to the repository and are responsible for:
- Reviewing and merging pull requests
- Triaging issues
- Releasing new versions
- Enforcing the code of conduct

**Current Maintainers:**
- Regain, Inc. maintainers (contact: team@regain.ai)

### Regain Hermes™ Steering Committee (HSC)

The HSC guides the project's strategic direction, including:
- Major version decisions
- Breaking changes
- Protocol extensions
- Governance changes

**Current HSC Members:**
- Anton Kim, Regain, Inc. (Chair)
- Seat 2: Open
- Seat 3: Open

HSC seats may be filled by individuals who have demonstrated sustained, high-quality contributions to the project.

### Contributors

Anyone who contributes code, documentation, or other improvements. Contributors are recognized in CONTRIBUTORS.md.

## Decision Making

### Minor Changes
- Bug fixes, documentation improvements, small features
- Any maintainer can merge
- No HSC approval required

### Major Changes
- New message types, significant API changes
- Requires HSC majority approval
- 14-day comment period before merge

### Breaking Changes
- Changes that break backward compatibility
- Requires HSC unanimous approval
- 90-day deprecation notice required
- Must increment major version

## Versioning

Regain Hermes™ follows [Semantic Versioning](https://semver.org/):
- MAJOR: Breaking changes
- MINOR: New features, backward compatible
- PATCH: Bug fixes

**Current Version Policy:**
- v0.x: Rapid iteration, breaking changes allowed with notice
- v1.x: Stable, strict backward compatibility

## Trademarks

"Regain Hermes™", "Regain Popper™", "Popper™", "Regain Deutsch™", and "Hard2Vary™" are trademarks of Regain, Inc.

Use of these marks is subject to the [Trademark Policy](./TRADEMARK.md).

Forks of this project may not use the "Regain Hermes™" name without permission.

## Certification (Roadmap 2026)

"Regain Hermes™ Certified" status will be available for implementations that pass the official conformance test suite. The certification program is currently in development. See [Certification](./CERTIFICATION.md) for proposed tiers.

## License

Regain Hermes™ is licensed under [Apache License 2.0](./LICENSE).

## Code of Conduct

All participants must follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Changes to Governance

Changes to this governance document require HSC unanimous approval.
