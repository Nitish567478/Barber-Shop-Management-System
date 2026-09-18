/**
 * Premium Barber Shop Official Receipt Generator & Printer
 * Includes website logo, watermark, itemized breakdown, and print-color-adjust styling.
 */

export const printReceipt = ({
  shopName = 'Modern Barber Studio',
  shopAddress = 'Ranchi HQ, Main Road, Jharkhand',
  shopPhone = '+91 9934630687',
  barberName = '',
  customerName = 'Valued Customer',
  customerPhone = '',
  customerEmail = '',
  appointmentDate = '',
  appointmentTime = '',
  services = [],
  originalPrice = 0,
  discountAmount = 0,
  totalPaid = 0,
  transactionId = 'TXN_OFFICIAL',
  paymentMethod = 'Razorpay / Online Verified',
  invoiceNumber = '',
  receivingAccountInfo = '',
}) => {
  const printWin = window.open('', '_blank', 'width=800,height=920');

  if (!printWin) {
    // If popup is blocked, fallback to browser print
    window.print();
    return;
  }

  const logoUrl = 'https://i.ibb.co/0yYptF9d/website-logo.png';
  const displayTxn = transactionId || invoiceNumber || `TXN-${Date.now().toString().slice(-8)}`;
  const displayInvoice = invoiceNumber || `INV-${displayTxn.slice(-6).toUpperCase()}`;

  const formattedDate = appointmentDate
    ? new Date(appointmentDate).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  const printedAt = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const receiptHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Receipt - ${displayTxn}</title>
  <style>
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #0f172a;
      background: #f1f5f9;
      margin: 0;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }

    /* Top Floating Action Bar (hidden on print) */
    .no-print {
      width: 100%;
      max-width: 680px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      padding: 10px 16px;
      background: #0f172a;
      border-radius: 12px;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .no-print .title {
      font-size: 13px;
      font-weight: 600;
      color: #fcd34d;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .no-print .actions {
      display: flex;
      gap: 10px;
    }

    .btn-action {
      background: #f59e0b;
      color: #0f172a;
      border: none;
      border-radius: 8px;
      padding: 6px 16px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s;
    }

    .btn-action:hover {
      background: #fbbf24;
    }

    .btn-close {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-close:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    /* Main Receipt Container */
    .receipt {
      position: relative;
      width: 100%;
      max-width: 680px;
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      border-radius: 20px;
      padding: 36px 40px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
      overflow: hidden;
    }

    /* ====================================================
       OFFICIAL WATERMARK STYLING (Multi-layered)
       ==================================================== */
    .watermark-container {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0.06;
      user-select: none;
    }

    .watermark-logo {
      width: 300px;
      height: auto;
      object-fit: contain;
      filter: grayscale(100%) contrast(150%);
    }

    .watermark-stamp {
      font-size: 52px;
      font-weight: 900;
      color: #b45309;
      border: 6px dashed #b45309;
      padding: 8px 36px;
      border-radius: 16px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      transform: rotate(-22deg);
      margin-top: -24px;
      white-space: nowrap;
    }

    .watermark-brand-line {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.3em;
      color: #0f172a;
      margin-top: 15px;
      transform: rotate(-22deg);
      text-transform: uppercase;
    }

    /* Receipt Content Layer */
    .receipt-content {
      position: relative;
      z-index: 1;
    }

    /* Brand Header with Logo */
    .brand-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }

    .brand-identity {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .website-logo-img {
      width: 64px;
      height: 64px;
      object-fit: contain;
      border-radius: 14px;
      border: 2px solid #f59e0b;
      padding: 3px;
      background: #ffffff;
      box-shadow: 0 4px 10px rgba(245, 158, 11, 0.2);
    }

    .brand-text h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.02em;
      text-transform: uppercase;
    }

    .brand-text p {
      margin: 2px 0 0;
      font-size: 11px;
      font-weight: 700;
      color: #d97706;
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }

    .brand-text .branch {
      margin-top: 3px;
      font-size: 12px;
      font-weight: 600;
      color: #475569;
    }

    .receipt-badge-box {
      text-align: right;
    }

    .receipt-type {
      font-size: 18px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin: 0;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 6px;
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    /* Meta Details Grid */
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 20px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 24px;
      font-size: 12px;
    }

    .meta-cell span {
      display: block;
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .meta-cell strong {
      display: block;
      margin-top: 2px;
      color: #0f172a;
      font-size: 13px;
      font-weight: 700;
    }

    .meta-cell strong.mono {
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
      color: #b45309;
    }

    /* Services Table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }

    th {
      text-align: left;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475569;
      padding: 10px 12px;
      background: #f1f5f9;
      border-bottom: 2px solid #cbd5e1;
    }

    th:last-child {
      text-align: right;
    }

    td {
      padding: 12px;
      font-size: 13px;
      color: #1e293b;
      border-bottom: 1px solid #f1f5f9;
    }

    td:last-child {
      text-align: right;
      font-weight: 700;
      color: #0f172a;
    }

    /* Pricing Totals Section */
    .totals-area {
      border-top: 2px solid #e2e8f0;
      padding-top: 14px;
      margin-bottom: 24px;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #64748b;
      margin-bottom: 6px;
    }

    .totals-row.discount {
      color: #15803d;
      font-weight: 600;
    }

    .totals-row.grand-total {
      border-top: 2px solid #0f172a;
      margin-top: 10px;
      padding-top: 12px;
      font-size: 16px;
      font-weight: 900;
      color: #0f172a;
      align-items: center;
    }

    .grand-total .amount {
      font-size: 26px;
      font-weight: 900;
      color: #d97706;
      letter-spacing: -0.02em;
    }

    /* Trust & Security Footnote */
    .trust-badge-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 18px;
      font-size: 11px;
      color: #475569;
      margin-bottom: 20px;
    }

    .trust-badge-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .trust-badge-item span {
      font-weight: 600;
    }

    /* Footer Note */
    .receipt-footer {
      border-top: 1px dashed #cbd5e1;
      padding-top: 16px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      line-height: 1.6;
    }

    .receipt-footer strong {
      color: #475569;
    }

    /* ====================================================
       PRINT MEDIA QUERY (Exact Print Rendering)
       ==================================================== */
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }

      .no-print {
        display: none !important;
      }

      .receipt {
        border: none !important;
        box-shadow: none !important;
        padding: 10px 14px !important;
        max-width: 100% !important;
      }

      .watermark-container {
        opacity: 0.065 !important;
      }
    }
  </style>
</head>
<body>

  <!-- Floating Print Control (Hidden during print) -->
  <div class="no-print">
    <div class="title">
      <span>● Official Receipt Preview</span>
    </div>
    <div class="actions">
      <button class="btn-action" onclick="window.print()">
        🖨️ Print / Save PDF
      </button>
      <button class="btn-close" onclick="window.close()">
        ✕ Close
      </button>
    </div>
  </div>

  <!-- Physical Printable Receipt -->
  <div class="receipt">

    <!-- WATERMARK LAYER -->
    <div class="watermark-container" aria-hidden="true">
      <img src="${logoUrl}" class="watermark-logo" alt="Watermark Logo" />
      <div class="watermark-stamp">PAID &amp; VERIFIED</div>
      <div class="watermark-brand-line">PREMIUM BARBER SHOP • OFFICIAL RECEIPT</div>
    </div>

    <!-- CONTENT LAYER -->
    <div class="receipt-content">

      <!-- BRAND & LOGO HEADER -->
      <div class="brand-header">
        <div class="brand-identity">
          <img src="${logoUrl}" alt="Barber Shop Logo" class="website-logo-img" />
          <div class="brand-text">
            <h1>Premium Barber Shop</h1>
            <p>Modern Grooming Studio</p>
            <div class="branch">Studio: <strong>${shopName}</strong></div>
          </div>
        </div>
        <div class="receipt-badge-box">
          <div class="receipt-type">Payment Receipt</div>
          <div class="status-badge">✓ Paid &amp; Confirmed</div>
        </div>
      </div>

      <!-- APPOINTMENT & PAYMENT META -->
      <div class="meta-grid">
        <div class="meta-cell">
          <span>Transaction Ref ID</span>
          <strong class="mono">${displayTxn}</strong>
        </div>
        <div class="meta-cell" style="text-align: right;">
          <span>Invoice Number</span>
          <strong class="mono">${displayInvoice}</strong>
        </div>

        <div class="meta-cell">
          <span>Customer Name</span>
          <strong>${customerName || 'Valued Guest'}</strong>
        </div>
        <div class="meta-cell" style="text-align: right;">
          <span>Payment Gateway</span>
          <strong style="text-transform: capitalize;">${paymentMethod}</strong>
        </div>

        <div class="meta-cell">
          <span>Scheduled Date</span>
          <strong>${formattedDate}</strong>
        </div>
        <div class="meta-cell" style="text-align: right;">
          <span>Time Slot</span>
          <strong>${appointmentTime || 'Scheduled'}</strong>
        </div>

        <div class="meta-cell">
          <span>Location</span>
          <strong style="font-size: 11px;">${shopAddress}</strong>
        </div>
        <div class="meta-cell" style="text-align: right;">
          <span>Printed On</span>
          <strong>${printedAt}</strong>
        </div>
      </div>

      ${
        receivingAccountInfo
          ? `
      <div style="margin-top: -12px; margin-bottom: 20px; padding: 10px 16px; background: #ecfdf5; border: 1.5px solid #a7f3d0; border-radius: 12px; font-size: 12px; display: flex; align-items: center; justify-content: space-between;">
        <div>
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #059669; letter-spacing: 0.06em; display: block;">
            Payee Receiving Account (Barber Direct Payout)
          </span>
          <strong style="color: #065f46; font-size: 13px;">${receivingAccountInfo}</strong>
        </div>
        <span style="background: #10b981; color: #ffffff; padding: 3px 10px; border-radius: 9999px; font-size: 10px; font-weight: 800; letter-spacing: 0.05em;">
          VERIFIED PAYEE
        </span>
      </div>
      `
          : ''
      }

      <!-- SERVICES TABLE -->
      <table>
        <thead>
          <tr>
            <th style="width: 50px;">#</th>
            <th>Service Details</th>
            <th>Duration</th>
            <th>Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          ${
            services.length > 0
              ? services
                  .map(
                    (s, index) => `
                <tr>
                  <td style="color: #94a3b8; font-weight: 600;">0${index + 1}</td>
                  <td>
                    <strong>${s.name || 'Barber Grooming Service'}</strong>
                    ${s.category ? `<div style="font-size: 11px; color: #64748b;">${s.category}</div>` : ''}
                  </td>
                  <td style="color: #64748b;">${s.duration || 30} mins</td>
                  <td>₹${Number(s.price || 0).toLocaleString('en-IN')}</td>
                </tr>
              `
                  )
                  .join('')
              : `
                <tr>
                  <td style="color: #94a3b8;">01</td>
                  <td><strong>Barber Grooming Session</strong></td>
                  <td style="color: #64748b;">30 mins</td>
                  <td>₹${Number(totalPaid || 0).toLocaleString('en-IN')}</td>
                </tr>
              `
          }
        </tbody>
      </table>

      <!-- TOTALS CALCULATION -->
      <div class="totals-area">
        ${
          originalPrice && originalPrice > totalPaid
            ? `
          <div class="totals-row">
            <span>Original Price</span>
            <span>₹${Number(originalPrice).toLocaleString('en-IN')}</span>
          </div>
        `
            : ''
        }

        ${
          discountAmount > 0
            ? `
          <div class="totals-row discount">
            <span>Promotional / Coupon Discount</span>
            <span>- ₹${Number(discountAmount).toLocaleString('en-IN')}</span>
          </div>
        `
            : ''
        }

        <div class="totals-row">
          <span>Taxes &amp; Platform Service Fee</span>
          <span style="color: #15803d; font-weight: 700;">INCLUDED</span>
        </div>

        <div class="totals-row grand-total">
          <span>Total Amount Paid</span>
          <span class="amount">₹${Number(totalPaid || 0).toLocaleString('en-IN')}</span>
        </div>
      </div>

      <!-- SECURITY & TRUST BADGES -->
      <div class="trust-badge-row">
        <div class="trust-badge-item">
          <span>🔒 256-Bit SSL Encrypted</span>
        </div>
        <div class="trust-badge-item">
          <span>⚡ Razorpay Authorized</span>
        </div>
        <div class="trust-badge-item">
          <span>📋 Official Tax Receipt</span>
        </div>
      </div>

      <!-- RECEIPT FOOTER -->
      <div class="receipt-footer">
        <p>Thank you for choosing <strong>${shopName}</strong>! Please arrive 5-10 minutes prior to your scheduled slot.</p>
        <p>For support or rescheduling, call <strong>${shopPhone}</strong> or visit <strong>barbershopranchi.in</strong>.</p>
        <p style="font-size: 10px; color: #cbd5e1; margin-top: 6px;">This is an electronically generated receipt verified by Barber Shop Management Network. No physical signature is required.</p>
      </div>

    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>
  `;

  printWin.document.open();
  printWin.document.write(receiptHtml);
  printWin.document.close();
};
