# Interaction events validation

The demo permits text values only for the native `search-input` host. Password,
masked and other inputs are not allowlisted. Known Nocturne title/play links use
route templates; dynamic IDs, query values and fragments are omitted. No launch
argument values or production permissions are added.

Search uses optional metadata while native TextInput observation owns edits,
including composition and allowlisted values. The existing search handlers remain
in place.
Rails keep native scroll observation, add stable native IDs, and compose the
existing scroll ref with optional metadata. Existing deep-link routing remains
the sole app router; the SDK observes the native Linking channel itself.

Run a development build with `EXPO_PUBLIC_EVERFRAME_INTERACTION_HELPERS=0` to
remove helper registration while retaining native IDs, accessibility labels and
screen tracking. The SDK export is optional, so older released packages keep
working. Production builds retain helpers when available.

For iOS, Android, tvOS and Android TV, capture a report after a search edit,
submission, rail gesture, link opening and background/foreground return in each
helper mode. Record exact demo and public SDK commits and validate stored
`data.interaction` objects against the published schema. Check source screens,
logical targets, no duplicate semantic events, and no private URL components.

The public SDK's separate development interaction fixture covers secure/masked
text, custom controls, revocation and permission result mapping without adding
unrelated controls to Nocturne. Synthetic permission and notification-attribution
cases must be labelled; they do not prove an OS prompt or delivered notification.
Local collector captures must not be described as production reports.
