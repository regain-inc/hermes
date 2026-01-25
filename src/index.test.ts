import { describe, expect, it } from 'bun:test';
import { Hermes, version } from './index';

describe('Hermes', () => {
  it('should create instance with default config', () => {
    const hermes = new Hermes();
    expect(hermes).toBeInstanceOf(Hermes);
    expect(hermes.isDebugEnabled()).toBe(false);
  });

  it('should create instance with debug enabled', () => {
    const hermes = new Hermes({ debug: true });
    expect(hermes.isDebugEnabled()).toBe(true);
  });

  it('should return correct version', () => {
    const hermes = new Hermes();
    expect(hermes.getVersion()).toBe(version);
  });

  it('should run without errors', async () => {
    const hermes = new Hermes();
    await expect(hermes.run()).resolves.toBeUndefined();
  });

  it('should run with custom timeout', async () => {
    const hermes = new Hermes({ debug: true });
    await expect(hermes.run({ timeout: 1000 })).resolves.toBeUndefined();
  });
});

describe('version', () => {
  it('should be a valid semver string', () => {
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
