'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const skillGroups = [
  {
    label: 'Programming & Data',
    skills: ['Python', 'SQL', 'PostgreSQL', 'MS Server', 'MySQL', 'Teradata', 'R', 'Spark', 'Power BI', 'DAX', 'Excel/VBA', 'Git'],
  },
  {
    label: 'AI / ML',
    skills: ['LangChain', 'RAG', 'sklearn', 'NLP', 'Propensity Modeling', 'Knowledge Graphs', 'Amazon Q', 'ChatGPT API'],
  },
  {
    label: 'Product',
    skills: ['Figma', 'Notion', 'Jira', 'CIRCLES Framework', 'Jobs to Be Done', 'MoSCoW', 'OKRs', 'Roadmapping', 'GTM'],
  },
  {
    label: 'Finance',
    skills: ['Bloomberg Terminal', 'Morningstar', 'DCF', 'Fund Selection Frameworks'],
  },
  {
    label: 'Cloud & Tools',
    skills: ['GCP', 'GitHub Actions', 'Power Automate', 'FastAPI', 'Pydantic', 'Vercel'],
  },
  {
    label: 'Languages',
    skills: ['Spanish (native)', 'English (fluent)'],
  },
]

export default function Skills() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="skills" ref={ref} className="py-24 max-w-6xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <p className="text-accent font-mono text-sm tracking-widest uppercase mb-3">Skills</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-text mb-16">Toolkit</h2>

        <div className="space-y-10">
          {skillGroups.map((group, i) => (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <h3 className="font-mono text-sm text-muted uppercase tracking-widest mb-3">
                {group.label}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <span
                    key={skill}
                    className="font-mono text-sm text-accent bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-full hover:bg-accent/20 transition-colors cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
