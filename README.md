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

### For Developers

- **[Developer Guide](./docs/DEVELOPER-GUIDE.md)** - Step-by-step integration guide with workflows
- **[API Reference](./docs/API-REFERENCE.md)** - Complete function and type documentation
- **[Epistemology Guide](./docs/EPISTEMOLOGY-GUIDE.md)** - HTV scoring and uncertainty deep dive
- **[Testing Guide](./docs/TESTING.md)** - How to test your integration
- [Protocol Specification](./docs/00-hermes-specs/02-hermes-contracts.md) - Full schema spec

### Project Governance

- [Project Vision](./VISION.md) - Our strategy for safe clinical AI.
- [Certification Program](./CERTIFICATION.md) - How to certify your implementation.
- [Governance Model](./GOVERNANCE.md) - How the standard is maintained.
- [Contributing](./CONTRIBUTING.md) - Technical guidelines and our CLA.
- [Trademark Policy](./TRADEMARK.md) - Usage guidelines for our marks.

## Quick Start

### Validate Messages

```typescript
import { validateHermesMessage, parseHermesMessage } from '@regain/hermes';

// Option 1: Check validity without throwing
const result = validateHermesMessage(payload);
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}

// Option 2: Parse with type safety (throws on failure)
const request = parseHermesMessage(payload);
console.log(`Trace: ${request.trace.trace_id}`);
```

### Compute Epistemic Scores

```typescript
import { computeHTVScore, getHTVQualityLevel } from '@regain/hermes';

const score = computeHTVScore({
  interdependence: 0.9,
  specificity: 0.85,
  parsimony: 0.8,
  falsifiability: 0.9,
});

console.log(score.composite);  // 0.8625
console.log(getHTVQualityLevel(score.composite));  // 'good'
```

### Type Guard Pattern

```typescript
import { isValidHermesMessage, type SupervisionRequest } from '@regain/hermes';

if (isValidHermesMessage(payload)) {
  // TypeScript knows payload is HermesMessage
  if (payload.message_type === 'supervision_request') {
    handleRequest(payload as SupervisionRequest);
  }
}
```

## API Summary

### Validation

| Function | Description |
|----------|-------------|
| `validateHermesMessage(msg)` | Validate against JSON Schema, returns `{ valid, errors }` |
| `parseHermesMessage(msg)` | Validate and parse, throws `HermesValidationError` on failure |
| `isValidHermesMessage(msg)` | Type guard for Hermes messages |

### Epistemology Utilities

| Function | Description |
|----------|-------------|
| `computeHTVScore(dims, weights?)` | Calculate Hard2Vary™ composite score (0.0-1.0) |
| `meetsHTVThreshold(score, threshold?)` | Check if score meets minimum threshold |
| `getHTVQualityLevel(score)` | Get quality level: 'excellent', 'good', 'moderate', 'poor', 'refuted' |
| `computeUncertainty(inputs)` | Calculate calibrated uncertainty with drivers |
| `isUncertaintyAcceptable(unc, maxLevel?)` | Check if uncertainty is acceptable |
| `compareEvidenceGrades(a, b)` | Compare evidence strength (negative if a stronger) |

### Builders

| Function | Description |
|----------|-------------|
| `htvScore()` | Fluent builder for HTV scores |
| `createFalsificationCriteria(...)` | Create falsification criteria for claims |
| `createUniformHTVScore(value)` | Create HTV with all dimensions equal |

See **[API Reference](./docs/API-REFERENCE.md)** for complete documentation including constants, types, and examples.

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
