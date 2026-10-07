# Publishing the demo build

Checklist for putting the demo-mode build behind Everframe's onboarding demo.
Values in angle brackets are placeholders to fill in when the accounts exist.

| Placeholder | Meaning |
|---|---|
| `<VIBEVIEW_DEMO_ACCOUNT>` | The dedicated VibeView account that hosts the demo app |
| `<VIBEVIEW_DEMO_EMBED_KEY>` | That account's embed key, e.g. `ek_live_REPLACE_ME` |
| `<NOCTURNE_WEB_URL>` | Where the web build is hosted, e.g. `https://nocturne-demo.example.invalid` |

## 1. Native builds on VibeView

1. Build release artifacts with `EXPO_PUBLIC_DEMO_MODE=1` for the iOS
   simulator, the tvOS simulator, Android and Android TV
   (see VibeView's "Preparing your build" guide for the upload format).
2. Upload them to one app named "Nocturne TV" in `<VIBEVIEW_DEMO_ACCOUNT>`.
3. For each of iPhone, Pixel, Apple TV and Android TV, start a sandbox
   session with launch params `{"everframeKey":"evf_live_PROBE"}` and confirm
   the SDK configured with that key.

   | Device | Param received | Build |
   |---|---|---|
   | iPhone | | |
   | Pixel | | |
   | Apple TV | | |
   | Android TV | | |

   If Apple TV doesn't receive it, leave Apple TV out of the embed key's
   devices until VibeView delivers launch params on tvOS. If Android TV
   doesn't, check it's a release build and that the launcher activity is the
   one reading the extras.

## 2. Hosted web build

1. `pnpm build:web:demo`
2. Deploy `dist/` to `<NOCTURNE_WEB_URL>`.
3. Open `<NOCTURNE_WEB_URL>/?key=evf_live_PROBE` and confirm the header shows
   **Report a bug** and the SDK requests use that key.

## 3. Embed key

In `<VIBEVIEW_DEMO_ACCOUNT>`, Embedding → Create key:

| Setting | Value |
|---|---|
| App and build | Nocturne TV, latest build (auto) |
| Allowed domains | the Everframe dashboard's domain, `localhost` |
| Device models | Apple TV, iPhone, Pixel, Android TV |
| Let visitors choose the device | On |
| Max session duration | 600 |
| Max concurrent sessions | the pool size the account plan allows |
| Max sessions per visitor | 1 |
| Audio | Off |

Smoke test from a local page on `localhost`:

```html
<iframe
  src="https://vibeview.io/embed/<VIBEVIEW_DEMO_EMBED_KEY>?params=%7B%22everframeKey%22%3A%22evf_live_PROBE%22%7D"
  style="width:100%;max-width:380px;aspect-ratio:9/19.5;border:0"
  allow="autoplay; clipboard-write" allowfullscreen></iframe>
```

## 4. Hand the values to Everframe

Set `VIBEVIEW_DEMO_EMBED_KEY=<VIBEVIEW_DEMO_EMBED_KEY>` and
`NOCTURNE_WEB_URL=<NOCTURNE_WEB_URL>` in the Everframe API environment.
