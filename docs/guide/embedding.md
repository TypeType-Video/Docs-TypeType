# Embedded player

TypeType provides a dedicated player route for embedding YouTube videos without the
rest of the watch page.

## URL format

Use the YouTube video identifier after `/embed/`:

```text
https://your-instance.example/embed/VIDEO_ID
```

The identifier is the 11-character value after `v=` in a regular YouTube watch URL.
For example, `https://www.youtube.com/watch?v=dQw4w9WgXcQ` becomes
`/embed/dQw4w9WgXcQ`.

## Start position and autoplay

| Parameter | Value | Behavior |
| --- | --- | --- |
| `t` | Seconds or a duration | Start position |
| `start` | Seconds or a duration | Alias for `t` |
| `time_continue` | Seconds or a duration | Invidious-compatible alias for `t` |
| `autoplay` | `1` | Request autoplay |

Durations can combine hours, minutes, and seconds, such as `1h30m15s`. When several
start parameters are present, TypeType uses `t`, then `start`, then `time_continue`.
Invalid or negative values start from the beginning.

```text
/embed/dQw4w9WgXcQ?t=90
/embed/dQw4w9WgXcQ?start=1m30s
/embed/dQw4w9WgXcQ?time_continue=45&autoplay=1
```

Autoplay remains subject to the browser's media policy. A browser can require a user
gesture before starting audio.

## Add an iframe

```html
<iframe
  src="https://your-instance.example/embed/dQw4w9WgXcQ?autoplay=1"
  title="TypeType video player"
  allow="autoplay; fullscreen; picture-in-picture"
  allowfullscreen
  loading="lazy"
></iframe>
```

Give the iframe an explicit responsive size in the surrounding page. For example:

```css
.video-embed {
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 0;
}
```

Add `class="video-embed"` to the iframe when using this example.

## Accounts, settings, and guest access

Opening an embed URL directly in a browser tab can reuse the current TypeType account
and player settings. Inside an iframe, playback is anonymous and does not read the
embedding site's TypeType session or settings.

The instance must therefore allow guest access for iframe playback. An administrator
can enable **Allow guest mode** from the TypeType administration settings. When guest
access is disabled, the embed shows a dedicated message with a link to the normal
watch page instead of attempting playback.

The embed also shows the same unavailable, scheduled, and members-only states as the
watch page. Temporary loading failures provide a retry action when retrying is safe.
