// HealthVerse — Shared Serverless HTTP & Security Helpers

const SAFE_CHARS_RE = /[\u0000-\u001F\u007F]/g;

/**
 * Send a JSON response with security headers.
 */
export function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(payload));
}

/**
 * Enforce POST method and same-origin requests.
 */
export function enforcePostSameOrigin(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, { error: 'Method not allowed. Use POST.' });
    return false;
  }

  const secFetchSite = String(req.headers['sec-fetch-site'] || '').toLowerCase();
  if (secFetchSite === 'cross-site') {
    sendJson(res, 403, { error: 'Cross-origin requests are not allowed.' });
    return false;
  }

  const rawHost = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim().toLowerCase();
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  const normalizeHost = (host) => host.replace(/^127\.0\.0\.1(?=:|$)/, 'localhost');

  if (origin) {
    try {
      const originHost = normalizeHost(new URL(origin).host.toLowerCase());
      if (rawHost && originHost !== normalizeHost(rawHost)) {
        sendJson(res, 403, { error: 'Cross-origin requests are not allowed.' });
        return false;
      }
    } catch {
      sendJson(res, 403, { error: 'Invalid request origin.' });
      return false;
    }
  } else if (referer) {
    try {
      const refHost = normalizeHost(new URL(referer).host.toLowerCase());
      if (rawHost && refHost !== normalizeHost(rawHost)) {
        sendJson(res, 403, { error: 'Cross-origin requests are not allowed.' });
        return false;
      }
    } catch {
      sendJson(res, 403, { error: 'Invalid request referer.' });
      return false;
    }
  }

  return true;
}

/**
 * Safely parse JSON request body with strict byte-size enforcement.
 */
export async function readJsonBody(req, maxBytes = 16384) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      const approxBytes = Buffer.byteLength(JSON.stringify(req.body), 'utf8');
      if (approxBytes > maxBytes) {
        const err = new Error('Request payload too large.');
        err.statusCode = 413;
        throw err;
      }
      return req.body;
    }
    if (typeof req.body === 'string') {
      if (Buffer.byteLength(req.body, 'utf8') > maxBytes) {
        const err = new Error('Request payload too large.');
        err.statusCode = 413;
        throw err;
      }
      try {
        return JSON.parse(req.body || '{}');
      } catch {
        const err = new Error('Invalid JSON payload.');
        err.statusCode = 400;
        throw err;
      }
    }
  }

  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buf.length;
    if (total > maxBytes) {
      const err = new Error('Request payload too large.');
      err.statusCode = 413;
      throw err;
    }
    chunks.push(buf);
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    const err = new Error('Invalid JSON payload.');
    err.statusCode = 400;
    throw err;
  }
}

export function cleanString(val, maxLen = 200) {
  if (typeof val !== 'string') return '';
  return val.replace(SAFE_CHARS_RE, ' ').trim().slice(0, maxLen);
}
