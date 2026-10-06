import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { captureException, useEverframeScreen } from '@everframe/react-native';
import { color, font } from '../theme';
import { useInsets, useLayout } from '../layout';
import { nav } from '../nav';
import { byId, formatMinutes, posterAspect, stillAspect, titles, type Episode, type Title } from '../data/catalog';
import { toggleSaved, useSaved } from '../data/myList';
import { startDownload } from '../demo/api';
import { isOn } from '../demo/scenarios';
import { Backdrop } from '../components/Backdrop';
import { PosterCard } from '../components/Cards';
import { Rail } from '../components/Rail';
import { Focusable } from '../components/Focusable';
import { Icon } from '../components/Icon';
import { showToast } from '../components/Toast';
import { Button, Meta, Progress, SectionHeading, ShowTitle, styles } from '../components/primitives';

class DownloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DownloadError';
  }
}

async function download(title: Title): Promise<void> {
  showToast(`Downloading ${title.name}…`);
  try {
    await startDownload(title);
    if (isOn('downloadFails')) {
      // Mirrors a real bug: the storage check reads a field that the
      // licence response no longer includes.
      const licence: { storage?: { freeBytes: number } } = {};
      const free = licence.storage!.freeBytes;
      console.log('free bytes', free);
    }
    showToast(`${title.name} is ready to watch offline.`);
  } catch (err) {
    const error = err instanceof TypeError ? new DownloadError(`Download of "${title.id}" failed: ${err.message}`) : err;
    console.error('[downloads] failed to start download', error);
    captureException(error, { context: 'downloads', metadata: { titleId: title.id, quality: '1080p' } });
    showToast('Download failed. Check your connection and try again.', 'error');
  }
}

function resumeTarget(title: Title): Episode | undefined {
  return title.episodes.find((e) => e.progress > 0 && e.progress < 1) ?? title.episodes[0];
}

function EpisodeCard({ title, ep, width, index }: { title: Title; ep: Episode; width: number; index: number }): React.JSX.Element {
  const L = useLayout();
  const radius = L.size({ tv: 18, wide: 14, phone: 10 });
  const fs = L.size({ tv: 24, wide: 16, phone: 15 });
  // Alternate artwork so neighbouring episodes don't share one frame.
  const art = index % 2 === 0 ? title.still : title.poster;
  return (
    <View style={{ width, gap: L.size({ tv: 14, wide: 10, phone: 8 }) }}>
      <Focusable
        accessibilityRole="button"
        accessibilityLabel={`Episode ${ep.number}, ${ep.title}`}
        testID={`episode-${ep.number}`}
        onPress={() => nav.push({ name: 'player', id: title.id, episode: ep.id })}
        focusScale={L.form === 'tv' ? 1.05 : 1}
        style={{ width, aspectRatio: 16 / 9, borderRadius: radius }}
        focusStyle={[styles.ring, { borderRadius: radius }]}
      >
        <View style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden', backgroundColor: color.surface }]}>
          <Image source={art} resizeMode="cover" resizeMethod="resize" style={{ width: '100%', height: '100%' }} />
          <Progress value={ep.progress} height={L.size({ tv: 6, wide: 4, phone: 3 })} style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }} />
        </View>
      </Focusable>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: font.semibold, fontSize: fs, color: color.bone }}>
          {ep.number}. {ep.title}
        </Text>
        <Text style={{ fontFamily: font.medium, fontSize: fs * 0.9, color: color.lichen }}>{formatMinutes(ep.length)}</Text>
      </View>
      <Text numberOfLines={2} style={{ fontFamily: font.body, fontSize: fs * 0.84, lineHeight: fs * 1.2, color: color.lichen }}>
        {ep.blurb}
      </Text>
    </View>
  );
}

function EpisodeRow({ title, ep }: { title: Title; ep: Episode }): React.JSX.Element {
  return (
    <Focusable
      accessibilityRole="button"
      accessibilityLabel={`Episode ${ep.number}, ${ep.title}`}
      onPress={() => nav.push({ name: 'player', id: title.id, episode: ep.id })}
      style={{ flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 6 }}
    >
      <View style={{ width: 128, height: 72, borderRadius: 10, overflow: 'hidden', backgroundColor: color.surface }}>
        <Image source={ep.number % 2 === 1 ? title.still : title.poster} resizeMode="cover" resizeMethod="resize" style={{ width: '100%', height: '100%' }} />
        <Progress value={ep.progress} height={3} style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text numberOfLines={1} style={{ fontFamily: font.semibold, fontSize: 15, color: color.bone }}>
          {ep.number}. {ep.title}
        </Text>
        <Text numberOfLines={2} style={{ fontFamily: font.body, fontSize: 13, lineHeight: 18, color: color.lichen }}>
          {formatMinutes(ep.length)}  {ep.blurb}
        </Text>
      </View>
    </Focusable>
  );
}

export function Detail({ id }: { id: string }): React.JSX.Element {
  const title = byId(id);
  useEverframeScreen(`Detail: ${title.name}`);
  const L = useLayout();
  const insets = useInsets();
  const saved = useSaved().includes(title.id);
  const target = resumeTarget(title);
  const [season] = useState(1);
  const resumeLabel = target ? (target.progress > 0 ? `Resume E${target.number}` : 'Play E1') : 'Play';
  const play = () => nav.push({ name: 'player', id: title.id, episode: target?.id });
  const count = `${title.episodes.length} episodes`;
  const items =
    title.kind === 'film'
      ? [title.genre, title.extent]
      : title.extent.includes('episode')
        ? [title.genre, count]
        : [title.genre, title.extent, count];

  const buttons = (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: L.size({ tv: 20, wide: 12, phone: 10 }) }}>
      <Button kind="primary" icon="play" label={resumeLabel} onPress={play} hasTVPreferredFocus={L.form === 'tv'} testID="detail-play" containerStyle={L.form === 'phone' ? { flex: 1.4 } : undefined} />
      {L.form !== 'tv' ? (
        <Button icon="download" label="Download" onPress={() => void download(title)} testID="detail-download" containerStyle={L.form === 'phone' ? { flex: 1 } : undefined} />
      ) : null}
      <Button
        icon={saved ? 'check' : 'plus'}
        label={L.form === 'phone' ? undefined : saved ? 'In My list' : 'My list'}
        accessibilityLabel={saved ? 'Remove from My list' : 'Add to My list'}
        onPress={() => toggleSaved(title.id)}
      />
    </View>
  );

  const episodesHeading = title.kind === 'film' ? null : `Season ${season}`;
  const similar = titles
    .filter((t) => t.id !== title.id && (t.kind === title.kind || t.genre === title.genre))
    .slice(0, 10);
  const moreLikeThis = (
    <View style={{ marginTop: L.size({ tv: 72, wide: 64, phone: 28 }) }}>
      <Rail
        heading="More like this"
        shape="poster"
        items={similar}
        keyOf={(t) => t.id}
        render={(t, w) => <PosterCard title={t} width={w} onPress={() => nav.push({ name: 'detail', id: t.id })} />}
      />
    </View>
  );

  if (L.form === 'phone') {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: color.ground }} contentContainerStyle={{ paddingBottom: 140 }}>
        <View style={{ height: 430, justifyContent: 'flex-end', paddingHorizontal: 20, paddingBottom: 8 }}>
          <Backdrop source={title.poster} aspect={posterAspect(title)} focusX={title.focusX} side={false} bottomStart={0.45} />
          <ShowTitle size={60}>{title.name}</ShowTitle>
          <Focusable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={() => nav.back()}
            containerStyle={{ position: 'absolute', top: insets.top + 8, left: 16 }}
            style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(14,27,25,0.6)' }}
          >
            <Icon name="back" size={22} color={color.bone} weight={2.2} />
          </Focusable>
        </View>
        <View style={{ paddingHorizontal: 20, paddingTop: 14, gap: 14 }}>
          <Meta size={13} rating={title.rating} items={items} />
          {buttons}
          <Text style={{ fontFamily: font.body, fontSize: 15, lineHeight: 22, color: color.mist }}>{title.synopsis}</Text>
          {episodesHeading ? <SectionHeading size={20} style={{ marginTop: 6 }}>Episodes</SectionHeading> : null}
          {title.episodes.map((ep) => (
            <EpisodeRow key={ep.id} title={title} ep={ep} />
          ))}
        </View>
        {moreLikeThis}
      </ScrollView>
    );
  }

  const tv = L.form === 'tv';
  const epWidth = tv ? L.size({ tv: 420, wide: 0, phone: 0 }) : Math.min(300, (Math.min(L.width, 1440) - L.gutter * 2 - 60) / 4);

  return (
    <View style={{ flex: 1, backgroundColor: color.ground }}>
      <View style={{ position: 'absolute', top: 0, right: 0, width: '74%', height: tv ? '80%' : 640 }}>
        <Backdrop source={title.still} aspect={stillAspect(title)} focusX={title.focusX} bottomStart={0.4} />
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: L.size({ tv: 80, wide: 96, phone: 0 }) }}>
        <View style={{ width: '100%', maxWidth: tv ? undefined : 1440, alignSelf: 'center', paddingHorizontal: L.gutter }}>
          <View style={{ paddingTop: L.size({ tv: 56, wide: 24, phone: 0 }) }}>
            <Focusable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={() => nav.back()}
              containerStyle={{ alignSelf: 'flex-start' }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingRight: 14, paddingLeft: 6, borderRadius: 999 }}
              focusStyle={{ backgroundColor: color.glass }}
            >
              <Icon name="back" size={L.size({ tv: 28, wide: 20, phone: 20 })} color={color.lichen} />
              <Text style={{ fontFamily: font.medium, fontSize: L.size({ tv: 22, wide: 15, phone: 14 }), color: color.lichen }}>
                {title.kind === 'documentary' ? 'Documentaries' : title.kind === 'film' ? 'Films' : 'Series'}
              </Text>
            </Focusable>
          </View>
          <View style={{ marginTop: L.size({ tv: 60, wide: 80, phone: 0 }), gap: L.size({ tv: 24, wide: 18, phone: 0 }), maxWidth: L.size({ tv: 820, wide: 620, phone: 0 }) }}>
            <ShowTitle size={L.size({ tv: 150, wide: Math.min(112, L.width * 0.075), phone: 0 })}>{title.name}</ShowTitle>
            <Meta size={L.size({ tv: 22, wide: 14, phone: 0 })} rating={title.rating} items={items} />
            <Text style={{ fontFamily: font.body, fontSize: L.size({ tv: 26, wide: 17, phone: 0 }), lineHeight: L.size({ tv: 38, wide: 26, phone: 0 }), color: color.boneSoft }}>
              {title.synopsis}
            </Text>
            <View style={{ marginTop: L.size({ tv: 8, wide: 6, phone: 0 }) }}>{buttons}</View>
          </View>
          {title.episodes.length > 0 ? (
            <View style={{ marginTop: L.size({ tv: 80, wide: 72, phone: 0 }), gap: L.size({ tv: 24, wide: 18, phone: 0 }) }}>
              <SectionHeading size={L.size({ tv: 32, wide: 24, phone: 0 })}>{episodesHeading ?? 'Episodes'}</SectionHeading>
              {tv ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -L.gutter }} contentContainerStyle={{ gap: 32, paddingHorizontal: L.gutter, paddingVertical: 20 }}>
                  {title.episodes.map((ep, i) => (
                    <EpisodeCard key={ep.id} title={title} ep={ep} width={epWidth} index={i} />
                  ))}
                </ScrollView>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
                  {title.episodes.map((ep, i) => (
                    <EpisodeCard key={ep.id} title={title} ep={ep} width={epWidth} index={i} />
                  ))}
                </View>
              )}
            </View>
          ) : null}
        </View>
        {moreLikeThis}
      </ScrollView>
    </View>
  );
}
