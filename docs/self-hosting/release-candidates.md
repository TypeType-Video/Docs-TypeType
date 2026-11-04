# Release candidates

A release candidate, or rc, is the next TypeType version before its release day. It
runs the images that will ship, so you can try a release early and report what breaks
before everyone updates. The official instance runs the release candidates too.

| Choice | Images | Changes | For |
| --- | --- | --- | --- |
| **Latest release** | `:latest`, `:1.16.0` | On release day only | Everyday use |
| **Release candidates** | `:rc`, `:1.16.0-rc.1` | When a component is ready for the next release | Trying the next version early |
| **One version** | `:1.15.0` | Never, until you pick another one | Staying on a version on purpose |
| **Beta** | `-beta:latest` | On every push to `dev` | Development, can break |

A release candidate only gets what is ready for the next release, so it is steadier
than beta. It can still have bugs: back up the database before you switch, see
[Backups](./maintenance#backups). How the candidates are made is described in
[Branches and releases](/project/releases#how-a-release-is-made).

## Choose your version

Run the installer as usual. It asks which version you want:

```text
[install] Which TypeType version do you want?
[install]   1) The latest release, recommended for everyday use
[install]   2) The release candidates, the next version before its release
[install]   3) One version that never changes until you pick another one
Choose 1, 2 or 3 [1]:
```

Pick `2` for the release candidates. The installer writes `TYPETYPE_VERSION=rc` in
`.env`, so the four TypeType images use the `:rc` tag, and it takes the stack files of
the release candidates from the `staging` branch. Run it again later to switch: it
suggests your current choice by default. Your `.env`, ports and data volumes stay as
they are.

A `TYPETYPE_*_IMAGE` value in `.env` still takes precedence for its image. Remove those
lines, or leave them empty, so every image follows your choice.

## Without questions

For scripts and automatic setups, choose with an option and add `--yes`:

| Option | Effect |
| --- | --- |
| `--rc` | Follow the release candidates |
| `--latest` | Follow the latest release again |
| `--version 1.15.0` | Stay on one version |

```sh
curl -fsSL https://raw.githubusercontent.com/TypeType-Video/TypeType/main/scripts/install-stack.sh | bash -s -- --rc --yes --dir "$STACK_DIR"
```

`$STACK_DIR` is your stack directory, `~/typetype-stack` unless you chose another one.
These options cannot be combined with `--beta`.

## Update

Run the installer again. A stack on the release candidates keeps the `staging` stack
files when the installer runs again, even with `--yes`. Without the installer, pull and
recreate the stack:

```sh
cd "$STACK_DIR"
docker compose pull
docker compose up -d --wait --wait-timeout 180
```

A new release candidate replaces the `:rc` images, so each update brings the newest one.

## Check what you run

```sh
curl -fsS http://localhost:8082/api/version/server
```

The `version` field shows the release candidate, for example `1.16.0-rc.1`. The same
endpoint exists for `web`, `token` and `downloader`.

## Go back to the latest release

Run the installer and pick `1`, or pass `--latest`. A release candidate can change the
database, so going back to an older version may need the backup you made before
switching: see [Roll back an update](./rollback).

After a release, the latest release and the last release candidate are the same code,
so you can stay on the release candidates to keep testing the next version.

## Report a problem

Open an [issue](https://github.com/TypeType-Video/TypeType/issues) with the versions
from `/api/version`, and say that you run a release candidate. See
[Reporting issues](./reporting-issues).
