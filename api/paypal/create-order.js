// HealthVerse — Create PayPal Checkout Order (Serverless Function)
import crypto from 'node:crypto';
import { enforcePostSameOrigin, readJsonBody, sendJson, cleanString } from '../_lib/http.js';
import { paypalRequest, PayPalApiError } from '../_lib/paypal.js';

const ALLOWED_REFERENCE_TYPES = new Set(['appointment', 'medicine']);

export default async function handler(req, res) {
  if (!enforcePostSameOrigin(req, res)) return;

  let payload;
  try {
    payload = await readJsonBody(req, 8192);
  } catch (err) {
    sendJson(res, err?.statusCode || 400, { error: err?.message || 'Invalid JSON body.' });
    return;
  }

  const rawAmount = Number(payload?.amount);
  const currency = cleanString(payload?.currency || 'USD', 8).toUpperCase();
  const referenceType = cleanString(payload?.referenceType || '', 32).toLowerCase();
  const referenceId = cleanString(String(payload?.referenceId || ''), 100);
  const description = cleanString(
    payload?.description || `HealthVerse ${referenceType || 'healthcare'} payment`,
    127
  );

  if (!Number.isFinite(rawAmount) || rawAmount <= 0 || rawAmount > 500) {
    sendJson(res, 400, { error: 'Amount must be a positive number up to 500 USD.' });
    return;
  }
  if (currency !== 'USD') {
    sendJson(res, 400, { error: 'Only USD currency is supported in sandbox mode.' });
    return;
  }
  if (!ALLOWED_REFERENCE_TYPES.has(referenceType)) {
    sendJson(res, 400, { error: 'referenceType must be "appointment" or "medicine".' });
    return;
  }
  if (!referenceId) {
    sendJson(res, 400, { error: 'referenceId is required.' });
    return;
  }

  const formattedAmount = rawAmount.toFixed(2);
  const requestId = `hv-${referenceType}-${crypto.randomUUID()}`;

  try {
    const order = await paypalRequest('/v2/checkout/orders', {
      method: 'POST',
      requestId,
      body: {
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: referenceId.slice(0, 64),
            custom_id: `${referenceType}:${referenceId}`.slice(0, 127),
            description,
            amount: {
              currency_code: 'USD',
              value: formattedAmount
            }
          }
        ]
      }
    });

    if (!order?.id) {
      sendJson(res, 502, { error: 'PayPal did not return an order identifier.' });
      return;
    }

    sendJson(res, 200, { id: order.id });
  } catch (err) {
    if (err instanceof PayPalApiError) {
      sendJson(res, err.statusCode, { error: err.message, code: err.code });
      return;
    }
    sendJson(res, 500, { error: 'Unable to initialize PayPal order.' });
  }
}
