'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

type SubmitStatus = 'idle' | 'sending' | 'success' | 'error'

export default function Contact() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<SubmitStatus>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    } catch {
      setStatus('error')
    }
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
        <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Let&apos;s Talk
        </h2>
        <p className="text-muted mb-12">
          Open to partnerships, collaborations, and interesting conversations.
        </p>

        {/* Icon buttons */}
        <div className="flex justify-center gap-3 flex-wrap mb-16">
          <a
            href="mailto:padelabarraos@gmail.com"
            className="flex items-center gap-2 px-5 py-3 bg-surface border border-border hover:border-accent rounded-lg text-muted hover:text-gray-900 transition-all duration-200 text-sm font-mono"
          >
            ✉ Email
          </a>
          <a
            href="https://www.linkedin.com/in/pedro-de-la-barra/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 bg-surface border border-border hover:border-accent rounded-lg text-muted hover:text-gray-900 transition-all duration-200 text-sm font-mono"
          >
            in LinkedIn ↗
          </a>
          <a
            href="https://github.com/padelabarra"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 bg-surface border border-border hover:border-accent rounded-lg text-muted hover:text-gray-900 transition-all duration-200 text-sm font-mono"
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
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-gray-900 placeholder:text-muted font-body focus:outline-none focus:border-accent transition-colors"
          />
          <input
            type="email"
            placeholder="Your email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-gray-900 placeholder:text-muted font-body focus:outline-none focus:border-accent transition-colors"
          />
          <textarea
            placeholder="Your message"
            required
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-gray-900 placeholder:text-muted font-body focus:outline-none focus:border-accent transition-colors resize-none"
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full py-3 bg-accent hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-body font-medium rounded-lg transition-colors duration-200"
          >
            {status === 'sending' ? 'Sending…' : 'Send Message'}
          </button>
          {status === 'success' && (
            <p className="text-sm text-accent font-mono text-center">
              Message sent — thanks for reaching out!
            </p>
          )}
          {status === 'error' && (
            <p className="text-sm text-red-500 font-mono text-center">
              Something went wrong. Please try again or email me directly.
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-muted text-sm font-mono mb-3">
            Teaching AI to predict markets and soccer scores — while being taught how not to crash in
            wakeboarding.
          </p>
          <p className="text-muted/50 text-xs">
            Bellevue, WA ·{' '}
            <a
              href="mailto:padelabarraos@gmail.com"
              className="hover:text-muted transition-colors"
            >
              padelabarraos@gmail.com
            </a>
          </p>
        </div>
      </motion.div>
    </section>
  )
}
