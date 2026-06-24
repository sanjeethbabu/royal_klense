const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    console.log('Email transporter created.');
  } else {
    transporter = null;
    console.log('SMTP not configured, email notifications disabled.');
  }
  return transporter;
}

function buildEnquiryHtml(data) {
  const fields = [
    { label: 'Name', value: data.name },
    { label: 'Company', value: data.company },
    { label: 'Phone', value: data.phone },
    { label: 'Email', value: data.email },
  ];

  if (data.product) {
    fields.push({ label: 'Product', value: data.product });
    fields.push({ label: 'Quantity', value: data.quantity });
  }

  const fieldRows = fields.filter(f => f.value && f.value !== 'N/A').map(f => `
    <tr>
      <td style="padding:8px 16px;border-bottom:1px solid #eee;color:#666;font-weight:500">${f.label}</td>
      <td style="padding:8px 16px;border-bottom:1px solid #eee;color:#333">${f.value}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:32px">
      <div style="background:linear-gradient(135deg,#003B8E,#002a6a);padding:32px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:#C9A227;margin:0;font-size:24px">New Website Enquiry</h1>
        <p style="color:#fff;margin:8px 0 0;opacity:0.9">Received on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
      </div>

      <div style="background:#fff;border-radius:0 0 12px 12px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
        <table style="width:100%;border-collapse:collapse">
          ${fieldRows}
        </table>

        <div style="margin-top:24px;padding:16px;background:#f0f4ff;border-radius:8px;border-left:4px solid #003B8E">
          <h3 style="margin:0 0 8px;color:#003B8E;font-size:14px;text-transform:uppercase">Message</h3>
          <p style="margin:0;color:#333;line-height:1.6">${data.message || 'N/A'}</p>
        </div>
      </div>

      <div style="text-align:center;padding:16px;color:#999;font-size:12px">
        <p style="margin:0">Royal Klense - Premium Hygiene & Cleaning Solutions</p>
        <p style="margin:4px 0 0">This is an automated notification from your website enquiry form.</p>
      </div>
    </div>
  `;
}

function buildSubscriberHtml(email) {
  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8f9fa;padding:32px">
      <div style="background:linear-gradient(135deg,#003B8E,#002a6a);padding:32px;border-radius:12px;text-align:center">
        <h1 style="color:#C9A227;margin:0;font-size:24px">New Newsletter Subscriber</h1>
      </div>
      <div style="background:#fff;border-radius:12px;padding:24px;margin-top:16px;box-shadow:0 2px 8px rgba(0,0,0,0.08);text-align:center">
        <p style="font-size:18px;color:#333;margin:0">${email}</p>
        <p style="color:#999;margin-top:8px">Subscribed on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
      </div>
    </div>
  `;
}

async function sendEnquiryEmail(data) {
  const t = getTransporter();
  if (!t) return;

  try {
    await t.sendMail({
      from: `"Royal Klense" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || 'sales@royalklense.com',
      subject: `New ${data.type === 'quote' ? 'Quote Request' : 'Enquiry'} from ${data.name}`,
      html: buildEnquiryHtml(data),
      replyTo: data.email,
    });
    console.log('Enquiry email sent successfully.');
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
}

async function sendSubscriberEmail(email) {
  const t = getTransporter();
  if (!t) return;

  try {
    await t.sendMail({
      from: `"Royal Klense" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || 'sales@royalklense.com',
      subject: 'New Newsletter Subscriber',
      html: buildSubscriberHtml(email),
    });
    console.log('Subscriber notification email sent.');
  } catch (err) {
    console.error('Subscriber email send failed:', err.message);
  }
}

module.exports = { sendEnquiryEmail, sendSubscriberEmail, getTransporter };
