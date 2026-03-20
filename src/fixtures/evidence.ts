/**
 * EvidenceRef fixtures for testing and examples.
 * @module fixtures/evidence
 */

import type { EvidenceRef } from '../types/evidence';

/**
 * Systematic review evidence reference.
 * Highest quality evidence (hardest to vary).
 */
export const systematicReviewEvidence: EvidenceRef = {
  evidence_id: 'ev-sr-001',
  evidence_type: 'guideline',
  citation: 'ACC/AHA Heart Failure Guidelines 2024, Section 7.2',
  uri: 'https://www.ahajournals.org/doi/10.1161/CIR.0000000000001063',
  excerpt:
    'ACE inhibitors are recommended for all patients with HFrEF to reduce morbidity and mortality.',
  evidence_grade: 'systematic_review',
  confidence: 0.95,
  publication_date: '2024-04-01',
  falsification_condition: 'If RCT shows ACE-I increase mortality in HFrEF population',
};

/**
 * Randomized controlled trial evidence reference.
 * Strong evidence from well-designed RCT.
 */
export const rctEvidence: EvidenceRef = {
  evidence_id: 'ev-rct-001',
  evidence_type: 'literature',
  citation: 'CONSENSUS Trial Investigators. NEJM 1987;316:1429-35',
  uri: 'https://doi.org/10.1056/NEJM198706043162301',
  excerpt: 'Enalapril reduced mortality by 40% in severe heart failure.',
  evidence_grade: 'rct',
  confidence: 0.9,
  publication_date: '1987-06-04',
  falsification_condition: 'If larger RCT shows no mortality benefit',
};

/**
 * Cohort study evidence reference.
 * Moderate evidence from observational cohort.
 */
export const cohortEvidence: EvidenceRef = {
  evidence_id: 'ev-cohort-001',
  evidence_type: 'literature',
  citation: 'Framingham Heart Study, CVD Risk Factors Analysis 2020',
  uri: 'https://framinghamheartstudy.org/publications/',
  evidence_grade: 'cohort',
  confidence: 0.75,
  publication_date: '2020-03-15',
};

/**
 * Expert opinion evidence reference.
 * Lower quality evidence requiring more scrutiny.
 */
export const expertOpinionEvidence: EvidenceRef = {
  evidence_id: 'ev-expert-001',
  evidence_type: 'guideline',
  citation: 'Expert Consensus Statement on Cardiac Rehabilitation 2023',
  evidence_grade: 'expert_opinion',
  confidence: 0.6,
  publication_date: '2023-09-01',
  falsification_condition: 'If RCT contradicts expert consensus',
};

/**
 * Patient-reported evidence reference.
 * Self-reported data from patient.
 */
export const patientReportedEvidence: EvidenceRef = {
  evidence_id: 'ev-patient-001',
  evidence_type: 'patient_data',
  citation: 'Patient self-reported symptom diary',
  evidence_grade: 'patient_reported',
  confidence: 0.5,
};

/**
 * Calculated/derived evidence reference.
 * Evidence from clinical calculations or algorithms.
 */
export const calculatedEvidence: EvidenceRef = {
  evidence_id: 'ev-calc-001',
  evidence_type: 'calculation',
  citation: 'CKD-EPI Creatinine Equation 2021',
  uri: 'https://doi.org/10.1056/NEJMoa2102953',
  evidence_grade: 'calculated',
  confidence: 0.85,
  publication_date: '2021-09-23',
};

/**
 * Policy-based evidence reference.
 * Organizational or regulatory policy.
 */
export const policyEvidence: EvidenceRef = {
  evidence_id: 'ev-policy-001',
  evidence_type: 'policy',
  citation: 'Organization Clinical Protocol: HF-GDMT v2.0',
  uri: 'protocol://org-ta3-alpha/cvd/hf-gdmt/v2.0.0',
  evidence_grade: 'policy',
  confidence: 0.8,
};

/**
 * Drug interaction evidence reference.
 * Evidence from drug interaction databases.
 */
export const drugInteractionEvidence: EvidenceRef = {
  evidence_id: 'ev-drug-001',
  evidence_type: 'guideline',
  citation: 'ACE-I and Potassium Interaction, UpToDate 2025',
  excerpt: 'ACE inhibitors can cause hyperkalemia, especially in patients with renal impairment.',
  evidence_grade: 'systematic_review',
  confidence: 0.9,
  falsification_condition: 'If prospective study shows no increased hyperkalemia risk',
};

/**
 * Imaging-derived evidence reference.
 * Evidence from imaging studies or AI analysis.
 */
export const imagingEvidence: EvidenceRef = {
  evidence_id: 'ev-imaging-001',
  evidence_type: 'patient_data',
  citation: 'Cardiac MRI LVEF Assessment, Study Date: 2026-01-20',
  evidence_grade: 'calculated',
  confidence: 0.85,
};
