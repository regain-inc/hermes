# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.3] - 2026-01-25

### Fixed

- CI now publishes only on version tags (not every push)

## [1.0.2] - 2026-01-25

### Fixed

- Remove dead link to docs in README

## [1.0.1] - 2026-01-25

### Changed

- Remove internal documentation from package
- Remove spec file references from JSDoc comments

## [1.0.0] - 2026-01-25

### Added

- **Core Types** (Phase 1)
  - `HermesVersion`, `IsoDateTime`, `Mode` primitives
  - `TraceContext`, `SubjectRef`, `AuditRedactionBase` context types
  - `SupervisionDecision`, `ReasonCode` enums
  - Branded types with type guards

- **Supervision Contract** (Phase 2)
  - `SupervisionRequest` - Deutsch to Popper requests
  - `SupervisionResponse` - Popper to Deutsch responses
  - `ProposedIntervention` union with 8 intervention types
  - `HealthStateSnapshotRef` with imaging support
  - `ControlCommand` and `SafeModeState` types

- **Epistemology Types** (Phase 3)
  - `HTVScore` - Hard-to-Vary scoring
  - `EvidenceGrade` hierarchy with comparison utilities
  - `UncertaintyCalibration` with drivers
  - `FalsificationCriteria` for Popperian refutation
  - `ClaimType` classification with risk profiles

- **Clinical Types** (Phase 4)
  - `ClinicianFeedbackEvent` with override history
  - `BiasDetectionEvent` for fairness monitoring
  - `AuditEvent` for audit trail
  - `HermesError` standardized errors
  - Imaging types: `ImagingStudyRef`, `DerivedImagingFinding`

- **Validation & Testing** (Phase 5)
  - JSON Schema validation with AJV (draft-2020-12)
  - `validateHermesMessage`, `parseHermesMessage` functions
  - `isValidHermesMessage` type guard
  - Comprehensive test fixtures for all message types
  - HTV score fixtures (excellent, good, moderate, poor)
  - Evidence reference fixtures

- **Utilities**
  - `computeHTVScore` - Calculate composite HTV scores
  - `computeUncertainty` - Calibrated uncertainty calculation
  - `compareEvidenceGrades` - Evidence strength comparison
  - `HTVScoreBuilder` - Fluent builder pattern

- **Infrastructure**
  - GitHub Actions CI/CD pipeline
  - Pre-commit hooks for quality checks
  - Submodule exports (`/schema`, `/fixtures`)

### Notes

- Implements Hermes Protocol v1.6.0
- Requires Node.js >= 18.0.0
- TypeScript >= 5.0.0 recommended

[Unreleased]: https://github.com/regain-inc/hermes/compare/v1.0.3...HEAD
[1.0.3]: https://github.com/regain-inc/hermes/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/regain-inc/hermes/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/regain-inc/hermes/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/regain-inc/hermes/releases/tag/v1.0.0
