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
