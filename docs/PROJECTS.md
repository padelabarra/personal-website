# Projects Data

The "What I've Shipped" section on the site (`components/Projects.tsx`) is driven entirely by `data/projects.json`. This file explains how that data is produced and how to change it.

## How it works

- `data/projects.json` is a committed array of project entries. It's the only thing `Projects.tsx` reads — there's no live filesystem access in production, because the deployed site (on Vercel) has no access to this machine's local folders.
- Each entry has a `source` of either `"auto"` (created and matched by folder name via the sync script) or `"manual"` (written by hand, no folder required).
- Each entry has a `draft` flag. Entries with `draft: true` are excluded from the rendered site. New auto-generated entries default to `draft: true` until reviewed.

## Adding a project that has a folder

1. Create/confirm the project folder exists as a sibling under `/Users/padelabarra/Documents/Codigo/ClaudeCode/` (the parent of this repo).
2. Run `npm run sync-projects`. This adds a new entry to `data/projects.json` with an auto-generated `name`, `description` (from `package.json` or `README.md`), `tags`, and `githubUrl` (from the folder's git remote, credentials stripped). `liveUrl` is always left `null` — it's never guessed.
3. Open `data/projects.json`, find the new entry (`source: "auto"`), and:
   - Fix the `name` if the auto-generated version reads oddly.
   - Write or improve the `description`.
   - Adjust `tags` if the auto-detected list is wrong or incomplete.
   - Set `liveUrl` if the project is deployed somewhere.
   - Set `"draft": false` once it's ready to publish.
4. Re-running `npm run sync-projects` later will never overwrite anything you've edited on that entry — it only touches entries it hasn't seen before, and removes entries whose folder no longer exists (with a console warning).

## Adding a project that has no folder

Add an object directly to `data/projects.json` with `"source": "manual"` and a unique `slug`. The sync script never reads, modifies, or removes `"manual"` entries — they're entirely yours to maintain.

## Excluding a folder from auto-detection

Edit the `EXCLUDE` array at the top of `scripts/sync-projects.mjs` and add the folder name (e.g. `"agent_google_suite"`). This repo's own folder (`personal_website`) is always excluded automatically, regardless of `EXCLUDE`.

## Tag detection

`scripts/lib/sync-projects-lib.mjs` exports a `TAG_RULES` lookup table mapping known `package.json` dependency names to display tags (e.g. `next` → `"Next.js"`). Add an entry there to teach the script a new tag. Projects with a `package.json` but no recognized dependency get a generic `"Node.js"` tag; projects with a `pyproject.toml` or `requirements.txt` get `"Python"`.

## Security

The sync script only reads four files per folder: `package.json`, `README.md`, `pyproject.toml`, `requirements.txt`. It never recurses into subdirectories or reads any other file. Git remote URLs always have embedded credentials stripped before being written to `data/projects.json`.

## Testing

Pure logic used by the sync script (name formatting, URL sanitizing, tag detection, README parsing, manifest merging) has unit tests in `scripts/lib/sync-projects-lib.test.mjs`, run with `npm test`.

## Maintenance rule

Any change to this feature — the manifest schema, the sync script's behavior, the tag lookup table, the exclude list, or how `liveUrl`/`githubUrl` are resolved — must be reflected in this file and in the relevant section of `README.md` in the same change.
