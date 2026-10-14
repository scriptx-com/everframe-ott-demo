# Interaction target validation

The demo attaches optional annotations to the existing Focusable Pressable.
Rails supply their stable IDs, headings, and logical source-data index/count;
top navigation and phone tabs supply tablist containers. Accessibility labels,
test IDs, screen markers, press handlers, and focus behavior remain in place.

The released SDK remains a supported dependency. Until the new SDK is released,
the demo probes for its optional hook and uses a harmless fallback when absent.
No unreleased filesystem dependency is committed to package.json or the lockfile.
For local feature qualification, build/pack the public SDK branch and install its
package into an isolated demo checkout, together with matching native artifacts.
The native SDK key configuration also supplies the current `sdkKey` name while
preserving the released SDK's `apiKey` field.

## Local source setup

- Build the public protocol/core/React/RN packages and pack the RN package.
- Use the packed RN package in an isolated node_modules install. Keep the demo's
  tracked dependency manifest/lockfile on its released dependency.
- Android: publish debug native artifacts to Maven local using a distinct
  development version, then add mavenLocal() to the generated host repositories
  and pass `-PeverframeNativeVersion=<local-version>-DEV` to Gradle.
- iOS/tvOS: build the public SDK's debug xcframeworks, point the generated Podfile
  at `<sdk-checkout>/packages/sdk-ios/dev-podspec`, and set
  `EVERFRAME_NATIVE_POD_VERSION` to that source's podspec version.
- Use a dedicated local test key and development ingest endpoint. Do not copy
  credentials or machine-specific paths into source.
- Rebuild native apps after Kotlin, Swift, or TurboModule signature changes.

## Matrix

For iOS, Android, tvOS, and Android TV, run the same checks twice: normal
annotations, then `EXPO_PUBLIC_EVERFRAME_TARGET_ANNOTATIONS=0` in a development
Metro build. Restart Metro between states. Production ignores the off switch.

1. Activate a poster, Continue watching card, and navigation tab. Include hits
   on nested artwork/SVG and activation that immediately navigates.
2. Verify one automatic breadcrumb per interaction and source-screen context.
3. With annotations, compare rail ID/name/index/count to the logical data array;
   without annotations, verify available native name/testID/role still identify
   controls. Do not infer counts from mounted children.
4. Reorder/remount/clip cards, and verify old container metadata never describes
   a new item. Use the public SDK's installed interaction-target fixture for
   same-host updates without layout and rapid replacement.
5. TVs: repeat Select and directional navigation. Use a dedicated simulator or
   emulator, preserving other running tasks' devices.
6. Verify sensitive content suppresses identifying metadata across the entire
   breadcrumb, then capture a report in both annotation states. Validate its
   `data.target` values against the public interaction-target JSON Schema.

## Qualification results (2026-10-14)

Local captured envelopes pass the poster, Continue watching, navigation,
nested artwork, and immediate-navigation checks with annotations on and off
on iOS 26.5, tvOS 26.5, Android 15/API35, and Android TV 14/API34. TV runs
include Select and directional input. Every extracted descriptor validates
against the generated interaction-target schema.

Across all four runtimes, annotated Low Orbit retains `Home` as its source
screen when opening a player/detail screen. Continue watching has logical
index 0/count 5; its Top 10 poster has index 2/count 10. With annotations
disabled, native names, test IDs and roles remain usable without invented rail
positions. Phone SVG navigation and nested poster artwork resolve to their
owning controls. Android phone rails were scrolled offscreen and back before
activation; both TV runs also traversed away from and back to the poster.

The installed SDK fixture separately passes metadata update, host replacement,
automatic fallback and masking on all four runtimes. iOS/Android produce nine
descriptors each, tvOS 22, and Android TV 28. Masked breadcrumbs retain only
allowed role/masked fields. Native regression tests cover sibling reorder and
registration ownership; the installed fixture covers update/remount behavior.

Qualification used the feature RN package, matching locally built native
artifacts, synthetic keys and a local collector. Temporary timed handled-error
captures collected normal SDK breadcrumbs without changing the demo's press
handlers or target metadata. That instrumentation is not shipped. These are
local report-envelope checks, not production backend or companion acceptance.

All 19 demo tests, typecheck, and web export previously passed with both the
released SDK and the packed feature package. Native debug hosts build on all
four runtimes; hosted demo CI is green. SDK implementation is in
[PR 126](https://github.com/scriptx-com/everframe/pull/126). Broader coordinated integration gates are tracked separately.
No deployment is part of this change.
