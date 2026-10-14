# Scenario State qualification

The native publisher sends the entire `demo.<scenario>` snapshot after the
Everframe provider mounts and after each setting change. False values are
explicit. Scenario console messages are no longer used as State.

The currently published React Native SDK does not export `setState`; the
publisher guards that optional API so existing installs continue to run.
The web adapter also has no State API and its publisher is explicitly inert.
Missing State must remain unknown in reports from those builds.

Local qualification uses public Everframe source commit
`e2f93f8318bf5c44b32412a495a09619ec957cf0`, packed React Native/React modules,
and matching native debug binaries. This is not an npm/Maven/Swift release.
Dependency manifests and lockfiles retain their published versions.

Validation:

- 12 scenario/mode tests pass, including false values, individual/all toggles,
  initial publication and simulated remount publication.
- TypeScript and the demo web export pass.
- A rebuilt Android phone app records all five startup values, and a subsequent
  real report records all five explicit false values.
- A rebuilt iOS app records all five startup values and all five explicit false
  values in a subsequent real report.

- Real individual-scenario reports now cover all four native hosts: Download
  on iOS 26.5; Search and Subtitles on tvOS 26.5; Buffering on Android 14;
  Poster on Android TV 14. All use app 1.0.0(1), this demo source at `8bc3126`
  and the source SDK revision above. Each snapshot records only the intended
  scenario true and the other four false; Android captures also retain the
  startup → all-off → individual-on change sequence.
- An actual Android process restart republishes all five startup values.
  An isolated native provider remount was not separately exercised.
- The private platform exported these five genuine reports as demo bundle v2,
  verified screenshot hashes, and provisioned a fresh local demo with recorded
  State and generic reproduction packs. Public asset upload is still pending.
- Manually authored Smart tests on the existing hosted builds reproduced four
  of five fresh scenarios (poster, download, search, buffering). Subtitle timing
  remains inconclusive. These tests use explicit human setup recipes and live
  target navigation; their assisted result does not replace the old-report2/5
  benchmark or qualify State in the older hosted native binaries.

The source change is not a claim that a published SDK or an old native binary
supports State. A State-capable release and a deliberate dependency update are
needed before normal builds can publish these values. Web State is unqualified.
