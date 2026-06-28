const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { getWaMeLink } = require('./whatsapp');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public'), { index: false }));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/image2', express.static(path.join(__dirname, 'image2')));

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
      to: process.env.CONTACT_EMAIL || 'sanjeethbabumani@gmail.com',
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

  const waLink = getWaMeLink({ ...data, type: 'contact' });

  res.json({
    success: true,
    message: 'Thank you for your inquiry. Our team will contact you shortly.',
    waLink,
  });
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
      to: process.env.CONTACT_EMAIL || 'sanjeethbabumani@gmail.com',
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

  const waLink = getWaMeLink({ ...data, type: 'quote' });

  res.json({
    success: true,
    message: 'Your quote request has been submitted. Our sales team will respond within 24 hours.',
    waLink,
  });
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

const pageMeta = {
  home: {
    title: 'Home',
    description: 'Royal Klense — premium hygiene and cleaning solutions for hotels, hospitals, industries, and institutions. Learn about us, our credentials, and sectors we serve.',
    canonical: '/'
  },
  about: {
    title: 'About Us',
    description: 'Learn about Royal Klense — India\'s trusted manufacturer of premium cleaning chemicals and hygiene solutions with ISO-certified production.',
    canonical: '/about'
  },
  products: {
    title: 'Products',
    description: 'Explore 300+ cleaning and hygiene products across 12 categories — from industrial cleaners to premium hygiene essentials by Royal Klense.',
    canonical: '/products'
  },
  industries: {
    title: 'Industries We Serve',
    description: 'Royal Klense provides tailored cleaning and hygiene solutions for hotels, hospitals, restaurants, institutions, and more.',
    canonical: '/industries'
  },
  'why-us': {
    title: 'Why Choose Us',
    description: 'Discover why businesses trust Royal Klense — ISO-certified quality, reliable supply chain, competitive pricing, and expert technical support.',
    canonical: '/why-us'
  },
  contact: {
    title: 'Contact Us',
    description: 'Get in touch with Royal Klense for product enquiries, quotes, and partnership opportunities. We respond within 24 hours.',
    canonical: '/contact'
  }
};

function renderPage(res, page, view) {
  res.render(view, { ...pageMeta[page], currentPage: page });
}

app.get('/', (req, res) => renderPage(res, 'home', 'index'));
app.get('/home', (req, res) => renderPage(res, 'home', 'index'));

app.get('/about', (req, res) => res.redirect('/#about'));
app.get('/products', (req, res) => renderPage(res, 'products', 'products'));
app.get('/industries', (req, res) => res.redirect('/#industries'));
app.get('/why-us', (req, res) => renderPage(res, 'why-us', 'why-us'));
app.get('/contact', (req, res) => renderPage(res, 'contact', 'contact'));

app.get('*', (req, res) => {
  res.status(404).redirect('/');
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
