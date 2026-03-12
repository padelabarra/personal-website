# Personal Website Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy Pedro de la Barra's single-page personal portfolio website on Vercel.

**Architecture:** Next.js 14 App Router single-page site with all sections as isolated React components wired together in `app/page.tsx`. Tailwind CSS handles layout and spacing; CSS custom properties in `globals.css` define the design system. Framer Motion handles all animations.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Google Fonts (Syne + DM Sans), Vercel

**Spec:** `docs/superpowers/specs/2026-03-10-personal-website-design.md`

---

## Chunk 1: Scaffolding & Design System

### Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `next.config.js`, `tailwind.config.ts`, `tsconfig.json`, `postcss.config.js`

- [ ] **Step 1: Scaffold the project**

```bash
cd /Users/padelabarra/Documents/Python/ClaudeCode/personal_website
npx create-next-app@14 . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --use-npm
```

When prompted, answer: Yes to TypeScript, Yes to ESLint, Yes to Tailwind, Yes to App Router.

- [ ] **Step 2: Install Framer Motion**

```bash
npm install framer-motion
```

- [ ] **Step 3: Verify build compiles clean**

```bash
npm run build
```
Expected: `✓ Compiled successfully` with no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 14 + TypeScript + Tailwind project"
```

---

### Task 2: Design system — globals.css and fonts

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update `app/globals.css` with design tokens**

Replace the entire file with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --bg: #0a0e1a;
  --surface: #111827;
  --border: #1e293b;
  --accent: #3b82f6;
  --accent-hover: #60a5fa;
  --text: #f8fafc;
  --muted: #94a3b8;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--bg);
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
}

h1, h2, h3, h4 {
  font-family: 'Syne', sans-serif;
}

::selection {
  background: var(--accent);
  color: white;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--accent); }
```

- [ ] **Step 2: Update `app/layout.tsx` with metadata and font links**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pedro de la Barra — Senior PM & AI Builder',
  description: 'Chilean engineer, Amazon Senior PM–Technical (L6), MBA\'26 UCLA Anderson. Building at the intersection of AI, data, and product.',
  keywords: ['Product Manager', 'Amazon', 'UCLA Anderson', 'AI', 'Data Science', 'Chile'],
  authors: [{ name: 'Pedro de la Barra' }],
  openGraph: {
    title: 'Pedro de la Barra — Senior PM & AI Builder',
    description: 'Chilean engineer, Amazon Senior PM–Technical (L6), MBA\'26 UCLA Anderson.',
    url: 'https://padelabarra.vercel.app',
    siteName: 'Pedro de la Barra',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pedro de la Barra — Senior PM & AI Builder',
    description: 'Chilean engineer, Amazon Senior PM–Technical (L6), MBA\'26 UCLA Anderson.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Update `tailwind.config.ts` to include design tokens**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0e1a',
        surface: '#111827',
        border: '#1e293b',
        accent: '#3b82f6',
        'accent-hover': '#60a5fa',
        text: '#f8fafc',
        muted: '#94a3b8',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```
Expected: clean compile.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add design system — CSS tokens, fonts, Tailwind config"
```

---

## Chunk 2: Nav + Hero + About

### Task 3: Nav component

**Files:**
- Create: `components/Nav.tsx`

- [ ] **Step 1: Create `components/` directory and `Nav.tsx`**

```bash
mkdir -p components
```

```tsx
// components/Nav.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const links = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Education', href: '#education' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contact', href: '#contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-bg/90 backdrop-blur-md border-b border-border' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Monogram */}
        <a href="#" className="font-display font-bold text-xl text-accent tracking-tight">
          PdlB
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-body text-muted hover:text-text transition-colors duration-200"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-muted hover:text-text transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-5 h-0.5 bg-current mb-1" />
          <div className="w-5 h-0.5 bg-current mb-1" />
          <div className="w-5 h-0.5 bg-current" />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-surface border-b border-border px-6 py-4"
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-muted hover:text-text transition-colors"
              >
                {link.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/Nav.tsx
git commit -m "feat: add sticky Nav with smooth scroll links and mobile drawer"
```

---

### Task 4: Hero component

**Files:**
- Create: `components/Hero.tsx`

- [ ] **Step 1: Create `components/Hero.tsx`**

```tsx
// components/Hero.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const subtitles = [
  'Senior PM–Technical @ Amazon',
  "MBA '26 · UCLA Anderson",
  'Co-founder @ Apocrypha',
]

export default function Hero() {
  const [index, setIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [typing, setTyping] = useState(true)

  useEffect(() => {
    const target = subtitles[index]
    if (typing) {
      if (displayed.length < target.length) {
        const t = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 60)
        return () => clearTimeout(t)
      } else {
        const t = setTimeout(() => setTyping(false), 2000)
        return () => clearTimeout(t)
      }
    } else {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 30)
        return () => clearTimeout(t)
      } else {
        setIndex((i) => (i + 1) % subtitles.length)
        setTyping(true)
      }
    }
  }, [displayed, typing, index])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-2xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-16 w-full">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
          {/* Text content */}
          <motion.div
            className="flex-1 order-2 md:order-1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <p className="text-accent font-mono text-sm tracking-widest uppercase mb-4">
              Available · Seattle, WA
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-text leading-none mb-6">
              Pedro<br />de la Barra
            </h1>
            <div className="h-8 mb-4">
              <span className="font-mono text-accent text-lg">
                {displayed}
                <span className="animate-pulse">|</span>
              </span>
            </div>
            <p className="text-muted text-lg mb-10 max-w-md">
              Building at the intersection of AI, data, and product.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#projects"
                className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-body font-medium rounded-lg transition-colors duration-200"
              >
                View My Work
              </a>
              <a
                href="https://www.linkedin.com/in/pedro-de-la-barra/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-border hover:border-accent text-muted hover:text-text font-body font-medium rounded-lg transition-colors duration-200"
              >
                LinkedIn ↗
              </a>
            </div>
          </motion.div>

          {/* Photo placeholder */}
          <motion.div
            className="order-1 md:order-2 flex-shrink-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {/* TODO: Replace with /public/pedro-photo.jpg */}
            <div className="photo-placeholder w-64 h-64 md:w-80 md:h-80 rounded-full border-2 border-accent/30 bg-surface flex items-center justify-center">
              <span className="font-display text-6xl font-bold text-accent/40">PdlB</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/Hero.tsx
git commit -m "feat: add Hero with typed subtitle animation and gradient mesh background"
```

---

### Task 5: About component

**Files:**
- Create: `components/About.tsx`

- [ ] **Step 1: Create `components/About.tsx`**

```tsx
// components/About.tsx
'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

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
          Chilean Industrial Engineer turned product leader. I move from data to strategy to execution —
          and I ship things that work at scale.
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-surface border border-border rounded-xl p-6"
            >
              <div className="font-display text-3xl font-bold text-accent mb-1">{s.value}</div>
              <div className="font-body font-medium text-text text-sm mb-1">{s.label}</div>
              <div className="text-muted text-xs">{s.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Narrative */}
        <div className="max-w-3xl space-y-4 text-muted leading-relaxed">
          <p>
            Industrial Engineer from PUC Chile. Started as an Investment Analyst, became a Product Owner,
            built an Innovation unit from scratch, moved into Data Science at BCI — Chile&apos;s 3rd largest bank —
            and then earned a merit fellowship MBA at UCLA Anderson.
          </p>
          <p>
            Now joining Amazon as a Senior PM–Technical (L6) while wrapping up a venture project, Apocrypha,
            where I built knowledge graph middleware for enterprise AI agents and took it to enterprise pilot stage.
          </p>
          <p>
            Husband to Renatta. Rower. Runner. Outdoor junkie. Bilingual — Spanish native, English fluent.
            Los Angeles, CA. Open to Seattle.
          </p>
        </div>
      </motion.div>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/About.tsx
git commit -m "feat: add About with bio, stat row, and scroll animation"
```

---

## Chunk 3: Experience + Projects + Education

### Task 6: Experience component (vertical timeline)

**Files:**
- Create: `components/Experience.tsx`

- [ ] **Step 1: Create `components/Experience.tsx`**

```tsx
// components/Experience.tsx
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
      'Launched company\'s first offshore fixed-income fund; led roadshow and investor relations → raised $10M in 2 months.',
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
          {/* Vertical line */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border ml-3" />

          <div className="space-y-12">
            {jobs.map((job, i) => (
              <motion.div
                key={`${job.company}-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative pl-12"
              >
                {/* Dot */}
                <div className="absolute left-0 top-1.5 w-7 h-7 rounded-full bg-surface border-2 border-accent flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>

                <div className="bg-surface border border-border rounded-xl p-6 hover:border-accent/50 transition-colors duration-200">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                    <div>
                      <span className="font-display font-bold text-text text-xl">{job.company}</span>
                      <span className="text-muted mx-2">·</span>
                      <span className="font-body font-medium text-accent">{job.role}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-muted text-sm font-mono">{job.dates}</div>
                      <div className="text-muted text-xs">{job.location}</div>
                    </div>
                  </div>
                  {job.blurb && (
                    <p className="text-muted text-sm italic mb-3">{job.blurb}</p>
                  )}
                  <ul className="space-y-2">
                    {job.bullets.map((b, j) => (
                      <li key={j} className="text-muted text-sm flex gap-2">
                        <span className="text-accent mt-1 shrink-0">→</span>
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/Experience.tsx
git commit -m "feat: add Experience vertical timeline with 5 entries"
```

---

### Task 7: Projects component

**Files:**
- Create: `components/Projects.tsx`

- [ ] **Step 1: Create `components/Projects.tsx`**

```tsx
// components/Projects.tsx
'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const projects = [
  {
    name: 'Apocrypha',
    description:
      'Venture project built during MBA. Knowledge graph middleware for enterprise AI agents — contextualizing fragmented data for LLM-powered workflows. Took to enterprise pilot stage with Domino\'s.',
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-surface border border-border rounded-xl p-6 flex flex-col hover:border-accent/50 transition-colors duration-200 group"
            >
              <h3 className="font-display font-bold text-text text-lg mb-3 group-hover:text-accent transition-colors">
                {p.name}
              </h3>
              <p className="text-muted text-sm leading-relaxed flex-1 mb-4">{p.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-xs text-accent bg-accent/10 px-2 py-1 rounded-full"
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
                  className="text-sm text-muted hover:text-accent transition-colors font-mono"
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/Projects.tsx
git commit -m "feat: add Projects card grid with 5 entries"
```

---

### Task 8: Education component

**Files:**
- Create: `components/Education.tsx`

- [ ] **Step 1: Create `components/Education.tsx`**

```tsx
// components/Education.tsx
'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const schools = [
  {
    school: 'UCLA Anderson School of Management',
    degree: 'MBA, Technology Management',
    period: '2024 – 2026',
    location: 'Los Angeles, CA',
    highlight: 'Merit Fellowship Award — 80% of tuition',
    bullets: [
      'VP Social & Inclusion — Latin America Business Association (LABA)',
      'VP Social — Soccer Club',
      'Member — Technology Business Association (AnderTech)',
      'Co-founded Apocrypha (AI/SaaS venture) during MBA',
    ],
  },
  {
    school: 'Pontificia Universidad Católica de Chile',
    degree: 'B.S.E. Industrial Engineering',
    period: '2014 – 2019',
    location: 'Santiago, Chile',
    highlight: 'Major: Operations Research · Minor: Transportation Systems',
    bullets: [
      'Adjunct professor — Project Evaluation course',
      'Captain of 5 amateur soccer teams',
      'Strong foundation in statistics, algorithms, and financial engineering',
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
              className="bg-surface border border-border rounded-xl p-8 hover:border-accent/50 transition-colors duration-200"
            >
              <p className="text-muted font-mono text-xs mb-2">{s.period} · {s.location}</p>
              <h3 className="font-display font-bold text-text text-xl mb-1">{s.school}</h3>
              <p className="text-accent font-body font-medium mb-3">{s.degree}</p>
              <p className="text-muted text-sm italic mb-4">{s.highlight}</p>
              <ul className="space-y-2">
                {s.bullets.map((b) => (
                  <li key={b} className="text-muted text-sm flex gap-2">
                    <span className="text-accent shrink-0">·</span>
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/Education.tsx
git commit -m "feat: add Education two-card layout (UCLA Anderson + PUC Chile)"
```

---

## Chunk 4: Skills + Contact + Assembly + Deployment

### Task 9: Skills component

**Files:**
- Create: `components/Skills.tsx`

- [ ] **Step 1: Create `components/Skills.tsx`**

```tsx
// components/Skills.tsx
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
        <h2 className="font-display text-4xl md:text-5xl font-bold text-text mb-16">
          Toolkit
        </h2>

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
                    className="font-mono text-sm text-accent bg-accent/10 border border-accent/20 px-3 py-1.5 rounded-full hover:bg-accent/20 transition-colors"
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
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/Skills.tsx
git commit -m "feat: add Skills grouped pill badges"
```

---

### Task 10: Contact component

**Files:**
- Create: `components/Contact.tsx`

- [ ] **Step 1: Create `components/Contact.tsx`**

```tsx
// components/Contact.tsx
'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

export default function Contact() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Message from ${form.name}`)
    const body = encodeURIComponent(`${form.message}\n\nFrom: ${form.name} <${form.email}>`)
    window.location.href = `mailto:pedro.de.la.barra.2026@anderson.ucla.edu?subject=${subject}&body=${body}`
  }

  return (
    <section id="contact" ref={ref} className="py-24 max-w-6xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center"
      >
        <p className="text-accent font-mono text-sm tracking-widest uppercase mb-3">Contact</p>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-text mb-6">
          Let&apos;s Talk
        </h2>
        <p className="text-muted mb-12">
          Open to new opportunities, partnerships, and interesting conversations.
        </p>

        {/* Icon buttons */}
        <div className="flex justify-center gap-4 flex-wrap mb-16">
          <a
            href="mailto:pedro.de.la.barra.2026@anderson.ucla.edu"
            className="flex items-center gap-2 px-5 py-3 bg-surface border border-border hover:border-accent rounded-lg text-muted hover:text-text transition-colors text-sm font-mono"
          >
            ✉ Email
          </a>
          <a
            href="https://www.linkedin.com/in/pedro-de-la-barra/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 bg-surface border border-border hover:border-accent rounded-lg text-muted hover:text-text transition-colors text-sm font-mono"
          >
            in LinkedIn ↗
          </a>
          <a
            href="https://github.com/padelabarra"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 bg-surface border border-border hover:border-accent rounded-lg text-muted hover:text-text transition-colors text-sm font-mono"
          >
            ⌥ GitHub ↗
          </a>
        </div>

        {/* Contact form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <input
            type="text"
            placeholder="Your name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text placeholder-muted font-body focus:outline-none focus:border-accent transition-colors"
          />
          <input
            type="email"
            placeholder="Your email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text placeholder-muted font-body focus:outline-none focus:border-accent transition-colors"
          />
          <textarea
            placeholder="Your message"
            required
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-text placeholder-muted font-body focus:outline-none focus:border-accent transition-colors resize-none"
          />
          <button
            type="submit"
            className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-body font-medium rounded-lg transition-colors duration-200"
          >
            Send Message
          </button>
        </form>

        {/* Footer note */}
        <p className="text-muted text-xs mt-12 font-mono">
          Teaching AI to predict markets and soccer scores — while being taught how not to crash in wakeboarding.
        </p>
        <p className="text-muted/50 text-xs mt-2">
          Los Angeles, CA · Open to Seattle · pedro.de.la.barra.2026@anderson.ucla.edu
        </p>
      </motion.div>
    </section>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add components/Contact.tsx
git commit -m "feat: add Contact section with mailto form and icon buttons"
```

---

### Task 11: Wire page.tsx and layout.tsx

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx` with assembled single-page layout**

```tsx
// app/page.tsx
import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Experience from '@/components/Experience'
import Projects from '@/components/Projects'
import Education from '@/components/Education'
import Skills from '@/components/Skills'
import Contact from '@/components/Contact'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Education />
        <Skills />
        <Contact />
      </main>
    </>
  )
}
```

- [ ] **Step 2: Full build check**

```bash
npm run build
```
Expected: `✓ Compiled successfully`, zero TypeScript errors, all routes listed.

- [ ] **Step 3: Spot-check dev server**

```bash
npm run dev
```
Open `http://localhost:3000` and verify: all sections render, typed animation works, scroll animations trigger, nav links scroll correctly.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: wire all components into single-page layout"
```

---

### Task 12: Vercel deployment setup

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Create `vercel.json`**

```json
{
  "framework": "nextjs"
}
```

- [ ] **Step 2: Push repo to GitHub and deploy to Vercel**

```bash
# Create GitHub repo (if not exists)
gh repo create padelabarra/personal-website --public --source=. --remote=origin --push
```

Then go to vercel.com → Import Project → select `padelabarra/personal-website` → Deploy.
Or via CLI:

```bash
npx vercel --prod
```

- [ ] **Step 3: Verify live URL loads correctly**

Open the Vercel deployment URL. Check: hero animation, all sections visible, mobile responsive (use Chrome DevTools).

- [ ] **Step 4: Commit vercel.json**

```bash
git add vercel.json
git commit -m "chore: add vercel.json config"
git push origin main
```

---

### Task 13: SEO — sitemap + robots

**Files:**
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`

- [ ] **Step 1: Create `app/sitemap.ts`**

```ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://padelabarra.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]
}
```

- [ ] **Step 2: Create `app/robots.ts`**

```ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://padelabarra.vercel.app/sitemap.xml',
  }
}
```

- [ ] **Step 3: Build and verify routes**

```bash
npm run build
```
Expected: `/sitemap.xml` and `/robots.txt` listed in build output.

- [ ] **Step 4: Commit and push**

```bash
git add app/sitemap.ts app/robots.ts
git commit -m "feat: add sitemap.xml and robots.txt for SEO"
git push origin main
```

---

## Done

After Task 13, the site is live on Vercel with:
- All 7 sections assembled and animated
- SEO meta, OG tags, sitemap, robots
- Typed hero subtitle, scroll animations, mobile responsive
- Photo placeholder ready for `public/pedro-photo.jpg` swap
