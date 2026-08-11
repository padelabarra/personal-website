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

function readManifest(filePath) {
  if (!fs.existsSync(filePath)) return []
  let parsed
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (err) {
    console.error(`Refusing to run: ${filePath} is not valid JSON (${err.message}).`)
    console.error('Fix the file by hand (or restore it with git checkout) and re-run.')
    process.exit(1)
  }
  if (!Array.isArray(parsed)) {
    console.error(`Refusing to run: ${filePath} must contain a JSON array.`)
    process.exit(1)
  }
  return parsed
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
    (packageJson && typeof packageJson.description === 'string' && packageJson.description.trim()) ||
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

  const existing = readManifest(MANIFEST_PATH)
  const { entries: merged, added, removed, skipped } = mergeManifest(existing, discovered)

  const serialized = `${JSON.stringify(merged, null, 2)}\n`
  const current = fs.existsSync(MANIFEST_PATH) ? fs.readFileSync(MANIFEST_PATH, 'utf8') : null
  if (serialized !== current) {
    fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true })
    fs.writeFileSync(MANIFEST_PATH, serialized)
  }

  if (added.length > 0) {
    console.log(`Added ${added.length} new project(s): ${added.join(', ')}`)
    console.log('New entries default to draft: true — edit data/projects.json and set draft: false when ready to publish.')
  }
  if (removed.length > 0) {
    console.warn(`Removed ${removed.length} project(s) whose folder no longer exists: ${removed.join(', ')}`)
  }
  if (skipped.length > 0) {
    console.warn(`Skipped ${skipped.length} discovered folder(s) whose name collides with an existing manifest slug: ${skipped.join(', ')}`)
  }
  if (added.length === 0 && removed.length === 0 && skipped.length === 0) {
    console.log('No changes — manifest is already up to date.')
  }
}

main()
