// HealthVerse — Patient Payment Receipts History (#payments)
import { navigate, goBack } from '../../routes/router.js';
import { getReceipts, INR_PER_USD } from '../../services/payments/paypalService.js';
import {
  renderSkeletonCards,
  renderEmptyState,
  renderErrorState,
  escapeHtml,
  applyCountUps
} from '../../utils/utils.js';
import { uiIcon } from '../../utils/icons.js';
import { renderBottomNav } from '../patient/patient-home.js';

export function renderPayments() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="screen" id="payments-screen" style="background:var(--bg);">
      <div class="page-header">
        <button class="back-btn" onclick="goBack()" aria-label="Go back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="page-title">Payment Receipts</div>
        <button class="btn-icon btn-ghost" onclick="retryLoadPayments()" aria-label="Refresh receipts">
          ${uiIcon('repeat', { size: 17 })}
        </button>
      </div>

      <div class="screen-content" style="padding:20px;padding-bottom:100px;">
        <div id="payments-summary" class="mb-4">
          <div class="skeleton" style="height:88px;border-radius:var(--radius-lg);"></div>
        </div>

        <div class="section-header mb-3">
          <div class="section-title">PayPal Sandbox Receipts</div>
          <span class="badge badge-primary">1 USD = &#8377;${INR_PER_USD} demo rate</span>
        </div>

        <div id="payments-list-container">
          ${renderSkeletonCards(3, false)}
        </div>
      </div>
      ${renderBottomNav('settings', { desktopOnly: true })}
    </div>
  `;

  window.retryLoadPayments = () => loadPaymentsData();
  loadPaymentsData();
}

function loadPaymentsData() {
  const summaryEl = document.getElementById('payments-summary');
  const listEl = document.getElementById('payments-list-container');
  if (!listEl) return;

  try {
    const receipts = getReceipts();

    const totalUsd = receipts.reduce((sum, r) => sum + (Number(r.amountUSD) || 0), 0);
    const totalInr = receipts.reduce((sum, r) => sum + (Number(r.amountINR) || 0), 0);

    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="card p-4 payments-summary-card">
          <div class="flex items-center justify-between gap-3">
            <div>
              <div class="text-overline" style="color:var(--text-tertiary);">Total Sandbox Payments</div>
              <div style="font-family:var(--font-display);font-size:24px;font-weight:800;color:var(--text-primary);margin-top:4px;">
                $<span data-countup="${totalUsd.toFixed(2)}">${totalUsd.toFixed(2)}</span> USD
              </div>
              <div class="text-caption mt-1">Approx. &#8377;${Math.round(totalInr).toLocaleString('en-IN')} at demo conversion rate</div>
            </div>
            <div class="text-right">
              <div class="badge badge-success mb-2">
                ${uiIcon('checkCircle', { size: 12 })} ${receipts.length} Receipt${receipts.length === 1 ? '' : 's'}
              </div>
              <div class="text-caption">PayPal Sandbox</div>
            </div>
          </div>
        </div>
      `;
      applyCountUps(summaryEl);
    }

    if (receipts.length === 0) {
      listEl.innerHTML = renderEmptyState({
        title: 'No PayPal receipts yet',
        description: 'When you pay an appointment consultation fee or pharmacy refill with PayPal Sandbox, your verified transaction receipt appears here.',
        icon: uiIcon('fileText', { size: 30, color: 'var(--primary)' }),
        actionLabel: 'Book an Appointment',
        actionOnclick: "navigate('appointments')"
      });
      return;
    }

    listEl.innerHTML = `
      <div class="flex-col gap-3">
        ${receipts.map(r => {
          const when = r.timestamp ? new Date(r.timestamp).toLocaleString('en-IN') : 'Recent';
          const isCompleted = String(r.status || 'COMPLETED').toUpperCase() === 'COMPLETED';
          return `
            <article class="card p-4" style="border-left:4px solid var(--secondary);">
              <div class="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div style="font-family:var(--font-display);font-size:15px;font-weight:700;color:var(--text-primary);">
                    ${escapeHtml(r.description || 'HealthVerse Payment')}
                  </div>
                  <div class="text-caption mt-1 inline-icon-text">
                    ${uiIcon('clock', { size: 12 })} <span>${escapeHtml(when)}</span>
                  </div>
                </div>
                <span class="badge ${isCompleted ? 'badge-success' : 'badge-warning'}">
                  ${isCompleted ? 'Paid' : escapeHtml(r.status || 'Pending')}
                </span>
              </div>

              <div class="paypal-receipt-meta">
                <div>
                  <span>Amount Charged</span>
                  <strong>$${escapeHtml(r.amountUSD)} ${escapeHtml(r.currency || 'USD')} (&#8377;${escapeHtml(String(r.amountINR))})</strong>
                </div>
                <div>
                  <span>Transaction ID</span>
                  <strong>${escapeHtml(r.transactionId)}</strong>
                </div>
                <div>
                  <span>Category</span>
                  <strong>${escapeHtml(r.referenceType === 'medicine' ? 'Pharmacy Refill' : 'Consultation')} #${escapeHtml(r.referenceId)}</strong>
                </div>
                ${r.payerEmail ? `<div><span>Buyer</span><strong>${escapeHtml(r.payerEmail)}</strong></div>` : ''}
              </div>

              <button type="button" class="btn btn-outline btn-xs btn-full mt-3" onclick="window.__hvPrintReceipt('${escapeHtml(r.id)}')">
                ${uiIcon('fileText', { size: 14 })} Print / Save receipt
              </button>
            </article>
          `;
        }).join('')}
      </div>
    `;
  } catch (err) {
    if (summaryEl) summaryEl.innerHTML = '';
    listEl.innerHTML = renderErrorState({
      title: 'Unable to load payment receipts',
      description: err?.message || 'Could not read stored PayPal receipts.',
      retryOnclick: 'retryLoadPayments()'
    });
  }
}
