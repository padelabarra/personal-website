import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pedro de la Barra — Senior PM & AI Builder',
  description: "Chilean engineer, Amazon Senior PM–Technical (L6), MBA '26 UCLA Anderson. Building at the intersection of AI, data, and product.",
  keywords: ['Product Manager', 'Amazon', 'UCLA Anderson', 'AI', 'Data Science', 'Chile'],
  authors: [{ name: 'Pedro de la Barra' }],
  openGraph: {
    title: 'Pedro de la Barra — Senior PM & AI Builder',
    description: "Chilean engineer, Amazon Senior PM–Technical (L6), MBA '26 UCLA Anderson.",
    url: 'https://padelabarra.vercel.app',
    siteName: 'Pedro de la Barra',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pedro de la Barra — Senior PM & AI Builder',
    description: "Chilean engineer, Amazon Senior PM–Technical (L6), MBA '26 UCLA Anderson.",
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
