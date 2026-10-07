const json = (body, status = 200) => Response.json(body, {
  status,
  headers: {
    'Cache-Control': 'no-store',
  },
})

const normalizeLine = (value, maxLength) => String(value ?? '')
  .replace(/[\r\n]+/g, ' ')
  .trim()
  .slice(0, maxLength)

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed.' }, 405)
    }

    const contentLength = Number(request.headers.get('content-length') || 0)
    if (contentLength > 20_000) {
      return json({ error: 'Message is too large.' }, 413)
    }

    let payload
    try {
      payload = await request.json()
    } catch {
      return json({ error: 'Invalid request.' }, 400)
    }

    // Bots commonly fill this visually hidden field. Return success without
    // sending so the field remains an effective, unobtrusive honeypot.
    if (String(payload.company ?? '').trim()) {
      return json({ ok: true })
    }

    const requestType = normalizeLine(payload.requestType, 20)
    const email = normalizeLine(payload.email, 254).toLowerCase()
    let subject
    let emailText

    if (requestType === 'tour') {
      const firstName = normalizeLine(payload.firstName, 50)
      const lastName = normalizeLine(payload.lastName, 50)
      const phone = normalizeLine(payload.phone, 50)
      const home = normalizeLine(payload.home, 150)
      const community = normalizeLine(payload.community, 150)
      const message = String(payload.message ?? '').trim().slice(0, 5_000)

      if (!firstName || !lastName || !isEmail(email) || !phone || !home || !community) {
        return json({ error: 'Please complete all required tour-request fields.' }, 400)
      }

      subject = `Tour Request: ${home} — ${community}`
      emailText = [
        'A new tour request was submitted through the Schottenstein Homes website.',
        '',
        `Home: ${home}`,
        `Community: ${community}`,
        `Name: ${firstName} ${lastName}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        '',
        'Message:',
        message || 'No additional message provided.',
      ].join('\n')
    } else {
      const name = normalizeLine(payload.name, 100)
      const message = String(payload.message ?? '').trim().slice(0, 5_000)
      const community = normalizeLine(payload.community, 150)

      if (!name || !isEmail(email) || !message) {
        return json({ error: 'Please provide your name, a valid email, and a message.' }, 400)
      }

      subject = requestType === 'community-tour' && community
        ? `Tour Request: ${community}`
        : `New website inquiry from ${name}`
      emailText = [
        requestType === 'community-tour'
          ? 'A new community tour request was submitted through the Schottenstein Homes website.'
          : 'A new message was submitted through the Schottenstein Homes website.',
        '',
        ...(community ? [`Community: ${community}`] : []),
        `Name: ${name}`,
        `Email: ${email}`,
        '',
        'Message:',
        message,
      ].join('\n')
    }

    const apiKey = process.env.RESEND_API_KEY
    const toEmail = process.env.CONTACT_TO_EMAIL
    const fromEmail = process.env.CONTACT_FROM_EMAIL || 'Schottenstein Homes Website <onboarding@resend.dev>'

    if (!apiKey || !toEmail) {
      console.error('Contact form email environment variables are not configured.')
      return json({ error: 'Email delivery is not configured yet.' }, 503)
    }

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject,
        text: emailText,
      }),
    })

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text()
      console.error('Resend rejected the contact email:', resendResponse.status, errorBody)
      return json({ error: 'We could not send your message. Please try again shortly.' }, 502)
    }

    return json({ ok: true })
  },
}
