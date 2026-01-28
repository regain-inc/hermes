# [PROPOSED] Regain Hermes™ Certification Program

> **Status: Roadmap 2026 (Draft)**
> This document outlines the proposed certification program for the Regain Hermes™ ecosystem. These tiers and requirements are subject to change as the protocol evolves. We are currently inviting early partners to help shape these standards.

## Overview

The Regain Hermes™ Certification Program establishes trust in the clinical AI ecosystem by verifying that implementations correctly follow the Hermes protocol and adhere to clinical safety standards.

Certification provides hospitals, medical centers, and regulators with the assurance that a system's "Brain vs. Shield" architecture is robust, auditable, and compliant with the industry standard.

---

## Certification Tiers

### Tier 1: Hermes Compatible (Free)
**Self-certification for basic protocol compliance.**

*   **Requirements:**
    *   Pass the automated `hermes-conformance` test suite.
    *   Correct implementation of core schemas (`SupervisionRequest`, `SupervisionResponse`).
    *   Proper handling of `trace_id` and `HealthStateSnapshotRef`.
*   **Benefits:**
    *   Authorized use of the "Hermes Compatible" badge.
    *   Listing in the official compatible implementations directory.
*   **Cost:** Free.

### Tier 2: Hermes Certified (Paid)
**Regain-reviewed certification for production implementations.**

*   **Requirements:**
    *   All Tier 1 requirements.
    *   Code review of the Hermes integration by a Regain, Inc. engineer.
    *   Verification of audit trail integrity.
    *   Designated support contact.
*   **Benefits:**
    *   Official "Hermes Certified" badge.
    *   Priority support channel for protocol extensions.
    *   Quarterly roadmap sync calls with the Regain team.
*   **Cost:** Paid (pricing available on request).

### Tier 3: Hermes Certified Clinical (Paid)
**Full clinical audit for autonomous or semi-autonomous deployment.**

*   **Requirements:**
    *   All Tier 2 requirements.
    *   Audit of clinical reasoning traceability (Hard2Vary™ scoring implementation).
    *   Verification of Evidence Ref binding to current clinical guidelines.
    *   Full security and HIPAA-compliance review of the PHI/PII boundary.
    *   Provision of FDA Pre-market Submission documentation templates.
*   **Benefits:**
    *   "Hermes Certified for Clinical Use" badge.
    *   Direct advisory support for regulatory (FDA/IMDRF) submissions.
    *   Monthly sync calls with Regain's clinical and AI research teams.
*   **Cost:** Paid (pricing available on request).

---

## The Certification Process

1.  **Preparation**: Download and run the `@regain/hermes-conformance` CLI against your implementation.
2.  **Application**: Email your conformance report and project details to **team@regain.ai**.
3.  **Review**: For Tier 2 and 3, the Regain, Inc. team will schedule a technical and/or clinical review within 30 days.
4.  **Issuance**: Upon approval, you will receive a digital certificate ID and authorized badges for use in your marketing and product UI.

---

## Conformance Test Suite

The conformance suite ensures your system handles:
*   **Schema Validation**: Every message matches the Zod/JSON definitions.
*   **Protocol Behavior**: Idempotency, trace propagation, and error format compliance.
*   **Clinical Scenarios**: Correct handling of `HARD_STOP` and `ROUTE_TO_CLINICIAN` decisions.

To get started:
```bash
# Conformance tool is currently in private beta
# Contact team@regain.ai for access
```

---

## Contact

For inquiries regarding the certification program, please contact **team@regain.ai**.

*Regain Hermes™ and Hermes Certified™ are trademarks of Regain, Inc.*
