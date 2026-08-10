# Dynamic Projects Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded `projects` array in `components/Projects.tsx` with data read from a committed manifest (`data/projects.json`) that a local Node script keeps in sync with the sibling project folders under `/Users/padelabarra/Documents/Codigo/ClaudeCode/`.

**Architecture:** A pure-function library (`scripts/lib/sync-projects-lib.mjs`) implements name formatting, git-URL sanitizing, README parsing, tag detection, and manifest merging, each unit-tested with Node's built-in test runner. A thin CLI (`scripts/sync-projects.mjs`) does the actual filesystem/git I/O and calls the library. `components/Projects.tsx` imports the resulting JSON manifest directly — same render logic, same styling, same animations as today.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, framer-motion. Node built-ins only for the sync tooling (`node:fs`, `node:path`, `node:child_process`, `node:url`, `node:test`, `node:assert/strict`) — no new npm dependencies.

## Global Constraints

- No new npm dependencies — sync tooling uses only Node built-in modules.
- No UI/UX changes — the rendered grid layout, framer-motion animations, card markup, and tag-pill styling in `Projects.tsx` must stay exactly as they are today.
- `liveUrl` is never auto-detected or guessed by the sync script — it is always written as `null` for new entries and only ever set by hand.
- The sync script reads only four files per scanned folder, at the folder's top level only: `package.json`, `README.md`, `pyproject.toml`, `requirements.txt`. It never recurses into subdirectories or reads any other file.
- Git remote URLs must have any embedded credentials stripped unconditionally before being written anywhere (this repo found a live example: `taskflow`'s remote contains a plaintext GitHub token).
- New auto-detected entries default to `"draft": true` and are excluded from the rendered site until a human sets `"draft": false`.
- Once an `"auto"` entry exists in the manifest, the sync script never overwrites any of its fields on a rerun — only a human editing `data/projects.json` changes it after creation.
- `"manual"` entries (`source: "manual"`) are never read for matching, modified, or removed by the sync script.
- This repo's own folder (`personal_website`) is always excluded from scanning by resolved path comparison, not by name.
- Any future change to this feature (schema, script behavior, tag table, exclude list, URL resolution) must update both `README.md` and `docs/PROJECTS.md` in the same change. Dated documents under `docs/superpowers/specs/` and `docs/superpowers/plans/` are historical and are not rewritten after the fact.

---

### Task 1: Project type and manifest migration

**Files:**
- Create: `types/project.ts`
- Create: `data/projects.json`

**Interfaces:**
- Produces: `ProjectEntry` type (`types/project.ts`), consumed by `components/Projects.tsx` (Task 5) and referenced conceptually by the sync script (Tasks 2–4).
- Produces: `data/projects.json`, an array of `ProjectEntry` objects, read by `components/Projects.tsx` (Task 5) and read/written by `scripts/sync-projects.mjs` (Task 4).

- [ ] **Step 1: Create the `ProjectEntry` type**

Create `types/project.ts`:

```ts
export type ProjectSource = 'auto' | 'manual'

export type ProjectEntry = {
  slug: string
  name: string
  description: string
  tags: string[]
  liveUrl: string | null
  githubUrl: string | null
  source: ProjectSource
  draft: boolean
}
```

- [ ] **Step 2: Migrate the current hardcoded projects into the manifest**

Create `data/projects.json`. This is a direct migration of the five entries currently hardcoded in `components/Projects.tsx` — same names, descriptions, tags, and links, just reshaped into the new schema (`link`/`linkLabel` become `githubUrl`, since none of the current entries have a distinct live URL):

```json
[
  {
    "slug": "apocrypha",
    "name": "Apocrypha",
    "description": "Venture project built during MBA. Knowledge graph middleware for enterprise AI agents — contextualizing fragmented data for LLM-powered workflows. Took to enterprise pilot stage with Domino's.",
    "tags": ["Python", "FastAPI", "LangChain", "RAG", "Knowledge Graphs"],
    "liveUrl": null,
    "githubUrl": null,
    "source": "manual",
    "draft": false
  },
  {
    "slug": "banking-classification-ml",
    "name": "BankingClassification ML",
    "description": "Machine learning pipeline for banking transaction classification. Hybrid rule-based + TF-IDF + Logistic Regression model with Streamlit dashboard for review and analytics.",
    "tags": ["Python", "sklearn", "Pandas", "SQLite", "Streamlit"],
    "liveUrl": null,
    "githubUrl": "https://github.com/padelabarra",
    "source": "manual",
    "draft": false
  },
  {
    "slug": "mbi-financial-platform",
    "name": "MBI Financial Platform",
    "description": "Bloomberg BQL-powered dashboards and Python automation tools for a $1B+ AUM investment firm. Portfolio analytics, digital client enrollment flows, and international fund infrastructure.",
    "tags": ["Python", "Bloomberg API", "Power BI", "SQL"],
    "liveUrl": null,
    "githubUrl": "https://github.com/padelabarra",
    "source": "manual",
    "draft": false
  },
  {
    "slug": "datacamp-ml-track",
    "name": "DataCamp ML Track",
    "description": "Completed ML Scientist Career Track — full series of Jupyter notebook exercises and projects covering supervised learning, NLP, tree-based models, and deep learning.",
    "tags": ["Python", "Jupyter", "sklearn", "pandas", "NLP"],
    "liveUrl": null,
    "githubUrl": "https://github.com/padelabarra",
    "source": "manual",
    "draft": false
  },
  {
    "slug": "allfunds-investment-platform",
    "name": "AllFunds Investment Platform",
    "description": "Scaled AUM from $18M to $54M in 8 months as Product Owner. Defined product vision, pricing strategy, GTM roadmap, and built quantitative fund selection framework analyzing 85K+ securities.",
    "tags": ["Product Strategy", "FinTech", "Operations", "Fund Selection"],
    "liveUrl": null,
    "githubUrl": null,
    "source": "manual",
    "draft": false
  }
]
```

- [ ] **Step 3: Verify the JSON is valid and matches the type shape**

Run: `node -e "const d=require('./data/projects.json'); console.assert(Array.isArray(d) && d.length===5, 'expected 5 entries'); d.forEach(e=>console.assert(e.source==='manual'&&e.draft===false, e.slug)); console.log('OK', d.length)"`

Expected output: `OK 5`

- [ ] **Step 4: Commit**

```bash
git add types/project.ts data/projects.json
git commit -m "feat: add ProjectEntry type and migrate hardcoded projects to data/projects.json"
```

---

### Task 2: Sync script library — name, URL, README, and tag helpers

**Files:**
- Create: `scripts/lib/sync-projects-lib.mjs`
- Test: `scripts/lib/sync-projects-lib.test.mjs`
- Modify: `package.json` (add `test` script)

**Interfaces:**
- Consumes: nothing (pure functions, no dependency on Task 1's files).
- Produces (from `scripts/lib/sync-projects-lib.mjs`, consumed by Task 3 and Task 4):
  - `TAG_RULES: Record<string, string>`
  - `prettifyName(folderName: string): string`
  - `sanitizeGitRemoteUrl(rawUrl: string | null): string | null`
  - `extractReadmeDescription(readmeText: string | null, maxLength?: number): string`
  - `detectTags(opts: { hasPackageJson?: boolean, packageJsonDeps?: string[], hasPyproject?: boolean, hasRequirements?: boolean }): string[]`

- [ ] **Step 1: Write the failing tests**

Create `scripts/lib/sync-projects-lib.test.mjs`:

```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  prettifyName,
  sanitizeGitRemoteUrl,
  extractReadmeDescription,
  detectTags,
} from './sync-projects-lib.mjs'

test('prettifyName converts kebab and snake case to Title Case', () => {
  assert.equal(prettifyName('fitness-tracker'), 'Fitness Tracker')
  assert.equal(prettifyName('seattle_property_finder'), 'Seattle Property Finder')
  assert.equal(prettifyName('relationshipOS'), 'RelationshipOS')
})

test('sanitizeGitRemoteUrl strips embedded credentials', () => {
  assert.equal(
    sanitizeGitRemoteUrl(
      'https://<REDACTED-TOKEN-EXAMPLE>@github.com/padelabarra/taskflow.git'
    ),
    'https://github.com/padelabarra/taskflow'
  )
})

test('sanitizeGitRemoteUrl handles plain https remotes', () => {
  assert.equal(
    sanitizeGitRemoteUrl('https://github.com/padelabarra/fitness-tracker.git'),
    'https://github.com/padelabarra/fitness-tracker'
  )
})

test('sanitizeGitRemoteUrl handles ssh remotes', () => {
  assert.equal(
    sanitizeGitRemoteUrl('git@github.com:padelabarra/foo.git'),
    'https://github.com/padelabarra/foo'
  )
})

test('sanitizeGitRemoteUrl returns null for non-github remotes and empty input', () => {
  assert.equal(sanitizeGitRemoteUrl('https://gitlab.com/x/y.git'), null)
  assert.equal(sanitizeGitRemoteUrl(null), null)
  assert.equal(sanitizeGitRemoteUrl(''), null)
})

test('extractReadmeDescription pulls the first real paragraph', () => {
  const readme = `# My Project\n\n![badge](url)\n\nA tool that does the thing.\nSecond line of the same paragraph.\n\nMore text below.`
  assert.equal(
    extractReadmeDescription(readme),
    'A tool that does the thing. Second line of the same paragraph.'
  )
})

test('extractReadmeDescription returns empty string for missing readme', () => {
  assert.equal(extractReadmeDescription(''), '')
  assert.equal(extractReadmeDescription(null), '')
})

test('detectTags maps known package.json dependencies to labels', () => {
  assert.deepEqual(
    detectTags({ hasPackageJson: true, packageJsonDeps: ['next', 'react', 'tailwindcss'] }),
    ['Next.js', 'React', 'Tailwind CSS']
  )
})

test('detectTags falls back to Node.js when no known deps match', () => {
  assert.deepEqual(detectTags({ hasPackageJson: true, packageJsonDeps: ['left-pad'] }), ['Node.js'])
})

test('detectTags adds Python for pyproject or requirements files', () => {
  assert.deepEqual(detectTags({ hasPyproject: true }), ['Python'])
  assert.deepEqual(detectTags({ hasRequirements: true }), ['Python'])
})

test('detectTags returns empty array when nothing detected', () => {
  assert.deepEqual(detectTags({}), [])
})
```

Add a `test` script to `package.json`'s `"scripts"` block (alongside the existing `dev`/`build`/`start`/`lint`):

```json
"test": "node --test scripts/lib/"
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: fails with a module-not-found error for `./sync-projects-lib.mjs` (the file doesn't exist yet).

- [ ] **Step 3: Implement the library functions**

Create `scripts/lib/sync-projects-lib.mjs`:

```js
export const TAG_RULES = {
  next: 'Next.js',
  react: 'React',
  'react-dom': 'React',
  typescript: 'TypeScript',
  tailwindcss: 'Tailwind CSS',
  express: 'Express',
  fastapi: 'FastAPI',
  flask: 'Flask',
  streamlit: 'Streamlit',
  pandas: 'Pandas',
  numpy: 'NumPy',
  'scikit-learn': 'scikit-learn',
  langchain: 'LangChain',
  'drizzle-orm': 'Drizzle',
  prisma: 'Prisma',
  'framer-motion': 'Framer Motion',
}

export function prettifyName(folderName) {
  return folderName
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function sanitizeGitRemoteUrl(rawUrl) {
  if (!rawUrl) return null
  const url = rawUrl.trim()
  if (!url) return null

  const sshMatch = url.match(/^git@github\.com:(.+?)(\.git)?$/)
  if (sshMatch) {
    return `https://github.com/${sshMatch[1]}`
  }

  const withoutCreds = url.replace(/^(https?:\/\/)[^@/]+@/, '$1')

  let parsed
  try {
    parsed = new URL(withoutCreds)
  } catch {
    return null
  }

  if (parsed.hostname !== 'github.com') return null

  const cleanPath = parsed.pathname.replace(/\.git$/, '').replace(/\/+$/, '')
  if (!cleanPath || cleanPath === '/') return null

  return `https://github.com${cleanPath}`
}

export function extractReadmeDescription(readmeText, maxLength = 200) {
  if (!readmeText) return ''

  const lines = readmeText.split('\n')
  const paragraph = []

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (paragraph.length === 0) {
      if (!line) continue
      if (line.startsWith('#')) continue
      if (line.startsWith('![')) continue
      if (line.startsWith('[![')) continue
      if (/^<.*>$/.test(line)) continue
    } else if (!line) {
      break
    }

    paragraph.push(line)
  }

  const text = paragraph.join(' ').replace(/\s+/g, ' ').trim()
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}…`
}

export function detectTags({
  packageJsonDeps = [],
  hasPyproject = false,
  hasRequirements = false,
  hasPackageJson = false,
} = {}) {
  const tags = new Set()

  for (const dep of packageJsonDeps) {
    const label = TAG_RULES[dep]
    if (label) tags.add(label)
  }

  if (hasPackageJson && !packageJsonDeps.some((dep) => TAG_RULES[dep])) {
    tags.add('Node.js')
  }

  if (hasPyproject || hasRequirements) {
    tags.add('Python')
  }

  return Array.from(tags)
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: all tests in `scripts/lib/sync-projects-lib.test.mjs` PASS (13 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/sync-projects-lib.mjs scripts/lib/sync-projects-lib.test.mjs package.json
git commit -m "feat: add sync-projects library helpers for name/URL/README/tag detection"
```

---

### Task 3: Sync script library — manifest merge logic

**Files:**
- Modify: `scripts/lib/sync-projects-lib.mjs` (append)
- Modify: `scripts/lib/sync-projects-lib.test.mjs` (append)

**Interfaces:**
- Consumes: nothing new from other tasks.
- Produces (consumed by Task 4's CLI script):
  - `buildAutoEntry(opts: { slug: string, name: string, description: string, tags: string[], githubUrl: string | null }): ProjectEntry`
  - `mergeManifest(existingEntries: ProjectEntry[], discoveredAutoEntries: ProjectEntry[]): { entries: ProjectEntry[], added: string[], removed: string[] }`

- [ ] **Step 1: Write the failing tests**

Append to `scripts/lib/sync-projects-lib.test.mjs` (add to the existing imports and add new `test(...)` blocks):

```js
import { buildAutoEntry, mergeManifest } from './sync-projects-lib.mjs'
```

(Add `buildAutoEntry, mergeManifest` to the existing import statement from Task 2 rather than a second import line.)

```js
test('buildAutoEntry produces a draft auto entry with liveUrl always null', () => {
  const entry = buildAutoEntry({
    slug: 'fitness-tracker',
    name: 'Fitness Tracker',
    description: 'A fitness tracking app.',
    tags: ['Next.js'],
    githubUrl: 'https://github.com/padelabarra/fitness-tracker',
  })

  assert.deepEqual(entry, {
    slug: 'fitness-tracker',
    name: 'Fitness Tracker',
    description: 'A fitness tracking app.',
    tags: ['Next.js'],
    liveUrl: null,
    githubUrl: 'https://github.com/padelabarra/fitness-tracker',
    source: 'auto',
    draft: true,
  })
})

test('mergeManifest adds new auto entries and preserves manual entries untouched', () => {
  const manual = {
    slug: 'apocrypha',
    name: 'Apocrypha',
    description: 'x',
    tags: [],
    liveUrl: null,
    githubUrl: null,
    source: 'manual',
    draft: false,
  }
  const discovered = [
    buildAutoEntry({
      slug: 'fitness-tracker',
      name: 'Fitness Tracker',
      description: 'desc',
      tags: ['Next.js'],
      githubUrl: 'https://github.com/padelabarra/fitness-tracker',
    }),
  ]

  const result = mergeManifest([manual], discovered)

  assert.deepEqual(result.added, ['fitness-tracker'])
  assert.deepEqual(result.removed, [])
  assert.equal(result.entries.length, 2)
  assert.deepEqual(result.entries[0], manual)
  assert.equal(result.entries[1].slug, 'fitness-tracker')
  assert.equal(result.entries[1].draft, true)
})

test('mergeManifest never overwrites an existing auto entry even if the candidate differs', () => {
  const existingAuto = {
    slug: 'fitness-tracker',
    name: 'Hand-Edited Name',
    description: 'Hand-written description',
    tags: ['Custom'],
    liveUrl: 'https://fitness.example.com',
    githubUrl: 'https://github.com/padelabarra/fitness-tracker',
    source: 'auto',
    draft: false,
  }
  const candidate = buildAutoEntry({
    slug: 'fitness-tracker',
    name: 'Fitness Tracker',
    description: 'freshly scanned description',
    tags: ['Next.js'],
    githubUrl: 'https://github.com/padelabarra/fitness-tracker',
  })

  const result = mergeManifest([existingAuto], [candidate])

  assert.deepEqual(result.entries, [existingAuto])
  assert.deepEqual(result.added, [])
})

test('mergeManifest removes auto entries whose folder disappeared and reports them', () => {
  const staleAuto = {
    slug: 'old-project',
    name: 'Old Project',
    description: '',
    tags: [],
    liveUrl: null,
    githubUrl: null,
    source: 'auto',
    draft: true,
  }

  const result = mergeManifest([staleAuto], [])

  assert.deepEqual(result.entries, [])
  assert.deepEqual(result.removed, ['old-project'])
})

test('mergeManifest sorts auto entries alphabetically by slug after manual entries', () => {
  const manual = {
    slug: 'apocrypha',
    name: 'Apocrypha',
    description: '',
    tags: [],
    liveUrl: null,
    githubUrl: null,
    source: 'manual',
    draft: false,
  }
  const discovered = [
    buildAutoEntry({ slug: 'taskflow', name: 'Taskflow', description: '', tags: [], githubUrl: null }),
    buildAutoEntry({
      slug: 'fitness-tracker',
      name: 'Fitness Tracker',
      description: '',
      tags: [],
      githubUrl: null,
    }),
  ]

  const result = mergeManifest([manual], discovered)

  assert.deepEqual(result.entries.map((e) => e.slug), ['apocrypha', 'fitness-tracker', 'taskflow'])
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `buildAutoEntry` and `mergeManifest` are not exported from `./sync-projects-lib.mjs`.

- [ ] **Step 3: Implement `buildAutoEntry` and `mergeManifest`**

Append to `scripts/lib/sync-projects-lib.mjs`:

```js
export function buildAutoEntry({ slug, name, description, tags, githubUrl }) {
  return {
    slug,
    name,
    description,
    tags,
    liveUrl: null,
    githubUrl: githubUrl ?? null,
    source: 'auto',
    draft: true,
  }
}

export function mergeManifest(existingEntries, discoveredAutoEntries) {
  const existingAutoBySlug = new Map(
    existingEntries.filter((e) => e.source === 'auto').map((e) => [e.slug, e])
  )
  const discoveredSlugs = new Set(discoveredAutoEntries.map((e) => e.slug))
  const manualEntries = existingEntries.filter((e) => e.source === 'manual')

  const autoEntries = []
  const added = []

  for (const candidate of discoveredAutoEntries) {
    const existing = existingAutoBySlug.get(candidate.slug)
    if (existing) {
      autoEntries.push(existing)
    } else {
      autoEntries.push(candidate)
      added.push(candidate.slug)
    }
  }

  const removed = []
  for (const slug of existingAutoBySlug.keys()) {
    if (!discoveredSlugs.has(slug)) {
      removed.push(slug)
    }
  }

  autoEntries.sort((a, b) => a.slug.localeCompare(b.slug))

  return {
    entries: [...manualEntries, ...autoEntries],
    added,
    removed,
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: all tests PASS (18 tests total across the file).

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/sync-projects-lib.mjs scripts/lib/sync-projects-lib.test.mjs
git commit -m "feat: add manifest merge logic that preserves manual edits on rerun"
```

---

### Task 4: Sync script CLI and first real run

**Files:**
- Create: `scripts/sync-projects.mjs`
- Modify: `package.json` (add `sync-projects` script)

**Interfaces:**
- Consumes: `prettifyName`, `sanitizeGitRemoteUrl`, `extractReadmeDescription`, `detectTags`, `buildAutoEntry`, `mergeManifest` from `scripts/lib/sync-projects-lib.mjs` (Tasks 2–3).
- Consumes/produces: reads and overwrites `data/projects.json` (Task 1's schema).

- [ ] **Step 1: Add the `sync-projects` npm script**

Modify `package.json`'s `"scripts"` block to add:

```json
"sync-projects": "node scripts/sync-projects.mjs"
```

- [ ] **Step 2: Implement the CLI**

Create `scripts/sync-projects.mjs`:

```js
#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  prettifyName,
  sanitizeGitRemoteUrl,
  extractReadmeDescription,
  detectTags,
  buildAutoEntry,
  mergeManifest,
} from './lib/sync-projects-lib.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..')
const PROJECTS_ROOT = path.resolve(REPO_ROOT, '..')
const MANIFEST_PATH = path.join(REPO_ROOT, 'data', 'projects.json')

// Folder names under PROJECTS_ROOT to skip entirely, in addition to this
// repo's own folder (always excluded automatically by path).
// Example: EXCLUDE = ['agent_google_suite', 'investment_consolidation']
const EXCLUDE = []

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return null
  }
}

function readTextIfExists(filePath) {
  if (!fs.existsSync(filePath)) return null
  return fs.readFileSync(filePath, 'utf8')
}

function getGitRemoteUrl(folderPath) {
  if (!fs.existsSync(path.join(folderPath, '.git'))) return null
  try {
    return execFileSync('git', ['-C', folderPath, 'remote', 'get-url', 'origin'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return null
  }
}

function scanFolder(folderPath, slug) {
  const packageJson = readJsonIfExists(path.join(folderPath, 'package.json'))
  const readme = readTextIfExists(path.join(folderPath, 'README.md'))
  const hasPyproject = fs.existsSync(path.join(folderPath, 'pyproject.toml'))
  const hasRequirements = fs.existsSync(path.join(folderPath, 'requirements.txt'))

  const packageJsonDeps = packageJson
    ? Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies })
    : []

  const name = prettifyName(slug)
  const description =
    (packageJson && packageJson.description && packageJson.description.trim()) ||
    extractReadmeDescription(readme) ||
    ''
  const tags = detectTags({
    hasPackageJson: Boolean(packageJson),
    packageJsonDeps,
    hasPyproject,
    hasRequirements,
  })
  const githubUrl = sanitizeGitRemoteUrl(getGitRemoteUrl(folderPath))

  return buildAutoEntry({ slug, name, description, tags, githubUrl })
}

function main() {
  const dirEntries = fs.readdirSync(PROJECTS_ROOT, { withFileTypes: true })
  const excludeSet = new Set(EXCLUDE)

  const discovered = []
  for (const entry of dirEntries) {
    if (!entry.isDirectory()) continue
    const folderPath = path.join(PROJECTS_ROOT, entry.name)
    if (folderPath === REPO_ROOT) continue
    if (excludeSet.has(entry.name)) continue
    discovered.push(scanFolder(folderPath, entry.name))
  }

  const existing = readJsonIfExists(MANIFEST_PATH) || []
  const { entries: merged, added, removed } = mergeManifest(existing, discovered)

  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true })
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(merged, null, 2)}\n`)

  if (added.length > 0) {
    console.log(`Added ${added.length} new project(s): ${added.join(', ')}`)
    console.log('New entries default to draft: true — edit data/projects.json and set draft: false when ready to publish.')
  }
  if (removed.length > 0) {
    console.warn(`Removed ${removed.length} project(s) whose folder no longer exists: ${removed.join(', ')}`)
  }
  if (added.length === 0 && removed.length === 0) {
    console.log('No changes — manifest is already up to date.')
  }
}

main()
```

- [ ] **Step 3: Run the script for real and verify the output**

Run: `npm run sync-projects`

Expected: console output listing added slugs including (at least) `fitness-tracker`, `invesment_analysis`, `news_feed`, `seattle_property_finder`, `taskflow`, `relationshipOS`, `investment_consolidation`, `property_finder`, `prompt_video`, `Agents`, `agent_google_suite`, `BankingClassication` — one entry per sibling folder under `ClaudeCode/` other than `personal_website`. No mention of `personal_website` itself.

Then verify with: `node -e "const d=require('./data/projects.json'); const auto=d.filter(e=>e.source==='auto'); console.assert(auto.every(e=>e.draft===true), 'all new auto entries must be draft:true'); console.assert(auto.every(e=>e.liveUrl===null), 'liveUrl must be null'); const taskflow=auto.find(e=>e.slug==='taskflow'); console.assert(taskflow && !taskflow.githubUrl.includes('ghp_'), 'githubUrl must not contain a token'); console.log('githubUrl for taskflow:', taskflow && taskflow.githubUrl); console.log('OK, auto entries:', auto.length)"`

Expected: no assertion errors, and the printed `githubUrl for taskflow` is `https://github.com/padelabarra/taskflow` (no token, no `.git` suffix).

- [ ] **Step 4: Run the sync script a second time to confirm idempotency**

Run: `npm run sync-projects`
Expected: `No changes — manifest is already up to date.` (no entries added or removed on the second run, since nothing about the folders changed).

- [ ] **Step 5: Commit**

```bash
git add scripts/sync-projects.mjs package.json data/projects.json
git commit -m "feat: add sync-projects CLI and run initial scan of ClaudeCode/ folders"
```

---

### Task 5: Wire `Projects.tsx` to the manifest

**Files:**
- Modify: `components/Projects.tsx`

**Interfaces:**
- Consumes: `ProjectEntry` type from `types/project.ts` (Task 1), `data/projects.json` (Tasks 1 and 4).

- [ ] **Step 1: Replace the hardcoded array with the manifest import**

Modify `components/Projects.tsx`. Replace lines 1–47 (the imports and the hardcoded `projects` const) with:

```tsx
'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import projectEntries from '@/data/projects.json'
import type { ProjectEntry } from '@/types/project'

const projects = (projectEntries as unknown as ProjectEntry[]).filter((p) => !p.draft)
```

- [ ] **Step 2: Update the render logic for the new field names**

Replace the body of the `.map()` callback (currently keyed on `p.name` with `p.link`/`p.linkLabel`) so it derives `link`/`linkLabel` per card and keys on `p.slug`:

```tsx
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p, i) => {
            const link = p.liveUrl ?? p.githubUrl
            const linkLabel = p.liveUrl ? 'Live' : 'GitHub'

            return (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-surface border border-border rounded-xl p-6 flex flex-col hover:border-accent/40 transition-colors duration-200 group"
              >
                <h3 className="font-display font-bold text-gray-900 text-lg mb-3 group-hover:text-accent transition-colors duration-200">
                  {p.name}
                </h3>
                <p className="text-muted text-sm leading-relaxed flex-1 mb-4">{p.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {link && (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted hover:text-accent transition-colors font-mono mt-auto"
                  >
                    {linkLabel} ↗
                  </a>
                )}
              </motion.div>
            )
          })}
        </div>
```

The rest of the file (the `export default function Projects()` wrapper, the `useRef`/`useInView` hooks, the `<section>`/heading markup above the grid) stays exactly as it is today.

- [ ] **Step 3: Type-check and build**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds with no errors.

- [ ] **Step 4: Manually verify in the browser**

Run: `npm run dev`, open `http://localhost:3000` in a browser, scroll to the "What I've Shipped" section, and confirm:
- Exactly the same 5 cards render as before this change (Apocrypha, BankingClassification ML, MBI Financial Platform, DataCamp ML Track, AllFunds Investment Platform), with identical text, tags, and links.
- No newly auto-discovered project (e.g. `fitness-tracker`, `taskflow`) appears, since those all have `draft: true`.
- Card entrance animations and hover states behave the same as before.

Stop the dev server once confirmed.

- [ ] **Step 5: Commit**

```bash
git add components/Projects.tsx
git commit -m "feat: read Projects section from data/projects.json manifest"
```

---

### Task 6: Documentation

**Files:**
- Create: `docs/PROJECTS.md`
- Modify: `README.md`

**Interfaces:**
- None (documentation only).

- [ ] **Step 1: Write the maintenance guide**

Create `docs/PROJECTS.md`:

```markdown
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
```

- [ ] **Step 2: Point to it from the README**

Modify `README.md`: add a new section after the existing "## Deploy on Vercel" section (at the end of the file):

```markdown

## Projects Data

The Projects section (`components/Projects.tsx`) reads from `data/projects.json`, which is kept in sync with sibling project folders under `ClaudeCode/` by running `npm run sync-projects`. See [`docs/PROJECTS.md`](docs/PROJECTS.md) for how to add, edit, or exclude a project, and how the auto-detection rules work.
```

- [ ] **Step 3: Commit**

```bash
git add docs/PROJECTS.md README.md
git commit -m "docs: add projects data maintenance guide and README pointer"
```

---

### Task 7: Final verification pass

**Files:** none (verification only).

**Interfaces:** none.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all tests in `scripts/lib/sync-projects-lib.test.mjs` PASS.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Run a full production build**

Run: `npm run build`
Expected: build succeeds with no errors or warnings related to `components/Projects.tsx` or `data/projects.json`.

- [ ] **Step 4: Confirm the sync script is still idempotent**

Run: `npm run sync-projects`
Expected: `No changes — manifest is already up to date.`

- [ ] **Step 5: Confirm both living docs are current**

Read `README.md` and `docs/PROJECTS.md` and confirm they accurately describe the shipped behavior (manifest location, `sync-projects` command, `draft`/`source` semantics, `EXCLUDE` array, `TAG_RULES` table). No commit needed if Task 6 already covered this — this step is a final accuracy check, not a rewrite.
