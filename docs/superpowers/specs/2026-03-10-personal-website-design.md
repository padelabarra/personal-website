# Pedro de la Barra — Personal Website Design Spec
Date: 2026-03-10

## Overview
A single-page personal professional website for Pedro de la Barra — Chilean engineer, Amazon Senior PM–Technical (L6), and MBA candidate at UCLA Anderson. Modeled after the professional layout of arturo-herrera.com, adapted with Pedro's brand identity and modern animations.

## Tech Stack
- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + CSS custom properties
- **Animation:** Framer Motion (scroll-triggered, typed hero subtitle)
- **Deployment:** Vercel (GitHub push → auto-deploy)
- **Fonts:** Syne (headings) + DM Sans (body) via Google Fonts
- **No CMS, no database, no blog** — pure static portfolio

## Design System

### Colors
```
Background:   #0a0e1a  (dark navy)
Surface:      #111827  (cards, timeline entries)
Border:       #1e293b  (subtle dividers)
Accent:       #3b82f6  (electric blue)
Accent hover: #60a5fa
Text primary: #f8fafc
Text muted:   #94a3b8
```

### Typography
- Headings: **Syne** — geometric, distinctive
- Body: **DM Sans** — clean, readable
- Monospace: **JetBrains Mono** — skill tags

### Spacing
- Base grid: 8px
- Section padding: `py-24` (96px)
- Max content width: 1200px centered

## File Structure
```
personal-website/
├── app/
│   ├── layout.tsx        # Root layout, fonts, SEO meta, OG tags
│   ├── page.tsx          # Single page — all sections
│   └── globals.css       # Design tokens, custom CSS
├── components/
│   ├── Nav.tsx           # Sticky horizontal nav, smooth scroll, mobile hamburger
│   ├── Hero.tsx          # Full-viewport, typed subtitle, CTA buttons, photo placeholder
│   ├── About.tsx         # Bio + "By the Numbers" 4-stat row
│   ├── Experience.tsx    # Vertical timeline (Amazon → BCI → MBI)
│   ├── Projects.tsx      # 3-column card grid
│   ├── Education.tsx     # Two horizontal cards
│   ├── Skills.tsx        # Grouped pill badges
│   └── Contact.tsx       # Icon buttons + mailto form
├── public/
│   └── pedro-photo.jpg   # TODO: replace placeholder
└── vercel.json
```

## Section-by-Section Design

### 1. Nav
- Sticky top, dark navy with `backdrop-blur`
- Left: "PdlB" monogram in accent blue
- Right: smooth-scroll links — About · Experience · Projects · Education · Skills · Contact
- Mobile: hamburger menu with slide-down drawer

### 2. Hero
- Full viewport height
- Left 60%: "Pedro de la Barra" in large Syne, typed subtitle (3 roles cycling), tagline, two CTA buttons
- Right 40%: circular photo placeholder `<div class="photo-placeholder">` with `<!-- TODO: Replace with /public/pedro-photo.jpg -->`
- Background: subtle animated gradient mesh (blue/navy)
- Mobile: stacked vertically

**Hero subtitle order (typed/fading):**
1. "Senior PM–Technical @ Amazon"
2. "MBA '26 · UCLA Anderson"
3. "Co-founder @ Apocrypha"

**Tagline:** "Building at the intersection of AI, data, and product."

**CTA buttons:**
- Primary (filled blue): [View My Work] → scrolls to Projects
- Secondary (ghost border): [LinkedIn] → opens in new tab

### 3. About
- Short 3-sentence bio paragraph
- "By the Numbers" 4-column stat row with large accent-blue numbers:
  - 5+ years · Building data & AI products
  - $60M+ · New business generated
  - 85,000+ · Securities analyzed
  - 3 countries · Chile · USA · Internship track
- Full narrative paragraph below

### 4. Experience (Vertical Timeline)
Left rail: continuous blue vertical line with dot markers. Each entry: company name + role (large), dates + location (muted gray), italic company blurb, bullet points.

**Entries (top to bottom):**
1. Amazon — Senior PM–Technical (L6) | 2026–Present | Seattle, WA
2. Amazon — Senior PM–Technical Intern | June–Sept 2025 | Seattle, WA
3. BCI — Senior Data Scientist | June 2023–July 2024 | Santiago, Chile
4. MBI — Innovation Lead | Oct 2021–June 2023 | Santiago, Chile
5. MBI — Product Owner / Investment Analyst | June 2019–Oct 2021 | Santiago, Chile

### 5. Projects (Card Grid)
3-column grid (1 column on mobile). Each card: name, description, tag pills, optional GitHub link.

**Cards:**
1. **Apocrypha** — Venture project built during MBA. Knowledge graph middleware for enterprise AI agents. Enterprise pilot with Domino's. (Python · FastAPI · LangChain · RAG · Knowledge Graphs) — framed as a technical project, not a funded startup
2. **BankingClassification ML** — ML model for banking client classification. (Python · sklearn · Pandas) [GitHub]
3. **MBI Financial Platform** — Bloomberg BQL dashboards + Python automation for $1B+ AUM firm. (Python · Bloomberg API · Power BI · SQL)
4. **DataCamp ML Track** — Completed ML Scientist Career Track. (Python · Jupyter · sklearn · pandas) [GitHub]
5. **AllFunds Investment Platform** — Scaled AUM $18M → $54M in 8 months as Product Owner. (Product Strategy · FinTech · Operations)

### 6. Education (Two Cards)
Side-by-side horizontal cards:
- UCLA Anderson | MBA, Technology Management | Class of 2026 | Merit Fellowship (80% tuition) | LABA VP, Soccer Club VP, AnderTech
- PUC Chile | B.S.E. Industrial Engineering | Ops Research major | June 2019 | Adjunct professor, Soccer captain

### 7. Skills (Grouped Pills)
Group headers with pill badges:
- Programming & Data
- AI / ML
- Product
- Finance
- Cloud & Tools
- Languages

### 8. Contact
- Centered layout
- Icon buttons: Email · LinkedIn · GitHub
- 3-field mailto form: Name / Email / Message
- Certifications listed below form (Scrum Master, DataCamp ML Track)

## SEO & Meta
- Title: "Pedro de la Barra — Senior PM & AI Builder"
- Description: 140-char summary
- Open Graph + Twitter Card tags
- `robots.txt` + `sitemap.xml`

## Identity & Contact Data
- Email: pedro.de.la.barra.2026@anderson.ucla.edu
- Phone: (251) 278-7571
- LinkedIn: https://www.linkedin.com/in/pedro-de-la-barra/
- GitHub: https://github.com/padelabarra
- Location: Los Angeles, CA (open to Seattle)
- Languages: Spanish (native), English (fluent)

## Key Decisions
- Single-page scroll, not multi-page
- Vercel deployment (not GitHub Pages)
- Apocrypha framed as venture project, not funded startup — no "raising capital" language
- No press/media section
- Section order optimized for impact: Hero → About → Experience → Projects → Education → Skills → Contact
