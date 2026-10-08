# Publishing the demo build

Checklist for putting the demo-mode build behind Everframe's onboarding demo.
Values in angle brackets are placeholders to fill in when the accounts exist.

| Placeholder | Meaning |
|---|---|
| `<VIBEVIEW_DEMO_ACCOUNT>` | The dedicated VibeView account that hosts the demo apps |
| `<EMBED_KEY>` | One embed key per platform app, e.g. `ek_live_REPLACE_ME` |
| `<SIGNING_SECRET>` | That key's visitor signing secret, e.g. `vvis_REPLACE_ME` (server-side only) |

## 1. Native builds on VibeView

1. Build release artifacts with `EXPO_PUBLIC_DEMO_MODE=1` for the iOS
   simulator, the tvOS simulator, Android and Android TV
   (see VibeView's "Preparing your build" guide for the upload format).
   Build with **no** `EXPO_PUBLIC_EVERFRAME_KEY` / `EXPO_PUBLIC_EVERFRAME_WEB_KEY`
   in the environment or `.env`: Expo bakes them in at build time, and a
   launch without a param would then report to the builder's own project
   instead of falling back to the public demo key in `src/everframe/keys.ts`.
2. Upload them to `<VIBEVIEW_DEMO_ACCOUNT>`. A VibeView app has exactly one
   platform, so this is four apps: iOS, tvOS, Android and Android TV.
3. For each of iPhone, Pixel, Apple TV and Android TV, start a sandbox
   session with launch params `{"everframeKey":"evf_live_PROBE"}` and confirm
   the SDK configured with that key.

   | Device | Param received | Build |
   |---|---|---|
   | iPhone | | |
   | Pixel | | |
   | Apple TV | | |
   | Android TV | | |

   Then relaunch each device **without** params and confirm the SDK falls back
   to the public demo key, so no key carries over from a previous session.

   If Apple TV doesn't receive it, leave Apple TV out of the embed key's
   devices until VibeView delivers launch params on tvOS. If Android TV
   doesn't, check it's a release build and that the launcher activity is the
   one reading the extras.

## 2. Hosted web build

The web demo runs on Cloudflare as a static-assets Worker at
**https://ott-demo.everframe.dev** (`wrangler.jsonc`).

1. Every push to `main` deploys it automatically
   (`.github/workflows/deploy-web-demo.yml`, using the `CLOUDFLARE_API_TOKEN`
   repository secret); "Run workflow" redeploys on demand. To deploy by hand:
   `CLOUDFLARE_API_TOKEN=… pnpm deploy:web:demo`.
2. Open `https://ott-demo.everframe.dev/?key=evf_live_PROBE` and confirm the
   header shows **Report a bug** and the SDK requests use that key.

## 3. Embed keys

An embed key streams one app, so create one key per platform app in
`<VIBEVIEW_DEMO_ACCOUNT>` (Embedding → Create key). Everframe's demo page
switches between them. For each:

| Setting | Value |
|---|---|
| App and build | That platform's app, latest build (auto) |
| Allowed domains | the Everframe dashboard's domain, `localhost` |
| Device models | the platform's device, e.g. iPhone or Pixel |
| Let visitors choose the device | Off |
| Max session duration | 600 |
| Max concurrent sessions | the pool size the account plan allows |
| Max sessions per visitor | 1 |
| Audio | Off |

Copy each key's visitor signing secret when it is shown (once). Everframe signs
the signed-in user as the visitor, so a user who leaves the demo page and comes
back resumes their running session. Once every key has its secret in
Everframe, turn on **Require a visitor identity**.

Smoke test from a local page on `localhost`:

```html
<iframe
  src="https://vibeview.io/embed/<EMBED_KEY>?params=%7B%22everframeKey%22%3A%22evf_live_PROBE%22%7D"
  style="width:100%;max-width:380px;aspect-ratio:380/820;border:0"
  allow="autoplay; clipboard-write" allowfullscreen></iframe>
```

## 4. Hand the values to Everframe

In the Everframe API environment, set for each platform (`IOS`, `ANDROID`,
`TVOS`, `ANDROID_TV`):

- `VIBEVIEW_DEMO_EMBED_KEY_<PLATFORM>=<EMBED_KEY>`
- `VIBEVIEW_DEMO_SIGNING_SECRET_<PLATFORM>=<SIGNING_SECRET>`

and `NOCTURNE_WEB_URL=https://ott-demo.everframe.dev`. A platform without a
key is left out of the demo page.
