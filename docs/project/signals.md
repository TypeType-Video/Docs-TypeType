# Signals, the recommender

::: warning Experimental
Signals is at version 0.0.1. Its contract with Server and its algorithms can still
change.
:::

[TypeType Signals](https://github.com/TypeType-Video/TypeType-Signals) is the optional
service that holds the home page algorithms. This page explains how it fits with
Server and how an algorithm is written. For what users see, read
[Choosing your algorithm](/guide/algorithm); to run it, read
[Recommender](/self-hosting/recommender).

## Who does what {#roles}

| | TypeType-Server | Signals |
| --- | --- | --- |
| Accounts, sessions, user data | Owns them | Has none: a request never names a user |
| Talking to YouTube | Fetches every video, through its extraction and cache | Never does |
| Blocking, family filters | Applies them to whatever comes back | Cannot bypass them |
| Choosing and ordering videos | Falls back to its built-in home page | Owns the algorithms |
| What is kept | Choices, corrections, opinions, built pages | Public title vectors; temporary keyed history snapshots |

Server is the only caller of the service. If the service is absent, slow or failing,
Server serves its built-in home page, so a home page never breaks.

## One home page, step by step {#flow}

```text
browser ── GET /recommendations/home ─▶ Server
Server  ── POST /v1/history (once, when the history changed) ─▶ Signals
Server  ── POST /v1/plan (snapshot) ─▶ Signals
Server  ◀─ the sources to fetch ───── Signals
Server:    fetches those sources, filters the candidates
Server  ── POST /v1/rank (plan id, candidates) ─▶ Signals
Server  ◀─ rows, reasons, trace ───── Signals
Server:    filters the rows again, keeps the page, serves it in slices
browser ◀─ rows ───────────────────── Server
```

1. **Snapshot.** Server describes the person without naming them: the algorithm they
   chose and its settings, the hour and language, their subscriptions, and only the
   data categories the algorithm lists and the person allows. A long history is sent
   once under a key and named by that key afterwards.
2. **Plan.** The algorithm answers with the sources it wants: the subscription feed,
   the videos next to a given video, a channel's videos, a search, trending, or exact
   videos to resume. Each source carries the reason it was asked for.
3. **Fetch.** Server fetches the sources, through its shared cache, and counts every
   video it has to open at the provider against the instance's limit.
4. **Rank.** The algorithm scores the candidates and arranges them in rows. Rows name
   videos by URL only: the service cannot put a video on screen that Server did not
   fetch and filter.
5. **Second filter.** Server applies blocking and family filters to the rows again. A
   bug in an algorithm cannot show a blocked video.

A page that is not ready within Server's deadline is replaced by the built-in home
page for that visit, and keeps being built for the next one.

## Routes of the service {#routes}

Every route but `/health` requires the `X-Internal-Token` header, the secret shared
with Server.

| Route | Purpose |
| --- | --- |
| `GET /health` | Liveness and version |
| `GET /version` | Version, revision and build time, as every TypeType service gives them |
| `GET /v1/algorithms` | The algorithms, their texts, the data each reads and every setting with its bounds and default. The interface is built from this answer: a new algorithm needs no frontend change. |
| `POST /v1/history` | A history and likes under a key chosen by Server, in one call or in parts |
| `POST /v1/plan` | Snapshot in, sources to fetch out |
| `POST /v1/rank` | Candidates in, rows with reasons out, and the trace when asked |
| `POST /v1/profile` | What the algorithm concludes from a snapshot: interests, channels, recent watches |
| `POST /v1/topics` | For a list of titles, the interest each belongs to |

A plan or a history the service no longer holds is answered `409`; Server then sends
it again. The exact shapes are the models in
[`recommender/contract.py`](https://github.com/TypeType-Video/TypeType-Signals/blob/dev/recommender/contract.py)
and the `contract_*.py` files beside it.

## Rules every algorithm follows {#principles}

1. **It says what it reads.** An algorithm lists the data categories it uses, and
   the engine removes the others from the snapshot before calling it. "Never reads
   your history" is true by construction.
2. **Every setting is exposed.** Each weight, threshold, cap and decay time is
   declared with its type, bounds and default, and shown to the user.
3. **Every row has a reason.** A row carries the kind of reason and the item or
   conclusion behind it; every video carries what brought it.
4. **Conclusions are shown.** What was deduced (interests, channels, recent watches)
   comes out of the same code that ranks, with where each conclusion comes from.
5. **The user's decisions win.** Hidden and pinned interests, ignored channels and
   excluded items are honoured by every algorithm.
6. **Randomness is declared.** An algorithm that draws says so and takes a seed: the
   same seed and the same data give the same page.
7. **One code path.** The profile and the trace a user sees come from the run that
   built their page. There is no separate explanation.

## Write an algorithm {#write}

An algorithm is one file in `recommender/algorithms/`. It declares its name and texts,
the data it reads, its settings, and implements two steps: plan the sources, then rank
the candidates into rows. Register it in `recommender/registry.py`.

Start from
[`subscriptions.py`](https://github.com/TypeType-Video/TypeType-Signals/blob/dev/recommender/algorithms/subscriptions.py),
the smallest one, and read
[`CONTRIBUTING.md`](https://github.com/TypeType-Video/TypeType-Signals/blob/dev/CONTRIBUTING.md)
first: it says how the code is written and how to prove that a change did not alter a
single page.

```sh
docker compose up -d --build
uv run pytest
```

The first command starts the service on port `8190` with its own database and cache.
The tests use a word-hashing stand-in for the language model, so they need no
download.

## How Signals reads a history {#signals}

The Signals family (Signals, channels, videos, mix) shares one reading of the history:

- **Channels.** A channel counts by the different videos watched from it, fading by
  half every 30 days. Minutes watched do not count.
- **Interests.** Titles of videos watched through are compared by meaning with a
  multilingual sentence model, and grouped when they are close enough on average.
  A group is named after the words its titles share. Titles that say nothing about a
  subject are left out.
- **Recent watches.** A video just watched steers the page at once; its effect halves
  over time and stops after a few hours.

Shorts are read apart and never feed long-form recommendations.

The model runs locally in the service, on CPU. It is downloaded once on first start
and nothing is sent to a third party afterwards.

## Versions {#versions}

Signals follows [semantic versioning](https://semver.org). A patch changes no page, a
minor version may change what pages show or add settings, a major version changes the
contract with Server. While the number starts with 0, anything may still change. The
version running on an instance is shown on its About page.

The service is licensed under the GNU Affero General Public License, version 3.

## Source references

- [Signals repository](https://github.com/TypeType-Video/TypeType-Signals)
- [Contract models](https://github.com/TypeType-Video/TypeType-Signals/blob/dev/recommender/contract.py)
- [Server's recommender integration](https://github.com/TypeType-Video/TypeType-Server/blob/dev/server-services/src/main/kotlin/dev/typetype/server/RecommenderServices.kt)
