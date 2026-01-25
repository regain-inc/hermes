# @regain/hermes

> TypeScript types, validation, and utilities for the Hermes clinical supervision protocol.

[![CI](https://github.com/regain-inc/hermes/actions/workflows/ci.yml/badge.svg)](https://github.com/regain-inc/hermes/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@regain/hermes.svg)](https://www.npmjs.com/package/@regain/hermes)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Overview

Hermes is a protocol for clinical AI supervision, enabling safe communication between AI agents (Deutsch) and supervision systems (Popper). This package provides:

- **TypeScript Types** - Complete type definitions for all Hermes messages
- **JSON Schema Validation** - Runtime validation using AJV
- **Test Fixtures** - Ready-to-use message examples for testing
- **Epistemology Utilities** - HTV scoring, uncertainty calibration, evidence grading

## Installation

```bash
# npm
npm install @regain/hermes

# yarn
yarn add @regain/hermes

# pnpm
pnpm add @regain/hermes

# bun
bun add @regain/hermes
```

## Quick Start

```typescript
import {
  validateHermesMessage,
  parseHermesMessage,
  type SupervisionRequest,
  type SupervisionResponse,
  CURRENT_HERMES_VERSION,
} from '@regain/hermes';

// Validate a message
const result = validateHermesMessage(unknownMessage);
if (result.valid) {
  console.log('Valid Hermes message');
} else {
  console.error('Validation errors:', result.errors);
}

// Parse with type safety (throws on invalid)
const message = parseHermesMessage(unknownMessage);
```

## Features

### Message Types

```typescript
import type {
  SupervisionRequest,    // Deutsch -> Popper request
  SupervisionResponse,   // Popper -> Deutsch response
  ClinicianFeedbackEvent, // Clinician override feedback
  AuditEvent,            // Audit trail events
  BiasDetectionEvent,    // Bias monitoring events
  HermesError,           // Error responses
} from '@regain/hermes';
```

### Schema Validation

```typescript
import {
  validateHermesMessage,
  parseHermesMessage,
  isValidHermesMessage,
  HermesValidationError,
} from '@regain/hermes';

// Type guard
if (isValidHermesMessage(data)) {
  // data is now typed as HermesMessage
}

// Parse with error handling
try {
  const msg = parseHermesMessage(data);
} catch (e) {
  if (e instanceof HermesValidationError) {
    console.log(e.errors); // Detailed validation errors
  }
}
```

### Submodule Imports

```typescript
// Schema validation only
import { validateHermesMessage } from '@regain/hermes/schema';

// Test fixtures only
import {
  minimalSupervisionRequest,
  approvedSupervisionResponse,
  goodHTVScore,
} from '@regain/hermes/fixtures';
```

### Epistemology Utilities

```typescript
import {
  computeHTVScore,
  getHTVQualityLevel,
  compareEvidenceGrades,
  computeUncertainty,
} from '@regain/hermes';

// Compute Hard-to-Vary score
const htv = computeHTVScore({
  interdependence: 0.9,
  specificity: 0.85,
  parsimony: 0.8,
  falsifiability: 0.9,
});

console.log(htv.composite);        // 0.8625
console.log(getHTVQualityLevel(htv.composite)); // 'good'
```

## API Reference

### Validation

| Function | Description |
|----------|-------------|
| `validateHermesMessage(msg)` | Validate message, returns `{ valid, errors? }` |
| `parseHermesMessage(msg)` | Validate and return typed message, throws on error |
| `isValidHermesMessage(msg)` | Type guard for valid messages |

### Constants

| Constant | Description |
|----------|-------------|
| `CURRENT_HERMES_VERSION` | Current protocol version (`1.6.0`) |
| `SUPERVISION_DECISIONS` | All valid decision values |
| `REASON_CODES` | All valid reason codes |
| `EVIDENCE_GRADES` | Evidence quality hierarchy |

### Epistemology

| Function | Description |
|----------|-------------|
| `computeHTVScore(dims)` | Calculate HTV composite score |
| `getHTVQualityLevel(score)` | Get quality level from score |
| `compareEvidenceGrades(a, b)` | Compare evidence strength |
| `computeUncertainty(inputs)` | Calculate calibrated uncertainty |

## Test Fixtures

The package includes comprehensive fixtures for testing:

```typescript
import {
  // SupervisionRequest variants
  minimalSupervisionRequest,
  fullSupervisionRequest,
  medicationSupervisionRequest,

  // SupervisionResponse variants
  approvedSupervisionResponse,
  routeSupervisionResponse,
  hardStopSupervisionResponse,

  // HTV Scores
  excellentHTVScore,
  goodHTVScore,
  poorHTVScore,

  // And more...
} from '@regain/hermes/fixtures';
```

## Requirements

- Node.js >= 18.0.0
- TypeScript >= 5.0.0 (optional, for type checking)

## Protocol Version

This package implements **Hermes v1.6.0**.

## License

MIT - see [LICENSE](./LICENSE) for details.

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit PRs to the `main` branch.

## Links

- [GitHub Repository](https://github.com/regain-inc/hermes)
- [npm Package](https://www.npmjs.com/package/@regain/hermes)
- [Issue Tracker](https://github.com/regain-inc/hermes/issues)
