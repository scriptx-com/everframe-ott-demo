import type { ImageSourcePropType } from 'react-native';
import { moreTitles } from './moreTitles';

// Nocturne's catalogue. Every title, synopsis and image is original to this
// demo: the artwork was generated for it and contains no real people, brands
// or text.

export type Kind = 'series' | 'film' | 'documentary';

export interface Caption {
  /** Seconds into the clip. */
  start: number;
  end: number;
  text: string;
}

export interface Episode {
  id: string;
  number: number;
  title: string;
  /** Minutes. */
  length: number;
  blurb: string;
  /** 0–1 watched. */
  progress: number;
}

export interface Title {
  id: string;
  name: string;
  kind: Kind;
  genre: string;
  rating: string;
  year: number;
  /** "2 seasons", "1 h 48 min". */
  extent: string;
  tagline: string;
  synopsis: string;
  poster: ImageSourcePropType;
  still: ImageSourcePropType;
  /** Where the subject sits in the still, for cropping (0–1). */
  focusX: number;
  clip: number;
  captions: Caption[];
  episodes: Episode[];
  badge?: string;
}

const img = {
  saltLine: require('../../assets/images/still-salt-line.jpg'),
  lowOrbitStill: require('../../assets/images/still-low-orbit.jpg'),
  lowOrbitPoster: require('../../assets/images/poster-low-orbit.jpg'),
  hollowStill: require('../../assets/images/still-hollow-pines.jpg'),
  hollowPoster: require('../../assets/images/poster-hollow-pines.jpg'),
  kitchenStill: require('../../assets/images/still-kitchen-midnight.jpg'),
  kitchenPoster: require('../../assets/images/poster-kitchen-midnight.jpg'),
  undertowStill: require('../../assets/images/still-undertow.jpg'),
  undertowPoster: require('../../assets/images/poster-undertow.jpg'),
  velvetStill: require('../../assets/images/still-velvet-hour.jpg'),
  velvetPoster: require('../../assets/images/poster-velvet-hour.jpg'),
  longQuiet: require('../../assets/images/poster-long-quiet.jpg'),
  fieldNotes: require('../../assets/images/poster-field-notes.jpg'),
  neonSaints: require('../../assets/images/poster-neon-saints.jpg'),
  signalFires: require('../../assets/images/poster-signal-fires.jpg'),
};

const clip = {
  saltLine: require('../../assets/video/salt-line.mp4'),
  lowOrbit: require('../../assets/video/low-orbit.mp4'),
  hollowPines: require('../../assets/video/hollow-pines.mp4'),
  kitchen: require('../../assets/video/kitchen-midnight.mp4'),
  undertow: require('../../assets/video/undertow.mp4'),
  velvet: require('../../assets/video/velvet-hour.mp4'),
  longQuiet: require('../../assets/video/long-quiet.mp4'),
  fieldNotes: require('../../assets/video/field-notes.mp4'),
  neonSaints: require('../../assets/video/neon-saints.mp4'),
  signalFires: require('../../assets/video/signal-fires.mp4'),
};

function eps(list: Array<[string, number, string]>, watchedThrough = 0, current = 0): Episode[] {
  return list.map(([title, length, blurb], i) => ({
    id: `e${i + 1}`,
    number: i + 1,
    title,
    length,
    blurb,
    progress: i < watchedThrough ? 1 : i === watchedThrough ? current : 0,
  }));
}

const baseTitles: Title[] = [
  {
    id: 'salt-line',
    name: 'The Salt Line',
    kind: 'series',
    genre: 'Coastal thriller',
    rating: '16+',
    year: 2026,
    extent: '2 seasons',
    tagline: 'Season 2 now streaming',
    synopsis:
      'The last keeper of a northern lighthouse finds a ship on her charts that sank forty years ago. Tonight it is sailing toward her.',
    poster: img.saltLine,
    still: img.saltLine,
    focusX: 0.75,
    clip: clip.saltLine,
    badge: 'New season',
    captions: [
      { start: 1, end: 4, text: '[wind howling]' },
      { start: 5, end: 8.5, text: 'The lamp has burned every night for ninety years.' },
      { start: 9.5, end: 12.5, text: 'So why does that ship not see it?' },
      { start: 14, end: 17.5, text: 'Ilse, come away from the edge.' },
      { start: 18.5, end: 22, text: "It's on the chart. It shouldn't be on the chart." },
    ],
    episodes: eps([
      ['The keeper', 54, 'A ship appears on charts drawn decades before it sank.'],
      ['Fog signal', 51, 'Ilse rings the bell for a vessel nobody else can hear.'],
      ['Low water', 49, 'The tide goes out farther than it ever has.'],
      ['Wreckers', 56, 'The village remembers what it did in 1986.'],
    ]),
  },
  {
    id: 'low-orbit',
    name: 'Low Orbit',
    kind: 'series',
    genre: 'Science fiction',
    rating: '13+',
    year: 2025,
    extent: '1 season',
    tagline: 'Ninety minutes per orbit',
    synopsis:
      'Two engineers are the last crew on a station losing altitude by the hour. One plan might work, and the ground team has stopped answering.',
    poster: img.lowOrbitPoster,
    still: img.lowOrbitStill,
    focusX: 0.5,
    clip: clip.lowOrbit,
    captions: [
      { start: 1, end: 4, text: 'Houston, Kestrel. Do you copy?' },
      { start: 5, end: 8, text: '[static]' },
      { start: 9, end: 12.5, text: 'We lost another four hundred metres.' },
      { start: 14, end: 17, text: 'Then we fire on the next pass.' },
      { start: 18, end: 22.5, text: 'Eleven seconds. Not one more.' },
    ],
    episodes: eps(
      [
        ['Decay', 48, 'The station drops for the first time.'],
        ['Kestrel', 50, 'An old supply ship is the only way home.'],
        ['Dead air', 47, 'The radio goes quiet mid-sentence.'],
        ['Burn window', 52, 'Eleven seconds to fire the engines, or wait another day.'],
        ['Tether', 49, 'A spacewalk nobody trained for.'],
        ['Reentry math', 55, 'The numbers say one of them stays.'],
      ],
      3,
      0.62,
    ),
  },
  {
    id: 'kitchen-midnight',
    name: 'Kitchen at Midnight',
    kind: 'documentary',
    genre: 'Food',
    rating: 'All',
    year: 2026,
    extent: '6 episodes',
    tagline: 'Night markets, one city at a time',
    synopsis:
      'The cooks who feed a city after the restaurants close. Six cities, six nights, no reservations.',
    poster: img.kitchenPoster,
    still: img.kitchenStill,
    focusX: 0.5,
    clip: clip.kitchen,
    captions: [
      { start: 0.5, end: 3.5, text: '[oil crackling]' },
      { start: 4, end: 7.5, text: 'Two more minutes, then we flip it.' },
      { start: 8.5, end: 12, text: 'My mother ran this stall for thirty years.' },
      { start: 13, end: 16.5, text: 'The rain brings people in. Nobody knows why.' },
      { start: 17.5, end: 21.5, text: 'By two in the morning the line reaches the corner.' },
    ],
    episodes: eps(
      [
        ['Taipei, 1 a.m.', 44, 'A noodle stall that has never closed.'],
        ['Mexico City, 3 a.m.', 46, 'Tacos al pastor for the night shift.'],
        ['Osaka, 2 a.m.', 48, 'Okonomiyaki under the train tracks.'],
        ['Lagos, midnight', 45, 'Suya smoke and generator hum.'],
        ['Istanbul, 4 a.m.', 43, 'Soup for the fishermen.'],
        ['Lisbon, 1 a.m.', 47, 'A bifana counter older than the street.'],
      ],
      2,
      0.3,
    ),
  },
  {
    id: 'velvet-hour',
    name: 'The Velvet Hour',
    kind: 'series',
    genre: 'Period drama',
    rating: '16+',
    year: 2025,
    extent: '1 season',
    tagline: 'Harlem, 1954',
    synopsis:
      'A singer with one good season left and a club owner with debts to the wrong people share a stage, and a secret.',
    poster: img.velvetPoster,
    still: img.velvetStill,
    focusX: 0.5,
    clip: clip.velvet,
    captions: [
      { start: 1, end: 4, text: '[trumpet plays]' },
      { start: 5, end: 8.5, text: 'One more set, Lena. They came for you.' },
      { start: 9.5, end: 13, text: 'They came for the bar. I just keep them there.' },
      { start: 14.5, end: 18, text: 'Mr. Okafor is at table six again.' },
      { start: 19, end: 22.5, text: 'Then we play the slow one.' },
    ],
    episodes: eps(
      [
        ['Opening night', 52, 'Lena auditions for a club that cannot pay her.'],
        ['Table six', 49, 'A regular who never orders a drink.'],
        ['Cover charge', 50, 'The debt comes due.'],
        ['Blue Monday', 51, 'A recording session goes wrong.'],
        ['Last set', 58, 'Lena chooses which song to sing.'],
        ['Lights up', 54, 'The club after closing.'],
      ],
      4,
      0.81,
    ),
  },
  {
    id: 'undertow',
    name: 'Undertow',
    kind: 'documentary',
    genre: 'Nature',
    rating: 'All',
    year: 2026,
    extent: '5 episodes',
    tagline: 'Life under the surface',
    synopsis:
      'Freedivers and marine biologists follow the currents that shape the planet, from kelp forests to the open blue.',
    poster: img.undertowPoster,
    still: img.undertowStill,
    focusX: 0.5,
    clip: clip.undertow,
    captions: [
      { start: 1, end: 4.5, text: 'Kelp grows up to half a metre a day.' },
      { start: 6, end: 9.5, text: 'Inside, the light turns green and gold.' },
      { start: 11, end: 14.5, text: 'A harbour seal comes close to look.' },
      { start: 16, end: 20, text: 'For a moment, nobody is the visitor.' },
    ],
    episodes: eps(
      [
        ['Open water', 50, 'Following a turtle across an ocean basin.'],
        ['The kelp cathedral', 48, 'Forests that grow toward the sun.'],
        ['Cold current', 51, 'Where the Arctic meets the Atlantic.'],
        ['Reef night', 47, 'What wakes after dark.'],
        ['Return', 52, 'The divers go home.'],
      ],
      1,
      0.45,
    ),
  },
  {
    id: 'hollow-pines',
    name: 'Hollow Pines',
    kind: 'series',
    genre: 'Mystery',
    rating: '13+',
    year: 2026,
    extent: '1 season',
    tagline: 'Every town has a lookout',
    synopsis:
      'A teenager in a mountain town sees a light in the abandoned fire lookout. The next morning, the tower is gone.',
    poster: img.hollowPoster,
    still: img.hollowStill,
    focusX: 0.5,
    clip: clip.hollowPines,
    badge: 'New',
    captions: [
      { start: 1, end: 4, text: '[crickets]' },
      { start: 5, end: 8.5, text: 'There. Third window. Do you see it?' },
      { start: 9.5, end: 12.5, text: "Nobody's been up there since the fire." },
      { start: 14, end: 17.5, text: "Then who's turning the light on?" },
      { start: 18.5, end: 22, text: 'Wren, wait. Wren!' },
    ],
    episodes: eps(
      [
        ['Lookout', 46, 'A light where there should be none.'],
        ['Ranger station', 44, 'The town records are missing a year.'],
        ['Controlled burn', 48, 'Wren goes up the mountain alone.'],
        ['Ash', 50, 'What the fire left behind.'],
      ],
      0,
      0.12,
    ),
  },
  {
    id: 'neon-saints',
    name: 'Neon Saints',
    kind: 'series',
    genre: 'Crime noir',
    rating: '18+',
    year: 2025,
    extent: '2 seasons',
    tagline: 'The rain never stops in Low Harbour',
    synopsis:
      'A detective who works only at night chases a thief who returns everything he steals, one week later, to the minute.',
    poster: img.neonSaints,
    still: img.neonSaints,
    focusX: 0.5,
    clip: clip.neonSaints,
    captions: [
      { start: 1, end: 4.5, text: 'Seven days. To the minute.' },
      { start: 6, end: 9.5, text: 'Why steal it if you give it back?' },
      { start: 11, end: 14.5, text: "Because he's not stealing the thing." },
      { start: 16, end: 20, text: "He's stealing the week." },
    ],
    episodes: eps([
      ['Return policy', 53, 'A painting comes back with one brushstroke changed.'],
      ['Low Harbour', 50, 'The precinct nobody transfers out of.'],
      ['Seventh day', 55, 'Detective Sato waits.'],
    ]),
  },
  {
    id: 'long-quiet',
    name: 'The Long Quiet',
    kind: 'documentary',
    genre: 'Nature',
    rating: 'All',
    year: 2024,
    extent: '1 h 38 min',
    tagline: 'One winter on the ice',
    synopsis:
      'Two researchers and a sled dog spend a polar winter measuring an ice shelf the size of a small country.',
    poster: img.longQuiet,
    still: img.longQuiet,
    focusX: 0.5,
    clip: clip.longQuiet,
    captions: [
      { start: 1, end: 4.5, text: 'Day 61. Minus 48.' },
      { start: 6, end: 9.5, text: 'The aurora came back tonight.' },
      { start: 11, end: 15, text: 'Tove barks at it every time.' },
      { start: 16.5, end: 20.5, text: 'The shelf moved four metres this month.' },
    ],
    episodes: [],
  },
  {
    id: 'field-notes',
    name: 'Field Notes',
    kind: 'documentary',
    genre: 'Nature',
    rating: 'All',
    year: 2026,
    extent: '8 episodes',
    tagline: 'Birds, up close',
    synopsis:
      'A slow, patient series about the birds that live along one river, filmed over a single year.',
    poster: img.fieldNotes,
    still: img.fieldNotes,
    focusX: 0.5,
    clip: clip.fieldNotes,
    captions: [
      { start: 1, end: 4.5, text: '[river running]' },
      { start: 6, end: 10, text: 'A kingfisher waits for the water to go still.' },
      { start: 12, end: 16, text: 'It dives eleven times before breakfast.' },
    ],
    episodes: eps([
      ['Dawn chorus', 28, 'Spring arrives at the river.'],
      ['Kingfisher', 26, 'The fastest dive on the bank.'],
      ['Heron', 27, 'Patience as a hunting strategy.'],
    ]),
  },
  {
    id: 'signal-fires',
    name: 'Signal Fires',
    kind: 'film',
    genre: 'Western',
    rating: '13+',
    year: 2025,
    extent: '1 h 52 min',
    tagline: 'Light them, and they come',
    synopsis:
      'A rider crosses the high desert to warn a town that the railroad is coming, and that it is not coming alone.',
    poster: img.signalFires,
    still: img.signalFires,
    focusX: 0.5,
    clip: clip.signalFires,
    captions: [
      { start: 1, end: 4.5, text: 'Three fires means riders.' },
      { start: 6, end: 9.5, text: "And five?" },
      { start: 11, end: 14.5, text: 'Five means run.' },
      { start: 16, end: 20, text: '[horse snorts]' },
    ],
    episodes: [],
  },
];

export const titles: Title[] = [...baseTitles, ...moreTitles];

/** Width / height of a title's still (some titles reuse their portrait poster). */
const portraitOnly = new Set(['neon-saints', 'long-quiet', 'field-notes', 'signal-fires']);
export const stillAspect = (t: Title): number => (portraitOnly.has(t.id) ? 2 / 3 : 1.5);

/** The Salt Line has no portrait poster; it reuses its landscape still. */
export const posterAspect = (t: Title): number => (t.id === 'salt-line' ? 1.5 : 2 / 3);

export const byId = (id: string): Title => {
  const t = titles.find((x) => x.id === id);
  if (!t) throw new Error(`Unknown title: ${id}`);
  return t;
};

export interface ContinueItem {
  title: Title;
  episode: Episode;
}

/** Titles with an episode in progress, most recent first. */
export const continueWatching: ContinueItem[] = ['low-orbit', 'kitchen-midnight', 'velvet-hour', 'undertow', 'hollow-pines'].map(
  (id) => {
    const title = byId(id);
    const episode = title.episodes.find((e) => e.progress > 0 && e.progress < 1) ?? title.episodes[0]!;
    return { title, episode };
  },
);

export const featured = ['salt-line', 'low-orbit', 'velvet-hour'].map(byId);

export interface Rail {
  id: string;
  name: string;
  items: Title[];
  /** top10 = posters with a large rank number beside them. */
  shape: 'poster' | 'landscape' | 'top10';
}

const ids = (...list: string[]) => list.map(byId);

/** Home rails after Continue watching, top to bottom. */
export const rails: Rail[] = [
  {
    id: 'top10',
    name: 'Top 10 in Lithuania today',
    shape: 'top10',
    items: ids('salt-line', 'cartographer', 'low-orbit', 'northbound', 'velvet-hour', 'halden', 'hollow-pines', 'kitchen-midnight', 'static', 'glasshouse'),
  },
  {
    id: 'originals',
    name: 'Nocturne originals',
    shape: 'poster',
    items: ids('hollow-pines', 'neon-saints', 'velvet-hour', 'understudy', 'signal-fires', 'low-orbit', 'copper-ash', 'salt-line', 'static', 'long-quiet', 'northbound'),
  },
  {
    id: 'new',
    name: 'New this week',
    shape: 'landscape',
    items: ids('cartographer', 'northbound', 'paper-fleet', 'hollow-pines', 'wild-cities', 'glasshouse', 'kitchen-midnight'),
  },
  {
    id: 'because',
    name: 'Because you watched Low Orbit',
    shape: 'poster',
    items: ids('glasshouse', 'static', 'long-quiet', 'deep-time', 'halden', 'neon-saints', 'undertow', 'cartographer'),
  },
  {
    id: 'late-films',
    name: 'Films for a late night',
    shape: 'landscape',
    items: ids('halden', 'paper-moons', 'cartographer', 'signal-fires', 'glasshouse', 'saltwater'),
  },
  {
    id: 'docs',
    name: 'Documentaries worth staying up for',
    shape: 'landscape',
    items: ids('undertow', 'wild-cities', 'kitchen-midnight', 'hives', 'long-quiet', 'deep-time', 'field-notes'),
  },
  {
    id: 'family',
    name: 'For the whole family',
    shape: 'poster',
    items: ids('paper-fleet', 'moonlight-bakery', 'field-notes', 'undertow', 'hives', 'wild-cities', 'long-quiet'),
  },
];

export const kindLabel: Record<Kind, string> = {
  series: 'Series',
  film: 'Films',
  documentary: 'Documentaries',
};

export function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${min % 60} min`;
}
