import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  let body: { name?: string; email?: string; message?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const name = (body.name ?? '').trim()
  const email = (body.email ?? '').trim()
  const message = (body.message ?? '').trim()

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Name, email, and message are all required.' }, { status: 400 })
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const gmailUser = process.env.GMAIL_USER
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD

  if (!gmailUser || !gmailAppPassword) {
    console.error('Contact form: GMAIL_USER or GMAIL_APP_PASSWORD is not configured.')
    return NextResponse.json({ error: 'Email is not configured on the server.' }, { status: 500 })
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  })

  try {
    await transporter.sendMail({
      from: gmailUser,
      to: gmailUser,
      replyTo: email,
      subject: `Personal Website Contact + ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    })
  } catch (err) {
    console.error('Contact form: failed to send email.', err)
    return NextResponse.json({ error: 'Failed to send message. Please try again later.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
