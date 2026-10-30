# Settings

Open **Settings** from the side menu. The page has eleven sections, listed on the
left: Playback, Video, Interface, Languages, Services, Notifications, Data, API,
Privacy, Blocked content, and About. Most choices are saved on your instance and
follow your account to every browser. The theme, the interface language, and the
player color stay in the browser where you set them.

![The Playback section of the settings page](/screenshot-settings.png)

## Playback {#playback}

- **Autoplay**, play the next video automatically.
- **Autoplay countdown**, the seconds before autoplay moves on; `0` starts the next
  playlist item at once.
- **Skip playlist autoplay screen**, go straight to the next playlist item while
  keeping the countdown for recommendations.
- **Hide upcoming playlist videos**, hide the titles and thumbnails of the next
  playlist items.
- **Audio-only playback**, load only the audio stream when the service offers one.
  See [Audio only](./watching#audio-only).
- **Default quality**, the resolution videos open at.
- **Default playback speed**, applied when a video starts.

YouTube playback uses the stateful SABR path on every supported browser. NicoNico
and BiliBili keep their provider-specific playback paths.

## Video and SponsorBlock {#sponsorblock}

The **Video** section decides what SponsorBlock does with community-marked segments:

- **SponsorBlock behavior**, **Skip** segments automatically, **Mark** them on the
  bar without skipping, or **Off** to ignore SponsorBlock entirely.
- **SponsorBlock categories**, choose **Skip**, **Mark**, or **Hide** for each kind
  of segment: sponsored message, self-promotion, interaction reminder, intro,
  endcards, and more.
- **Advanced display**, set a minimum segment duration, show the current segment
  next to the time, show chapters and full-video labels, skip full-video labels
  manually, mute instead of skipping, and skip non-music only on music videos.

The same section holds two watch-page switches: **Autoplay next video**, which
continues with the first suggestion, and **Autoplay on open**, which starts a video
as soon as you open it.

![SponsorBlock behavior and categories](/screenshot-sponsorblock.png)

## Interface {#what-you-see}

**Startup** sets the **Default landing page**: Home, Subscriptions, History,
Playlists, Watch later, or Favorites.

**Layout** sets the number of **Videos per row**, the **Theme** (system, light, or
dark), the **Related video size** on watch pages, and the **Player color**. The
player color changes the progress bar and the player controls, for video and
audio-only playback. Pick default, white, red, pink, purple, blue, green, or orange;
the bar under the swatches previews your choice.

![Picking a player color in Settings > Interface](/player-color.gif)

**Discovery surfaces** turns parts of TypeType off:

- **DeArrow titles and thumbnails**, community-written titles and representative
  thumbnails for YouTube videos.
- **Continue watching** and **Home recommendations**, hide in-progress videos or
  personalized recommendations from the home page. See
  [Choosing your algorithm](/guide/algorithm) for how the home page is built.
- **Related videos**, hide the suggestions column on watch pages.
- **Comments and danmaku**, stop loading comments and bullet comments.
- **Shorts surface**, hide short-form videos everywhere and the Shorts page.
- **Live streams**, hide active and scheduled live streams from the subscriptions
  feed.
- **Members-only videos**, hide videos that require a paid channel membership.
- **Hide everything**, switch every surface above off at once.

![Discovery surfaces in Settings > Interface](/screenshot-content-toggles.png)

## Languages {#languages}

- **Interface language**, English, Simplified Chinese, French, or German, on this
  device.
- **Subtitles**, turn subtitles on by default and choose a **Subtitle language**.
- **Audio language**, the audio track to pick when a video has several.
- **Prefer original language**, always keep the original audio instead of a dubbed
  track.

## Services {#service}

Pick the default service, **YouTube, NicoNico, or BiliBili**, so search and browsing
target the right source. The service menu at the top of the page also switches
service.

## Notifications, data, and API keys

- **Notifications** turns popups for new videos on or off and lets you choose which
  subscribed channels notify you. New channels start disabled.
- **Data** exports a TypeType backup of the categories you select, restores one,
  and opens [data transfer](/self-hosting/importing-data) for other apps. Restoring
  replaces the categories included in the backup.
- **API** creates and revokes keys for external apps, such as
  [Discord Rich Presence](./discord-rich-presence).

## Privacy and blocked content

**Privacy** controls watch history tracking and clears your watch history, search
history, or subscriptions. **Blocked content** lists the channels, videos, and
keywords you have hidden. Both are described in [Privacy & blocking](./privacy).

## About {#about}

The About section shows the version, full revision, and build time reported by the
web app, Server, Token, and Downloader. Each component is checked independently, so
an unavailable internal service does not hide the version information returned by
the others. Use the refresh button after an update to request the current values.
