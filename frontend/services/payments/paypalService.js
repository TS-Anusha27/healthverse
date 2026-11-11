// HealthVerse — PayPal Sandbox Checkout & Receipt Service
import { createPayment } from '../supabase/db.js';
import { store } from '../../store/store.js';
import { escapeHtml, showToast } from '../../utils/utils.js';
import { uiIcon } from '../../utils/icons.js';

const RECEIPTS_STORAGE_KEY = 'hv_receipts';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const parsedRate = Number(import.meta.env.VITE_INR_PER_USD);
export const INR_PER_USD = Number.isFinite(parsedRate) && parsedRate > 0 ? parsedRate : 85;

let sdkPromise = null;

/**
 * Convert an INR amount to USD using the configured demo conversion rate.
 */
export function convertInrToUsd(amountINR) {
  const inr = Math.max(0, Number(amountINR) || 0);
  const rawUsd = inr / INR_PER_USD;
  const usd = Math.max(0.5, Number(rawUsd.toFixed(2)));
  return {
    inr: Math.round(inr),
    usd,
    usdString: usd.toFixed(2),
    rate: INR_PER_USD
  };
}

/**
 * Read saved PayPal receipts from localStorage.
 */
export function getReceipts() {
  try {
    const raw = localStorage.getItem(RECEIPTS_STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/**
 * Persist a PayPal receipt to localStorage.
 */
export function saveReceipt(receipt) {
  const list = getReceipts();
  const entry = {
    id: receipt.id || `rcpt_${Date.now().toString(36)}`,
    transactionId: String(receipt.transactionId || ''),
    orderId: String(receipt.orderId || ''),
    amountUSD: Number(receipt.amountUSD || 0).toFixed(2),
    amountINR: Math.round(Number(receipt.amountINR || 0)),
    currency: String(receipt.currency || 'USD'),
    description: String(receipt.description || 'HealthVerse payment'),
    referenceType: String(receipt.referenceType || 'appointment'),
    referenceId: String(receipt.referenceId || ''),
    payerEmail: receipt.payerEmail || null,
    status: String(receipt.status || 'COMPLETED'),
    timestamp: receipt.timestamp || new Date().toISOString()
  };
  list.unshift(entry);
  try {
    localStorage.setItem(RECEIPTS_STORAGE_KEY, JSON.stringify(list.slice(0, 100)));
  } catch {
    // Storage quota full — non-fatal
  }
  return entry;
}

/**
 * Print or download a clean HealthVerse PayPal receipt.
 */
export function printOrSaveReceipt(receiptOrId) {
  const receipt = typeof receiptOrId === 'string'
    ? getReceipts().find(r => r.id === receiptOrId || r.transactionId === receiptOrId)
    : receiptOrId;

  if (!receipt) {
    showToast('Receipt details unavailable', 'warning');
    return;
  }

  const formattedDate = receipt.timestamp
    ? new Date(receipt.timestamp).toLocaleString('en-IN')
    : new Date().toLocaleString('en-IN');

  const textSummary = [
    'HEALTHVERSE — SANDBOX PAYMENT RECEIPT',
    '=======================================',
    `Transaction ID : ${receipt.transactionId}`,
    `Order ID       : ${receipt.orderId || 'N/A'}`,
    `Status         : ${receipt.status}`,
    `Type           : ${receipt.referenceType} (${receipt.referenceId})`,
    `Description    : ${receipt.description}`,
    `Amount Charged : $${receipt.amountUSD} ${receipt.currency}`,
    `INR Equivalent : Rs ${receipt.amountINR} (Demo rate: 1 USD = Rs ${INR_PER_USD})`,
    `Payer          : ${receipt.payerEmail || 'Sandbox Buyer'}`,
    `Date           : ${formattedDate}`,
    '=======================================',
    'Note: Sandbox transaction processed for demo purposes.'
  ].join('\n');

  const win = typeof window !== 'undefined' ? window.open('', '_blank', 'width=520,height=640') : null;
  if (win) {
    win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>HealthVerse Receipt — ${escapeHtml(receipt.transactionId)}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #F0F5FA; color: #1E293B; padding: 28px; }
    .card { max-width: 440px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #E2E8F0; }
    h1 { font-size: 18px; margin: 0 0 4px; color: #1E3A5F; }
    .sub { font-size: 12px; color: #64748B; margin-bottom: 16px; }
    .row { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-bottom: 1px solid #F1F5F9; font-size: 13px; }
    .row span:first-child { color: #64748B; }
    .row strong { text-align: right; word-break: break-all; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; background: #E8F8F0; color: #166534; font-weight: 700; font-size: 12px; }
    .foot { margin-top: 16px; font-size: 11px; color: #64748B; text-align: center; }
    @media print { body { background: #fff; padding: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="card">
    <h1>HealthVerse Payment Receipt</h1>
    <div class="sub">PayPal Sandbox Transaction Confirmation</div>
    <div class="row"><span>Status</span><strong><span class="badge">${escapeHtml(receipt.status)}</span></strong></div>
    <div class="row"><span>Transaction ID</span><strong>${escapeHtml(receipt.transactionId)}</strong></div>
    <div class="row"><span>Description</span><strong>${escapeHtml(receipt.description)}</strong></div>
    <div class="row"><span>Amount Charged</span><strong>$${escapeHtml(receipt.amountUSD)} ${escapeHtml(receipt.currency)}</strong></div>
    <div class="row"><span>INR Equivalent</span><strong>&#8377;${escapeHtml(String(receipt.amountINR))} (1 USD = &#8377;${INR_PER_USD} demo rate)</strong></div>
    <div class="row"><span>Reference</span><strong>${escapeHtml(receipt.referenceType)} #${escapeHtml(receipt.referenceId)}</strong></div>
    ${receipt.payerEmail ? `<div class="row"><span>Payer Email</span><strong>${escapeHtml(receipt.payerEmail)}</strong></div>` : ''}
    <div class="row"><span>Timestamp</span><strong>${escapeHtml(formattedDate)}</strong></div>
    <div class="foot">Generated by HealthVerse Pay &bull; Demo conversion rate: 1 USD = &#8377;${INR_PER_USD}</div>
    <button class="no-print" onclick="window.print()" style="margin-top:16px;width:100%;padding:10px;border:none;border-radius:10px;background:#4A90D9;color:white;font-weight:700;cursor:pointer;">Print Receipt</button>
  </div>
</body>
</html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { try { win.print(); } catch {} }, 250);
    return;
  }

  // Fallback file download when popups are blocked
  try {
    const blob = new Blob([textSummary], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `healthverse-receipt-${receipt.transactionId || 'sandbox'}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Receipt saved as text file', 'success');
  } catch {
    showToast('Unable to open print preview', 'error');
  }
}

if (typeof window !== 'undefined') {
  window.__hvPrintReceipt = (id) => printOrSaveReceipt(id);
}

/**
 * Dynamically load the PayPal Web SDK once using VITE_PAYPAL_CLIENT_ID.
 */
export function loadPayPalSdk() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('PayPal SDK requires a browser environment.'));
  }

  if (window.paypal && typeof window.paypal.Buttons === 'function') {
    return Promise.resolve(window.paypal);
  }

  const clientId = String(import.meta.env.VITE_PAYPAL_CLIENT_ID || '').trim();
  if (!clientId) {
    return Promise.reject(new Error('PayPal checkout is not configured (missing VITE_PAYPAL_CLIENT_ID).'));
  }

  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-hv-paypal-sdk="true"]');
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.paypal) resolve(window.paypal);
        else reject(new Error('PayPal SDK loaded without window.paypal.'));
      });
      existing.addEventListener('error', () => {
        sdkPromise = null;
        reject(new Error('Failed to load PayPal checkout script.'));
      });
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture`;
    script.async = true;
    script.dataset.hvPaypalSdk = 'true';
    script.onload = () => {
      if (window.paypal && typeof window.paypal.Buttons === 'function') {
        resolve(window.paypal);
      } else {
        sdkPromise = null;
        reject(new Error('PayPal SDK initialized unexpectedly.'));
      }
    };
    script.onerror = () => {
      sdkPromise = null;
      script.remove();
      reject(new Error('Unable to reach PayPal checkout SDK. Please check your connection.'));
    };
    document.head.appendChild(script);
  });

  return sdkPromise;
}

/**
 * Render a full PayPal Sandbox checkout widget inside containerEl with
 * INR -> USD conversion notice, loading/error/cancel states, and receipt view.
 */
export async function renderPayPalButtons(containerEl, options = {}) {
  if (!containerEl) return;

  const {
    amountUSD,
    amountINR,
    description = 'HealthVerse Healthcare Payment',
    referenceType = 'appointment',
    referenceId = `ref_${Date.now()}`,
    onSuccess = () => {},
    onError = () => {},
    onCancel = () => {}
  } = options;

  const numericUsd = Number(amountUSD);
  if (!Number.isFinite(numericUsd) || numericUsd <= 0 || numericUsd > 500) {
    containerEl.innerHTML = renderStatusCard({
      tone: 'error',
      title: 'Invalid payment amount',
      message: 'PayPal Sandbox checkout supports amounts between $0.01 and $500.00 USD.'
    });
    return;
  }

  const usdFixed = numericUsd.toFixed(2);
  const resolvedInr = Number.isFinite(Number(amountINR)) && Number(amountINR) > 0
    ? Math.round(Number(amountINR))
    : Math.round(numericUsd * INR_PER_USD);

  containerEl.innerHTML = `
    <div class="paypal-checkout-box">
      <div class="paypal-rate-banner">
        <div>
          <div class="paypal-rate-label">PayPal Sandbox Charge</div>
          <div class="paypal-rate-amounts">
            <strong>&#8377;${escapeHtml(String(resolvedInr))}</strong>
            <span aria-hidden="true">&rarr;</span>
            <strong class="text-primary">$${escapeHtml(usdFixed)} USD</strong>
          </div>
          <div class="paypal-rate-note">1 USD = &#8377;${INR_PER_USD} (demo conversion rate)</div>
        </div>
        <span class="badge badge-primary">Sandbox</span>
      </div>
      <div class="paypal-stage" id="hv-paypal-stage">
        <div class="paypal-loading-row">
          <div class="skeleton" style="height:44px;border-radius:10px;width:100%;"></div>
          <div class="text-caption text-center mt-2">Loading PayPal Sandbox checkout...</div>
        </div>
      </div>
    </div>
  `;

  const stageEl = containerEl.querySelector('#hv-paypal-stage');

  const mountButtons = async () => {
    if (!stageEl) return;
    stageEl.innerHTML = `
      <div class="paypal-loading-row">
        <div class="skeleton" style="height:44px;border-radius:10px;width:100%;"></div>
        <div class="text-caption text-center mt-2">Loading PayPal Sandbox checkout...</div>
      </div>
    `;

    try {
      const paypal = await loadPayPalSdk();
      if (!document.body.contains(stageEl)) return;

      stageEl.innerHTML = '<div class="paypal-btn-slot"></div><div class="paypal-inline-feedback"></div>';
      const slotEl = stageEl.querySelector('.paypal-btn-slot');
      const feedbackEl = stageEl.querySelector('.paypal-inline-feedback');

      await paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          height: 44
        },
        createOrder: async () => {
          if (feedbackEl) feedbackEl.innerHTML = '';
          const res = await fetch('/api/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: Number(usdFixed),
              currency: 'USD',
              description,
              referenceType,
              referenceId: String(referenceId)
            })
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data?.id) {
            throw new Error(data?.error || 'Could not initialize PayPal order.');
          }
          return data.id;
        },
        onApprove: async (data) => {
          if (feedbackEl) {
            feedbackEl.innerHTML = `
              <div class="paypal-status-notice paypal-status-notice--info mt-2">
                <span class="spinner-inline animate-spin"></span>
                <span>Confirming payment capture...</span>
              </div>
            `;
          }

          try {
            const capRes = await fetch('/api/paypal/capture-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderID: data.orderID })
            });
            const capture = await capRes.json().catch(() => ({}));
            if (!capRes.ok || !capture?.captureId) {
              throw new Error(capture?.error || 'Payment capture failed.');
            }

            const receipt = saveReceipt({
              transactionId: capture.captureId,
              orderId: data.orderID,
              amountUSD: capture.amount || usdFixed,
              amountINR: resolvedInr,
              currency: capture.currency || 'USD',
              description,
              referenceType,
              referenceId: String(referenceId),
              payerEmail: capture.payerEmail || null,
              status: capture.status || 'COMPLETED',
              timestamp: capture.createTime || new Date().toISOString()
            });

            // Sync with Supabase payments table inside try/catch without blocking UI
            try {
              const rawUid = store.currentUser?.id;
              const patientId = typeof rawUid === 'string' && UUID_RE.test(rawUid) ? rawUid : null;
              await createPayment({
                patient_id: patientId,
                amount: Number(resolvedInr),
                purpose: `${description} ($${receipt.amountUSD} USD)`.slice(0, 200),
                payment_method: 'PayPal Sandbox',
                transaction_id: receipt.transactionId,
                status: 'success'
              });
            } catch {
              // Non-blocking fallback
            }

            containerEl.innerHTML = renderReceiptSuccessHtml(receipt);
            onSuccess(receipt, capture);
          } catch (err) {
            const msg = err?.message || 'Unable to verify PayPal payment capture.';
            if (feedbackEl) {
              feedbackEl.innerHTML = renderStatusCard({
                tone: 'error',
                title: 'Capture failed',
                message: msg
              });
            }
            onError(err);
          }
        },
        onCancel: (cancelData) => {
          if (feedbackEl) {
            feedbackEl.innerHTML = renderStatusCard({
              tone: 'cancelled',
              title: 'Payment cancelled',
              message: 'You cancelled PayPal checkout. No amount was charged — you can retry above or continue without paying now.'
            });
          }
          onCancel(cancelData);
        },
        onError: (err) => {
          const msg = err?.message || 'PayPal checkout encountered an issue. Existing booking options remain available.';
          if (feedbackEl) {
            feedbackEl.innerHTML = renderStatusCard({
              tone: 'error',
              title: 'Checkout unavailable',
              message: msg
            });
          }
          onError(err);
        }
      }).render(slotEl);
    } catch (err) {
      if (!document.body.contains(stageEl)) return;
      const msg = err?.message || 'PayPal checkout is currently unavailable.';
      stageEl.innerHTML = `
        ${renderStatusCard({
          tone: 'error',
          title: 'PayPal unavailable',
          message: `${msg} You can still proceed using standard HealthVerse options.`
        })}
        <button type="button" class="btn btn-outline btn-xs mt-2" id="hv-paypal-retry">Retry PayPal</button>
      `;
      const retryBtn = stageEl.querySelector('#hv-paypal-retry');
      if (retryBtn) retryBtn.addEventListener('click', () => mountButtons());
      onError(err);
    }
  };

  await mountButtons();
}

function renderStatusCard({ tone = 'error', title, message }) {
  const cls = tone === 'cancelled' ? 'paypal-status-notice--warning' : 'paypal-status-notice--error';
  const icon = tone === 'cancelled' ? uiIcon('clock', { size: 16 }) : uiIcon('alertTriangle', { size: 16 });
  return `
    <div class="paypal-status-notice ${cls} mt-2" role="status">
      <span class="ui-icon-wrap">${icon}</span>
      <div>
        <div class="paypal-status-title">${escapeHtml(title)}</div>
        <div class="paypal-status-msg">${escapeHtml(message)}</div>
      </div>
    </div>
  `;
}

export function renderReceiptSuccessHtml(receipt) {
  const when = receipt.timestamp
    ? new Date(receipt.timestamp).toLocaleString('en-IN')
    : new Date().toLocaleString('en-IN');

  return `
    <div class="paypal-success-card" role="status" aria-live="polite">
      <div class="paypal-success-header">
        <div class="paypal-success-icon">${uiIcon('checkCircle', { size: 22, color: 'var(--success)' })}</div>
        <div>
          <div class="paypal-success-title">Payment Confirmed</div>
          <div class="paypal-success-sub">PayPal Sandbox &bull; $${escapeHtml(receipt.amountUSD)} USD (&#8377;${escapeHtml(String(receipt.amountINR))})</div>
        </div>
        <span class="badge badge-success">${escapeHtml(receipt.status || 'COMPLETED')}</span>
      </div>
      <div class="paypal-receipt-meta">
        <div><span>Transaction ID</span><strong>${escapeHtml(receipt.transactionId)}</strong></div>
        <div><span>Description</span><strong>${escapeHtml(receipt.description)}</strong></div>
        ${receipt.payerEmail ? `<div><span>Buyer</span><strong>${escapeHtml(receipt.payerEmail)}</strong></div>` : ''}
        <div><span>Date</span><strong>${escapeHtml(when)}</strong></div>
      </div>
      <button type="button" class="btn btn-outline btn-sm btn-full mt-3" onclick="window.__hvPrintReceipt('${escapeHtml(receipt.id)}')">
        ${uiIcon('fileText', { size: 15 })} Print / Save receipt
      </button>
    </div>
  `;
}
