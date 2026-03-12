'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const stats = [
  { value: '5+', label: 'Years', sub: 'Building data & AI products' },
  { value: '$60M+', label: 'New Business', sub: 'Generated through ML models' },
  { value: '85K+', label: 'Securities', sub: 'Analyzed across 60+ categories' },
  { value: '3', label: 'Countries', sub: 'Chile · USA · Internship track' },
]

export default function About() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="about" ref={ref} className="py-24 max-w-6xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <p className="text-accent font-mono text-sm tracking-widest uppercase mb-3">About</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-text mb-8">
          Engineer. PM. Builder.
        </h2>

        <p className="text-muted text-lg leading-relaxed max-w-2xl mb-16">
          I move from data to strategy to execution — and I ship things that work at scale.
          Chilean Industrial Engineer turned product leader, now Senior PM–Technical at Amazon.
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              className="bg-surface border border-border rounded-xl p-5 hover:border-accent/30 transition-colors duration-200"
            >
              <div className="font-display text-3xl font-bold text-accent mb-1">{s.value}</div>
              <div className="font-body font-medium text-text text-sm mb-1">{s.label}</div>
              <div className="text-muted text-xs leading-tight">{s.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Narrative — two columns */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-4 text-muted leading-relaxed">
            <p>
              Industrial Engineer from PUC Chile. Started as an Investment Analyst, became a Product
              Owner, built an Innovation unit from scratch, moved into Data Science at BCI — Chile&apos;s
              3rd largest bank — and then earned a merit fellowship MBA at UCLA Anderson.
            </p>
            <p>
              Now joining Amazon as a Senior PM–Technical (L6). In parallel, I wrapped up a venture
              project, Apocrypha, where I built knowledge graph middleware for enterprise AI agents and
              took it to enterprise pilot stage with Domino&apos;s.
            </p>
          </div>
          <div className="space-y-4 text-muted leading-relaxed">
            <p>
              I&apos;m drawn to problems at the intersection of messy data, complex systems, and real user
              pain. I&apos;ve built ML pipelines that moved $60M+, digital products that grew customer bases
              by 3x, and quantitative frameworks that analysts actually use.
            </p>
            <p>
              Husband to Renatta. Rower. Runner. Outdoor junkie. Bilingual — Spanish native, English
              fluent. Los Angeles, CA. Open to Seattle.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
