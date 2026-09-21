const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const { getWaMeLink, sendWhatsApp } = require('./whatsapp');

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

const emailUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

const app = express();
const PORT = process.env.PORT || 3000;
const SITE_URL = process.env.SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://royalklense.com');

app.set('trust proxy', true);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.locals.siteUrl = SITE_URL;

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

app.get('/robots.txt', (req, res) => {
  res.type('text/plain; charset=utf-8');
  res.send(`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${SITE_URL}/sitemap.xml\n`);
});

app.get('/sitemap.xml', (req, res) => {
  const urls = [
    '/',
    '/products',
    '/why-us',
    '/contact',
    '/india-cleaning-chemicals-manufacturer',
    '/hospital-cleaning-chemicals',
    '/hotel-cleaning-chemicals',
    '/industrial-cleaning-products',
    '/chennai',
    '/madurai',
    '/dindigul'
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map((path) => `
    <url>
      <loc>${SITE_URL}${path}</loc>
      <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>${path === '/' ? '1.0' : '0.8'}</priority>
    </url>`).join('')}
</urlset>`;

  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.send(xml);
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
        from: `"${name}" <${email}>`,
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
        from: `"${name}" <${email}>`,
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
  const { name, email, phone, company, product, quantity, message, items, category, location, pincode } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, error: 'Name is required.' });
  }

  var emailStr = email || 'N/A';

  var productListHtml = 'N/A';
  if (items && items.length) {
    var groups = {};
    items.forEach(function(i) {
      var cat = i.category || 'all';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(i);
    });
    var listItems = [];
    Object.keys(groups).forEach(function(cat) {
      listItems.push('<li style="list-style:none;margin-top:12px;margin-bottom:4px"><strong>' + cat.charAt(0).toUpperCase() + cat.slice(1) + '</strong></li>');
      groups[cat].forEach(function(i, idx) {
        listItems.push('<li>' + (idx + 1) + '. ' + i.product + ' — ' + i.quantity + '</li>');
      });
    });
    productListHtml = '<ul style="padding-left:20px;margin:4px 0;list-style:none">' + listItems.join('') + '</ul>';
  }

  const data = {
    name,
    email: emailStr,
    phone: phone || 'N/A',
    company: company || 'N/A',
    product: product || 'N/A',
    quantity: quantity || 'N/A',
    category: category || 'N/A',
    location: location || 'N/A',
    pincode: pincode || 'N/A',
    message: message || 'N/A',
    type: 'quote',
    receivedAt: new Date().toISOString()
  };

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
      from: `"${name}" <${emailStr}>`,
      replyTo: emailStr,
      to: process.env.CONTACT_EMAIL || 'sanjeethbabumani@gmail.com',
      subject: `New Quote Request from ${name} - Royal Klense`,
      html: `
        <h2>New Quote Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${emailStr}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Location:</strong> ${data.location}</p>
        <p><strong>Pincode:</strong> ${data.pincode}</p>
        <p><strong>Products:</strong></p>
        ${productListHtml}
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

app.post('/api/direct-quote', (req, res) => {
  const { name, phone, email, city, pincode, product, quantity } = req.body;

  if (!name || !product) {
    return res.status(400).json({ success: false, error: 'Name and product are required.' });
  }

  var emailStr = email || 'N/A';

  const data = {
    name,
    phone: phone || 'N/A',
    email: emailStr,
    city: city || 'N/A',
    pincode: pincode || 'N/A',
    product: product || 'N/A',
    quantity: quantity || 'N/A',
    type: 'direct-quote',
    receivedAt: new Date().toISOString()
  };

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
      from: `"${name}" <${emailStr}>`,
      replyTo: emailStr,
      to: process.env.CONTACT_EMAIL || 'sanjeethbabumani@gmail.com',
      subject: `Direct Quote Request: ${product} from ${name} - Royal Klense`,
      html: `
        <h2>Direct Quote Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        <p><strong>Email:</strong> ${emailStr}</p>
        <p><strong>City:</strong> ${data.city}</p>
        <p><strong>Pincode:</strong> ${data.pincode}</p>
        <p><strong>Product:</strong> ${data.product}</p>
        <p><strong>Quantity:</strong> ${data.quantity}</p>
      `
    };

    transporter.sendMail(mailOptions).catch(err => {
      console.error('Email send failed:', err.message);
    });
  }

  res.json({
    success: true,
    message: 'Your quote request for ' + product + ' has been submitted. Our team will respond within 24 hours.'
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

  res.json({ success: true, message: 'Thank you for subscribing to our newsletter.' });
});

app.post('/api/send-email', emailUpload.array('attachments', 5), async (req, res) => {
  const { from, to, cc, subject, body } = req.body;

  if (!from || !to || !subject || !body) {
    return res.status(400).json({ success: false, error: 'From, To, Subject, and Message are required.' });
  }

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
    return res.status(500).json({ success: false, error: 'Email service not configured.' });
  }

  if (!transporter) {
    return res.status(500).json({ success: false, error: 'Email service not configured.' });
  }

  const mailOptions = {
    from: from,
    replyTo: from,
    to: to,
    cc: cc || undefined,
    subject: subject,
    html: body
  };

  if (req.files && req.files.length > 0) {
    mailOptions.attachments = req.files.map(f => ({
      filename: f.originalname,
      content: f.buffer
    }));
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent from ${from} to ${to}`);
    res.json({ success: true, message: 'Email sent successfully.' });
  } catch (err) {
    console.error('Email send failed:', err.message);
    res.status(500).json({ success: false, error: 'Failed to send email. ' + err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const pageMeta = {
  home: {
    title: 'Royal Klense | Cleaning Chemicals Manufacturer in India',
    description: 'Royal Klense is a trusted cleaning chemicals manufacturer and hygiene solutions supplier in India for hotels, hospitals, manufacturing units, institutions, and commercial facilities.',
    canonical: '/',
    image: `${SITE_URL}/images/logo.png`
  },
  about: {
    title: 'About Royal Klense | Cleaning Chemicals Company in India',
    description: 'Learn about Royal Klense, a leading cleaning chemicals and hygiene products manufacturer serving businesses across India with dependable quality and service.',
    canonical: '/about',
    image: `${SITE_URL}/images/logo.png`
  },
  products: {
    title: 'Cleaning Chemicals & Hygiene Products Supplier in India | Royal Klense',
    description: 'Discover Royal Klense cleaning chemicals, industrial cleaners, housekeeping products, and hygiene solutions for hotels, hospitals, factories, and commercial facilities across India.',
    canonical: '/products',
    image: `${SITE_URL}/images/logo.png`
  },
  industries: {
    title: 'Industrial Cleaning Solutions in India | Royal Klense',
    description: 'Royal Klense provides commercial cleaning, hospital hygiene, and hotel housekeeping solutions across India for businesses that need reliable cleaning performance.',
    canonical: '/industries',
    image: `${SITE_URL}/images/logo.png`
  },
  'why-us': {
    title: 'Why Choose Royal Klense | Cleaning Chemicals Supplier in India',
    description: 'Learn why businesses choose Royal Klense for premium cleaning chemicals, hygiene solutions, and dependable service support across India.',
    canonical: '/why-us',
    image: `${SITE_URL}/images/logo.png`
  },
  contact: {
    title: 'Contact Royal Klense | Cleaning Chemicals Supplier in India',
    description: 'Contact Royal Klense for product enquiries, quotes, and bulk cleaning chemical orders for hotels, hospitals, and industrial facilities across India.',
    canonical: '/contact',
    image: `${SITE_URL}/images/logo.png`
  }
};

function buildLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Royal Klense',
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    image: `${SITE_URL}/images/logo.png`,
    description: 'Royal Klense supplies cleaning chemicals, hygiene solutions, and housekeeping products for hotels, hospitals, industries, institutions, and commercial facilities across India.',
    email: 'sanjeethbabumani@gmail.com',
    telephone: '+91 63693 11595',
    areaServed: [
      'Chennai',
      'Madurai',
      'Dindigul',
      'Tamil Nadu',
      'India',
      'South India',
      'India'
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
      addressRegion: 'Tamil Nadu'
    },
    sameAs: [
      'https://royalklense.com/'
    ],
    contactPoint: [{
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: '+91 63693 11595',
      email: 'sanjeethbabumani@gmail.com',
      areaServed: 'IN',
      availableLanguage: ['English', 'Tamil']
    }]
  };
}

function renderPage(res, page, view) {
  const meta = { ...pageMeta[page], currentPage: page };
  const canonical = meta.canonical && meta.canonical.startsWith('http') ? meta.canonical : `${SITE_URL}${meta.canonical || '/'}`;
  meta.canonical = canonical;
  meta.ogUrl = canonical;
  meta.image = meta.image || `${SITE_URL}/images/logo.png`;
  meta.schema = buildLocalBusinessSchema();
  res.render(view, meta);
}

const servicePageMeta = {
  india: {
    title: 'Royal Klense India | Cleaning Chemicals Manufacturer in India',
    description: 'Royal Klense is an India-based cleaning chemicals manufacturer and hygiene solutions supplier serving hospitals, hotels, industries, and institutions across the country.',
    canonical: '/india-cleaning-chemicals-manufacturer',
    heading: 'Royal Klense India',
    subtitle: 'Cleaning chemicals manufacturer serving hospitals, hotels, institutions, and industrial facilities across India.'
  },
  hospital: {
    title: 'Hospital Cleaning Chemicals | Royal Klense',
    description: 'Royal Klense supplies hospital cleaning chemicals, disinfectants, and hygiene products for healthcare facilities and medical environments across India.',
    canonical: '/hospital-cleaning-chemicals',
    heading: 'Hospital Cleaning Chemicals',
    subtitle: 'Trusted hospital-grade disinfectants and cleaning solutions for healthcare environments.'
  },
  hotel: {
    title: 'Hotel Cleaning Chemicals | Royal Klense',
    description: 'Royal Klense provides hotel cleaning chemicals and housekeeping products for guest rooms, kitchens, restaurants, and public areas across India.',
    canonical: '/hotel-cleaning-chemicals',
    heading: 'Hotel Cleaning Chemicals',
    subtitle: 'High-performance cleaning and housekeeping solutions designed for hospitality operations.'
  },
  industrial: {
    title: 'Industrial Cleaning Products | Royal Klense',
    description: 'Royal Klense supplies industrial cleaning products for factories, workshops, warehouses, and commercial facilities that need powerful and reliable cleaning performance.',
    canonical: '/industrial-cleaning-products',
    heading: 'Industrial Cleaning Products',
    subtitle: 'Heavy-duty cleaning systems for manufacturing, commercial, and industrial environments.'
  }
};

function renderServicePage(res, pageKey) {
  const meta = { ...servicePageMeta[pageKey] };
  meta.currentPage = pageKey;
  meta.canonical = `${SITE_URL}${meta.canonical}`;
  meta.ogUrl = meta.canonical;
  meta.image = `${SITE_URL}/images/logo.png`;
  meta.schema = {
    ...buildLocalBusinessSchema(),
    name: `Royal Klense ${meta.heading}`,
    description: meta.description,
    areaServed: ['India', 'Tamil Nadu', 'South India']
  };
  res.render('service', meta);
}

const cityPageMeta = {
  chennai: {
    title: 'Royal Klense Chennai | Cleaning Chemicals Supplier in Chennai',
    description: 'Royal Klense supplies premium cleaning chemicals, hospital hygiene products, and housekeeping solutions in Chennai for hotels, hospitals, and commercial spaces.',
    canonical: '/chennai',
    city: 'Chennai',
    cityText: 'Chennai'
  },
  madurai: {
    title: 'Royal Klense Madurai | Cleaning Chemicals Supplier in Madurai',
    description: 'Royal Klense provides industrial cleaning chemicals, hygiene products, and housekeeping solutions in Madurai for schools, hotels, hospitals, and businesses.',
    canonical: '/madurai',
    city: 'Madurai',
    cityText: 'Madurai'
  },
  dindigul: {
    title: 'Royal Klense Dindigul | Cleaning Chemicals Supplier in Dindigul',
    description: 'Royal Klense supplies dependable cleaning chemicals and housekeeping products in Dindigul for hospitals, hotels, institutions, and industrial facilities.',
    canonical: '/dindigul',
    city: 'Dindigul',
    cityText: 'Dindigul'
  }
};

function renderCityPage(res, cityKey) {
  const meta = { ...cityPageMeta[cityKey] };
  meta.currentPage = cityKey;
  meta.canonical = `${SITE_URL}${meta.canonical}`;
  meta.ogUrl = meta.canonical;
  meta.image = `${SITE_URL}/images/logo.png`;
  meta.schema = {
    ...buildLocalBusinessSchema(),
    name: `Royal Klense ${meta.city}`,
    description: `Royal Klense is a trusted cleaning chemicals supplier in ${meta.city} for hotels, hospitals, and industrial facilities.`,
    areaServed: [meta.city, 'Tamil Nadu', 'India']
  };
  res.render('city', meta);
}

app.get('/', (req, res) => renderPage(res, 'home', 'index'));
app.get('/home', (req, res) => renderPage(res, 'home', 'index'));
app.get('/royal-klense', (req, res) => res.redirect(301, '/'));
app.get('/royal-klense/', (req, res) => res.redirect(301, '/'));
app.get('/royal-clense', (req, res) => res.redirect(301, '/'));
app.get('/royal-clense/', (req, res) => res.redirect(301, '/'));
app.get('/royalklense', (req, res) => res.redirect(301, '/'));
app.get('/royalklense/', (req, res) => res.redirect(301, '/'));

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${SITE_URL}/sitemap.xml\n`);
});

app.get('/sitemap.xml', (req, res) => {
  const urls = [
    '/',
    '/products',
    '/why-us',
    '/contact'
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map((path) => `
    <url>
      <loc>${SITE_URL}${path}</loc>
      <changefreq>weekly</changefreq>
      <priority>${path === '/' ? '1.0' : '0.8'}</priority>
    </url>`).join('')}
</urlset>`;

  res.type('application/xml');
  res.send(xml);
});

app.get('/about', (req, res) => res.redirect('/#about'));
app.get('/products', (req, res) => renderPage(res, 'products', 'products'));
app.get('/industries', (req, res) => res.redirect('/#industries'));
app.get('/why-us', (req, res) => renderPage(res, 'why-us', 'why-us'));
app.get('/contact', (req, res) => renderPage(res, 'contact', 'contact'));
app.get('/india-cleaning-chemicals-manufacturer', (req, res) => renderServicePage(res, 'india'));
app.get('/hospital-cleaning-chemicals', (req, res) => renderServicePage(res, 'hospital'));
app.get('/hotel-cleaning-chemicals', (req, res) => renderServicePage(res, 'hotel'));
app.get('/industrial-cleaning-products', (req, res) => renderServicePage(res, 'industrial'));
app.get('/chennai', (req, res) => renderCityPage(res, 'chennai'));
app.get('/madurai', (req, res) => renderCityPage(res, 'madurai'));
app.get('/dindigul', (req, res) => renderCityPage(res, 'dindigul'));
app.get('/royal-klense-chennai', (req, res) => res.redirect(301, '/chennai'));
app.get('/royal-klense-madurai', (req, res) => res.redirect(301, '/madurai'));
app.get('/royal-klense-dindigul', (req, res) => res.redirect(301, '/dindigul'));
app.get('/cleaning-chemicals-manufacturer-india', (req, res) => res.redirect(301, '/india-cleaning-chemicals-manufacturer'));
app.get('/hospital-cleaning-chemicals-india', (req, res) => res.redirect(301, '/hospital-cleaning-chemicals'));
app.get('/hotel-cleaning-chemicals-india', (req, res) => res.redirect(301, '/hotel-cleaning-chemicals'));
app.get('/industrial-cleaning-products-india', (req, res) => res.redirect(301, '/industrial-cleaning-products'));

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
