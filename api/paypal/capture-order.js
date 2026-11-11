// HealthVerse — Capture PayPal Checkout Order (Serverless Function)
import crypto from 'node:crypto';
import { enforcePostSameOrigin, readJsonBody, sendJson, cleanString } from '../_lib/http.js';
import { paypalRequest, PayPalApiError } from '../_lib/paypal.js';

const ORDER_ID_RE = /^[A-Za-z0-9_-]{4,64}$/;

export default async function handler(req, res) {
  if (!enforcePostSameOrigin(req, res)) return;

  let payload;
  try {
    payload = await readJsonBody(req, 4096);
  } catch (err) {
    sendJson(res, err?.statusCode || 400, { error: err?.message || 'Invalid JSON body.' });
    return;
  }

  const orderID = cleanString(String(payload?.orderID || ''), 64);
  if (!ORDER_ID_RE.test(orderID)) {
    sendJson(res, 400, { error: 'Valid PayPal orderID is required.' });
    return;
  }

  try {
    const result = await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`, {
      method: 'POST',
      requestId: `hv-cap-${orderID}-${crypto.randomUUID()}`,
      body: {}
    });

    const capture = result?.purchase_units?.[0]?.payments?.captures?.[0] || {};
    const status = capture.status || result.status || 'UNKNOWN';

    sendJson(res, 200, {
      status,
      captureId: capture.id || result.id || orderID,
      amount: capture.amount?.value || result?.purchase_units?.[0]?.amount?.value || null,
      currency: capture.amount?.currency_code || result?.purchase_units?.[0]?.amount?.currency_code || 'USD',
      payerEmail: result?.payer?.email_address || null,
      createTime: capture.create_time || new Date().toISOString()
    });
  } catch (err) {
    if (err instanceof PayPalApiError) {
      sendJson(res, err.statusCode, { error: err.message, code: err.code });
      return;
    }
    sendJson(res, 500, { error: 'Unable to capture PayPal payment.' });
  }
}
