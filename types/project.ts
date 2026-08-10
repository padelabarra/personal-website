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
