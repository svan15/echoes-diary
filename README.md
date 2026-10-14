# Echoes — Diary prototype

A SvelteKit + Tailwind CSS 4 + JavaScript prototype for a multi-diary journal inspired by the atmosphere of *Echoes*.

## Run

Requires Node.js 20.19+ (or a newer supported LTS release).

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (typically http://localhost:5173).

## Current features
- Create unlimited diaries (limited only by browser storage)
- Search/filter diary library
- Customize diary names, descriptions, types, theme colors, cover and background images
- Shared timeline and individual journal tabs
- Private vs published individual entries
- Persistent data in the same browser via localStorage
- Responsive dark, cinematic UI

## Important limitations
This is **not** a production-ready shared diary app. All data is local to the current browser. The second member names in sample data are illustrative; there is no authentication, cross-device sync, realtime multiuser updates, server permissions, or durable media storage. Image uploads are limited to 1.2 MB each to reduce localStorage exhaustion. Clearing browser data deletes the demo content. Do not store sensitive diary entries in this prototype.

## Next implementation phase
1. Supabase Auth for account signup and login.
2. PostgreSQL tables: `diaries`, `diary_members`, `entries`, `diary_invites`.
3. Supabase Storage private buckets for covers, backgrounds, entry media.
4. Row-level security on every table, with explicit visibility checks for private entries.
5. Supabase Realtime subscriptions for diary settings and shared entries.
6. Invites, membership roles, and revocation flows; any member can edit shared appearance.
7. Optional per-user display preferences and export/backups.

For production, never treat client-side hidden UI as access control. Enforce access to every row and media asset on the server.
