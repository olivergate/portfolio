---
slug: blob-life/technology
status: published
---

## The phone keeps the day

I built BlobLife in Flutter with Riverpod for state and Drift over SQLite for local data. The list you see on Today and the reminders it needs are worked out on the device.

## Plain-language capture

The app can take a sentence and suggest the kind of item it describes. You can check the result before saving it. The stack includes Supabase and Claude Haiku for the parts that use a server.

## Tests

I use unit tests for the scheduling and state rules, and Maestro to walk through the app on an emulator. It's worth seeing what happens when someone taps things in a different order from the one I had in mind.
