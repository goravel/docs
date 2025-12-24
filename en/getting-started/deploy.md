# Deploy

[[toc]]

## Overview

The `deploy` command provides a simple, opinionated deployment pipeline for Goravel applications. It compiles your application locally, performs one-time remote server setup when needed, uploads application artifacts, restarts the service, and supports rollback to the previous binary. It is designed to offer a pragmatic, single-command deploy suitable for small-to-medium workloads.

Key capabilities:
- Builds a target binary for your chosen OS/ARCH (optionally statically linked)
- First-time remote provisioning with systemd and optional Caddy reverse proxy
- Uploads binary, `.env`, and optional `public/`, `storage/`, `resources/` directories
- Restarts the systemd service
- Rollback support for the previously deployed binary

## Quick start

### With reverse proxy (recommended)

Prepare a production `.env` (for example `.env.production`) with at least:

```
APP_NAME=my-app
APP_PORT=9000
DEPLOY_SSH_IP=127.0.0.1
DEPLOY_SSH_PORT=22
DEPLOY_SSH_USER=deploy
DEPLOY_SSH_KEY_PATH=~/.ssh/id_rsa
DEPLOY_OS=linux
DEPLOY_ARCH=amd64
DEPLOY_PROD_ENV_FILE_PATH=.env.production
DEPLOY_STATIC=true
DEPLOY_REVERSE_PROXY_ENABLED=true
DEPLOY_REVERSE_PROXY_TLS_ENABLED=true
DEPLOY_DOMAIN=my-app.com
```

> Note: Ensure your domain registrar has a DNS A record for `DEPLOY_DOMAIN` pointing to `DEPLOY_IP_ADDRESS` (and an AAAA record if using IPv6). Caddy can only issue certificates when the domain resolves to your server's IP.

Then run:

```
go run . artisan deploy
```

This will:
1. Build the application.
2. On the server: install and configure Caddy as a reverse proxy, optionally enable TLS with automatic certificates, and expose HTTP(S) to your domain.
3. Configure ufw firewall to allow required traffic.
4. Create and enable a systemd unit for your app.
5. Upload the binary, environment file, and optional assets.
6. Restart the systemd service.

#### Request flow

1. User sends HTTP(S) request to `DEPLOY_DOMAIN`.
2. Caddy receives the request and proxies to `127.0.0.1:DEPLOY_APP_PORT`.
3. Goravel app processes the request (routing, middleware, controller).
4. App returns a response to Caddy.
5. Caddy sends the HTTP(S) response back to the user.

### Without reverse proxy

For a simpler deployment without a reverse proxy, use:

```
APP_NAME=my-app
APP_PORT=80
DEPLOY_SSH_IP=127.0.0.1
DEPLOY_SSH_PORT=22
DEPLOY_SSH_USER=deploy
DEPLOY_SSH_KEY_PATH=~/.ssh/id_rsa
DEPLOY_OS=linux
DEPLOY_ARCH=amd64
DEPLOY_PROD_ENV_FILE_PATH=.env.production
DEPLOY_STATIC=true
DEPLOY_REVERSE_PROXY_ENABLED=false
DEPLOY_REVERSE_PROXY_TLS_ENABLED=false
DEPLOY_DOMAIN=
```

Run:

```
go run . artisan deploy
```

This will:
1. Build the application.
2. On the server: configure ufw firewall for HTTP on port 80.
3. Create and enable the systemd unit.
4. Upload the binary, environment file, and optional assets.
5. Restart the service.

#### Request flow

1. User sends HTTP request to `APP_HOST:APP_PORT` (e.g., `0.0.0.0:80`).
2. Goravel app processes the request (routing, middleware, controller).
3. App sends the HTTP response back to the user.

### Rollback

Revert to the previously deployed binary:

```
go run . artisan deploy --rollback
```

### Force setup

Re-apply provisioning (e.g., after changing proxy/TLS/domain):

```
go run . artisan deploy --force-setup
```

### Deploy only a subset of files

Upload only specific artifacts (e.g., binary and `.env`):

```
go run . artisan deploy --only main,env
```

## Architecture assumptions

Two topologies are supported:

1) Reverse proxy (recommended)
- `DEPLOY_REVERSE_PROXY_ENABLED=true`
- App listens on `127.0.0.1:<DEPLOY_APP_PORT>` (e.g. 9000)
- Caddy proxies public HTTP(S) to the app
- If `DEPLOY_REVERSE_PROXY_TLS_ENABLED=true` and `DEPLOY_DOMAIN` is set, Caddy terminates TLS and manages certificates; otherwise Caddy serves plain HTTP on `:80`

2) No reverse proxy
- `DEPLOY_REVERSE_PROXY_ENABLED=false`
- App listens directly on `:80` (`APP_HOST=0.0.0.0`, `APP_PORT=80`)

## Artifacts and server layout

Remote base directory: `/var/www/<APP_NAME>`

Managed files:
- `main`: current binary
- `main.prev`: previous binary (for rollback)
- `.env`: uploaded from `DEPLOY_PROD_ENV_FILE_PATH`
- `public/`: optional static assets
- `storage/`: optional storage directory
- `resources/`: optional resources directory

## First-time setup and idempotency

On the first deploy, the command checks for `/etc/systemd/system/<APP_NAME>.service`. If absent, it will:
- Install and configure Caddy (when reverse proxy is enabled)
- Create the app directory and set ownership
- Write the systemd unit and enable the service
- Configure ufw firewall rules

Subsequent deploys skip setup for speed and safety. Use `--force-setup` to re-apply provisioning changes.

## Systemd service

- Runs under `DEPLOY_SSH_USER`
- Provides `APP_HOST` and `APP_PORT` via environment
- Working directory is `/var/www/<APP_NAME>`
- Uses restarts (brief downtime). For zero-downtime, adopt a more advanced process manager or socket activation

## Security and firewall

- SSH uses `StrictHostKeyChecking=no` for convenience. For production, consider pre-trusting the host key
- Firewall rules are applied via ufw: allow OpenSSH and required HTTP(S) ports first, then enable ufw to avoid losing SSH connectivity

## High-level deployment flow

1. Build: compile the binary for the specified target (OS/ARCH, optional static) with name `APP_NAME`
2. Determine artifacts to upload: `main`, `.env`, `public`, `storage`, `resources` (filterable via `--only`)
3. First-time setup or `--force-setup`: directories, Caddy (optional), systemd unit, ufw rules
4. Upload: binary and assets (atomic swaps for binary and `.env`, backups retained as `*.prev`)
5. Restart service: daemon-reload then restart (or start)

## Known limitations

- No database migrations or orchestration is performed
- Rollback swaps the binary (and restores backed-up assets when present) but does not re-run migrations
- `StrictHostKeyChecking` is disabled by default
- Changing proxy/TLS/domain requires `--force-setup`
- Assumes Debian/Ubuntu with `apt-get` and `ufw`

## Configuration

These environment variables control the deploy command. Set them in your production `.env` file.

### Required

- `app.name`: Application name; used for remote paths and systemd service name
- `DEPLOY_IP_ADDRESS`: Target server IP address
- `DEPLOY_APP_PORT`: Backend app port when reverse proxy is used (e.g. `9000`). If no reverse proxy, the app listens on `80`
- `DEPLOY_SSH_PORT`: SSH port (e.g. `22`)
- `DEPLOY_SSH_USER`: SSH username (must have sudo privileges)
- `DEPLOY_SSH_KEY_PATH`: Path to SSH private key (e.g. `~/.ssh/id_rsa`)
- `DEPLOY_OS`: Target OS for build (e.g. `linux`)
- `DEPLOY_ARCH`: Target architecture for build (e.g. `amd64`)
- `DEPLOY_PROD_ENV_FILE_PATH`: Local path to the production `.env` file to upload

### Optional / boolean (default false if unset)

- `DEPLOY_STATIC`: Build statically when `true`
- `DEPLOY_REVERSE_PROXY_ENABLED`: Use Caddy reverse proxy when `true`
- `DEPLOY_REVERSE_PROXY_TLS_ENABLED`: Enable TLS (requires `DEPLOY_DOMAIN`) when `true`
- `DEPLOY_DOMAIN`: Domain name for TLS or HTTP vhost when using Caddy (required only if TLS is enabled)

### CLI flags

- `--only`: Comma-separated subset to deploy: `main,env,public,storage,resources`
- `-r, --rollback`: Roll back to previous deployment
- `-F, --force-setup`: Force re-run server setup even if already configured

## Local build and artifacts

The deploy command compiles your application using the given target OS/ARCH and static preferences. For background and manual alternatives, see `Compile`:

`https://www.goravel.dev/getting-started/compile.html`
