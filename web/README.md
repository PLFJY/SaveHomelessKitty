# Save Homeless Kitty - Web Console

This is the React + TypeScript web console for the ASP.NET Core backend.

## Stack

- Vite + React + TypeScript
- Ant Design
- Axios
- pnpm

## Environment

Create `web/.env` when needed:

```
VITE_API_BASE_URL=http://localhost:5000
```

## Scripts

```
pnpm install
pnpm dev
pnpm build
pnpm preview
```

## Deployment (Linux)

1. Build: `pnpm build`.
2. Copy the `web/dist/` folder to your Linux server or static hosting.
3. Serve with Nginx, Caddy, or any static host.
4. Make sure `VITE_API_BASE_URL` points to the ASP.NET Core API host.

## Auth

The current UI uses a local storage based demo login (admin/viewer) to enforce
front-end RBAC. Replace with backend auth when available.
