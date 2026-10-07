import { describe, it, expect } from 'vitest';
import { isDemoMode, resolveNativeKey, resolveWebKey, initialScenarioState } from './mode';

describe('isDemoMode', () => {
  it('is on only for EXPO_PUBLIC_DEMO_MODE=1', () => {
    expect(isDemoMode({ EXPO_PUBLIC_DEMO_MODE: '1' })).toBe(true);
    expect(isDemoMode({ EXPO_PUBLIC_DEMO_MODE: 'true' })).toBe(false);
    expect(isDemoMode({})).toBe(false);
  });
});

describe('resolveNativeKey', () => {
  const baked = 'evf_live_baked';
  it('prefers the launch param in demo mode', () => {
    expect(resolveNativeKey({ demo: true, launchParam: 'evf_live_org', envKey: 'evf_live_env', baked })).toBe('evf_live_org');
  });
  it('ignores the launch param outside demo mode', () => {
    expect(resolveNativeKey({ demo: false, launchParam: 'evf_live_org', envKey: 'evf_live_env', baked })).toBe('evf_live_env');
  });
  it('empty launch param falls back', () => {
    expect(resolveNativeKey({ demo: true, launchParam: '', envKey: undefined, baked })).toBe(baked);
  });
});

describe('resolveWebKey', () => {
  const baked = 'evf_live_webbaked';
  it('uses ?key= in demo mode', () => {
    expect(resolveWebKey({ demo: true, search: '?key=evf_live_org', baked })).toBe('evf_live_org');
  });
  it('ignores ?key= outside demo mode', () => {
    expect(resolveWebKey({ demo: false, search: '?key=evf_live_org', webEnvKey: 'evf_live_w', baked })).toBe('evf_live_w');
  });
  it('falls back web env → shared env → baked', () => {
    expect(resolveWebKey({ demo: true, search: '', envKey: 'evf_live_shared', baked })).toBe('evf_live_shared');
    expect(resolveWebKey({ demo: true, search: '?key=', baked })).toBe(baked);
  });
});

describe('initialScenarioState', () => {
  it('all on in demo mode, all off otherwise', () => {
    expect(Object.values(initialScenarioState(true)).every(Boolean)).toBe(true);
    expect(Object.values(initialScenarioState(false)).some(Boolean)).toBe(false);
  });
});
