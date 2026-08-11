import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  prettifyName,
  sanitizeGitRemoteUrl,
  extractReadmeDescription,
  detectTags,
  buildAutoEntry,
  mergeManifest,
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

test('mergeManifest skips a discovered candidate whose slug collides with an existing manual entry', () => {
  const manual = {
    slug: 'fitness-tracker',
    name: 'Fitness Tracker (hand-curated)',
    description: 'x',
    tags: [],
    liveUrl: null,
    githubUrl: null,
    source: 'manual',
    draft: false,
  }
  const candidate = buildAutoEntry({
    slug: 'fitness-tracker',
    name: 'Fitness Tracker',
    description: 'auto-scanned',
    tags: [],
    githubUrl: null,
  })

  const result = mergeManifest([manual], [candidate])

  assert.deepEqual(result.entries, [manual])
  assert.deepEqual(result.added, [])
  assert.deepEqual(result.skipped, ['fitness-tracker'])
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
