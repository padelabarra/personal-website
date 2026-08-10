# Dynamic Projects Section — Design Spec

Date: 2026-08-10

## Problem

The `Projects` section on the personal website (`components/Projects.tsx`) is a hardcoded array of five entries. Several of those entries (Apocrypha, MBI Financial Platform, DataCamp ML Track, AllFunds Investment Platform) are resume-style items with no corresponding code folder, while real, buildable projects that live as sibling folders under `/Users/padelabarra/Documents/Codigo/ClaudeCode/` (e.g. `fitness-tracker`, `taskflow`, `relationshipOS`, `news_feed`, `invesment_analysis`, `seattle_property_finder`) aren't represented at all. Keeping the list current means hand-editing JSX every time a project is added, renamed, deployed, or retired.

The goal: make the Projects section reflect the actual folders under `ClaudeCode/` with minimal manual upkeep, while preserving the existing UI/UX exactly, and without leaking anything sensitive from those folders (credentials, personal financial documents, etc.).

## Constraint: production can't read the local filesystem

The site deploys to Vercel. Vercel's build/runtime environment has no access to `/Users/padelabarra/Documents/Codigo/ClaudeCode/` — that path only exists on the local dev machine. A component that reads the filesystem live (e.g. in a Next.js Server Component) would work in local dev but return nothing in production. Therefore "dynamic" here means: a committed data file the website always reads (identical behavior in dev and prod), refreshed on demand by a local script — not a live filesystem read.

## Data model — `data/projects.json`

A single committed JSON file at the repo root, containing an array of entries:

```ts
type ProjectEntry = {
  slug: string               // folder name for auto entries; a manual id for manual entries
  name: string                // display name shown on the card
  description: string
  tags: string[]
  liveUrl: string | null
  githubUrl: string | null
  source: 'auto' | 'manual'   // 'auto' = owned by the sync script; 'manual' = hand-maintained only, sync script never touches it
  draft: boolean              // true = excluded from the rendered site
}
```

`data/projects.ts` exports a matching `ProjectEntry` type (or the type is co-located in `data/projects.json`'s consuming module) so `Projects.tsx` and the sync script share the same shape conceptually; the JSON itself has no schema enforcement beyond what the script writes and what `Projects.tsx` expects.

The five current hardcoded entries are migrated into this file as `source: "manual"`, `draft: false`, with their existing `link`/`linkLabel` fields mapped to `githubUrl` (or `liveUrl` if a live URL is more appropriate) — content and rendering stay identical to today.

## Sync script — `scripts/sync-projects.mjs`

Invoked via `npm run sync-projects`. Plain Node (`fs`, `path`, `child_process` for `git remote get-url`), no new dependencies.

Behavior:

1. Resolve the upstream projects folder as `path.resolve(__dirname, '../..')` (the parent of the `personal_website` repo — i.e. `ClaudeCode/`).
2. List its immediate subdirectories.
3. Always skip the `personal_website` folder itself (compared by resolved path, not by name, so a rename doesn't break the exclusion).
4. Skip anything listed in a small `EXCLUDE` array declared at the top of the script (empty by default; documented with a comment showing how to add a folder name, e.g. for folders containing credentials or personal documents).
5. Load the existing `data/projects.json` (or start from `[]` if absent).
6. For each remaining folder:
   - **If no entry with that `slug` and `source: "auto"` exists** (new project): create one.
     - `name`: prettified folder name (kebab/snake case → Title Case). No renaming heuristics beyond basic word-splitting/capitalization — folder-name typos are the user's to fix by hand afterward, and once fixed the script will never overwrite them.
     - `description`: `package.json` `"description"` field if present and non-empty → else the first non-empty, non-heading, non-image/badge line of `README.md`, trimmed to ~200 characters → else `""`.
     - `tags`: best-effort detection, read only from top-level `package.json` (`dependencies`/`devDependencies` keys) or `pyproject.toml`/`requirements.txt` presence — never by recursing into the project's source files. A small lookup table (documented, easily extended) maps known package names to tag labels (e.g. `next`→`"Next.js"`, `react`→`"React"`, `tailwindcss`→`"Tailwind CSS"`, `fastapi`→`"FastAPI"`, `streamlit`→`"Streamlit"`, `pandas`→`"Pandas"`). A bare `package.json` with no recognized deps still gets `"Node.js"`; a bare `pyproject.toml`/`requirements.txt` still gets `"Python"`. No match → `[]`.
     - `liveUrl`: always `null`. Never guessed or inferred — the risk of pointing at a wrong/stale/insecure URL is worse than leaving it blank. Filled in by hand.
     - `githubUrl`: `git -C <folder> remote get-url origin`, converted to a plain `https://github.com/<owner>/<repo>` URL with any embedded credentials (`https://TOKEN@github.com/...`) stripped unconditionally, regardless of what form the remote is in. `null` if the folder isn't a git repo or has no `origin` remote.
     - `source`: `"auto"`.
     - `draft`: `true`.
   - **If an entry with that `slug` and `source: "auto"` already exists**: left completely untouched — no field is ever overwritten on a rerun, including `name`, `description`, `tags`, `liveUrl`, `githubUrl`, and `draft`. This is what makes manual corrections (fixing a name, writing a real description, adding a `liveUrl`, flipping `draft` to `false`) permanent across reruns.
   - **If an existing `source: "auto"` entry's folder no longer exists on disk**: the entry is removed from the manifest, and the script prints a warning naming the removed slug.
7. Entries with `source: "manual"` are never read for matching purposes and never modified, added, or removed by the script — they're purely hand-maintained directly in the JSON.
8. Write the updated array back to `data/projects.json`, sorted with `manual` entries first (preserving their current relative order) followed by `auto` entries sorted alphabetically by `slug`.

Security notes baked into the script:
- Only reads `package.json`, `README.md`, `pyproject.toml`, and `requirements.txt` at each folder's top level — never recurses into subdirectories or reads any other file type. This avoids ever touching files like `oauth_credentials.json` or personal PDFs.
- Git remote URLs are always sanitized (credential-stripped) before being written anywhere, matching the `taskflow` finding from this session.
- Because new entries default to `draft: true`, nothing about a newly-discovered folder is published until a human has looked at the generated description/tags/name and explicitly flipped `draft` to `false`.

## Component — `components/Projects.tsx`

- Replace the hardcoded `projects` const with `import projects from '@/data/projects.json'`.
- Filter to entries where `draft === false` before rendering.
- Derive per-card `link` = `p.liveUrl ?? p.githubUrl`, `linkLabel` = `p.liveUrl ? 'Live' : 'GitHub'` (falls back to no link rendered at all when both are `null`, exactly like today's `link: null` entries).
- No other change: grid layout, `framer-motion` animations, card markup, tag-pill styling, and section heading all stay exactly as they are today.

## Docs

- **`docs/PROJECTS.md`** (new): explains the manifest format, how to add a folder-derived project (`npm run sync-projects` → edit `data/projects.json` to fill in description/tags/`liveUrl` → set `draft: false`), how to add a manual (no-folder) entry directly, how the `EXCLUDE` array works, and the security rules the sync script follows (top-level files only, credential stripping, `draft` defaulting to `true`).
- **`README.md`**: add a short "Projects data" section pointing to `docs/PROJECTS.md`.
- **This spec**: committed at `docs/superpowers/specs/2026-08-10-dynamic-projects-design.md`.

## Out of scope

- No automated/CI-triggered sync — this is a manually re-run local script, matching the user's confirmed workflow ("re-trigger the run to upload the data").
- No live-URL auto-detection or health-checking of URLs.
- No recursive scanning of project folder contents beyond the four specific top-level files listed above.
- No UI/UX changes to the rendered Projects section.
