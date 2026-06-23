const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/images', express.static(path.join(__dirname, 'images')));

app.post('/api/contact', (req, res) => {
  const { name, email, phone, company, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
  }

  const data = {
    name,
    email,
    phone: phone || 'N/A',
    company: company || 'N/A',
    message,
    receivedAt: new Date().toISOString()
  };

  const logDir = path.join(__dirname, 'data');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const filename = `contact-${Date.now()}.json`;
  fs.writeFileSync(path.join(logDir, filename), JSON.stringify(data, null, 2));

  console.log(`Contact inquiry saved: ${filename}`);

  let transporter = null;
  try {
    const nodemailer = require('nodemailer');
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  } catch (e) {
    console.log('Nodemailer not configured, skipping email notification.');
  }

  if (transporter) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL || 'info@royalklense.com',
      subject: `New Contact Inquiry from ${name} - Royal Klense`,
      html: `
        <h2>New Contact Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Company:</strong> ${data.company}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    transporter.sendMail(mailOptions).catch(err => {
      console.error('Email send failed:', err.message);
    });
  }

  res.json({ success: true, message: 'Thank you for your inquiry. Our team will contact you shortly.' });
});

app.post('/api/quote', (req, res) => {
  const { name, email, phone, company, product, quantity, message } = req.body;

  if (!name || !email || !product) {
    return res.status(400).json({ success: false, error: 'Name, email, and product are required.' });
  }

  const data = {
    name,
    email,
    phone: phone || 'N/A',
    company: company || 'N/A',
    product,
    quantity: quantity || 'N/A',
    message: message || 'N/A',
    receivedAt: new Date().toISOString()
  };

  const logDir = path.join(__dirname, 'data');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const filename = `quote-${Date.now()}.json`;
  fs.writeFileSync(path.join(logDir, filename), JSON.stringify(data, null, 2));

  console.log(`Quote request saved: ${filename}`);

  let transporter = null;
  try {
    const nodemailer = require('nodemailer');
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    }
  } catch (e) {
    console.log('Nodemailer not configured, skipping email notification.');
  }

  if (transporter) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL || 'vedhaschem.info@gmail.com',
      subject: `New Quote Request from ${name} - Royal Klense`,
      html: `
        <h2>New Quote Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Company:</strong> ${data.company}</p>
        <p><strong>Product:</strong> ${data.product}</p>
        <p><strong>Quantity:</strong> ${data.quantity}</p>
        <p><strong>Message:</strong> ${data.message}</p>
      `
    };

    transporter.sendMail(mailOptions).catch(err => {
      console.error('Email send failed:', err.message);
    });
  }

  res.json({ success: true, message: 'Your quote request has been submitted. Our sales team will respond within 24 hours.' });
});

app.post('/api/subscribe', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }

  const data = {
    email,
    subscribedAt: new Date().toISOString()
  };

  const logDir = path.join(__dirname, 'data');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const filename = `subscriber-${Date.now()}.json`;
  fs.writeFileSync(path.join(logDir, filename), JSON.stringify(data, null, 2));

  console.log(`New subscriber: ${email}`);
  res.json({ success: true, message: 'Thank you for subscribing to our newsletter.' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.render('index', { title: 'Home', description: 'Royal Klense - Premium hygiene and cleaning solutions manufacturer.' });
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/products', (req, res) => {
  res.render('products');
});

app.get('/industries', (req, res) => {
  res.render('industries');
});

app.get('/why-us', (req, res) => {
  res.render('why-us');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.get('*', (req, res) => {
  res.status(404).render('index', { title: 'Home', description: 'Royal Klense - Premium hygiene and cleaning solutions manufacturer.' });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ success: false, error: 'Internal server error. Please try again later.' });
});

app.listen(PORT, () => {
  console.log(`Royal Klense server running on http://localhost:${PORT}`);
  console.log(`Serving static files from: ${path.join(__dirname, 'public')}`);
  console.log(`Images served from: ${path.join(__dirname, 'images')}`);
});
