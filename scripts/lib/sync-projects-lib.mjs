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
  const manualSlugs = new Set(
    existingEntries.filter((e) => e.source === 'manual').map((e) => e.slug)
  )
  const discoveredSlugs = new Set(discoveredAutoEntries.map((e) => e.slug))
  const manualEntries = existingEntries.filter((e) => e.source === 'manual')

  const autoEntries = []
  const added = []
  const skipped = []

  for (const candidate of discoveredAutoEntries) {
    if (manualSlugs.has(candidate.slug)) {
      skipped.push(candidate.slug)
      continue
    }
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

  autoEntries.sort((a, b) => a.slug.localeCompare(b.slug, 'en'))

  return {
    entries: [...manualEntries, ...autoEntries],
    added,
    removed,
    skipped,
  }
}
