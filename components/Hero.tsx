'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

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
        const t = setTimeout(() => setTyping(false), 2200)
        return () => clearTimeout(t)
      }
    } else {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 28)
        return () => clearTimeout(t)
      } else {
        setIndex((i) => (i + 1) % subtitles.length)
        setTyping(true)
      }
    }
  }, [displayed, typing, index])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated gradient mesh */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-accent/5 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-48 h-48 bg-blue-800/10 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: '2s' }}
        />
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
            <motion.p
              className="text-accent font-mono text-sm tracking-widest uppercase mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Los Angeles, CA · Open to Seattle
            </motion.p>

            <h1 className="font-display text-5xl md:text-7xl font-bold text-text leading-none mb-6 tracking-tight">
              Pedro
              <br />
              <span className="text-text/80">de la Barra</span>
            </h1>

            <div className="h-8 mb-4 flex items-center">
              <span className="font-mono text-accent text-base md:text-lg">
                {displayed}
                <span className="animate-pulse ml-0.5">|</span>
              </span>
            </div>

            <p className="text-muted text-lg mb-10 max-w-md leading-relaxed">
              Building at the intersection of AI, data, and product.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#projects"
                className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-body font-medium rounded-lg transition-colors duration-200 shadow-lg shadow-accent/20"
              >
                View My Work
              </a>
              <a
                href="https://www.linkedin.com/in/pedro-de-la-barra/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-border hover:border-accent text-muted hover:text-text font-body font-medium rounded-lg transition-all duration-200"
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
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          >
            <div className="photo-placeholder relative w-56 h-56 md:w-72 md:h-72">
              <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-accent/30">
                <Image
                  src="/pedro-photo.jpg"
                  alt="Pedro de la Barra at Horseshoe Bend"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
              <div className="absolute -inset-3 rounded-full border border-accent/20" />
              <div className="absolute -inset-6 rounded-full border border-accent/10" />
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div className="w-5 h-8 border border-muted/30 rounded-full flex justify-center pt-1.5">
            <motion.div
              className="w-1 h-1.5 bg-muted/50 rounded-full"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
