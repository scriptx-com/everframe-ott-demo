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

Validation so far:

- 12 scenario/mode tests pass, including false values, individual/all toggles,
  initial publication and simulated remount publication.
- TypeScript and the demo web export pass.
- A rebuilt Android phone app records all five startup values, and a subsequent
  real report records all five explicit false values.
- A rebuilt iOS app records all five startup values and all five explicit false
  values in a subsequent real report.

Native provider-remount coverage, the TV hosts, individual-scenario captures
and the refreshed demo bundle remain pending. The source change is not a claim
that a published SDK or an old native binary supports State. A State-capable
release and a deliberate dependency update are needed before normal builds
can publish these values.
