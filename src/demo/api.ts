import { isOn } from './scenarios';
import { titles, type Title } from '../data/catalog';

// Nocturne's "backend". The catalogue ships with the app, but every screen
// still makes the requests a real streaming app would, against an echo
// service, so Everframe's network log has something true to show.
// Point EXPO_PUBLIC_DEMO_API at any httpbin-compatible host.
const BASE = (process.env.EXPO_PUBLIC_DEMO_API ?? 'https://httpbin.org').replace(/\/$/, '');
const API = `${BASE}/anything/nocturne/v1`;
const PROFILE = 'viewer-0042';

// RN's URL polyfill lacks `pathname`.
const pathOf = (url: string): string => url.replace(/^https?:\/\/[^/]+/, '').split('?')[0] ?? url;

async function request(url: string, init?: RequestInit, quiet = false): Promise<Response> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: { Accept: 'application/json', 'X-Nocturne-Profile': PROFILE, ...init?.headers },
    });
    const ms = Date.now() - started;
    if (quiet) {
      // Best-effort calls stay out of the console.
    } else if (!res.ok) {
      console.error(`[api] ${init?.method ?? 'GET'} ${pathOf(url)} → ${res.status} in ${ms} ms`);
    } else {
      console.log(`[api] ${init?.method ?? 'GET'} ${pathOf(url)} → ${res.status} in ${ms} ms`);
    }
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function loadHome(): Promise<void> {
  try {
    await request(`${API}/rails/home?profile=${PROFILE}&region=EU`);
  } catch (err) {
    console.warn('[api] home rails request failed, using bundled catalogue', err);
  }
}

/** Resolves the remote artwork for a title. Fails for one poster when brokenPoster is on. */
export async function checkArtwork(title: Title): Promise<boolean> {
  if (title.id !== 'neon-saints' || !isOn('brokenPoster')) return true;
  try {
    const res = await request(`${BASE}/status/404?asset=posters/neon-saints@2x.jpg&cdn=img-eu-2`);
    if (!res.ok) {
      console.error(`[images] poster for "${title.name}" failed to load (HTTP ${res.status})`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[images] poster for "${title.name}" failed to load`, err);
    return false;
  }
}

export async function search(query: string): Promise<Title[]> {
  const q = encodeURIComponent(query.trim());
  const url = isOn('slowSearch') ? `${BASE}/delay/4?q=${q}&index=catalogue-v3` : `${API}/search?q=${q}`;
  const started = Date.now();
  try {
    await request(url);
  } catch (err) {
    console.warn('[search] request failed, searching locally', err);
  }
  const ms = Date.now() - started;
  if (ms > 2000) console.warn(`[search] "${query}" took ${ms} ms (budget 800 ms)`);
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  const tagged = MOODS[needle] ?? [];
  return titles.filter(
    (t) =>
      tagged.includes(t.id) ||
      t.name.toLowerCase().includes(needle) ||
      t.genre.toLowerCase().includes(needle) ||
      t.kind.includes(needle) ||
      t.synopsis.toLowerCase().includes(needle),
  );
}

// Moods the search screen suggests, mapped to the titles they stand for.
const MOODS: Record<string, string[]> = {
  space: ['low-orbit', 'glasshouse', 'deep-time'],
  'night markets': ['kitchen-midnight', 'neon-saints'],
  jazz: ['velvet-hour', 'paper-moons'],
};

export async function startDownload(title: Title): Promise<void> {
  await request(`${API}/downloads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titleId: title.id, quality: '1080p', profile: PROFILE }),
  });
}

export async function sendHeartbeat(title: Title, positionSec: number): Promise<void> {
  try {
    await request(`${API}/playback/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titleId: title.id, position: Math.round(positionSec), profile: PROFILE }),
    }, true);
  } catch {
    // Heartbeats are best-effort.
  }
}

/** The segment request that fails when playerStall is on. */
export async function fetchNextSegment(title: Title, index: number): Promise<boolean> {
  const seg = String(index).padStart(5, '0');
  try {
    const res = await request(`${BASE}/status/503?segment=${title.id}/1080p/seg_${seg}.m4s&cdn=vod-eu-2`);
    return res.ok;
  } catch {
    return false;
  }
}
