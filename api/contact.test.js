import assert from 'node:assert/strict'
import test from 'node:test'
import contactHandler from './contact.js'

const requestFor = (body) => new Request('https://example.com/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

test('rejects invalid input before checking delivery configuration', async () => {
  const response = await contactHandler.fetch(requestFor({
    name: 'x'.repeat(101),
    email: 'person@example.com',
    message: 'Hello',
    company: '',
  }))

  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { error: 'Name must be 100 characters or fewer.' })
})

test('rejects a completed honeypot field', async () => {
  const response = await contactHandler.fetch(requestFor({
    name: 'Test Person',
    email: 'person@example.com',
    message: 'Hello',
    company: 'Bot Company',
  }))

  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { error: 'Spam protection check failed.' })
})

test('returns the temporary-unavailable response after valid input when rate limiting is unconfigured', async () => {
  const originalConsoleError = console.error
  const errors = []
  console.error = (...args) => errors.push(args.join(' '))

  try {
    const response = await contactHandler.fetch(requestFor({
      name: 'Test Person',
      email: 'person@example.com',
      message: 'Hello',
      company: '',
    }))

    assert.equal(response.status, 503)
    assert.deepEqual(await response.json(), {
      error: 'Message delivery is temporarily unavailable. Please try again shortly.',
    })
    assert.match(errors.join('\n'), /UPSTASH_REDIS_REST_URL \(or KV_REST_API_URL\)/)
  } finally {
    console.error = originalConsoleError
  }
})
