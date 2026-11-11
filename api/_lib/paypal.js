// HealthVerse — PayPal Server-Side OAuth Token & API Client
import crypto from 'node:crypto';

let tokenCache = {
  key: '',
  accessToken: '',
  expiresAt: 0
};

export function getPayPalBaseUrl() {
  const envName = String(process.env.PAYPAL_ENV || 'sandbox').trim().toLowerCase();
  return envName === 'live' || envName === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

export class PayPalApiError extends Error {
  constructor(message, statusCode = 502, code = 'PAYPAL_ERROR') {
    super(message);
    this.name = 'PayPalApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Fetches and caches a PayPal OAuth2 client-credentials token until expiry.
 */
export async function getPayPalAccessToken() {
  const clientId = String(process.env.PAYPAL_CLIENT_ID || '').trim();
  const clientSecret = String(process.env.PAYPAL_CLIENT_SECRET || '').trim();

  if (!clientId || !clientSecret) {
    throw new PayPalApiError(
      'PayPal server credentials are not configured.',
      503,
      'PAYPAL_NOT_CONFIGURED'
    );
  }

  const baseUrl = getPayPalBaseUrl();
  const cacheKey = `${baseUrl}::${clientId}`;
  const now = Date.now();

  if (tokenCache.accessToken && tokenCache.key === cacheKey && now < tokenCache.expiresAt) {
    return { accessToken: tokenCache.accessToken, baseUrl };
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials',
      signal: controller.signal
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.access_token) {
      throw new PayPalApiError(
        'Unable to authenticate with PayPal gateway.',
        res.status >= 400 && res.status < 500 ? 502 : 503,
        'PAYPAL_AUTH_FAILED'
      );
    }

    const expiresInSec = Math.max(Number(data.expires_in || 300), 60);
    tokenCache = {
      key: cacheKey,
      accessToken: data.access_token,
      expiresAt: now + (expiresInSec - 45) * 1000
    };

    return { accessToken: tokenCache.accessToken, baseUrl };
  } catch (err) {
    if (err instanceof PayPalApiError) throw err;
    if (err?.name === 'AbortError') {
      throw new PayPalApiError('PayPal authentication timed out.', 504, 'PAYPAL_TIMEOUT');
    }
    throw new PayPalApiError('Failed to connect to PayPal gateway.', 502, 'PAYPAL_NETWORK_ERROR');
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Performs an authenticated PayPal REST API call.
 */
export async function paypalRequest(path, { method = 'POST', body = undefined, requestId = null } = {}) {
  const { accessToken, baseUrl } = await getPayPalAccessToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
  if (requestId) {
    headers['PayPal-Request-Id'] = requestId;
  } else if (method === 'POST') {
    headers['PayPal-Request-Id'] = crypto.randomUUID();
  }

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const detail = Array.isArray(data?.details) && data.details[0]?.description
        ? data.details[0].description
        : data?.message || 'PayPal request was declined.';
      throw new PayPalApiError(
        String(detail).slice(0, 200),
        res.status >= 400 && res.status < 500 ? res.status : 502,
        data?.name || 'PAYPAL_REQUEST_FAILED'
      );
    }

    return data;
  } catch (err) {
    if (err instanceof PayPalApiError) throw err;
    if (err?.name === 'AbortError') {
      throw new PayPalApiError('PayPal request timed out.', 504, 'PAYPAL_TIMEOUT');
    }
    throw new PayPalApiError('Failed to reach PayPal API.', 502, 'PAYPAL_NETWORK_ERROR');
  } finally {
    clearTimeout(timeout);
  }
}
