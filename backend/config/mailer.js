import nodemailer from "nodemailer";

let transporter = null;

const RED = "#e10600";
const BLACK = "#0a0a0a";
const CARD = "#161616";
const PAPER = "#e8e4dc";
const STEEL = "#9a948a";

function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

function buildHtml(order) {
  const itemRows = order.items
    .map(
      (i) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #2a2a2a;color:${PAPER};font-family:Arial,sans-serif;font-size:14px;">
            ${i.name} <span style="color:${STEEL};">(${i.size}) &times;${i.qty}</span>
          </td>
          <td align="right" style="padding:12px 0;border-bottom:1px solid #2a2a2a;color:${PAPER};font-family:Arial,sans-serif;font-size:14px;white-space:nowrap;">
            KES ${(i.price * i.qty).toLocaleString()}
          </td>
        </tr>`
    )
    .join("");

  return `
<div style="background:${BLACK};padding:32px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:${CARD};border:2px solid ${RED};border-radius:6px;overflow:hidden;">
    <tr>
      <td style="background:${RED};padding:20px 28px;">
        <span style="font-family:Arial,sans-serif;font-size:22px;font-weight:900;letter-spacing:1px;color:${BLACK};text-transform:uppercase;">
          STREET<span style="color:${BLACK};">WEAR</span>
        </span>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 28px 8px;">
        <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:13px;letter-spacing:1px;color:${RED};text-transform:uppercase;">Order confirmed</p>
        <h1 style="margin:0 0 18px;font-family:Arial,sans-serif;font-size:26px;color:${PAPER};">${order.orderNumber}</h1>
        <p style="margin:0 0 20px;font-family:Arial,sans-serif;font-size:14px;color:${STEEL};line-height:1.5;">
          Hi ${order.customer.name}, thanks for copping from STREETWEAR. Your order is locked in and ships within 48 hours.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${itemRows}
          <tr>
            <td style="padding:12px 0 0;font-family:Arial,sans-serif;font-size:13px;color:${STEEL};">Subtotal</td>
            <td align="right" style="padding:12px 0 0;font-family:Arial,sans-serif;font-size:13px;color:${STEEL};">KES ${order.subtotal.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding:6px 0 0;font-family:Arial,sans-serif;font-size:13px;color:${STEEL};">Shipping</td>
            <td align="right" style="padding:6px 0 0;font-family:Arial,sans-serif;font-size:13px;color:${STEEL};">${order.shippingFee === 0 ? "FREE" : `KES ${order.shippingFee.toLocaleString()}`}</td>
          </tr>
          <tr>
            <td style="padding:14px 0;font-family:Arial,sans-serif;font-size:18px;font-weight:700;color:${PAPER};border-top:2px solid ${RED};">Total</td>
            <td align="right" style="padding:14px 0;font-family:Arial,sans-serif;font-size:18px;font-weight:700;color:${RED};border-top:2px solid ${RED};">KES ${order.total.toLocaleString()}</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 28px 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BLACK};border-radius:4px;">
          <tr>
            <td style="padding:16px 18px;font-family:Arial,sans-serif;font-size:13px;color:${STEEL};line-height:1.6;">
              <strong style="color:${PAPER};">Payment:</strong> ${order.paymentMethod.toUpperCase()}<br/>
              <strong style="color:${PAPER};">Shipping to:</strong> ${order.shipping.address}, ${order.shipping.city}, ${order.shipping.country}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:18px 28px;background:${BLACK};border-top:1px solid #2a2a2a;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;letter-spacing:1px;color:${STEEL};text-transform:uppercase;">
          STREETWEAR &mdash; Wear the streets.
        </p>
      </td>
    </tr>
  </table>
</div>`;
}

export async function sendOrderConfirmation(order) {
  const mailer = getTransporter();
  if (!mailer) {
    console.warn("Email not configured (EMAIL_USER / EMAIL_APP_PASSWORD missing) — skipping confirmation email.");
    return;
  }

  const itemLines = order.items
    .map((i) => `  ${i.qty} x ${i.name} (${i.size}) — KES ${i.price * i.qty}`)
    .join("\n");

  const text = `Hi ${order.customer.name},

Thanks for copping from STREETWEAR. Your order is locked in.

Order number: ${order.orderNumber}

${itemLines}

Subtotal: KES ${order.subtotal}
Shipping: ${order.shippingFee === 0 ? "FREE" : `KES ${order.shippingFee}`}
Total: KES ${order.total}

Payment method: ${order.paymentMethod.toUpperCase()}
Shipping to: ${order.shipping.address}, ${order.shipping.city}, ${order.shipping.country}

Your drop ships within 48 hours.

— STREETWEAR`;

  try {
    await mailer.sendMail({
      from: `"STREETWEAR" <${process.env.EMAIL_USER}>`,
      to: order.customer.email,
      subject: `Order confirmed — ${order.orderNumber}`,
      text,
      html: buildHtml(order),
    });
  } catch (err) {
    console.error("Failed to send order confirmation email:", err.message);
  }
}

// Notifies the store owner (defaults to the sending account itself, or set
// OWNER_EMAIL in .env to send it somewhere else) every time an order lands.
export async function sendOwnerAlert(order) {
  const mailer = getTransporter();
  if (!mailer) return; // already warned in sendOrderConfirmation

  const ownerEmail = (process.env.OWNER_EMAIL || process.env.EMAIL_USER || "").trim();
  if (!ownerEmail) return;

  const itemLines = order.items
    .map((i) => `  ${i.qty} x ${i.name} (${i.size}) — KES ${i.price * i.qty}`)
    .join("\n");

  const text = `New order placed: ${order.orderNumber}

Customer: ${order.customer.name}
Email: ${order.customer.email}
Phone: ${order.customer.phone}

${itemLines}

Total: KES ${order.total}
Payment method: ${order.paymentMethod.toUpperCase()}
Ship to: ${order.shipping.address}, ${order.shipping.city}, ${order.shipping.country}`;

  const itemRows = order.items
    .map(
      (i) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:${PAPER};font-family:Arial,sans-serif;font-size:14px;">
            ${i.name} <span style="color:${STEEL};">(${i.size}) &times;${i.qty}</span>
          </td>
          <td align="right" style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:${PAPER};font-family:Arial,sans-serif;font-size:14px;white-space:nowrap;">
            KES ${(i.price * i.qty).toLocaleString()}
          </td>
        </tr>`
    )
    .join("");

  const html = `
<div style="background:${BLACK};padding:32px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:${CARD};border:2px solid ${RED};border-radius:6px;overflow:hidden;">
    <tr>
      <td style="background:${RED};padding:20px 28px;">
        <span style="font-family:Arial,sans-serif;font-size:22px;font-weight:900;letter-spacing:1px;color:${BLACK};text-transform:uppercase;">
          New Order
        </span>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 28px 8px;">
        <h1 style="margin:0 0 18px;font-family:Arial,sans-serif;font-size:26px;color:${PAPER};">${order.orderNumber}</h1>
        <p style="margin:0 0 20px;font-family:Arial,sans-serif;font-size:14px;color:${STEEL};line-height:1.6;">
          <strong style="color:${PAPER};">${order.customer.name}</strong><br/>
          ${order.customer.email}<br/>
          ${order.customer.phone}
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:0 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${itemRows}
          <tr>
            <td style="padding:14px 0;font-family:Arial,sans-serif;font-size:18px;font-weight:700;color:${PAPER};border-top:2px solid ${RED};">Total</td>
            <td align="right" style="padding:14px 0;font-family:Arial,sans-serif;font-size:18px;font-weight:700;color:${RED};border-top:2px solid ${RED};">KES ${order.total.toLocaleString()}</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 28px 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BLACK};border-radius:4px;">
          <tr>
            <td style="padding:16px 18px;font-family:Arial,sans-serif;font-size:13px;color:${STEEL};line-height:1.6;">
              <strong style="color:${PAPER};">Payment:</strong> ${order.paymentMethod.toUpperCase()}<br/>
              <strong style="color:${PAPER};">Ship to:</strong> ${order.shipping.address}, ${order.shipping.city}, ${order.shipping.country}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>`;

  try {
    await mailer.sendMail({
      from: `"STREETWEAR" <${process.env.EMAIL_USER}>`,
      to: ownerEmail,
      subject: `New order — ${order.orderNumber} (KES ${order.total.toLocaleString()})`,
      text,
      html,
    });
  } catch (err) {
    console.error("Failed to send owner order alert:", err.message);
  }
}
