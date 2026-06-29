const https = require('https');
const http = require('http');

function sendWhatsApp(data) {
  const phone = process.env.WHATSAPP_PHONE;
  if (!phone) {
    console.log('WHATSAPP_PHONE not set, skipping WhatsApp notification.');
    return;
  }

  const message = buildMessage(data);

  if (process.env.WHATSAPP_API_KEY && process.env.WHATSAPP_API_URL) {
    sendViaMetaApi(phone, message);
  } else if (process.env.WHATSAPP_API_KEY) {
    sendViaCallMeBot(phone, message);
  } else {
    console.log('WhatsApp API not configured. Set WHATSAPP_API_KEY (and optionally WHATSAPP_API_URL) in .env to enable WhatsApp notifications.');
    console.log('Get a free API key at https://www.callmebot.com/blog/free-api-whatsapp-messages/');
  }
}

function buildMessage(data) {
  const lines = [
    `*New ${data.type === 'quote' ? 'Quote Request' : 'Enquiry'} - Royal Klense*`,
    ``,
    `*Name:* ${data.name}`,
    `*Company:* ${data.company || 'N/A'}`,
    `*Phone:* ${data.phone || 'N/A'}`,
    `*Email:* ${data.email}`,
  ];

  if (data.product) {
    lines.push(`*Product:* ${data.product}`);
    lines.push(`*Quantity:* ${data.quantity || 'N/A'}`);
  }
  if (data.location) {
    lines.push(`*Location:* ${data.location}`);
  }
  if (data.category) {
    lines.push(`*Category:* ${data.category}`);
  }

  lines.push(``);
  lines.push(`*Message:*`);
  lines.push(data.message || 'N/A');
  lines.push(``);
  lines.push(`Received: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}`);

  return lines.join('\n');
}

function sendViaMetaApi(phone, message) {
  const payload = JSON.stringify({
    messaging_product: 'whatsapp',
    to: phone,
    type: 'text',
    text: { body: message },
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
}

function sendViaCallMeBot(phone, message) {
  const formattedPhone = phone.replace(/[^0-9]/g, '');
  const text = message.replace(/\*/g, '');
  const url = `https://api.callmebot.com/whatsapp.php?phone=${formattedPhone}&text=${encodeURIComponent(text)}&apikey=${process.env.WHATSAPP_API_KEY}`;

  https.get(url, (res) => {
    let body = '';
    res.on('data', (chunk) => (body += chunk));
    res.on('end', () => {
      console.log(`CallMeBot WhatsApp API response (${res.statusCode}): ${body}`);
    });
  }).on('error', (err) => {
    console.error('CallMeBot WhatsApp API error:', err.message);
  });
}

function getWaMeLink(data) {
  const phone = process.env.WHATSAPP_PHONE || '916379588598';
  const lines = [
    `New ${data.type === 'quote' ? 'Quote Request' : 'Enquiry'} - Royal Klense`,
    `Name: ${data.name}`,
    `Company: ${data.company || 'N/A'}`,
    `Phone: ${data.phone || 'N/A'}`,
    `Email: ${data.email}`,
  ];
  if (data.product) lines.push(`Product: ${data.product}`);
  if (data.quantity) lines.push(`Quantity: ${data.quantity}`);
  if (data.location) lines.push(`Location: ${data.location}`);
  if (data.category) lines.push(`Category: ${data.category}`);
  lines.push(`Message: ${data.message || 'N/A'}`);
  lines.push(`Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}`);

  const message = lines.join('\n');
  return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
}

module.exports = { sendWhatsApp, getWaMeLink };
