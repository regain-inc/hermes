/**
 * Builder for ControlCommandResponse messages
 * @module builders/control-command-response
 */

import type {
  ControlCommandResponse,
  ControlCommandStatus,
  ControlResponseSource,
  DeferredInfo,
  OperationalStateSnapshot,
  SettingApplicationResult,
} from '../types/control-v2';
import { createIsoDateTime } from '../utils/datetime';

/**
 * Options for creating a ControlCommandResponse.
 */
export interface ControlCommandResponseOptions {
  /** ID of the command being responded to */
  readonly command_id: string;

  /** Response status */
  readonly status: ControlCommandStatus;

  /** Source system identifier (default: 'deutsch') */
  readonly source_system?: string;

  /** Source service version (default: '2.0.0') */
  readonly source_service_version?: string;

  /** Source instance ID */
  readonly source_instance_id?: string;

  /** Reason for rejection or deferral */
  readonly reason?: string;

  /** Per-setting results for batch commands */
  readonly setting_results?: readonly SettingApplicationResult[];

  /** Post-command operational state snapshot */
  readonly settings_snapshot?: OperationalStateSnapshot;

  /** Deferred processing info */
  readonly deferred?: DeferredInfo;

  /** Batch correlation ID */
  readonly command_batch_id?: string;

  /** PHI-free audit summary */
  readonly audit_summary?: string;
}

/**
 * Creates a ControlCommandResponse message.
 *
 * @param options - Response configuration
 * @returns A fully formed ControlCommandResponse
 *
 * @example
 * ```typescript
 * const response = createControlCommandResponse({
 *   command_id: 'cmd-001',
 *   status: 'APPLIED',
 *   setting_results: [{ key: 'autonomy.max_risk_level', status: 'APPLIED', applied_value: 'low' }],
 * });
 * ```
 */
export function createControlCommandResponse(
  options: ControlCommandResponseOptions
): ControlCommandResponse {
  const now = createIsoDateTime();

  const source: ControlResponseSource = {
    system: options.source_system ?? 'deutsch',
    service_version: options.source_service_version ?? '2.0.0',
  };

  // Add optional source fields
  if (options.source_instance_id) {
    (source as { instance_id?: string }).instance_id = options.source_instance_id;
  }

  const response: ControlCommandResponse = {
    hermes_version: '2.0.0',
    message_type: 'control_command_response',
    command_id: options.command_id,
    response_id: crypto.randomUUID(),
    received_at: now,
    responded_at: now,
    source,
    status: options.status,
    audit_redaction: {
      summary: options.audit_summary ?? `Command ${options.command_id}: ${options.status}`,
    },
  };

  // Add optional fields — exactOptionalPropertyTypes: do NOT assign undefined
  if (options.reason) {
    (response as { reason?: string }).reason = options.reason;
  }
  if (options.setting_results) {
    (response as { setting_results?: readonly SettingApplicationResult[] }).setting_results =
      options.setting_results;
  }
  if (options.settings_snapshot) {
    (response as { settings_snapshot?: OperationalStateSnapshot }).settings_snapshot =
      options.settings_snapshot;
  }
  if (options.deferred) {
    (response as { deferred?: DeferredInfo }).deferred = options.deferred;
  }
  if (options.command_batch_id) {
    (response as { command_batch_id?: string }).command_batch_id = options.command_batch_id;
  }

  return response;
}
