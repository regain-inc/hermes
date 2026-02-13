/**
 * Types module - re-exports all type definitions
 * @module types
 */

// Core types (Phase 1)
export * from './core';
export * from './branded';
export * from './guards';

// Phase 2: Supervision Contract
export * from './evidence';
export * from './disclosure';
export * from './epistemology';
export * from './imaging';
export * from './feedback';
export * from './snapshot';
export * from './proposals';
export * from './control';
export * from './composition';
export * from './supervision';

// Phase 5: Control v2
export * from './control-v2';
export * from './operational-settings-catalog';

// Phase 4: Clinical, Imaging & Bias Detection
export * from './bias';
export * from './audit';
export * from './errors';
export * from './messages';
