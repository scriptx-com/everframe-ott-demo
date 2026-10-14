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

Local verification so far: metadata tests, typecheck, and web export pass against
both the released package and the feature package. Android debug compilation
and iOS debug compilation pass against local native artifacts. The public SDK's
installed phone fixture has produced local iOS/Android envelopes with annotation
on/off and masking; iOS also verified host replacement after native mount retries.
Android's final mount retry needs an installed rerun after the dedicated emulator
stalled under disk pressure. TV envelope runs and this demo's full Nocturne
interaction matrix remain pending. Native envelope qualification is tracked separately in the coordinated SDK/private evidence; a successful
compile alone is not evidence of device behavior. No deployment is part of this
change.
