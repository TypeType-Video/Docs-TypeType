# Twitch (optional)

Twitch support is an optional service, published as
[TypeType-Live](https://github.com/TypeType-Video/TypeType-Live). With it, users browse
Twitch lives, categories and tags, watch lives, past broadcasts and clips, read and send in
the chat, and can link their Twitch account. Past broadcasts keep their position like any
other video. Twitch never sees their IP address, and their browser never contacts Twitch.

A stack without it behaves exactly as before and shows no Twitch section.

## Before you start {#requirements}

| Resource | Amount |
| --- | --- |
| Memory | About 128 MB (`LIVE_MEMORY_LIMIT`) |
| Disk | About 10 MB for the image |
| TypeType | 1.18.0 or newer, installed with the installer or the supported Compose file |

What changes on your stack when you add it:

- a new container, `typetype-live`;
- three new secrets in the `typetype_secrets` volume, created by `typetype-init`: the secret
  Server shares with Live, the key that encrypts linked Twitch accounts, and the key that keeps
  playback links valid across restarts;
- Server is recreated with the address of the service.

The commands of this page use `$STACK_DIR` for the directory your stack lives in:

```sh
STACK_DIR=~/typetype-stack
```

## A. With the installer {#install}

Run the installer with `--twitch`, on a new instance or on an existing one:

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --twitch
```

::: tip During the 1.18.0 release candidate
Until 1.18.0 is released, `--twitch` is only in the installer of the release candidates: use
`https://raw.githubusercontent.com/TypeType-Video/TypeType/staging/scripts/install-stack.sh` with
`bash -s -- --rc --twitch`.
:::

Without `--yes`, the installer also asks. It writes `TWITCH_ENABLED=true` in `.env`, so later
updates keep Twitch.

## B. By hand {#install-by-hand}

```sh
cd "$STACK_DIR"
COMPOSE_TWITCH_FILE=docker-compose.twitch.yml ./scripts/run-stack-init.sh
docker compose -f docker-compose.yml -f docker-compose.twitch.yml up -d --wait
```

Add `TWITCH_ENABLED=true` to `.env` if you later update with the installer.

## Check it works {#check}

Open the instance: the sidebar shows **Live**. Open a live channel and the chat.

```sh
docker compose -f docker-compose.yml -f docker-compose.twitch.yml ps typetype-live
```

The container must be `healthy`.

## Linking a Twitch account {#link-account}

Each user can link their own Twitch account from **Live > Link a Twitch account**. TypeType shows
a code to enter on `twitch.tv/activate` from any device signed in to Twitch. A linked account
shows the followed lives, lets the user chat and follow, and reads the chat and chapters of past
broadcasts with that account. Tokens stay encrypted in the database and never reach the browser.

## Remove it {#remove}

Set `TWITCH_ENABLED=false` in `.env`, so a future update does not add it again, then start the
stack without the overlay:

```sh
cd "$STACK_DIR"
docker compose -f docker-compose.yml up -d --remove-orphans --wait
```

The Twitch section disappears. Linked accounts stay encrypted in the database.

## Settings {#settings}

| Variable | Default | Role |
| --- | --- | --- |
| `TYPETYPE_LIVE_IMAGE` | follows `TYPETYPE_VERSION` | Live image |
| `LIVE_MEMORY_LIMIT` | `128m` | Memory cap of the container |
| `LIVE_SEGMENT_CACHE` | `48MiB` | Shared cache of video segments |
| `TWITCH_SERVICE_TIMEOUT_MS` | `15000` | Timeout of Server's calls to Live |

## Your own Compose file {#own-compose}

If you run TypeType from your own Compose file, add the `typetype-live` service of
[docker-compose.twitch.yml](https://github.com/TypeType-Video/TypeType/blob/main/docker-compose.twitch.yml)
without publishing its port: only the server and the web container talk to it. Its variables are listed in
the [TypeType-Live README](https://github.com/TypeType-Video/TypeType-Live).

### Point the server at it {#server}

| Variable | Meaning |
| --- | --- |
| `TWITCH_SERVICE_URL` | Address of the service, for example `http://typetype-live:8080` |
| `TWITCH_SERVICE_SECRET` | The same value as `LIVE_SECRET` |
| `TWITCH_TOKEN_ENCRYPTION_KEY` | At least 32 random characters; encrypts the Twitch accounts users link |
| `TWITCH_SERVICE_TIMEOUT_MS` | Request timeout to the service, `15000` by default |

`TWITCH_SERVICE_SECRET` and `TWITCH_TOKEN_ENCRYPTION_KEY` also accept a `_FILE` variant that
reads the value from a file. Twitch stays off until all three of the first variables are set.

### The web container {#web}

The web image already sends `/live/hls/` to the service at `typetype-live:8080`. Set
`TYPETYPE_LIVE_HOST` and `TYPETYPE_LIVE_PORT` on the web container if yours has another
name or port. Only the signed video links go through that route; the service API stays
private behind the shared secret.
