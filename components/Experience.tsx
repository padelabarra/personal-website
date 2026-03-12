'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const jobs = [
  {
    company: 'Amazon',
    role: 'Senior PM–Technical (L6)',
    dates: '2026 – Present',
    location: 'Seattle, WA',
    blurb: '5th largest company in the world by market cap.',
    bullets: [
      'Joining the AMELIA team as a full-time Senior Product Manager – Technical following a successful internship.',
      'TODO: Add accomplishments as they come.',
    ],
  },
  {
    company: 'Amazon',
    role: 'Senior PM–Technical Intern',
    dates: 'June 2025 – September 2025',
    location: 'Seattle, WA',
    blurb: '',
    bullets: [
      'Developed a prototype for a new Seller Marketplace Incentives experience using Amazon Q and Figma.',
      'Conducted 5+ seller interviews and 150+ customer surveys; coordinated development across 3+ cross-functional teams.',
    ],
  },
  {
    company: 'BCI',
    role: 'Senior Data Scientist',
    dates: 'June 2023 – July 2024',
    location: 'Santiago, Chile',
    blurb: "Chile's 3rd largest bank ($8B market cap), owner of City National Bank of Florida.",
    bullets: [
      'Led ML model implementation identifying high-probability investment clients; launched first offshore investment campaign targeting 360+ model-identified clients.',
      'Developed transactional alert system for money movement detection → generated $60M+ in new deals, reduced competitive transfers by 10%.',
      'Built propensity model aggregating 10+ data sources and 100+ SQL variables; achieved AUC 0.75, improving segment capture by 20%.',
    ],
  },
  {
    company: 'MBI',
    role: 'Innovation Lead',
    dates: 'October 2021 – June 2023',
    location: 'Santiago, Chile',
    blurb: 'Chilean investment boutique with $1B+ AUM.',
    bullets: [
      'Founded and scaled Innovation unit from 1 to 10 people; led cross-functional team across engineering, design, operations, and sales.',
      'Directed IT infrastructure revamp; prioritized 40+ projects using MoSCoW and OKRs → 60% success rate, 100% implementation rate.',
      'Implemented new CRM end-to-end → enabled 280% customer growth in 12 months.',
      'Designed and launched digital client enrollment flow → 10% customer base growth in 6 months.',
    ],
  },
  {
    company: 'MBI',
    role: 'Product Owner International Markets · Investment Analyst',
    dates: 'June 2019 – October 2021',
    location: 'Santiago, Chile',
    blurb: '',
    bullets: [
      'Managed AllFunds investment platform: defined product vision, roadmap, GTM strategy, and pricing → scaled AUM from $18M to $54M in 8 months.',
      "Launched company's first offshore fixed-income fund; led roadshow and investor relations → raised $10M in 2 months.",
      'Built quantitative fund selection framework analyzing 85,000+ securities across 60+ categories → locked 100+ client investments in 12 months.',
    ],
  },
]

export default function Experience() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="experience" ref={ref} className="py-24 max-w-6xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <p className="text-accent font-mono text-sm tracking-widest uppercase mb-3">Experience</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-text mb-16">
          Where I&apos;ve Built
        </h2>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-8">
            {jobs.map((job, i) => (
              <motion.div
                key={`${job.company}-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative pl-12"
              >
                {/* Timeline dot */}
                <div className="absolute left-0 top-5 w-7 h-7 rounded-full bg-surface border-2 border-accent flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>

                <div className="bg-surface border border-border rounded-xl p-6 hover:border-accent/40 transition-colors duration-200">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                    <div>
                      <span className="font-display font-bold text-text text-xl">{job.company}</span>
                      <span className="text-muted/50 mx-2">·</span>
                      <span className="font-body font-medium text-accent text-sm md:text-base">
                        {job.role}
                      </span>
                    </div>
                    <div className="md:text-right shrink-0">
                      <div className="text-muted text-sm font-mono">{job.dates}</div>
                      <div className="text-muted/70 text-xs">{job.location}</div>
                    </div>
                  </div>
                  {job.blurb && (
                    <p className="text-muted/70 text-sm italic mb-3 border-l-2 border-accent/20 pl-3">
                      {job.blurb}
                    </p>
                  )}
                  <ul className="space-y-2">
                    {job.bullets.map((b, j) => (
                      <li key={j} className="text-muted text-sm flex gap-2 leading-relaxed">
                        <span className="text-accent mt-1 shrink-0 text-xs">→</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
