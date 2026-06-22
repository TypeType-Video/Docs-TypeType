# Configuration

All configuration lives in your `.env` file. Every value has a working default, so a
local install runs with the file copied straight from `.env.example`. This page
explains each variable so you can adapt it for a real deployment.

## Ports

These are the **host** ports the services are published on. Change them if something
else already uses those ports.

| Variable | Default | What it is |
| --- | --- | --- |
| `HOST_PORT_WEB` | `8082` | The web app, the only one your users need to reach |
| `HOST_PORT_SERVER` | `8080` | The API server |
| `HOST_PORT_TOKEN` | `8081` | The remote-login service |
| `HOST_PORT_GARAGE_S3` | `3900` | The object store's S3 endpoint |

## Origins

| Variable | Default | What it is |
| --- | --- | --- |
| `ALLOWED_ORIGINS` | local URLs | Comma-separated list of origins allowed to call the API. **Add your domain here** for a public deployment, e.g. `https://watch.example.com`. |

## Database and cache

Defaults work out of the box with the bundled `postgres` and `dragonfly` services.
Only change these if you point at an external database or cache.

| Variable | Default | What it is |
| --- | --- | --- |
| `DATABASE_URL` | bundled postgres | JDBC URL of the database |
| `DATABASE_USER` | `typetype` | Database user |
| `DATABASE_PASSWORD` | `typetype` | Database password, **change it for production** |
| `DRAGONFLY_URL` | bundled dragonfly | Redis-compatible cache URL |

## Object store (downloads)

Required only to enable downloads. See
[Docker Compose setup, Part 2](./docker-compose#part-2-object-storage-for-downloads).

| Variable | Default | What it is |
| --- | --- | --- |
| `DOWNLOADER_S3_ACCESS_KEY` | placeholder | S3 access key, must start with `GK` |
| `DOWNLOADER_S3_SECRET_KEY` | placeholder | S3 secret key |
| `DOWNLOADER_S3_PUBLIC_ENDPOINT` | `http://localhost:3900` | The S3 URL the **browser** uses to fetch finished downloads. For a public deployment this must be a publicly reachable URL. |

## Secrets, handled automatically

You normally never touch these. On first start an init container generates them into
a private volume, and the services read them from there. The `SET_ME_...` text in
`.env` is recognised as a placeholder and ignored.

| Variable | What it is |
| --- | --- |
| `YOUTUBE_REMOTE_LOGIN_INTERNAL_TOKEN` | Shared secret between the server and the remote-login service |
| `YOUTUBE_SESSION_ENCRYPTION_KEY` | Key used to encrypt stored sessions |

::: tip Bringing your own
If you prefer to manage these yourself (for example to share one value across hosts),
set a real value in `.env` and it will be used instead of the generated one.
:::

## YouTube remote login (optional feature)

Off by default. Leave it disabled unless you specifically want the remote-login flow.

| Variable | Default | What it is |
| --- | --- | --- |
| `YOUTUBE_REMOTE_LOGIN_ENABLED` | `false` | Turns the feature on |
| `YOUTUBE_REMOTE_LOGIN_CALLBACK_ORIGIN` | server URL | Origin used for the login callback |
| `YOUTUBE_REMOTE_LOGIN_TTL_MS` | `480000` | Session lifetime in milliseconds |
| `YOUTUBE_REMOTE_LOGIN_MAX_SESSIONS` | `2` | Max concurrent login sessions |
| `YOUTUBE_REMOTE_LOGIN_FRAME_FPS` | `10` | Frame rate of the streamed login view |
| `YOUTUBE_REMOTE_LOGIN_MAX_FRAME_BYTES` | `524288` | Max size of a single frame |

## Bug reports

| Variable | Default | What it is |
| --- | --- | --- |
| `GITHUB_REPO` | `Priveetee/TypeType-Server` | Repo the in-app bug reporter targets |
| `GITHUB_ISSUE_TEMPLATE` | `bug_report_backend.md` | Issue template the prefilled link selects, empty for none. See [Reporting issues](./reporting-issues#from-inside-the-app) |
