const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const { getWaMeLink, sendWhatsApp } = require('./whatsapp');
const { saveEnquiry, saveSubscriber } = require('./db');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are supported.'), false);
    }
    cb(null, true);
  }
});

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

app.post('/api/contact', (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError || err.message === 'Only PDF files are supported.') {
        return res.status(400).json({ success: false, error: err.message });
      }
      return next(err);
    }
    handleContact(req, res);
  });
});

function handleContact(req, res) {
  const { name, email, phone, company, message, position, education, experience, exp_city, exp_state } = req.body;
  const hasResume = req.file && req.file.buffer;

  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'Name and email are required.' });
  }

  if (!hasResume && !message) {
    return res.status(400).json({ success: false, error: 'Message is required.' });
  }

  if (hasResume && (!position || !education || !experience || !exp_city || !exp_state)) {
    return res.status(400).json({ success: false, error: 'All fields are required for job applications.' });
  }

  const data = {
    name,
    email,
    phone: phone || 'N/A',
    company: company || 'N/A',
    position: position || 'N/A',
    education: education || 'N/A',
    experience: experience || 'N/A',
    exp_city: exp_city || 'N/A',
    exp_state: exp_state || 'N/A',
    message: message || 'N/A',
    type: hasResume ? 'job' : 'contact',
    resume_name: hasResume ? req.file.originalname : null,
    receivedAt: new Date().toISOString()
  };

  saveEnquiry(data);

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
    if (hasResume) {
      const mailOptions = {
        from: `"${name}" <${process.env.SMTP_USER}>`,
        replyTo: email,
        to: process.env.CONTACT_EMAIL || 'sanjeethbabumani@gmail.com',
        subject: `Job Application from ${name} - ${position || 'N/A'} - Royal Klense`,
        html: `
          <h2>New Job Application</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <p><strong>Position Applied:</strong> ${data.position}</p>
          <p><strong>Education:</strong> ${data.education}</p>
          <p><strong>Years of Experience:</strong> ${data.experience && String(data.experience).toLowerCase() === 'nil' ? 'Fresher' : data.experience}</p>
          <p><strong>City:</strong> ${data.exp_city}</p>
          <p><strong>State:</strong> ${data.exp_state}</p>
          <p><strong>Message:</strong></p>
          <p>${data.message}</p>
          <hr>
          <p><em>Resume attached: ${req.file.originalname}</em></p>
        `,
        attachments: [{
          filename: req.file.originalname,
          content: req.file.buffer
        }]
      };

      transporter.sendMail(mailOptions).then(() => {
        console.log('Job application email sent with resume.');
      }).catch(err => {
        console.error('Job application email send failed:', err.message);
      });
    } else {
      const mailOptions = {
        from: `"${name}" <${process.env.SMTP_USER}>`,
        replyTo: email,
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
  }

  const waLink = getWaMeLink({ ...data, type: 'contact' });

  sendWhatsApp({ ...data, type: 'contact' });

  res.json({
    success: true,
    message: hasResume ? 'Your application has been submitted successfully.' : 'Thank you for your inquiry. Our team will contact you shortly.',
    waLink,
  });
}

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
    type: 'quote',
    receivedAt: new Date().toISOString()
  };

  saveEnquiry(data);

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

  sendWhatsApp({ ...data, type: 'quote' });

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

  saveSubscriber(email);
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
