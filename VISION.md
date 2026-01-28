# Regain Hermes™ Vision

## The Challenge: The "Black Box" of Clinical AI

As artificial intelligence moves from administrative tasks to direct clinical reasoning, the industry faces a fundamental safety crisis. Current AI models—while powerful—are often **sycophantic** (agreeing with the user rather than the data), prone to **hallucination**, and operate as **"Black Boxes"** where the reasoning path is untraceable.

For a hospital, a regulator, or a clinician, "trusting" an AI is not a technical strategy. Trust must be **engineered** through transparency, refutation, and standardized oversight.

## The Solution: "Brain vs. Shield" Architecture

Regain Hermes™ was born from the insight that a reasoning engine (the "Brain") should never be its own safety referee. In a safe clinical system:
1.  **The Brain** generates conjectures, plans, and actions. *Example: Regain Deutsch™, our clinical reasoning engine.*
2.  **The Shield** independently evaluates risk, enforces safety policies, and gates actions. *Example: Regain Popper™, our policy engine for clinical AI safety (coming soon).*

**Hermes is the language they use to talk to each other.**

By open-sourcing the Hermes protocol, we are providing the "Grammar of Safety" that allows any clinical AI to become auditable, governable, and—crucially—safer for patients.

## The Hermes Standard: Beyond Simple Payloads

Hermes does more than define JSON fields. It standardizes the **Epistemological Contract** required for clinical safety:

*   **Hard2Vary™ (HTV) Scores**: A methodology for measuring the quality of an AI's explanation. Good explanations are "hard to vary"—they are tightly bound to the data and hard to fake.
*   **Evidence Traceability**: Every proposed intervention must carry stable pointers to its evidence base (guidelines, RCTs, or patient history) without exposing PHI.
*   **Calibrated Uncertainty**: Agents must explicitly communicate *how unsure* they are, allowing the supervisor to trigger a "Route to Clinician" if uncertainty exceeds safety thresholds.
*   **Snapshot-First Reasoning**: Ensuring the supervisor evaluates the *exact same* patient state that the agent used to make its decision, preventing "race conditions" in clinical data.

## A Universal Standard for a Global Ecosystem

We believe clinical AI safety should not be a proprietary secret. By making Hermes the industry standard, we enable a modular ecosystem where:
*   **Specialized Agents** (specializing in Oncology, Cardiology, or Primary Care) can all use the same **Universal Supervisors**.
*   **Hospitals** can audit all AI actions through a single, standardized audit trail.
*   **Regulators (like the FDA)** can receive de-identified, high-fidelity data bundles to verify the safety of autonomous systems at scale.

## Our Commitment

**Regain, Inc.** is committed to maintaining Regain Hermes™ as a permissive, community-driven standard. Our goal is to move the industry away from "AI that sounds right" toward **"AI that is provably safe."**

---

*Regain Hermes™ is a trademark of Regain, Inc. Built for the advancement of safe, autonomous clinical reasoning.*
