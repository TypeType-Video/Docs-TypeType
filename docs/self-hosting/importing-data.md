# Importing your data

Once your instance is running and your account is created, you can bring in your
subscriptions, playlists, history, and more from the app you used before, and export
them again to another app later. Open **Data transfer** in the sidebar; new accounts
land there right after sign-up.

## Supported apps

| App or format | File | Import | Export |
| --- | --- | --- | --- |
| TypeType | `.json` | everything | everything |
| PipePipe | `.zip` | yes | no |
| NewPipe | `.zip` | yes | yes |
| Invidious | `.json` | yes | yes |
| Piped | `.json` | yes | yes |
| LibreTube | `.json` | yes | yes |
| ViewTube | `.zip` | yes | no |
| Flow | `.json` | yes | yes |
| Grayjay | `.zip` | yes | yes |
| YouTube Takeout | `.zip` | yes | no |
| OPML | `.opml` | subscriptions | subscriptions |
| Materialious | `.json` | subscriptions | subscriptions |
| SkyTube | `.opml` | subscriptions | subscriptions |
| youtube-local | `.opml` | subscriptions | subscriptions |

What comes across depends on what each app stores: subscriptions, subscription
groups, watch history, playlists, Watch later, favorites, playback progress, search
history, saved playlists, settings, or content filters. A TypeType backup carries
all of them. When a format holds only part of a category, the preview and the final
report say so.

![The Import from menu with every supported source](/screenshot-import-sources.png)

## Import

1. Export a backup from your current app, and keep the file exactly as it gives it
   to you: do not unzip or edit it.
2. In **Data transfer**, stay on **Import** and leave **Import from** on **Automatic
   detection**, or pick the app yourself.
3. Drop the file, or choose it. The limit is 512 MB.
4. TypeType analyzes the file and shows a preview: the detected source, how many
   items it found in each category, duplicates, and compatibility notes. Nothing is
   written before this step.
5. The import then starts on its own for everything detected. Items you already have
   are skipped. You can leave the page; the import keeps going.

When it finishes, a report lists what was imported and what was skipped, and you can
download it.

## From YouTube (Google Takeout)

Takeout brings in your **subscriptions, watch history, playlists, Watch later, and
liked videos** (as Favorites).

1. Pick **YouTube Takeout** in **Import from**, then select **Open Google Takeout**:
   the link pre-selects YouTube and My Activity. Keep My Activity if you want your
   watch history.
2. Create a one-time ZIP export and download it from Google.
3. Drop the original ZIP. If Google split the export into several ZIPs, import them
   one at a time.

The importer removes duplicate subscriptions, playlists, and videos, reuses an
existing playlist when it matches, and maps YouTube's system playlists to TypeType
**Favorites** and **Watch later** instead of ordinary playlists. Liked-video activity
can also fill Favorites when the system playlist is missing or incomplete; the
original activity time and order are kept. Rows with only partial metadata are
completed in the background, so the playlist opens right away.

If the import says no account data was found, you dropped a video-only part of the
export: choose the ZIP that holds your history, subscriptions, or playlists. If it
says the archive exceeds the limits or is encrypted, export YouTube again in smaller
ZIP parts.

## Export

On the **Export** tab, choose a **Destination format** and the categories to
include, then **Generate export** and download the file. A destination that cannot
hold every TypeType field shows a warning, and the report lists what could not be
kept. A TypeType export keeps everything, which makes it the backup to use when you
move to another TypeType instance.

**Settings > Data** also creates and restores a TypeType backup directly. Restoring
there replaces the categories included in the backup.

## Source references

- [Supported formats](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-portability/src/main/kotlin/dev/typetype/server/portability/PortabilityFormat.kt)
- [Registered importers and exporters](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-portability/src/main/kotlin/dev/typetype/server/portability/PortabilityEngineFactory.kt)
- [Takeout parser and deduplication](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-services/src/main/kotlin/dev/typetype/server/services/YoutubeTakeoutParserService.kt)
- [Background metadata repair](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-services/src/main/kotlin/dev/typetype/server/services/UserVideoMetadataRepairService.kt)
