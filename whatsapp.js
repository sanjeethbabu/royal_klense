const https = require('https');

function sendWhatsApp(data) {
  const phone = process.env.WHATSAPP_PHONE;
  if (!phone) {
    console.log('WHATSAPP_PHONE not set, skipping WhatsApp notification.');
    return;
  }

  const message = [
    `*New ${data.type === 'quote' ? 'Quote Request' : 'Enquiry'} - Royal Klense*`,
    ``,
    `*Name:* ${data.name}`,
    `*Company:* ${data.company || 'N/A'}`,
    `*Phone:* ${data.phone || 'N/A'}`,
    `*Email:* ${data.email}`,
  ];

  if (data.product) {
    message.push(`*Product:* ${data.product}`);
    message.push(`*Quantity:* ${data.quantity || 'N/A'}`);
  }

  message.push(``);
  message.push(`*Message:*`);
  message.push(data.message || 'N/A');
  message.push(``);
  message.push(`Received: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);

  if (process.env.WHATSAPP_API_KEY && process.env.WHATSAPP_API_URL) {
    const payload = JSON.stringify({
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: { body: message.join('\n') },
    });

    const url = new URL(process.env.WHATSAPP_API_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        console.log(`WhatsApp API response (${res.statusCode}): ${body}`);
      });
    });

    req.on('error', (err) => {
      console.error('WhatsApp API error:', err.message);
    });

    req.write(payload);
    req.end();
  } else {
    console.log('WhatsApp API not configured. Set WHATSAPP_API_KEY and WHATSAPP_API_URL to enable API notifications.');
    console.log('Free method: Use the wa.me link returned to the client instead.');
  }
}

function getWaMeLink(data) {
  const phone = process.env.WHATSAPP_PHONE || '919042324286';
  const lines = [
    `New ${data.type === 'quote' ? 'Quote Request' : 'Enquiry'} - Royal Klense`,
    `Name: ${data.name}`,
    `Company: ${data.company || 'N/A'}`,
    `Phone: ${data.phone || 'N/A'}`,
    `Email: ${data.email}`,
  ];
  if (data.product) lines.push(`Product: ${data.product}`);
  if (data.quantity) lines.push(`Quantity: ${data.quantity}`);
  lines.push(`Message: ${data.message || 'N/A'}`);
  lines.push(`Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);

  const message = lines.join('\n');
  return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
}

module.exports = { sendWhatsApp, getWaMeLink };
