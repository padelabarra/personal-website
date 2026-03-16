'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

const photos = [
  {
    src: '/gallery/photo-1.jpg',
    caption: 'Parker Ridge — Banff National Park, Canada',
  },
  {
    src: '/gallery/photo-2.jpg',
    caption: 'Abraham Lake Summit — Alberta, Canada',
  },
  {
    src: '/gallery/photo-3.jpg',
    caption: 'The Narrows — Zion National Park, Utah',
  },
  {
    src: '/gallery/photo-4.jpg',
    caption: 'Glacier Viewpoint — Jasper National Park, Canada',
  },
  {
    src: '/gallery/photo-5.jpg',
    caption: 'Hanging Bridges Trail — Arenal, Costa Rica',
  },
]

export default function PhotoSlider() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)

  const next = useCallback(() => {
    setDirection(1)
    setCurrent((i) => (i + 1) % photos.length)
  }, [])

  const prev = () => {
    setDirection(-1)
    setCurrent((i) => (i - 1 + photos.length) % photos.length)
  }

  const goTo = (i: number) => {
    setDirection(i > current ? 1 : -1)
    setCurrent(i)
  }

  // Auto-advance every 5s
  useEffect(() => {
    const t = setInterval(next, 5000)
    return () => clearInterval(t)
  }, [next])

  return (
    <section className="py-24 max-w-6xl mx-auto px-6">
      <p className="text-accent font-mono text-sm tracking-widest uppercase mb-3">Beyond the Screen</p>
      <h2 className="font-display text-4xl md:text-5xl font-bold text-text mb-16">
        Life Outside Work
      </h2>

      <div className="relative overflow-hidden rounded-2xl bg-surface border border-border" style={{ aspectRatio: '16/9' }}>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={{
              enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={photos[current].src}
              alt={photos[current].caption}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1200px"
            />
            {/* Caption overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-6 py-5">
              <p className="text-white font-mono text-sm">{photos[current].caption}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Arrow buttons */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-accent/80 border border-white/20 text-white flex items-center justify-center transition-colors duration-200 z-10"
          aria-label="Previous photo"
        >
          ←
        </button>
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-accent/80 border border-white/20 text-white flex items-center justify-center transition-colors duration-200 z-10"
          aria-label="Next photo"
        >
          →
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-5">
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              i === current ? 'bg-accent w-6' : 'bg-border hover:bg-muted'
            }`}
            aria-label={`Go to photo ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
