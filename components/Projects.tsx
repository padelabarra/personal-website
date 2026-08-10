'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import projectEntries from '@/data/projects.json'
import type { ProjectEntry } from '@/types/project'

const projects = (projectEntries as unknown as ProjectEntry[]).filter((p) => !p.draft)

export default function Projects() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="projects" ref={ref} className="py-24 max-w-6xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <p className="text-accent font-mono text-sm tracking-widest uppercase mb-3">Projects</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-16">
          What I&apos;ve Shipped
        </h2>

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
      </motion.div>
    </section>
  )
}
