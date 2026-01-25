/**
 * Imaging data types for Hermes protocol
 * Implements "Reference, Don't Transfer" pattern for medical imaging.
 * @module types/imaging
 */

import type { IsoDateTime } from './core';
import type { EvidenceGrade } from './epistemology';

// =============================================================================
// Section 2.9.1: Imaging Study Reference
// =============================================================================

/**
 * Imaging modality types (DICOM standard).
 * @see schema/hermes-message.schema.json — $defs.ImagingModality
 */
export type ImagingModality =
  | 'MR' // Magnetic Resonance Imaging
  | 'CT' // Computed Tomography
  | 'XR' // X-Ray / Radiography
  | 'US' // Ultrasound
  | 'MG' // Mammography
  | 'PT' // Positron Emission Tomography
  | 'NM' // Nuclear Medicine
  | 'ECG' // Electrocardiogram
  | 'DX' // Digital Radiography
  | 'CR' // Computed Radiography
  | 'OT'; // Other

/**
 * All valid imaging modalities as a readonly array for runtime validation.
 */
export const IMAGING_MODALITIES: readonly ImagingModality[] = [
  'MR',
  'CT',
  'XR',
  'US',
  'MG',
  'PT',
  'NM',
  'ECG',
  'DX',
  'CR',
  'OT',
] as const;

/**
 * Reference to an imaging study (not content).
 * Raw pixels stay in PHI storage; only references flow to clinical agents.
 *
 * @see schema/hermes-message.schema.json — $defs.ImagingStudyRef
 */
export interface ImagingStudyRef {
  /** Unique identifier (FHIR ImagingStudy.id or DICOM StudyInstanceUID) */
  readonly study_id: string;

  /**
   * Internal pointer to raw pixel storage (NEVER a public URL).
   * Clinical agents MUST NOT fetch this directly.
   */
  readonly storage_endpoint: string;

  /** Imaging modality (determines interpretation context) */
  readonly modality: ImagingModality;

  /** When the imaging study was performed */
  readonly study_date: IsoDateTime;

  /** Links related studies acquired together (e.g., PET + CT in PET-CT) */
  readonly study_group_id?: string;

  /** PHI-minimized label for combined acquisition (e.g., "PET-CT", "PET-MR") */
  readonly multi_modality_type?: string;

  /** Number of series in the study (metadata, not content) */
  readonly series_count?: number;

  /** Number of instances in the study (metadata, not content) */
  readonly instance_count?: number;

  /** PHI-minimized description (e.g., "Cardiac MRI", NOT patient details) */
  readonly description_redacted: string;

  /** Body part examined (SNOMED CT preferred) */
  readonly body_part_examined?: string;

  /** Content hash of DICOM metadata (NOT pixels) for integrity */
  readonly metadata_hash?: string;

  /** When this reference was last updated */
  readonly last_updated: IsoDateTime;
}

// =============================================================================
// Section 2.9.2: Derived Imaging Finding
// =============================================================================

/**
 * Type of imaging finding.
 * @see schema/hermes-message.schema.json — $defs.ImagingFindingType
 */
export type ImagingFindingType =
  | 'measurement' // Quantitative measurement (LVEF, tumor size, etc.)
  | 'classification' // AI/radiologist classification (malignant/benign)
  | 'abnormality_flag' // Binary abnormality detection
  | 'comparison' // Comparison to prior imaging
  | 'structured_report'; // Full DICOM SR summary

/**
 * All valid imaging finding types as a readonly array for runtime validation.
 */
export const IMAGING_FINDING_TYPES: readonly ImagingFindingType[] = [
  'measurement',
  'classification',
  'abnormality_flag',
  'comparison',
  'structured_report',
] as const;

/**
 * Clinical significance assessment.
 * @see schema/hermes-message.schema.json — $defs.ClinicalSignificance
 */
export type ClinicalSignificance = 'normal' | 'abnormal' | 'critical' | 'indeterminate';

/**
 * All valid clinical significance values as a readonly array for runtime validation.
 */
export const CLINICAL_SIGNIFICANCE_VALUES: readonly ClinicalSignificance[] = [
  'normal',
  'abnormal',
  'critical',
  'indeterminate',
] as const;

/**
 * Quantitative measurement from imaging.
 * @see schema/hermes-message.schema.json — $defs.ImagingMeasurement
 */
export interface ImagingMeasurement {
  /** The measured value */
  readonly value: number;

  /** Unit of measurement (UCUM preferred, e.g., "mL", "mm", "%") */
  readonly unit: string;

  /** Reference range for normal values */
  readonly reference_range?: {
    readonly low?: number;
    readonly high?: number;
    /** Population context (e.g., "adult_male", "pediatric") */
    readonly population?: string;
  };

  /** Measurement methodology */
  readonly method?: string;
}

/**
 * Classification result from imaging analysis.
 * @see schema/hermes-message.schema.json — $defs.ImagingClassification
 */
export interface ImagingClassification {
  /** Classification label (e.g., "malignant", "benign", "indeterminate") */
  readonly label: string;

  /** Confidence in this classification (0.0-1.0) */
  readonly confidence: number;

  /** Model ID if AI-derived */
  readonly model_id?: string;

  /** Alternative classifications with their confidence scores */
  readonly alternative_labels?: ReadonlyArray<{
    readonly label: string;
    readonly confidence: number;
  }>;
}

/**
 * Comparison result type.
 * @see schema/hermes-message.schema.json — $defs.ImagingComparison
 */
export type ComparisonType = 'improved' | 'stable' | 'worsened' | 'new_finding' | 'resolved';

/**
 * Comparison to prior imaging study.
 * @see schema/hermes-message.schema.json — $defs.ImagingComparison
 */
export interface ImagingComparison {
  /** ID of the prior study being compared to */
  readonly prior_study_id: string;

  /** Type of change observed */
  readonly comparison_type: ComparisonType;

  /** Numeric change if applicable */
  readonly delta_value?: number;

  /** Unit for delta value */
  readonly delta_unit?: string;

  /** Additional comparison notes */
  readonly notes?: string;
}

/**
 * Extractor type for imaging findings.
 * @see schema/hermes-message.schema.json — $defs.ImagingExtractor
 */
export type ImagingExtractorType = 'radiologist' | 'ai_model' | 'automated';

/**
 * Who/what extracted the imaging finding.
 * @see schema/hermes-message.schema.json — $defs.ImagingExtractor
 */
export type ImagingExtractor =
  | { readonly type: 'radiologist'; readonly provider_id?: string }
  | { readonly type: 'ai_model'; readonly model_id: string; readonly model_version: string }
  | { readonly type: 'automated'; readonly system_id?: string };

/**
 * Laterality for anatomical findings.
 */
export type Laterality = 'left' | 'right' | 'bilateral';

/**
 * Derived findings from imaging studies.
 * These are KB-sized extractions, safe to include in snapshots.
 *
 * @see schema/hermes-message.schema.json — $defs.DerivedImagingFinding
 */
export interface DerivedImagingFinding {
  /** Unique identifier for this finding */
  readonly finding_id: string;

  /** Which study this finding was derived from */
  readonly source_study: ImagingStudyRef;

  /** Type of finding */
  readonly finding_type: ImagingFindingType;

  /** Quantitative measurement (if applicable) */
  readonly measurement?: ImagingMeasurement;

  /** Classification result (if applicable) */
  readonly classification?: ImagingClassification;

  /** Anatomical location (SNOMED CT body site code preferred) */
  readonly body_site?: string;

  /** Laterality if applicable */
  readonly laterality?: Laterality;

  /** Clinical significance assessment */
  readonly clinical_significance?: ClinicalSignificance;

  /** Comparison to prior imaging (if applicable) */
  readonly comparison?: ImagingComparison;

  /** When this finding was extracted */
  readonly extracted_at: IsoDateTime;

  /** Who/what extracted the finding */
  readonly extractor: ImagingExtractor;

  /**
   * Evidence grade for this finding.
   * AI-derived findings typically: 'calculated'
   * Radiologist findings typically: 'expert_opinion' or 'case_report'
   */
  readonly evidence_grade: EvidenceGrade;

  /** Overall confidence in this finding (0.0-1.0) */
  readonly confidence: number;

  /** PHI-minimized notes */
  readonly notes_redacted?: string;
}

/**
 * Maximum size per derived imaging finding in bytes.
 */
export const MAX_FINDING_SIZE_BYTES = 10_000;
