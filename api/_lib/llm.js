// HealthVerse — Provider-Agnostic LLM Helper & Rate Limiter (Serverless Only)
import { cleanString } from './http.js';

const DEFAULT_TIMEOUT_MS = 20000;
const MAX_OUTPUT_TOKENS_CAP = 700;
const RATE_BUCKETS = new Map();

export class LlmApiError extends Error {
  constructor(statusCode, message, code = 'AI_ERROR') {
    super(message);
    this.name = 'LlmApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Extract client IP cleanly without storing full header strings.
 */
function getClientIp(req) {
  const fwd = req?.headers?.['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.trim()) {
    return fwd.split(',')[0].trim().slice(0, 64);
  }
  const realIp = req?.headers?.['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) {
    return realIp.trim().slice(0, 64);
  }
  return String(req?.socket?.remoteAddress || 'unknown').slice(0, 64);
}

/**
 * Best-effort in-memory sliding-window rate limiter per endpoint key and IP.
 */
export function checkRateLimit(req, { key = 'ai', limit = 20, windowMs = 60000 } = {}) {
  const now = Date.now();
  const bucketKey = `${key}:${getClientIp(req)}`;

  // Prune stale buckets periodically so warm serverless instances stay bounded
  if (RATE_BUCKETS.size > 500) {
    for (const [k, stamps] of RATE_BUCKETS.entries()) {
      const fresh = stamps.filter((ts) => now - ts < windowMs);
      if (fresh.length === 0) RATE_BUCKETS.delete(k);
      else RATE_BUCKETS.set(k, fresh);
    }
  }

  const existing = (RATE_BUCKETS.get(bucketKey) || []).filter((ts) => now - ts < windowMs);
  if (existing.length >= limit) {
    const oldest = existing[0];
    const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    RATE_BUCKETS.set(bucketKey, existing);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  existing.push(now);
  RATE_BUCKETS.set(bucketKey, existing);
  return { allowed: true, remaining: Math.max(0, limit - existing.length), retryAfterSec: 0 };
}

/**
 * Defensively extract a JSON object/array from LLM text output.
 */
export function parseJsonDefensively(rawText) {
  if (typeof rawText !== 'string') return null;
  let cleaned = rawText.trim();
  if (!cleaned) return null;

  // Strip Markdown code fences if present
  cleaned = cleaned
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Fall through to bracket-bounded extraction
  }

  const firstObj = cleaned.indexOf('{');
  const lastObj = cleaned.lastIndexOf('}');
  if (firstObj !== -1 && lastObj > firstObj) {
    try {
      return JSON.parse(cleaned.slice(firstObj, lastObj + 1));
    } catch {
      // Ignore and try array bounds
    }
  }

  const firstArr = cleaned.indexOf('[');
  const lastArr = cleaned.lastIndexOf(']');
  if (firstArr !== -1 && lastArr > firstArr) {
    try {
      return JSON.parse(cleaned.slice(firstArr, lastArr + 1));
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Normalize messages to { role: 'user' | 'assistant', content: string }.
 */
function normalizeMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new LlmApiError(400, 'At least one message is required.', 'AI_BAD_INPUT');
  }
  return messages
    .map((m) => {
      const role = m?.role === 'assistant' || m?.role === 'model' ? 'assistant' : 'user';
      const content = cleanString(String(m?.content || ''), 2400);
      return content ? { role, content } : null;
    })
    .filter(Boolean);
}

/**
 * Map upstream provider failure codes cleanly without echoing secrets or stack details.
 */
function mapUpstreamStatus(status) {
  if (status === 429) {
    return new LlmApiError(429, 'AI service is busy right now. Please try again shortly.', 'AI_RATE_LIMITED');
  }
  if (status === 401 || status === 403) {
    return new LlmApiError(503, 'AI service configuration needs attention.', 'AI_AUTH_ERROR');
  }
  if (status >= 500) {
    return new LlmApiError(502, 'AI service is temporarily unavailable. Please retry.', 'AI_UPSTREAM_ERROR');
  }
  return new LlmApiError(502, 'Unable to process AI request.', 'AI_REQUEST_FAILED');
}

async function callAnthropic({ apiKey, model, system, messages, maxTokens, temperature, signal }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      ...(system ? { system } : {}),
      messages: messages.map((m) => ({ role: m.role, content: m.content }))
    }),
    signal
  });

  if (!res.ok) {
    throw mapUpstreamStatus(res.status);
  }

  const data = await res.json().catch(() => null);
  const text = Array.isArray(data?.content)
    ? data.content
        .filter((part) => part?.type === 'text' && typeof part.text === 'string')
        .map((part) => part.text)
        .join('\n')
        .trim()
    : '';

  if (!text) {
    throw new LlmApiError(502, 'AI service returned an empty response.', 'AI_EMPTY_RESPONSE');
  }

  return text;
}

async function callGemini({ apiKey, model, system, messages, maxTokens, temperature, json, signal }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const supportsThinkingBudget = /gemini-(?:2\.5|3|flash-latest|flash-lite)/i.test(model);

  const body = {
    contents: messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    })),
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature,
      ...(json ? { responseMimeType: 'application/json' } : {}),
      ...(supportsThinkingBudget ? { thinkingConfig: { thinkingBudget: 0 } } : {})
    }
  };

  if (system) {
    body.systemInstruction = {
      parts: [{ text: system }]
    };
  }

  let res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify(body),
    signal
  });

  if (res.status === 503 && !signal?.aborted) {
    await new Promise((r) => setTimeout(r, 600));
    res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(body),
      signal
    });
  }

  if (!res.ok) {
    throw mapUpstreamStatus(res.status);
  }

  const data = await res.json().catch(() => null);
  const parts = data?.candidates?.[0]?.content?.parts;
  const text = Array.isArray(parts)
    ? parts
        .filter((p) => typeof p?.text === 'string' && !p.thought)
        .map((p) => p.text)
        .join('\n')
        .trim()
    : '';

  if (!text) {
    throw new LlmApiError(502, 'AI service returned an empty response.', 'AI_EMPTY_RESPONSE');
  }

  return text;
}

/**
 * Provider-agnostic serverless LLM caller supporting Anthropic Claude and Google Gemini.
 */
export async function callLLM({
  system = '',
  messages = [],
  json = false,
  maxOutputTokens = 700,
  temperature = 0.25
} = {}) {
  const apiKey = String(process.env.AI_API_KEY || '').trim();
  if (!apiKey) {
    throw new LlmApiError(503, 'AI assistant is not configured on the server.', 'AI_NOT_CONFIGURED');
  }

  const rawProvider = cleanString(process.env.AI_PROVIDER || 'gemini', 32).toLowerCase();
  const provider = rawProvider === 'claude' ? 'anthropic' : rawProvider;
  if (provider !== 'anthropic' && provider !== 'gemini') {
    throw new LlmApiError(500, 'Configured AI provider is unsupported.', 'AI_CONFIG_INVALID');
  }

  const defaultModel = provider === 'anthropic' ? 'claude-3-5-sonnet-latest' : 'gemini-3.5-flash';
  const model = cleanString(process.env.AI_MODEL || defaultModel, 100) || defaultModel;
  const maxTokens = Math.min(Math.max(64, Math.floor(Number(maxOutputTokens) || MAX_OUTPUT_TOKENS_CAP)), MAX_OUTPUT_TOKENS_CAP);
  const normalizedMessages = normalizeMessages(messages);
  if (normalizedMessages.length === 0) {
    throw new LlmApiError(400, 'Please enter a valid message.', 'AI_EMPTY_INPUT');
  }

  const safeSystem = cleanString(String(system || ''), 4000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const text =
      provider === 'anthropic'
        ? await callAnthropic({
            apiKey,
            model,
            system: safeSystem,
            messages: normalizedMessages,
            maxTokens,
            temperature,
            signal: controller.signal
          })
        : await callGemini({
            apiKey,
            model,
            system: safeSystem,
            messages: normalizedMessages,
            maxTokens,
            temperature,
            json,
            signal: controller.signal
          });

    const parsed = json ? parseJsonDefensively(text) : null;
    if (json && !parsed) {
      throw new LlmApiError(502, 'AI response format was unexpected. Please try again.', 'AI_PARSE_ERROR');
    }

    return { text, parsed, provider, model };
  } catch (err) {
    if (err instanceof LlmApiError) throw err;
    if (err?.name === 'AbortError') {
      throw new LlmApiError(504, 'AI request timed out. Please try again.', 'AI_TIMEOUT');
    }
    throw new LlmApiError(502, 'Unable to reach AI service right now.', 'AI_NETWORK_ERROR');
  } finally {
    clearTimeout(timer);
  }
}
