# Recommender (experimental)

::: warning Experimental
The recommender is at version 0.0.1. Its algorithms, settings and resource needs can
still change between updates.
:::

The recommender is an optional service, published as
[TypeType Signals](https://github.com/TypeType-Video/TypeType-Signals). It lets each
user build their home page with an algorithm they pick and tune. See
[Choosing your algorithm](/guide/algorithm) for what users get.

A stack without it behaves exactly as before and shows no option anywhere. With it,
three switches stay in different hands:

1. you install the service;
2. the administrator switches it on for the instance;
3. each user turns it on for themselves.

## Before you start {#requirements}

| Resource | Amount | How to check |
| --- | --- | --- |
| Memory | About 1 GB at rest, capped at 2 GB by default (`RECOMMENDER_MEMORY_LIMIT`) | `free -h`, column `available` |
| Disk | About 550 MB for the language model and about 330 MB for the image | `df -h /var/lib/docker` |
| Network | Internet access on first start, to download the model from Hugging Face. The service never talks to YouTube. | |
| TypeType | A stack installed with the installer or the supported Compose file | `docker compose ps` in the stack directory |

What changes on your stack when you add it:

- a new container, `typetype-recommender`;
- a new volume, `recommender_models`, for the model;
- a new database, `typetype_recommender`, in the PostgreSQL you already have;
- the `postgres` service moves from `postgres:17` to `pgvector/pgvector:pg17`, the same
  PostgreSQL 17 with the `pgvector` extension, on the same data volume. PostgreSQL
  restarts once, so the instance is unavailable for a few seconds;
- Server is recreated with the address of the service.

Your existing data is not migrated or rewritten. Take a database backup first all the
same, as before any change to the stack: see [Maintenance](./maintenance#backups).

The commands of this page use `$STACK_DIR` for the directory your stack lives in. Set
it once in your terminal. `~/typetype-stack` is only the installer's default: use the
directory you chose, whichever it is. See
[Choose the directory](./quick-start#stack-directory).

```sh
STACK_DIR=~/typetype-stack
```

Pick one of the three ways below.

## A. New instance, with the installer {#install-new}

1. Run the installer with the recommender:

   ```sh
   curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --recommender
   ```

   Without `--recommender`, the installer asks instead, and answers no if you just
   press Enter:

   ```text
   [install] Optional: the recommender (experimental) lets each user pick the algorithm of their home page.
   [install] It needs about 2 GB of memory and 1 GB of disk, and downloads a language model on first start.
   Add the experimental recommender? [y/N]:
   ```

2. The installer confirms the choice, then asks before starting anything:

   ```text
   [install] Recommender (experimental) added to the stack.
   [install] Validating the resolved Compose stack...
   Proceed with Docker pull + startup in <your stack directory>? [y/N]:
   ```

   Answer `y`.

3. Wait. The first start downloads the image and then the model. The installer waits
   up to 15 minutes for every service to be healthy, instead of the usual 3. It ends
   with:

   ```text
   Done. Open http://localhost:8082
   ```

4. Go to [Check that it runs](#verify).

The installer has set `RECOMMENDER_ENABLED=true` in `.env`, so the option is already
offered on the instance.

## B. Existing instance, with the installer {#install-existing}

Run the installer again with the directory of your stack. It backs up the managed
files, keeps your `.env` and your `docker-compose.override.yml`, and adds the
recommender.

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --recommender --dir "$STACK_DIR"
```

Expect the instance to be unavailable for a few seconds while PostgreSQL and Server
restart, then go to [Check that it runs](#verify).

## C. Existing instance, by hand {#manual}

Use this if you manage the stack yourself, for example with Dockge.

1. Go to the stack directory and make sure the overlay is there:

   ```sh
   cd "$STACK_DIR"
   ls docker-compose.recommender.yml
   ```

   If it is missing, your stack files are older than the recommender. Fetch it:

   ```sh
   curl -fsSLO https://raw.githubusercontent.com/TypeType-Video/TypeType/main/docker-compose.recommender.yml
   ```

2. Tell the stack to offer it. In `.env`, set:

   ```dotenv
   RECOMMENDER_ENABLED=true
   ```

   This line is also what makes the installer keep the recommender on a later update.

3. Create the database and the shared secret:

   ```sh
   COMPOSE_RECOMMENDER_FILE=docker-compose.recommender.yml ./scripts/run-stack-init.sh
   ```

   The output ends with:

   ```text
   CREATE DATABASE
   CREATE EXTENSION
   ```

   On a second run, `CREATE DATABASE` is absent and the extension line says it already
   exists. Both are fine.

4. Start the service and recreate Server:

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.recommender.yml up -d --wait --wait-timeout 900
   ```

   On an ARM64 host, name the ARM64 file too, as you already do:
   `-f docker-compose.yml -f docker-compose.arm64.yml -f docker-compose.recommender.yml`.

5. Go to [Check that it runs](#verify).

::: warning Name both files from now on
Every `docker compose` command for this stack must now name
`docker-compose.recommender.yml` as well. A command that names only
`docker-compose.yml` with `--remove-orphans` removes the recommender.
:::

## Check that it runs {#verify}

Run these from the stack directory. Every command names both Compose files, whichever
way you installed: `docker compose` alone only knows the services of
`docker-compose.yml`. On an ARM64 host, add `-f docker-compose.arm64.yml` between the
two.

```sh
cd "$STACK_DIR"
```

1. The container is healthy:

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.recommender.yml ps typetype-recommender
   ```

   The `STATUS` column must read `Up ... (healthy)`. `(health: starting)` means the
   model is still being downloaded or loaded.

2. Its log shows a complete start:

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.recommender.yml logs typetype-recommender
   ```

   ```text
   INFO:     Started server process [1]
   INFO:     Waiting for application startup.
   Warning: You are sending unauthenticated requests to the HF Hub. Please set a HF_TOKEN to enable higher rate limits and faster downloads.
   INFO:     Application startup complete.
   INFO:     Uvicorn running on http://0.0.0.0:8190 (Press CTRL+C to quit)
   ```

   The warning about the HF Hub is expected: the model is public and needs no token.
   The pause before `Application startup complete` is the download.

3. Server reaches it:

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.recommender.yml exec -T typetype-server wget -qO- http://127.0.0.1:8080/version/recommender
   ```

   ```json
   {"service":"recommender","version":"0.0.1","revision":"...","shortRevision":"...","buildTime":"..."}
   ```

   An empty answer or an error means Server does not see the service: see
   [Troubleshooting](#troubleshooting).

4. The instance announces it:

   ```sh
   docker compose -f docker-compose.yml -f docker-compose.recommender.yml exec -T typetype-server wget -qO- http://127.0.0.1:8080/instance
   ```

   The answer contains:

   ```json
   "recommender":{"installed":true,"enabled":true,"experimental":true}
   ```

   `installed` is true as soon as Server knows the service. `enabled` is the
   instance-wide switch described next.

5. In the web app, **Settings**, then **About**, shows a line **Algorithm** with the
   version `0.0.1`.

## Switch it on {#enable}

Installing the service shows nothing to users until the instance offers it.

1. Sign in as an administrator and open the admin console.
2. Open the **Recommender** section.
3. Switch on **Offer the experimental home page**. It is already on if `.env` holds
   `RECOMMENDER_ENABLED=true`.
4. Reload the web app: **Algorithm** appears in the menu.

Then try it with your own account:

1. Open **Algorithm**.
2. Switch on **Build my home page with an algorithm I choose**.
3. Go back to the home page. On an empty account you get a welcome card; import some
   data or watch a few videos first.
4. Open **Algorithm** again, then **How the last home page was built**: it must show
   the sources that were asked and the videos found.

Each user has to do the same for themselves, unless you turn on **On for everyone by
default**.

The **Recommender** section of the admin console holds everything an administrator
decides:

| Control | Effect |
| --- | --- |
| **Offer the experimental home page** | Off, everyone keeps the standard home page and the Algorithm page disappears. On, each user chooses to turn it on. |
| **On for everyone by default** | Off by default. On, every user gets the home page by algorithm at once and can turn it off. |
| **Algorithms offered** | Which algorithms users may pick. Nothing selected means all of them. |
| **Preselected algorithm** | The one a user gets before choosing. **The service's own choice** follows `RECOMMENDER_DEFAULT_ALGORITHM`. |
| **Answer time allowed (ms)** | How long one call to the service may take. `0` keeps the value set at installation. |
| **Video requests to YouTube per minute** | See [What it asks of YouTube](#provider-requests). `0` keeps the value set at installation. |

Below, **State of the service** shows whether it answers and in how many
milliseconds, the average time to build a page (split between the algorithm and the
YouTube sources), pages served and how many came from the cache, how often a visitor
was given the standard home page instead, and the video requests sent and held back
this minute. It also shows how many users turned the option on, per algorithm, and
the opinions they chose to send. No opinion names its author. The counters start
again when Server restarts.

## What it stores {#storage}

Your users' data stays in Server's database. The recommender has no account system and
does not know who a user is.

| What | Where | For how long |
| --- | --- | --- |
| Vectors of public video titles | Its own PostgreSQL database, table `title_vectors` | Until deleted. No user is named. |
| Public video details sent by Server | Its own PostgreSQL database, table `catalogue_videos` | Until the row is removed; newer details replace it. Not linked to an account. |
| A user's history, sent by Server under a key | Memory, and the shared cache | Memory: expires after 30 minutes idle and is pruned on the next history or recommendation request; shared cache: 30 minutes from upload |
| The plan of a page being built | Memory, and the shared cache | 2 minutes |
| What was concluded from a history | Memory only | 10 minutes, while the history is unchanged |

The video catalogue stores the video ID, title, channel URL, category, up to 12 tags
and up to 300 characters of description. It has no automatic expiry.

Server also keeps each built home page in Dragonfly for 30 minutes, and each user's
choice of algorithm, corrections and opinions in its own database. A user's export
carries their choices and opinions.

The service can be restarted at any time. Server then sends the history again and the
next page is built normally.

## What it asks of YouTube {#provider-requests}

The recommender itself sends nothing to YouTube. It tells Server which sources a page
needs (a channel's videos, a search, the videos next to one), and Server fetches them
through its usual extraction, behind its shared cache.

Server limits what the recommender may make it open:

| Variable | Default | Purpose |
| --- | --- | --- |
| `RECOMMENDER_STREAM_REQUESTS_PER_MINUTE` | `15` | Videos the recommender may make Server open at the provider in a minute, for the whole instance. People pressing play are never limited by it. |

When the provider refuses a request, the recommender asks for no video at all for a
while, so that it never makes a refusal last longer for the people watching. A page
built during that time simply has fewer sources.

## Settings {#settings}

These stack-level values are read from `.env`:

| Variable | Default | Purpose |
| --- | --- | --- |
| `RECOMMENDER_ENABLED` | `false` | Offers the recommender on the instance. The admin console can change it afterwards. |
| `RECOMMENDER_MEMORY_LIMIT` | `2g` | Memory cap of the container |
| `RECOMMENDER_DEFAULT_ALGORITHM` | `signals` | The algorithm preselected for someone who has not chosen |
| `RECOMMENDER_DATABASE` | `typetype_recommender` | Name of the service's own database |
| `RECOMMENDER_CACHE_URL` | `redis://dragonfly:6379` | Shared cache of the service |
| `RECOMMENDER_THREADS` | up to 8 | CPU threads of the language model |
| `TYPETYPE_RECOMMENDER_IMAGE` | stable image | Image override, for a pinned deployment or a rollback |
| `TYPETYPE_POSTGRES_VECTOR_IMAGE` | `pgvector/pgvector:pg17` | PostgreSQL image that ships `pgvector` |
| `TYPETYPE_RECOMMENDER_PORT` | `8190` | Port the service listens on, inside the Compose network |

Server's side of the integration can be tuned too:

| Variable | Default | Purpose |
| --- | --- | --- |
| `RECOMMENDER_REQUEST_TIMEOUT_MS` | `2500` | How long one call to the recommender may take |
| `RECOMMENDER_PAGE_DEADLINE_MS` | `4000` | How long a visitor waits for a page before the usual home page is shown; the page keeps being built for the next visit |
| `RECOMMENDER_PAGE_TTL_SECONDS` | `1800` | How long a built page is kept |
| `RECOMMENDER_PAGE_VARIANTS` | `3` | Pages kept per user, so that a refresh shows another one at once |
| `RECOMMENDER_RELATED_TTL_SECONDS` | `86400` | How long the videos next to one are kept |
| `RECOMMENDER_SEARCH_TTL_SECONDS` | `21600` | How long a search result is kept |
| `RECOMMENDER_CHANNEL_TTL_SECONDS` | `1800` | How long a channel's videos are kept |
| `RECOMMENDER_SOURCE_PARALLELISM` | `6` | Sources of one page fetched at once |

The overlay passes only the values above. The service reads more of its own, which
you set with a Compose override on `typetype-recommender`:

| Variable | Default | Purpose |
| --- | --- | --- |
| `RECOMMENDER_HISTORY_TTL_SECONDS` | `1800` | Memory entries are pruned on a request after the idle timeout; shared-cache expiry starts at upload |
| `RECOMMENDER_HISTORY_ITEMS_KEPT` | `400000` | Watches and likes of all the histories held in memory at once, about 0.5 MB per 1,000 |
| `RECOMMENDER_PLAN_TTL_SECONDS` | `120` | How long the plan of a page is kept |
| `RECOMMENDER_PROFILE_TTL_SECONDS` | `600` | How long what was concluded from an unchanged history is kept; `0` turns it off |
| `RECOMMENDER_EMBED_BUDGET` | `100` | New titles read by the model at most inside one request |
| `RECOMMENDER_MAX_TITLES` | `2000` | Titles a profile reads at most |
| `RECOMMENDER_EMBEDDING_MODEL`, `RECOMMENDER_EMBEDDING_FILE` | multilingual mpnet, fp16 | The language model and its build |
| `RECOMMENDER_DATABASE_POOL` | `4` | Connections kept to the database |
| `RECOMMENDER_CACHE_TIMEOUT_MS` | `2000` | How long a cache call may take |

A variable left empty counts as not set.

```yaml
services:
  typetype-recommender:
    environment:
      RECOMMENDER_PARALLEL_BATCHES: "3"
```

Save it as `docker-compose.override.yml` in the stack directory; the installer keeps
that file and applies it last.

### Memory against speed {#memory}

With its defaults the service stays under 2 GB. On a host with 4 GB to give it, two
settings of the service make it faster when many new people arrive at once, at the
cost of memory:

| Variable | Default | Effect |
| --- | --- | --- |
| `RECOMMENDER_PARALLEL_BATCHES` | `1` | Batches of titles going through the model at once. `3` serves a crowd of new people about a third faster, for about 0.8 GB more at the peak. |
| `RECOMMENDER_ONNX_ARENA` | `0` | `1` lets the model keep the memory of its largest batches: about 10 % faster under a crowd, about 1.3 GB more. |

Raise `RECOMMENDER_MEMORY_LIMIT` with them.

## Update it {#update}

With the installer, update as usual. It keeps the recommender because `.env` holds
`RECOMMENDER_ENABLED=true`:

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --yes --dir "$STACK_DIR"
```

By hand, pull and recreate with both files:

```sh
cd "$STACK_DIR"
docker compose -f docker-compose.yml -f docker-compose.recommender.yml pull
docker compose -f docker-compose.yml -f docker-compose.recommender.yml up -d --wait --wait-timeout 900
```

The model stays in its volume, so an update does not download it again. Then run the
checks of [Check that it runs](#verify): the version line tells you which version
answers.

## Remove it {#remove}

1. In `.env`, set `RECOMMENDER_ENABLED=false`, so that the installer does not add it
   again on the next update.

2. Recreate the stack without the overlay:

   ```sh
   cd "$STACK_DIR"
   docker compose -f docker-compose.yml up -d --remove-orphans --wait
   ```

   The recommender container is removed, PostgreSQL goes back to `postgres:17` and
   Server is recreated without the address of the service. The home page is the
   standard one for everyone and the Algorithm page disappears.

3. Check:

   ```sh
   docker compose exec -T typetype-server wget -qO- http://127.0.0.1:8080/instance
   ```

   The answer now contains `"recommender":{"installed":false,`.

Users' choices, corrections and opinions stay in Server's database, in case you add
the recommender again. Nothing else of theirs was ever stored by the service.

To reclaim the disk space, optionally:

```sh
docker volume ls | grep recommender_models
docker volume rm <name printed above>
docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "DROP DATABASE typetype_recommender"'
```

## Troubleshooting {#troubleshooting}

Read the log of the service first:

```sh
cd "$STACK_DIR"
docker compose -f docker-compose.yml -f docker-compose.recommender.yml logs --tail 100 typetype-recommender
```

| What you see | Cause | What to do |
| --- | --- | --- |
| `STATUS` stays `(health: starting)` for minutes on first start | The model, about 550 MB, is being downloaded | Wait. The log shows `Application startup complete` when it is done. |
| The log shows a network error before `Application startup complete` | The model could not be downloaded from Hugging Face | Give the container internet access for the first start. Afterwards the model is read from the volume. |
| `no such service: typetype-recommender` | The command names only `docker-compose.yml` | Add `-f docker-compose.recommender.yml`. |
| The container is killed and restarts, `OOMKilled` in `docker inspect` | It reached `RECOMMENDER_MEMORY_LIMIT` | Raise the limit, or keep the defaults of [Memory against speed](#memory). |
| `/version/recommender` answers nothing | Server was not recreated with the overlay, or the shared secret is missing | Run the two commands of [C. By hand](#manual), steps 3 and 4, again. |
| **Algorithm** is not in the menu | The instance does not offer it | Admin console, **Recommender**, **Offer the experimental home page**; then reload the page. |
| The home page stays the standard one | The page was not ready in time, or the account has no data | Reload after a few seconds. In the admin console, **Returns to the standard home page** counts how often it happens. |
| **State of the service** says **Not answering** | The service is down or still starting | Check its status and log as above. Home pages are the standard ones meanwhile. |

## Source references

- [Signals repository](https://github.com/TypeType-Video/TypeType-Signals)
- [Recommender overlay](https://github.com/TypeType-Video/TypeType/blob/main/docker-compose.recommender.yml)
- [Installer](https://github.com/TypeType-Video/TypeType/blob/main/scripts/install-stack.sh)
- [Server's recommender configuration](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-services/src/main/kotlin/dev/typetype/server/services/RecommenderConfig.kt)
