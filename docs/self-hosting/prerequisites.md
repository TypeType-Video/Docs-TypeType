# Prerequisites

**Languages:** English · [Français](/fr/self-hosting/prerequisites) ·
[Español](/es/self-hosting/prerequisites)

## Supported hosts

TypeType needs a 64-bit Linux host. The published images support `linux/amd64` and
`linux/arm64`; the installer automatically selects the ARM64 cache override when
needed. A GPU is not required.

::: tip Raspberry Pi
A 64-bit Raspberry Pi 4 or 5 with at least 4 GiB of RAM can run a small personal
instance. Use a USB 3 SSD rather than a microSD card for Docker, PostgreSQL, and
Garage data.
:::

## Resource sizing

These figures are host totals for the complete Compose stack, including the web app,
Server, Token, Downloader, PostgreSQL, cache, and Garage. They are deployment targets,
not hard limits.

| Profile | CPU | RAM | Free disk before downloads | Suitable for |
| --- | --- | --- | --- | --- |
| Small personal instance | 2 vCPU | 4 GiB | 20 GiB on SSD | One or two simultaneous playbacks and occasional downloads |
| Recommended | 4 vCPU | 8 GiB | 40 GiB on SSD | Several users, subscription refreshes, and regular downloads |
| Busy or download-heavy | 8+ vCPU | 16+ GiB | 100+ GiB plus artifact capacity | Many concurrent sessions or large and repeated downloads |

The 4 GiB minimum leaves room above the normal full-stack footprint and short
Server or Token peaks. CPU use is usually modest, but extraction, a large
subscription refresh, playback startup, and download muxing can overlap. Add capacity
for every simultaneous user rather than sizing from idle containers.

Playback does not load or store an entire video in memory. A ten-hour stream therefore
does not require ten hours of RAM; simultaneous playback sessions and their active
buffers are what increase memory use.

## Storage and long downloads

Reserve disk for four separate uses:

- Docker images and enough headroom to pull an update before old layers are removed.
- PostgreSQL, cache, and application metadata.
- Downloader working files while separate audio and video tracks are fetched and
  muxed.
- Finished artifacts in the Garage volume.

Estimate the final media size from its combined bitrate:

```text
size in decimal GB ≈ bitrate in Mbit/s × duration in hours × 0.45
```

| Example | Approximate final size |
| --- | --- |
| 10 hours of audio at 128 kbit/s | 0.58 GB |
| 10 hours of audio at 256 kbit/s | 1.15 GB |
| 10 hours of 4K video at 20 Mbit/s | 90 GB, plus audio |
| 10 hours of 4K video at 40 Mbit/s | 180 GB, plus audio |

The resolution label alone does not determine file size; the selected bitrate does.

With the bundled local Garage storage, a video download can temporarily occupy about
three times its final size on the same host: downloaded tracks, the muxed file, and
the Garage object can coexist until the job finishes. An audio-only download can
temporarily need about twice its final size. The default stack permits two concurrent
download jobs, so allow for both jobs to overlap.

`S3_ARTIFACT_TTL_SECONDS=7200` controls artifact URL expiry. It is not a disk quota
and does not automatically remove the object from Garage. Clear completed download
jobs when you no longer need their artifacts. Monitor Garage and Docker storage,
especially before long 4K downloads:

```sh
df -h
docker stats --no-stream
docker system df -v
docker compose exec -T garage /garage -c /etc/garage.toml status
```

## Network capacity

YouTube playback traffic passes through the TypeType host. For a remote viewer, the
host receives the selected media and sends it back out, so its download and upload
capacity must each cover the sum of active stream bitrates plus protocol overhead.
Home-hosted instances are often limited by upload speed.

For example, one 40 Mbit/s stream needs roughly 40 Mbit/s inbound and 40 Mbit/s
outbound while it is playing. Two such streams need roughly twice that. Leave
additional headroom for extraction, thumbnails, downloads, and other users.

## Required software

Install the following tools on the host:

- **Docker Engine** 24+ and the **Docker Compose v2** plugin (`docker compose`, not the
  old `docker-compose`).
- **curl**, to run the supported installer.
- **git**, to clone the repository.
- **openssl**, to generate secrets. It is preinstalled on most distributions; if not,
  the commands in this guide also show a Python fallback.

Check what you have:

```sh
docker --version
docker compose version
curl --version
openssl version
git --version
```

If `docker compose version` fails, install the Compose plugin for your distribution
before continuing.

## Optional, for a public deployment

- A **domain name** pointing at your server.
- A reverse proxy (Caddy, nginx, or Traefik) to terminate TLS. This is covered in
  [Reverse proxy and HTTPS](./reverse-proxy). You can skip it for a purely local
  setup and reach the app on `http://localhost:8082`.

::: warning Run as a non-root user
Add your user to the `docker` group (`sudo usermod -aG docker "$USER"`, then log out
and back in) so you do not have to run every command with `sudo`.
:::
