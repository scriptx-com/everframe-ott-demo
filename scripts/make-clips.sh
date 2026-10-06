#!/usr/bin/env bash
# Builds the episode clips in assets/video/ from the generated artwork in
# assets/images/. Each clip is two slow camera moves over still frames with
# a crossfade, so playback shows Nocturne's own (copyright-clean) imagery
# instead of third-party footage. Re-run after changing the artwork:
#
#   bash scripts/make-clips.sh          # only clips that don't exist yet
#   FORCE=1 bash scripts/make-clips.sh  # rebuild all
#
# Clips carry a silent audio track: some players (and Chrome in background
# tabs) treat video-only media differently.
#
# Requires ffmpeg.
set -euo pipefail
cd "$(dirname "$0")/.."

IMG=assets/images
OUT=assets/video
mkdir -p "$OUT"

FPS=30
SHOT=12            # seconds per shot
FADE=1             # crossfade seconds
FRAMES=$((FPS * SHOT))

# zoompan turns ONE input frame into $FRAMES output frames, so inputs are
# single images (not looped).
# shot <input> <crop expr: w:h:x:y over the source> <move: in|out|left|right>
shot_filter() {
  local crop=$1 move=$2 z x y
  case $move in
    in)    z="1+0.10*on/$FRAMES"; x="iw/2-(iw/zoom/2)"; y="ih/2-(ih/zoom/2)" ;;
    out)   z="1.10-0.10*on/$FRAMES"; x="iw/2-(iw/zoom/2)"; y="ih/2-(ih/zoom/2)" ;;
    left)  z="1.08"; x="(iw-iw/zoom)*(1-on/$FRAMES)"; y="ih/2-(ih/zoom/2)" ;;
    right) z="1.08"; x="(iw-iw/zoom)*on/$FRAMES"; y="ih/2-(ih/zoom/2)" ;;
  esac
  printf "crop=%s,scale=3840:2160,zoompan=z='%s':x='%s':y='%s':d=%d:s=1280x720:fps=%d,format=yuv420p" \
    "$crop" "$z" "$x" "$y" "$FRAMES" "$FPS"
}

# clip <name> <imgA> <cropA> <moveA> <imgB> <cropB> <moveB>
clip() {
  local name=$1
  if [ -f "$OUT/$name.mp4" ] && [ -z "${FORCE:-}" ]; then return; fi
  ffmpeg -y -loglevel error \
    -i "$IMG/$2" \
    -i "$IMG/$5" \
    -f lavfi -t $((SHOT * 2 - FADE)) -i anullsrc=channel_layout=stereo:sample_rate=48000 \
    -filter_complex "[0:v]$(shot_filter "$3" "$4")[a];[1:v]$(shot_filter "$6" "$7")[b];[a][b]xfade=transition=fade:duration=$FADE:offset=$((SHOT - FADE)),scale=out_range=tv,format=yuv420p[v]" \
    -map "[v]" -map 2:a -c:a aac -b:a 32k -shortest -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -profile:v high -level 4.0 -movflags +faststart "$OUT/$name.mp4"
  echo "$OUT/$name.mp4 $(du -h "$OUT/$name.mp4" | cut -f1)"
}

# Landscape stills are 1536x1024; a 16:9 crop of them is 1536x864.
# Portrait posters are 1024x1536; a 16:9 band of them is 1024x576.
W169='1536:864:0:80'
clip salt-line         still-salt-line.jpg   1536:864:0:120   in    still-salt-line.jpg  900:506:600:300  left
clip low-orbit         still-low-orbit.jpg   $W169            in    poster-low-orbit.jpg 1024:576:0:420   right
clip hollow-pines      still-hollow-pines.jpg $W169           out   poster-hollow-pines.jpg 1024:576:0:500 left
clip kitchen-midnight  still-kitchen-midnight.jpg $W169       in    poster-kitchen-midnight.jpg 1024:576:0:380 right
clip undertow          still-undertow.jpg    $W169            right poster-undertow.jpg  1024:576:0:600   in
clip velvet-hour       still-velvet-hour.jpg $W169            in    poster-velvet-hour.jpg 1024:576:0:260 left
clip long-quiet        poster-long-quiet.jpg 1024:576:0:700   in    poster-long-quiet.jpg 1024:576:0:300 right
clip field-notes       poster-field-notes.jpg 1024:576:0:480  in    poster-field-notes.jpg 1024:576:0:900 out
clip neon-saints       poster-neon-saints.jpg 1024:576:0:300  left  poster-neon-saints.jpg 1024:576:0:800 in
clip signal-fires      poster-signal-fires.jpg 1024:576:0:500 right poster-signal-fires.jpg 1024:576:0:150 in

pair() { # name: still push-in, then a band of the poster
  clip "$1" "still-$1.jpg" $W169 "${2:-in}" "poster-$1.jpg" 1024:576:0:${3:-450} "${4:-right}"
}
pair paper-moons in 520 left
pair cartographer out 300 right
pair glasshouse in 600 left
pair halden right 360 in
pair saltwater in 700 left
pair northbound left 600 in
pair understudy in 420 right
pair static out 500 left
pair copper-ash in 300 right
pair wild-cities right 600 in
pair deep-time in 700 out
pair hives left 300 in
pair paper-fleet in 500 right
pair moonlight-bakery out 520 left
