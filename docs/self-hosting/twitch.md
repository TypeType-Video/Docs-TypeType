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
| Memory | About 128 MB |
| Disk | About 10 MB for the image |
| TypeType | 1.18.0 or newer |

What changes on your stack: a new container, `typetype-live`, and Server is recreated with the
address of the service. Only Server and the web container talk to it; do not publish its port.

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

The installer creates the secrets, adds the service and keeps it on later updates.

## B. By hand {#install-by-hand}

Use this if you manage the stack yourself, for example with Dockge.

1. Add three random secrets of at least 32 characters to `.env`. Any password generator works;
   `openssl rand -hex 32` prints one.

   ```dotenv
   TWITCH_SERVICE_SECRET=change-me-to-a-random-value
   TWITCH_TOKEN_ENCRYPTION_KEY=change-me-to-another-random-value
   LIVE_SIGNING_KEY=change-me-to-a-third-random-value
   ```

   Keep `TWITCH_TOKEN_ENCRYPTION_KEY` once users have linked accounts: changing it makes them
   link again.

2. Add the service to `docker-compose.override.yml`, next to `docker-compose.yml` (create the
   file if you do not have one; the installer keeps it on updates):

   ```yaml
   services:
     typetype-server:
       environment:
         TWITCH_SERVICE_URL: http://typetype-live:8080
         TWITCH_SERVICE_SECRET: ${TWITCH_SERVICE_SECRET}
         TWITCH_TOKEN_ENCRYPTION_KEY: ${TWITCH_TOKEN_ENCRYPTION_KEY}

     typetype-live:
       image: ghcr.io/typetype-video/typetype-live:${TYPETYPE_VERSION:-latest}
       restart: unless-stopped
       environment:
         LIVE_SECRET: ${TWITCH_SERVICE_SECRET}
         LIVE_SIGNING_KEY: ${LIVE_SIGNING_KEY}
         LIVE_PUBLIC_BASE: /live
       mem_limit: 128m
       read_only: true
       cap_drop: [ALL]
       security_opt: ["no-new-privileges:true"]
   ```

   During the release candidate, the stack follows `TYPETYPE_VERSION=rc` and Live does too.

3. Start it:

   ```sh
   docker compose up -d
   ```

   The web container already sends the video links under `/live/` to `typetype-live:8080`. If
   your Live container has another name, set `TYPETYPE_LIVE_HOST` (and `TYPETYPE_LIVE_PORT`) on
   the web container.

## Check it works {#check}

Open the instance: the sidebar shows **Live**. Open a live channel and its chat. In the stack
directory, `docker compose ps typetype-live` shows the container as `healthy`.

## Linking a Twitch account {#link-account}

Each user can link their own Twitch account from **Live > Link a Twitch account**. TypeType shows
a code to enter on `twitch.tv/activate` from any device signed in to Twitch. A linked account
shows the followed lives, lets the user chat and follow, and reads the chat and chapters of past
broadcasts with that account. Tokens stay encrypted in the database and never reach the browser.

## Remove it {#remove}

With the installer, set `TWITCH_ENABLED=false` in `.env` and run it again. By hand, remove the
`typetype-live` block and the three `TWITCH_*` lines from `docker-compose.override.yml`, then run
`docker compose up -d --remove-orphans`. The Twitch section disappears; linked accounts stay
encrypted in the database.

## Settings {#settings}

| Variable | Default | Role |
| --- | --- | --- |
| `TWITCH_SERVICE_URL` | | Address of the service, as Server reaches it |
| `TWITCH_SERVICE_SECRET` | | Shared by Server and Live (`LIVE_SECRET`), 32+ characters |
| `TWITCH_TOKEN_ENCRYPTION_KEY` | | Encrypts linked Twitch accounts, 32+ characters |
| `LIVE_SIGNING_KEY` | random at start | Keeps video links valid across restarts, 32+ characters |
| `LIVE_SEGMENT_CACHE` | `32MiB` | Memory for shared video segments |
| `TWITCH_SERVICE_TIMEOUT_MS` | `15000` | Timeout of Server's calls to Live |

Twitch stays off until Server has the first three. Every secret also accepts a `_FILE` variant
that reads the value from a file.
