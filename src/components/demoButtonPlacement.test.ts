import { describe, it, expect } from 'vitest';
import { demoButtonPlacement } from './demoButtonPlacement';

const base = { demo: true, isTV: false, isWeb: false, form: 'phone' as const, route: 'section' };

describe('demoButtonPlacement', () => {
  it('floating on phones', () => expect(demoButtonPlacement(base)).toBe('floating'));
  it('header on wide web', () => expect(demoButtonPlacement({ ...base, isWeb: true, form: 'wide' })).toBe('header'));
  it('floating on narrow web', () => expect(demoButtonPlacement({ ...base, isWeb: true, form: 'phone' })).toBe('floating'));
  it('never on TVs', () => expect(demoButtonPlacement({ ...base, isTV: true, form: 'tv' })).toBeNull());
  it('never outside demo mode', () => expect(demoButtonPlacement({ ...base, demo: false })).toBeNull());
  it('hidden on the player route', () => expect(demoButtonPlacement({ ...base, route: 'player' })).toBeNull());
  // Only section screens render TopNav; a series page on wide web has no header.
  it('floating on a series page on wide web', () =>
    expect(demoButtonPlacement({ ...base, isWeb: true, form: 'wide', route: 'detail' })).toBe('floating'));
});
