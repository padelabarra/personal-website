'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const projects = [
  {
    name: 'Apocrypha',
    description:
      "Venture project built during MBA. Knowledge graph middleware for enterprise AI agents — contextualizing fragmented data for LLM-powered workflows. Took to enterprise pilot stage with Domino's.",
    tags: ['Python', 'FastAPI', 'LangChain', 'RAG', 'Knowledge Graphs'],
    link: null,
    linkLabel: null,
  },
  {
    name: 'BankingClassification ML',
    description:
      'Machine learning pipeline for banking transaction classification. Hybrid rule-based + TF-IDF + Logistic Regression model with Streamlit dashboard for review and analytics.',
    tags: ['Python', 'sklearn', 'Pandas', 'SQLite', 'Streamlit'],
    link: 'https://github.com/padelabarra',
    linkLabel: 'GitHub',
  },
  {
    name: 'MBI Financial Platform',
    description:
      'Bloomberg BQL-powered dashboards and Python automation tools for a $1B+ AUM investment firm. Portfolio analytics, digital client enrollment flows, and international fund infrastructure.',
    tags: ['Python', 'Bloomberg API', 'Power BI', 'SQL'],
    link: 'https://github.com/padelabarra',
    linkLabel: 'GitHub',
  },
  {
    name: 'DataCamp ML Track',
    description:
      'Completed ML Scientist Career Track — full series of Jupyter notebook exercises and projects covering supervised learning, NLP, tree-based models, and deep learning.',
    tags: ['Python', 'Jupyter', 'sklearn', 'pandas', 'NLP'],
    link: 'https://github.com/padelabarra',
    linkLabel: 'GitHub',
  },
  {
    name: 'AllFunds Investment Platform',
    description:
      'Scaled AUM from $18M to $54M in 8 months as Product Owner. Defined product vision, pricing strategy, GTM roadmap, and built quantitative fund selection framework analyzing 85K+ securities.',
    tags: ['Product Strategy', 'FinTech', 'Operations', 'Fund Selection'],
    link: null,
    linkLabel: null,
  },
]

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
        <h2 className="font-display text-4xl md:text-5xl font-bold text-text mb-16">
          What I&apos;ve Shipped
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-surface border border-border rounded-xl p-6 flex flex-col hover:border-accent/40 transition-colors duration-200 group"
            >
              <h3 className="font-display font-bold text-text text-lg mb-3 group-hover:text-accent transition-colors duration-200">
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
              {p.link && (
                <a
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted hover:text-accent transition-colors font-mono mt-auto"
                >
                  {p.linkLabel} ↗
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
