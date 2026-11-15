# Twitch (optional)

::: warning Development branches only
Twitch support is on the `dev` branches of TypeType-Server and TypeType-Frontend. It is not
in a release yet, and the central stack does not include it.
:::

Twitch support is an optional service, published as
[TypeType Live](https://github.com/TypeType-Video/TypeType-Live). A stack without it behaves
exactly as before: the server answers `404` on its Twitch routes and the web app hides the
Twitch section.

With it, viewers watch Twitch lives, VODs and clips through your instance. Twitch never sees
their IP address, and their browser never contacts Twitch.

## Before you start {#requirements}

| Resource | Amount |
| --- | --- |
| Memory | Capped at 128 MB, with `GOMEMLIMIT` at 100 MiB |
| Image | Built from source; no image is published yet |
| Network | Outbound access to Twitch from the service |

## 1. Build and run the service {#service}

```sh
git clone https://github.com/TypeType-Video/TypeType-Live.git
cd TypeType-Live
docker build -t typetype-live:local .
```

Add it to your stack's Compose file, on the same network as the server and the web container:

```yaml
  typetype-live:
    image: typetype-live:local
    restart: unless-stopped
    environment:
      LIVE_SECRET: ${LIVE_SECRET}
      LIVE_SIGNING_KEY: ${LIVE_SIGNING_KEY}
      LIVE_PUBLIC_BASE: /live
      LIVE_SEGMENT_CACHE: 48MiB
      GOMEMLIMIT: 100MiB
    read_only: true
    cap_drop: [ALL]
    security_opt:
      - no-new-privileges:true
    pids_limit: 128
    mem_limit: 128m
```

Do not publish its port. Only the server and the web container talk to it.

| Variable | Default | Meaning |
| --- | --- | --- |
| `LIVE_SECRET` | required | Shared with the server, at least 32 characters |
| `LIVE_SIGNING_KEY` | random at start | Keeps signed video links valid across restarts, at least 32 characters |
| `LIVE_PUBLIC_BASE` | | Public prefix of the video links, `/live` with the TypeType web container |
| `LIVE_SEGMENT_CACHE` | `32MiB` | Memory for shared video segments: about channels watched x segment size x 6 |
| `LIVE_ADDR` | `:8080` | Listening address |
| `LIVE_LOG_LEVEL` | `info` | Log level |

## 2. Point the server at it {#server}

| Variable | Meaning |
| --- | --- |
| `TWITCH_SERVICE_URL` | Address of the service, for example `http://typetype-live:8080` |
| `TWITCH_SERVICE_SECRET` | The same value as `LIVE_SECRET` |
| `TWITCH_TOKEN_ENCRYPTION_KEY` | At least 32 random characters; encrypts the Twitch accounts users link |
| `TWITCH_SERVICE_TIMEOUT_MS` | Request timeout to the service, `15000` by default |

`TWITCH_SERVICE_SECRET` and `TWITCH_TOKEN_ENCRYPTION_KEY` also accept a `_FILE` variant that
reads the value from a file. Twitch stays off until all three of the first variables are set.

## 3. The web container {#web}

The web image already sends `/live/hls/` to the service at `typetype-live:8080`. Set
`TYPETYPE_LIVE_HOST` and `TYPETYPE_LIVE_PORT` on the web container if yours has another
name or port. Only the signed video links go through that route; the service API stays
private behind the shared secret.

## What viewers get {#features}

- A Twitch section with lives, categories and search.
- Lives, VODs and clips played through the instance.
- The live chat, with badges and emotes.
- Linking their Twitch account with a code on twitch.tv/activate, for followed lives,
  subscriber content and sending chat messages.
