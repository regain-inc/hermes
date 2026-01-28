# Regain Hermes™

> The industry-standard protocol for safe, auditable, and traceable clinical AI supervision.

[![CI](https://github.com/regain-inc/hermes/actions/workflows/ci.yml/badge.svg)](https://github.com/regain-inc/hermes/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@regain/hermes.svg)](https://www.npmjs.com/package/@regain/hermes)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Overview

Regain Hermes™ is a protocol for clinical AI supervision. It defines the **Epistemological Contract** required for safe communication between reasoning agents (the "Brain") and independent supervision systems (the "Shield").

By standardizing how AI systems propose interventions, provide evidence, and measure uncertainty, Hermes enables a modular ecosystem of trusted clinical AI that is regulatory-ready from day one.

Read our [Project Vision](./VISION.md) to learn how we are building the "Grammar of Safety."

## Package Features

This package provides the reference implementation of the Hermes protocol:

- **TypeScript Types** - Complete type definitions for all Hermes messages.
- **JSON Schema Validation** - Runtime validation for inter-agent communication.
- **Epistemology Utilities** - Hard2Vary™ (HTV) scoring, uncertainty calibration, and evidence grading.
- **Audit Tooling** - Standardized formats for regulatory-grade, de-identified audit exports.
- **Test Fixtures** - A comprehensive library of clinical scenarios for unit testing.

## Project Status: Public Alpha

Regain Hermes™ is currently in **Public Alpha**. The core protocol schemas and validation logic are stable for early adoption, but the broader commercial ecosystem (Certification and Managed Services) is currently under development.

## Installation

```bash
# npm
npm install @regain/hermes
```

## Certification (Roadmap 2026)

To ensure future ecosystem trust, we are developing a [Certification Program](./CERTIFICATION.md) with three proposed tiers:
- **Hermes Compatible** (Free) - Automated conformance.
- **Hermes Certified** (Paid) - Technical review & support.
- **Hermes Certified Clinical** (Paid) - Full clinical audit & regulatory readiness.

*If you are interested in becoming a launch partner for the certification program, please contact **team@regain.ai**.*

## Enterprise & Managed Services (Coming Soon)

For organizations that prefer a fully managed solution, Regain, Inc. is developing hosted supervision infrastructure:

- **Regain Popper™ Cloud** - Managed policy engine with deterministic safety gates and audit logging.
- **Enterprise Support** - SLA-backed support for mission-critical clinical deployments.
- **Regulatory Packages** - Pre-configured compliance documentation for FDA, HIPAA, and IMDRF.

*These services are currently in development. Contact **team@regain.ai** to join the early access waitlist.*

## Documentation

- [Project Vision](./VISION.md) - Our strategy for safe clinical AI.
- [Certification Program](./CERTIFICATION.md) - How to certify your implementation.
- [Governance Model](./GOVERNANCE.md) - How the standard is maintained.
- [Contributing](./CONTRIBUTING.md) - Technical guidelines and our CLA.
- [Trademark Policy](./TRADEMARK.md) - Usage guidelines for our marks.

## Quick Start

```typescript
import {
  validateHermesMessage,
  parseHermesMessage,
  type SupervisionRequest,
} from '@regain/hermes';

// Validate a message from a reasoning agent
const result = validateHermesMessage(payload);

if (result.valid) {
  const request = parseHermesMessage(payload) as SupervisionRequest;
  console.log(`Processing trace: ${request.trace.trace_id}`);
} else {
  console.error('Protocol violation:', result.errors);
}
```

## API Reference

### Epistemology Utilities

| Function | Description |
|----------|-------------|
| `computeHTVScore(dims)` | Calculate Hard2Vary™ (HTV) composite score for an explanation. |
| `getHTVQualityLevel(score)` | Get a human-readable quality level (e.g., 'excellent') from a score. |
| `compareEvidenceGrades(a, b)` | Compare the strength of two evidence citations. |
| `computeUncertainty(inputs)` | Calculate calibrated uncertainty for a proposed action. |

---

## Contributing

Contributions are welcome! Please read our [contributing guidelines](./CONTRIBUTING.md) and [governance model](./GOVERNANCE.md) before submitting pull requests.

## Trademarks

"Regain Hermes™", "Regain Popper™", "Popper™", "Regain Deutsch™", and "Hard2Vary™" are trademarks of Regain, Inc. See our [Trademark Policy](./TRADEMARK.md) for usage guidelines.

## Links

- [GitHub Repository](https://github.com/regain-inc/hermes)
- [npm Package](https://www.npmjs.com/package/@regain/hermes)
- [Issue Tracker](https://github.com/regain-inc/hermes/issues)
- [Code of Conduct](./CODE_OF_CONDUCT.md)

---

*Regain Hermes™, Regain Deutsch™, Regain Popper™, Popper™, and Hard2Vary™ are trademarks of Regain, Inc. All rights reserved.*
