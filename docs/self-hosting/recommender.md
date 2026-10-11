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

## What it needs {#requirements}

| Resource | Amount |
| --- | --- |
| Memory | About 1.2 GB at rest. The container is capped at 2 GB by default (`RECOMMENDER_MEMORY_LIMIT`). |
| Disk | About 1 GB for its language model, downloaded once on first start into the `recommender_models` volume, plus the image. |
| Network | Internet access on first start, to download the model. None to YouTube: the service never talks to a provider. |
| Database | PostgreSQL with the `pgvector` extension. The overlay switches the bundled `postgres` service to an image that ships it, on the same data volume. |
| Cache | The Dragonfly the stack already has. |

`typetype-init` creates the service's own database (`typetype_recommender`) and the
secret it shares with Server.

## Add it with the installer {#install}

The installer asks whether to add it, and answers no by default:

```text
Add the experimental recommender? [y/N]:
```

To add it without the question:

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --recommender
```

The installer then starts the stack with the recommender overlay, sets
`RECOMMENDER_ENABLED=true` in `.env`, and waits longer than usual for the first start,
because the model is being downloaded. Running the installer again on that stack keeps
the recommender.

With `--yes` alone, the recommender is not added.

## Add it by hand {#manual}

On an existing stack, from its directory:

```sh
COMPOSE_RECOMMENDER_FILE=docker-compose.recommender.yml ./scripts/run-stack-init.sh
docker compose -f docker-compose.yml -f docker-compose.recommender.yml up -d --wait
```

The first command creates the database and the secret. The second starts the service
and recreates Server with its address. Expect a few minutes on the first start.

From then on, every `docker compose` command for this stack must name both files, or
Compose removes the recommender as an orphan on the next `up --remove-orphans`.

Check that it answers:

```sh
docker compose -f docker-compose.yml -f docker-compose.recommender.yml ps typetype-recommender
```

The service is `healthy` once the model is loaded. The About page of the instance then
shows an **Algorithm** line with the version that runs.

## Switch it on {#enable}

Installing the service does not show anything to users yet.

- The installer sets `RECOMMENDER_ENABLED=true`, which offers it on a new instance.
- On an instance installed by hand, open the admin console, then **Recommender**, and
  switch on **Offer the experimental home page**.

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
| A user's history, sent by Server under a key | Memory, and the shared cache | 30 minutes after its last use |
| The plan of a page being built | Memory, and the shared cache | 2 minutes |
| What was concluded from a history | Memory only | 10 minutes, while the history is unchanged |

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
| `RECOMMENDER_HISTORY_TTL_SECONDS` | `1800` | How long a history sent by Server is kept after its last use |
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

## Remove it {#remove}

```sh
docker compose -f docker-compose.yml up -d --remove-orphans --wait
```

The home page goes back to the standard one and the option disappears everywhere.
Users' choices and opinions stay in Server's database, in case you add it again.

To reclaim the space, delete the `recommender_models` volume and the
`typetype_recommender` database by hand. Set `RECOMMENDER_ENABLED=false` in `.env` so
that the installer does not add it again on the next run.

## Troubleshooting {#troubleshooting}

**The service never becomes healthy on first start.** The model is about 1 GB and is
downloaded before the service answers. Read its log:

```sh
docker compose -f docker-compose.yml -f docker-compose.recommender.yml logs typetype-recommender
```

**Users do not see the Algorithm page.** Check, in this order: the service is
`healthy`; the recommender is switched on in the admin console; the user reloaded the
page.

**Home pages stay the usual ones.** A page that is not ready in time is replaced by
the usual home page and keeps being built in the background. The admin console shows
how often that happens. A first page for a long history is the slowest.

## Source references

- [Signals repository](https://github.com/TypeType-Video/TypeType-Signals)
- [Recommender overlay](https://github.com/TypeType-Video/TypeType/blob/main/docker-compose.recommender.yml)
- [Installer](https://github.com/TypeType-Video/TypeType/blob/main/scripts/install-stack.sh)
- [Server's recommender configuration](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-services/src/main/kotlin/dev/typetype/server/services/RecommenderConfig.kt)
