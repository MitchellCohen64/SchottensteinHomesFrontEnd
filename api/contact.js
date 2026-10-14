const json = (body, status = 200, headers = {}) => Response.json(body, {
  status,
  headers: {
    'Cache-Control': 'no-store',
    ...headers,
  },
})

const rateLimitPolicies = [
  { scope: 'ip', windowSeconds: 10 * 60, maximum: 5 },
  { scope: 'ip', windowSeconds: 24 * 60 * 60, maximum: 20 },
  { scope: 'email', windowSeconds: 10 * 60, maximum: 3 },
  { scope: 'email', windowSeconds: 24 * 60 * 60, maximum: 10 },
]

const hashIdentifier = async (value, secret) => {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value))
  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

const clientIpFor = (request) => {
  const forwarded = request.headers.get('x-vercel-forwarded-for')
    || request.headers.get('x-forwarded-for')
    || request.headers.get('x-real-ip')
    || 'unknown'

  return forwarded.split(',')[0].trim() || 'unknown'
}

const checkRateLimit = async (request, email) => {
  const redisUrl = (
    process.env.UPSTASH_REDIS_REST_URL
    || process.env.KV_REST_API_URL
  )?.replace(/\/$/, '')
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
    || process.env.KV_REST_API_TOKEN
  const hashSecret = process.env.RATE_LIMIT_SECRET

  if (!redisUrl || !redisToken || !hashSecret) {
    throw new Error('Contact rate limiting is not configured.')
  }
  if (new TextEncoder().encode(hashSecret).byteLength < 32) {
    throw new Error('RATE_LIMIT_SECRET must be at least 32 bytes.')
  }

  const identifiers = {
    ip: await hashIdentifier(clientIpFor(request), hashSecret),
    email: await hashIdentifier(email, hashSecret),
  }
  const nowSeconds = Math.floor(Date.now() / 1000)
  const commands = []
  const evaluatedPolicies = rateLimitPolicies.map((policy) => {
    const bucket = Math.floor(nowSeconds / policy.windowSeconds)
    const key = `contact:${policy.scope}:${identifiers[policy.scope]}:${policy.windowSeconds}:${bucket}`

    commands.push(['INCR', key], ['EXPIRE', key, policy.windowSeconds + 60])
    return {
      ...policy,
      retryAfter: policy.windowSeconds - (nowSeconds % policy.windowSeconds),
    }
  })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3_000)
  let response

  try {
    response = await fetch(`${redisUrl}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${redisToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commands),
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok) {
    throw new Error(`Rate-limit store rejected the request with status ${response.status}.`)
  }

  const results = await response.json()
  if (!Array.isArray(results) || results.length !== commands.length) {
    throw new Error('Rate-limit store returned an invalid response.')
  }

  const violations = evaluatedPolicies.filter((policy, index) => {
    const countResult = results[index * 2]
    const expiryResult = results[index * 2 + 1]
    const count = Number(countResult?.result)
    if (
      countResult?.error
      || expiryResult?.error
      || !Number.isInteger(count)
      || count < 1
      || Number(expiryResult?.result) !== 1
    ) {
      throw new Error('Rate-limit store could not update a counter.')
    }
    return count > policy.maximum
  })

  return {
    allowed: violations.length === 0,
    retryAfter: violations.length
      ? Math.max(...violations.map(({ retryAfter }) => retryAfter))
      : 0,
  }
}

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

    let rateLimit
    try {
      rateLimit = await checkRateLimit(request, email)
    } catch (error) {
      console.error('Contact rate limiting is unavailable:', error.message)
      return json({ error: 'Message delivery is temporarily unavailable. Please try again shortly.' }, 503)
    }

    if (!rateLimit.allowed) {
      return json(
        { error: 'Too many messages have been submitted. Please try again later.' },
        429,
        { 'Retry-After': String(rateLimit.retryAfter) },
      )
    }

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
