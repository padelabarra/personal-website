'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const schools = [
  {
    school: 'UCLA Anderson School of Management',
    shortName: 'UCLA Anderson',
    degree: 'MBA, Technology Management',
    period: '2024 – 2026',
    location: 'Los Angeles, CA',
    highlight: 'Merit Fellowship Award — 80% of tuition',
    bullets: [
      'VP Social & Inclusion — Latin America Business Association (LABA)',
      'VP Social — Soccer Club',
      'Member — Technology Business Association (AnderTech)',
      'Courses: Tech Immersion, Entrepreneurship & Venture Initiation',
      'Co-founded Apocrypha (AI venture project) during MBA',
    ],
  },
  {
    school: 'Pontificia Universidad Católica de Chile',
    shortName: 'PUC Chile',
    degree: 'B.S.E. Industrial Engineering',
    period: '2014 – 2019',
    location: 'Santiago, Chile',
    highlight: 'Major: Operations Research · Minor: Transportation Systems',
    bullets: [
      'Adjunct professor — Project Evaluation course',
      'Captain of 5 amateur soccer teams',
      'Strong foundation in statistics, algorithms, operations research, and financial engineering',
    ],
  },
]

export default function Education() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="education" ref={ref} className="py-24 max-w-6xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <p className="text-accent font-mono text-sm tracking-widest uppercase mb-3">Education</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-text mb-16">
          Academic Foundation
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schools.map((s, i) => (
            <motion.div
              key={s.school}
              initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="bg-surface border border-border rounded-xl p-8 hover:border-accent/40 transition-colors duration-200"
            >
              <p className="text-muted font-mono text-xs mb-3 tracking-wide">
                {s.period} · {s.location}
              </p>
              <h3 className="font-display font-bold text-text text-xl mb-1">{s.shortName}</h3>
              <p className="text-text/60 text-sm mb-2">{s.school}</p>
              <p className="text-accent font-body font-medium mb-3">{s.degree}</p>
              <p className="text-muted text-sm italic mb-5 pb-5 border-b border-border">
                {s.highlight}
              </p>
              <ul className="space-y-2">
                {s.bullets.map((b) => (
                  <li key={b} className="text-muted text-sm flex gap-2 leading-relaxed">
                    <span className="text-accent shrink-0 mt-0.5">·</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
