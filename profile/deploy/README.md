# Bardie reference Compose (MVP)

Pull published images from GHCR and run the MVP quartet behind nginx (or your own edge).

## Quick start (bundled edge)

```bash
# From a clone of Bardie-radio/.github — or copy this `deploy/` folder elsewhere
cd profile/deploy
cp .env.example .env
# Edit .env: rotate secrets, set PUBLIC_BASE_URL (http://localhost for local HTTP)

docker compose up -d
```

Open `http://localhost/` (or your `PUBLIC_BASE_URL`). Only port **80** is published.

**OTel (optional):** leave `OTEL_*` commented in `compose.yml`. To enable, uncomment those lines (and `extra_hosts` if the collector runs on the Docker host), set `OTEL_EXPORTER_OTLP_ENDPOINT` in `.env`, then `docker compose up -d`. Omit = no export.

## External edge

If you already run a reverse proxy:

```bash
cd profile/deploy
cp .env.example .env
# Set PUBLIC_BASE_URL to the public HTTPS (or HTTP) origin clients use
docker compose -f compose.external-edge.yml up -d
```

Wire your proxy with [edge/nginx.external.conf.example](edge/nginx.external.conf.example) (or equivalent). Targets on the Compose network: `kithara:8080`, `plume:8080`. Do **not** expose Kithara gRPC (`:5000`).

## Images

| Service | Image |
|---------|--------|
| kithara | `ghcr.io/bardie-radio/kithara:<tag>` |
| plume | `ghcr.io/bardie-radio/plume:<tag>` |
| magpie | `ghcr.io/bardie-radio/magpie:<tag>` |
| bes | `ghcr.io/bardie-radio/bes:<tag>` |

Tag via `IMAGE_TAG` in `.env` (`latest`, `dev`, or a SemVer). Release notes: [version-check](../docs/version-check.md).

## First boot (AUTH-INVITE)

1. Watch Kithara logs for the WARNING banner (`KITHARA AUTH-INVITE` / `Registration OTP`).
2. Open `/claim` (or registration) on Plume → username + OTP → bind credentials via Bes.
3. Create a Struna on `/`, then listen on `/player/{slug}` or `/stream/{slug}` (VLC).

Before treating `latest` as good: Plume image must include Vite `wwwroot/dist` ([pre-publish-audit](https://github.com/Bardie-radio/kithara/blob/main/docs/architecture/mvp/pre-publish-audit.md)).

Deep dive: [Deployment](../docs/architecture/05-deployment.md) · [Kithara configuration](https://github.com/Bardie-radio/kithara/blob/main/docs/architecture/operations/configuration.md)
