# Hermes Migration Guide: 2.1 to 2.3

> **Date**: 2026-03-21
> **Affects**: Popper (05-popper), Accreditation (07-regain-accreditation), Deutsch (04-deutsch)

---

## Summary of Changes

### v2.1 to v2.2

- **VendorIdentifier**: New type for multi-vendor supervision. `SupervisionRequest.vendor` field enables vendor-specific policy rules and per-vendor audit trails.
- **VendorRiskTier**: `'low' | 'moderate' | 'high' | 'unclassified'` for policy routing.

### v2.2 to v2.3

- **Governance module**: 16 new types for FDA QMSR, PCCP, IEC 62304, and ISO 14971 compliance.
- **GovernanceApproval expanded**: 7 new optional fields (backward-compatible superset of v2.2).
- **`readonly` modifier**: All interface fields now use `readonly`. This is TypeScript-only and has no runtime effect.

---

## Breaking Changes

### Runtime: `snapshot_hash` enforcement

The JSON Schema now **rejects** `SupervisionRequest` and `SupervisionResponse` messages that include an inline `snapshot_payload` without a corresponding `snapshot_hash`. Previously, `snapshot_hash` was optional even when `snapshot_payload` was present. As of v2.3, `snapshot_hash` is **required** whenever `snapshot_payload` is provided.

**Impact**: Any code that sends inline snapshots without computing the hash will fail schema validation at runtime.

**Fix**: Compute the SHA-256 hash of the canonical JSON snapshot payload and include it in `snapshot_hash`:

```typescript
import { computeSnapshotHash } from '@regain/hermes';

const request = {
  // ...
  snapshot: {
    snapshot_payload: payload,
    snapshot_hash: computeSnapshotHash(payload), // NOW REQUIRED
  },
};
```

### TypeScript: `readonly` modifier on all fields

The `readonly` modifier added to all interface fields is a TypeScript compile-time constraint only. Existing JavaScript consumers are unaffected.

TypeScript consumers may see new compile errors if they were mutating Hermes objects directly. Fix by copying before mutation:

```typescript
// Before (now a TS error):
request.mode = 'wellness';

// After:
const updated = { ...request, mode: 'wellness' };
```

---

## New Types Available (v2.3)

### Governance Module (`types/governance`)

| Type | Purpose |
|------|---------|
| `VerificationTestType` | 7 test types (unit through manual_review) |
| `VerificationResult` | pass / fail / inconclusive / not_run |
| `VerificationEvidence` | Test record with artifact linkage (IEC 62304 SS5.7) |
| `SafetyClass` | A / B / C (IEC 62304 SS4.3) |
| `RiskSeverity` | 5-level severity scale (ISO 14971) |
| `RiskProbability` | 5-level probability scale (ISO 14971) |
| `RiskDetectability` | 4-level detectability scale (ISO 14971) |
| `RiskClassification` | Combined risk record |
| `SourceRelationship` | supporting / contradicting / qualifying / superseding |
| `GovernanceApproval` | Expanded with 7 new optional fields |
| `PCCPScope` | sps / acp / itp |
| `ChangeControlRecord` | Formal change record with verification + approval |
| `ReviewAlertLevel` | overdue / due_soon / upcoming / current |
| `ReviewAlert` | Runtime review-due alert |
| `GovernanceEventType` | 8 governance audit event types |
| `GovernanceEvent` | Governance audit event record |

### Vendor Identification (v2.2, also available)

| Type | Purpose |
|------|---------|
| `VendorIdentifier` | Upstream AI vendor identification |
| `VendorRiskTier` | Vendor risk tier for policy routing |

---

## Migration Steps: Popper Consumers (05-popper)

1. **Remove local duplicates** from `packages/core/src/policy-engine/types.ts`:
   - `ApprovalStatus`
   - `ApprovalMethod`
   - `GovernanceApproval`
   - `APPROVAL_STATUSES`
   - `APPROVAL_METHODS`

2. **Import from Hermes**:
   ```typescript
   import {
     ApprovalStatus,
     ApprovalMethod,
     GovernanceApproval,
     APPROVAL_STATUSES,
     APPROVAL_METHODS,
   } from '@regain/hermes';
   ```

3. **Optionally adopt new fields**: Expand YAML `approval` blocks with `change_request_id`, `rationale`, `verification_evidence`, etc.

4. **Update `package.json`**:
   ```json
   { "@regain/hermes": "2.3.0" }
   ```

5. Run `bun test` to verify contract compatibility.

---

## Migration Steps: Accreditation Consumers (07-regain-accreditation)

1. **Remove local duplicates** from `packages/compliance/src/types.ts`:
   - `ApprovalStatus`
   - `ApprovalMethod`
   - `GovernanceApproval`
   - `APPROVAL_STATUSES`
   - `APPROVAL_METHODS`

2. **Import from Hermes**:
   ```typescript
   import {
     ApprovalStatus,
     ApprovalMethod,
     GovernanceApproval,
     APPROVAL_STATUSES,
     APPROVAL_METHODS,
   } from '@regain/hermes';
   ```

3. **Update re-exports** in `packages/compliance/src/index.ts` to re-export from `@regain/hermes` instead of local types.

4. **Update `package.json`**:
   ```json
   { "@regain/hermes": "2.3.0" }
   ```

5. Run compliance test suite to verify.

---

## Migration Steps: Deutsch Consumers (04-deutsch)

1. **Update `package.json`**:
   ```json
   { "@regain/hermes": "2.3.0" }
   ```

2. **Fix `NYHAClass` collision**: Deutsch defines a local `NYHAClass` type that collides with the Hermes governance module's `RiskClassification` patterns. Rename the local type to `NYHAFunctionalClass` or import the canonical version if Hermes adds it in a future release.

3. **Update `EvidenceType` enum**: Hermes v2.3 adds `VerificationTestType` and `VerificationEvidence` to the governance module. If Deutsch defines a local `EvidenceType` that overlaps, align it with the canonical Hermes types or re-export from `@regain/hermes`.

4. **Adopt `snapshot_hash` enforcement**: Any Deutsch code that sends `SupervisionRequest` with an inline `snapshot_payload` must now include a `snapshot_hash`. See the Breaking Changes section above.

5. **Optionally adopt governance types**: Replace any local `GovernanceApproval` or `ApprovalStatus` with Hermes canonical imports, same as Popper and Accreditation.

6. Run `bun test` to verify contract compatibility.

---

## Field Name Reference (Common Mistakes)

These field names changed or were clarified in v2.3. If migrating from older docs or code:

| Wrong (pre-v2.3) | Correct (v2.3) | Context |
|-------------------|----------------|---------|
| `producer.version` | `producer.service_version` | `TraceProducer` |
| `deployment_env` | _(removed)_ | Not a Hermes field |
| `snapshot_ref` | `snapshot` | `SupervisionRequest` / `SupervisionResponse` |
| `timestamp` | `occurred_at` | `AuditEvent` |
| `event_id` | _(not an AuditEvent field)_ | Use `trace.trace_id` for correlation |
| `SUPERVISION_REQUESTED` | `SUPERVISION_REQUEST_SENT` | `AuditEventType` |
| `SUPERVISION_RECEIVED` | `SUPERVISION_RESPONSE_RECEIVED` | `AuditEventType` |

---

## PHI and PII Considerations

### GovernanceApproval.approver

The `approver` field is free-text and may contain real names. For PHI-adjacent deployments:

- **Recommend pseudonymous identifiers** (e.g., `"reviewer-A"`, `"CGB-chair"`) rather than real names.
- The `approver` field should follow the same redaction rules as other PII in the audit trail.
- When `GovernanceApproval` records are included in audit events that may be logged to general-purpose sinks, ensure the `approver` value is consistent with your organization's PII handling policy.
- The `approver_role` field (e.g., `"Cardiologist, FASE"`) is less sensitive but should still be reviewed for indirect identifiability in small organizations.
