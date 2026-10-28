# Temporary local sharing

Share the local CRM for demos through a temporary HTTPS Cloudflare Quick Tunnel.
The PC, PostgreSQL, API, preview server and tunnel must stay running. Visitors use
their existing CRM accounts and operate on the same local database.

## Start

1. Start the configured backend in `Altium-back` with `pnpm dev` (PostgreSQL must be running).
2. In `Altium-front`, run `pnpm share:build` and then `pnpm share:serve`.
3. In another terminal, run:

   ```powershell
   .\tmp\share\cloudflared.exe tunnel --url http://127.0.0.1:4174 --http-host-header localhost:4174 --no-autoupdate
   ```

4. Share the printed `https://….trycloudflare.com` URL. Login uses the usual username and password.

The portable executable can be downloaded from the official
[Cloudflare releases](https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe)
into `tmp/share/cloudflared.exe` (create that folder first). It is ignored by Git;
no global installation, account, router port forwarding or Netlify connection is needed.

## Configuration and behavior

- `share` is a dedicated Vite mode: output is `dist-share/`, without source maps.
  Normal `dist/`, development and production environments keep their existing settings.
- The compiled API base is `/`, overriding local `VITE_API_BASE_URL` values.
  `/api/…` and `/health` are proxied to `http://127.0.0.1:3000` by the preview server.
  Session and CSRF cookies therefore belong to the public HTTPS origin; no cross-site
  cookie or wildcard CORS configuration is needed. Existing RBAC and CSRF remain active.
- Preview binds only to loopback on strict port 4174. Cloudflare supplies the local
  Host header, so no wildcard `allowedHosts` is needed. The public URL serves the
  compiled app rather than Vite's development server.
- New source changes require another `pnpm share:build`. This is a temporary demo
  setup, not a production deployment. Quick Tunnel URLs change when restarted.
- Local activation/reset links still follow the backend's local notification setup.
  Existing users can log in normally; email delivery is not enabled by sharing.

## Stop

Stop the tunnel with Ctrl+C; its public URL immediately stops providing access.
Stop the preview server separately with Ctrl+C. Stop the backend only when it is
no longer needed locally. When started by Codex in the background, process IDs
and logs for this session are stored in ignored `tmp/share/`.

## Verification

- `pnpm check` covers configuration regression tests and the same-origin API base.
- Check `/login` returns HTML and `/api/v1/auth/me` returns an unauthenticated 401,
  rather than SPA HTML, both on loopback and through the HTTPS URL.
- An end-to-end login with an existing account is needed to confirm a full session.

Reference: [Cloudflare Quick Tunnels](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/).
