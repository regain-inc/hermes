import type { HermesConfig, HermesOptions } from './types';
import { version } from './version';

/**
 * Main Hermes class
 */
export class Hermes {
  private readonly config: Required<HermesConfig>;

  constructor(config: HermesConfig = {}) {
    this.config = {
      debug: config.debug ?? false,
    };

    if (this.config.debug) {
      console.log(`[Hermes v${version}] Initialized with config:`, this.config);
    }
  }

  /**
   * Get the current version
   */
  getVersion(): string {
    return version;
  }

  /**
   * Check if debug mode is enabled
   */
  isDebugEnabled(): boolean {
    return this.config.debug;
  }

  /**
   * Example method - replace with actual functionality
   */
  async run(options: HermesOptions = {}): Promise<void> {
    const timeout = options.timeout ?? 5000;

    if (this.config.debug) {
      console.log(`[Hermes] Running with timeout: ${timeout}ms`);
    }

    // TODO: Implement actual functionality
  }
}
