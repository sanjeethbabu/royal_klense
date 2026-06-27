if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

const siteData = {
  products: [
    { icon: 'fas fa-soap', name: 'Soap Oils & Cleaners', desc: 'Premium hand washes, body soaps, and multipurpose liquid cleaners for professional use.' },
    { icon: 'fas fa-tshirt', name: 'Laundry Essentials', desc: 'Industrial laundry detergents, fabric softeners, and stain removal solutions.' },
    { icon: 'fas fa-utensils', name: 'Kitchen Care', desc: 'Degreasers, dishwashing liquids, and kitchen surface sanitizers for commercial kitchens.' },
    { icon: 'fas fa-broom', name: 'Floor Care', desc: 'Floor cleaners, polishes, and maintenance solutions for all surface types.' },
    { icon: 'fas fa-shower', name: 'Bathroom Solutions', desc: 'Toilet cleaners, bathroom sprays, and descaling solutions for hygiene.' },
    { icon: 'fas fa-hand-sparkles', name: 'Hygiene Essentials', desc: 'Hand sanitizers, surface disinfectants, and infection control products.' },
    { icon: 'fas fa-wind', name: 'Glass & Surface Care', desc: 'Streak-free glass cleaners and multi-surface polishing solutions.' },
    { icon: 'fas fa-vial', name: 'Specialty Products', desc: 'Specialized cleaning agents for industrial and institutional applications.' },
    { icon: 'fas fa-trash-alt', name: 'Waste Management', desc: 'Odor control solutions, bin cleaners, and waste treatment chemicals.' },
    { icon: 'fas fa-tools', name: 'Cleaning Accessories', desc: 'Dispensers, mops, buckets, and professional cleaning equipment.' }
  ],
  topProducts: [
    { icon: 'fas fa-soap', name: 'PROFESSIONAL HAND WASH', desc: 'Premium quality hand wash with moisturizers, ideal for hotels and healthcare facilities.', frontIcon: 'fas fa-hand-holding-water' },
    { icon: 'fas fa-wind', name: 'INDUSTRIAL DEGREASER', desc: 'Heavy-duty degreaser for commercial kitchens and industrial applications.', frontIcon: 'fas fa-oil-can' },
    { icon: 'fas fa-shield-alt', name: 'SURFACE DISINFECTANT', desc: 'Hospital-grade disinfectant effective against bacteria, viruses, and fungi.', frontIcon: 'fas fa-shield-virus' }
  ],
  videos: [
    { title: 'Quality Manufacturing Process', desc: 'See how we maintain international quality standards.', icon: 'fas fa-play-circle' },
    { title: 'Client Success Stories', desc: 'Hear from our satisfied partners across industries.', icon: 'fas fa-play-circle' },
    { title: 'Product Application Guide', desc: 'Learn the best practices for using our products.', icon: 'fas fa-play-circle' }
  ],
  industries: [
    { icon: 'fas fa-hotel', name: 'Hotels & Resorts', desc: 'Complete hygiene solutions for housekeeping, laundry, kitchen, and public areas.' },
    { icon: 'fas fa-hospital', name: 'Hospitals & Healthcare', desc: 'Medical-grade disinfectants and infection control products for healthcare facilities.' },
    { icon: 'fas fa-utensils', name: 'Restaurants & Catering', desc: 'Professional kitchen cleaning and sanitation solutions for food service.' },
    { icon: 'fas fa-school', name: 'Educational Institutions', desc: 'Safe and effective cleaning solutions for schools, colleges, and universities.' },
    { icon: 'fas fa-building', name: 'Corporate Offices', desc: 'Professional cleaning and hygiene products for workplace environments.' },
    { icon: 'fas fa-industry', name: 'Manufacturing Industries', desc: 'Heavy-duty industrial cleaners and specialized maintenance chemicals.' },
    { icon: 'fas fa-store', name: 'Commercial Buildings', desc: 'Complete facility management cleaning solutions for commercial properties.' },
    { icon: 'fas fa-chess', name: 'Facility Management', desc: 'Comprehensive cleaning programs tailored for facility management companies.' }
  ],
  features: [
    { icon: 'fas fa-certificate', name: 'ISO Quality Standards', desc: 'Our manufacturing processes are ISO certified, ensuring consistent quality across all products.' },
    { icon: 'fas fa-chart-line', name: 'Consistent Performance', desc: 'Every batch is tested for quality and consistency, delivering reliable results every time.' },
    { icon: 'fas fa-tag', name: 'Competitive Pricing', desc: 'Premium quality products at competitive prices through efficient manufacturing and supply chain.' },
    { icon: 'fas fa-truck', name: 'Reliable Supply Chain', desc: 'Pan India distribution network ensuring timely delivery to all locations.' },
    { icon: 'fas fa-heart', name: 'Customer-Centric Service', desc: 'Dedicated customer support team providing personalized service and technical assistance.' },
    { icon: 'fas fa-cogs', name: 'Customized Solutions', desc: 'Tailored product formulations and cleaning programs for specific industry requirements.' },
    { icon: 'fas fa-leaf', name: 'Eco-Friendly Approach', desc: 'Environmentally responsible manufacturing with biodegradable and sustainable products.' },
    { icon: 'fas fa-headset', name: 'Technical Support', desc: 'Expert technical team providing application guidance and troubleshooting support.' }
  ],
  testimonials: [
    { text: 'Royal Klense has been our trusted partner for over 5 years. Their products consistently meet our high standards for quality and reliability.', author: 'Rajesh Mehta', role: 'General Manager, Grand Palace Hotels' },
    { text: 'The quality of their disinfectants and hygiene products is exceptional. Our infection control ratings have improved significantly since switching to Royal Klense.', author: 'Dr. Priya Sharma', role: 'Chief of Operations, City Healthcare Group' },
    { text: 'Their customized cleaning solutions have transformed our facility management operations. Highly professional team with excellent product knowledge.', author: 'Amit Verma', role: 'Director, Elite Facility Management' },
    { text: 'We have been sourcing laundry and kitchen chemicals from Royal Klense for our restaurant chain. Consistent quality and reliable supply chain.', author: 'Vikram Singh', role: 'Owner, Royal Hospitality Group' }
  ]
};

const API_BASE = '';

function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

function openModal(content) {
  const overlay = document.getElementById('modalOverlay');
  const body = document.getElementById('modalBody');
  body.innerHTML = content;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function loadProducts() {
  const grid = document.getElementById('productsGrid');
  const filterBar = document.getElementById('productsFilterBar');
  if (!grid) return;

  const gradients = [
    'from-#C9A227-to-#9a7a1a', 'from-#0B1D3A-to-#17305c', 'from-#1a6b3c-to-#0f4d2a',
    'from-#8B4513-to-#5c2d0a', 'from-#1a5276-to-#0e344e', 'from-#6c3483-to-#4a235a',
    'from-#117a65-to-#0b5345', 'from-#b7950b-to-#7d6608', 'from-#922b21-to-#641e16',
    'from-#2c3e50-to-#1a252f'
  ];

  const gradColors = [
    ['#C9A227', '#9a7a1a'], ['#0B1D3A', '#17305c'], ['#1a6b3c', '#0f4d2a'],
    ['#8B4513', '#5c2d0a'], ['#1a5276', '#0e344e'], ['#6c3483', '#4a235a'],
    ['#117a65', '#0b5345'], ['#b7950b', '#7d6608'], ['#922b21', '#641e16'],
    ['#2c3e50', '#1a252f']
  ];

  if (filterBar) {
    const cats = siteData.products.map(p => p.name);
    filterBar.innerHTML = `<button class="filter-btn active" data-filter="all">All Categories</button>` +
      cats.map((c, i) => `<button class="filter-btn" data-filter="cat-${i}">${c}</button>`).join('');

    filterBar.addEventListener('click', e => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('.product-card').forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = '';
          card.style.animation = 'none';
          card.style.animationDelay = '';
          void card.offsetHeight;
          card.style.animation = 'cardFadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards';
        } else {
          card.style.animation = 'none';
          card.style.display = 'none';
        }
      });
    });
  }

  grid.innerHTML = siteData.products.map((p, i) => `
    <div class="product-card enhanced-product-card" style="animation-delay: ${i * 0.08}s" data-category="cat-${i}" onclick="openProductModal('${p.name}', '${p.desc}')">
      <div class="product-card-bg" style="background: linear-gradient(135deg, ${gradColors[i][0]}15, ${gradColors[i][1]}08)"></div>
      <div class="product-card-shine"></div>
      <div class="product-card-inner">
        <div class="product-icon-wrap" style="background: linear-gradient(135deg, ${gradColors[i][0]}20, ${gradColors[i][1]}10); color: ${gradColors[i][0]}">
          <i class="${p.icon}"></i>
        </div>
        <span class="product-badge" style="background: ${gradColors[i][0]}">${p.name.split(' ')[0]}</span>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <span class="product-link">Explore Range <i class="fas fa-arrow-right"></i></span>
      </div>
      <div class="product-card-edge" style="background: linear-gradient(90deg, ${gradColors[i][0]}, ${gradColors[i][1]})"></div>
    </div>
  `).join('');
}

function openProductModal(name, desc) {
  openModal(`
    <div style="text-align:center">
      <h2>${name}</h2>
      <p>${desc}</p>
      <p style="font-size:0.9rem;color:var(--text-light);margin-top:16px">Contact our team for detailed product specifications, pricing, and bulk ordering information.</p>
      <button class="btn btn-primary" onclick="closeModal();openContactModal()" style="margin-top:16px">
        <i class="fas fa-phone-alt"></i> Inquire Now
      </button>
    </div>
  `);
}

function loadIndustries() {
  const topGrid = document.getElementById('industriesGridTop');
  const bottomGrid = document.getElementById('industriesGridBottom');
  if (topGrid) {
    topGrid.innerHTML = siteData.industries.slice(0, 4).map((ind, i) => `
      <div class="industry-card reveal" data-delay="${i * 100}">
        <div class="industry-icon"><i class="${ind.icon}"></i></div>
        <h3>${ind.name}</h3>
        <p>${ind.desc}</p>
      </div>
    `).join('');
  }
  if (bottomGrid) {
    bottomGrid.innerHTML = siteData.industries.slice(4).map((ind, i) => `
      <div class="industry-card reveal" data-delay="${i * 100}">
        <div class="industry-icon"><i class="${ind.icon}"></i></div>
        <h3>${ind.name}</h3>
        <p>${ind.desc}</p>
      </div>
    `).join('');
  }
}

function loadFeatures() {
  const grid = document.getElementById('featuresGrid');
  if (!grid) return;
  grid.innerHTML = siteData.features.map((f, i) => `
    <div class="feature-card reveal" data-delay="${i * 80}">
      <div class="feature-icon"><i class="${f.icon}"></i></div>
      <h3>${f.name}</h3>
      <p>${f.desc}</p>
    </div>
  `).join('');
}

function loadTestimonials() {
  const carousel = document.getElementById('testimonialsCarousel');
  const dots = document.getElementById('testimonialDots');
  if (!carousel || !dots) return;

  carousel.innerHTML = siteData.testimonials.map((t, i) => `
    <div class="testimonial-card ${i === 0 ? 'active' : ''}" data-index="${i}">
      <div class="testimonial-stars">${'★'.repeat(5)}</div>
      <p class="testimonial-text">${t.text}</p>
      <div class="testimonial-author">${t.author}</div>
      <div class="testimonial-role">${t.role}</div>
    </div>
  `).join('');

  dots.innerHTML = siteData.testimonials.map((_, i) => `
    <button class="testimonial-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></button>
  `).join('');
}

let currentTestimonial = 0;

function showTestimonial(index) {
  const cards = document.querySelectorAll('.testimonial-card');
  const dots = document.querySelectorAll('.testimonial-dot');
  if (!cards.length) return;

  cards.forEach(c => c.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));

  currentTestimonial = (index + cards.length) % cards.length;
  cards[currentTestimonial].classList.add('active');
  dots[currentTestimonial].classList.add('active');
}

function startAutoTestimonial() {
  return setInterval(() => showTestimonial(currentTestimonial + 1), 5000);
}

function setupTestimonialControls() {
  const prevBtn = document.getElementById('prevTestimonial');
  const nextBtn = document.getElementById('nextTestimonial');
  const dotsContainer = document.getElementById('testimonialDots');
  if (!prevBtn || !nextBtn || !dotsContainer) return;

  const autoTimer = startAutoTestimonial();

  prevBtn.addEventListener('click', () => {
    clearInterval(autoTimer);
    showTestimonial(currentTestimonial - 1);
  });

  nextBtn.addEventListener('click', () => {
    clearInterval(autoTimer);
    showTestimonial(currentTestimonial + 1);
  });

  dotsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('testimonial-dot')) {
      clearInterval(autoTimer);
      showTestimonial(parseInt(e.target.dataset.index, 10));
    }
  });
}

function setupScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });
}

function setupParallax() {
  if (window.innerWidth < 768) return;
  const hero = document.querySelector('.hero');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        const heroContent = document.querySelector('.hero-content');
        const heroStats = document.querySelector('.hero-stats');
        const heroGeometric = document.querySelector('.hero-geometric');

        if (heroContent && scrolled < window.innerHeight) {
          heroContent.style.transform = `translateY(${scrolled * 0.15}px)`;
          heroContent.style.opacity = 1 - (scrolled / (window.innerHeight * 0.8));
        }
        if (heroStats && scrolled < window.innerHeight) {
          heroStats.style.transform = `translateY(${scrolled * 0.1}px)`;
          heroStats.style.opacity = 1 - (scrolled / (window.innerHeight * 0.6));
        }
        if (heroGeometric) {
          heroGeometric.style.transform = `translate(${scrolled * 0.05}px, ${scrolled * 0.03}px) rotate(${scrolled * 0.02}deg)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  });
}

function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.count);
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        let step = 0;

        const timer = setInterval(() => {
          step++;
          current = Math.min(current + increment, target);
          entry.target.textContent = Math.round(current) + (target >= 1000 ? '+' : '+');
          if (step >= steps) {
            entry.target.textContent = target + '+';
            clearInterval(timer);
          }
        }, duration / steps);

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

let navbarInitialized = false;

function setupNavbar() {
  if (navbarInitialized) return;
  navbarInitialized = true;

  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navBackdrop = document.getElementById('navBackdrop');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!navToggle || !navMenu) return;

  let tickingNav = false;
  window.addEventListener('scroll', () => {
    if (!tickingNav) {
      window.requestAnimationFrame(() => {
        navbar?.classList.toggle('scrolled', window.scrollY > 80);
        tickingNav = false;
      });
      tickingNav = true;
    }
  }, { passive: true });

  function setNavOpen(open) {
    requestAnimationFrame(() => {
      navToggle.classList.toggle('active', open);
      navMenu.classList.toggle('active', open);
      navBackdrop?.classList.toggle('active', open);
      document.documentElement.classList.toggle('nav-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      navMenu.setAttribute('aria-hidden', String(!open));
    });
  }

  navToggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    setNavOpen(!navMenu.classList.contains('active'));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      setNavOpen(false);
    }
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('active')) {
        setNavOpen(false);
      }
    });
  });
}

function setupModal() {
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

function getContactForm() {
  return `
    <h2>Get in Touch</h2>
    <p>Fill out the form below and our team will get back to you within 24 hours.</p>
    <form id="contactForm" onsubmit="handleContact(event)">
      <div class="form-row">
        <div class="form-group">
          <label for="cf_name">Full Name *</label>
          <input type="text" id="cf_name" required placeholder="Your full name">
        </div>
        <div class="form-group">
          <label for="cf_email">Email Address *</label>
          <input type="email" id="cf_email" required placeholder="your@email.com">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="cf_phone">Phone Number</label>
          <input type="tel" id="cf_phone" placeholder="+91 90423 24286">
        </div>
        <div class="form-group">
          <label for="cf_company">Company Name</label>
          <input type="text" id="cf_company" placeholder="Your company">
        </div>
      </div>
      <div class="form-group">
        <label for="cf_message">Message *</label>
        <textarea id="cf_message" required placeholder="Tell us about your requirements..."></textarea>
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center">
        <i class="fas fa-paper-plane"></i> Send Message
      </button>
    </form>
  `;
}

function getQuoteForm() {
  return `
    <h2>Request a Quote</h2>
    <p>Tell us what you need and our sales team will provide a customized quote.</p>
    <form id="quoteForm" onsubmit="handleQuote(event)">
      <div class="form-row">
        <div class="form-group">
          <label for="qf_name">Full Name *</label>
          <input type="text" id="qf_name" required placeholder="Your full name">
        </div>
        <div class="form-group">
          <label for="qf_email">Email Address *</label>
          <input type="email" id="qf_email" required placeholder="your@email.com">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="qf_phone">Phone Number</label>
          <input type="tel" id="qf_phone" placeholder="+91 90423 24286">
        </div>
        <div class="form-group">
          <label for="qf_company">Company Name</label>
          <input type="text" id="qf_company" placeholder="Your company">
        </div>
      </div>
      <div class="form-group">
        <label for="qf_product">Product Interested In *</label>
        <select id="qf_product" required>
          <option value="">Select a category...</option>
          ${siteData.products.map(p => `<option value="${p.name}">${p.name}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label for="qf_quantity">Estimated Quantity</label>
        <input type="text" id="qf_quantity" placeholder="e.g., 100 litres, 50 kgs">
      </div>
      <div class="form-group">
        <label for="qf_message">Additional Details</label>
        <textarea id="qf_message" placeholder="Any specific requirements..."></textarea>
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center">
        <i class="fas fa-file-invoice"></i> Request Quote
      </button>
    </form>
  `;
}

async function handleContact(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

  const data = {
    name: document.getElementById('cf_name').value,
    email: document.getElementById('cf_email').value,
    phone: document.getElementById('cf_phone').value,
    company: document.getElementById('cf_company').value,
    message: document.getElementById('cf_message').value
  };

  try {
    const res = await fetch(`${API_BASE}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.success) {
      const waBtn = result.waLink ? `<a href="${result.waLink}" target="_blank" class="btn btn-whatsapp" style="margin-top:12px;width:100%;justify-content:center">
        <i class="fab fa-whatsapp"></i> Notify Us on WhatsApp
      </a>` : '';
      document.getElementById('modalBody').innerHTML = `
        <div class="form-success">
          <i class="fas fa-check-circle"></i>
          <h3>Thank You!</h3>
          <p>${result.message}</p>
          ${waBtn}
          <button class="btn btn-primary" onclick="closeModal()" style="margin-top:12px">Close</button>
        </div>
      `;
      showToast('Message sent successfully!', 'success');
    } else {
      showToast(result.error || 'Something went wrong.', 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
    }
  } catch (err) {
    showToast('Network error. Please try again.', 'error');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
  }
}

async function handleQuote(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

  const data = {
    name: document.getElementById('qf_name').value,
    email: document.getElementById('qf_email').value,
    phone: document.getElementById('qf_phone').value,
    company: document.getElementById('qf_company').value,
    product: document.getElementById('qf_product').value,
    quantity: document.getElementById('qf_quantity').value,
    message: document.getElementById('qf_message').value
  };

  try {
    const res = await fetch(`${API_BASE}/api/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.success) {
      const waBtn = result.waLink ? `<a href="${result.waLink}" target="_blank" class="btn btn-whatsapp" style="margin-top:12px;width:100%;justify-content:center">
        <i class="fab fa-whatsapp"></i> Notify Us on WhatsApp
      </a>` : '';
      document.getElementById('modalBody').innerHTML = `
        <div class="form-success">
          <i class="fas fa-file-invoice"></i>
          <h3>Quote Requested!</h3>
          <p>${result.message}</p>
          ${waBtn}
          <button class="btn btn-primary" onclick="closeModal()" style="margin-top:12px">Close</button>
        </div>
      `;
      showToast('Quote request submitted!', 'success');
    } else {
      showToast(result.error || 'Something went wrong.', 'error');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-file-invoice"></i> Request Quote';
    }
  } catch (err) {
    showToast('Network error. Please try again.', 'error');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-file-invoice"></i> Request Quote';
  }
}

function openContactModal() {
  openModal(getContactForm());
}

function openQuoteModal() {
  openModal(getQuoteForm());
}

function getJoinTeamForm() {
  return `
    <h2>Join Our Team</h2>
    <p>Interested in building a career with Royal Klense? Share your details and our HR team will reach out.</p>
    <form id="contactForm" onsubmit="handleContact(event)">
      <div class="form-row">
        <div class="form-group">
          <label for="cf_name">Full Name *</label>
          <input type="text" id="cf_name" required placeholder="Your full name">
        </div>
        <div class="form-group">
          <label for="cf_email">Email Address *</label>
          <input type="email" id="cf_email" required placeholder="your@email.com">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="cf_phone">Phone Number</label>
          <input type="tel" id="cf_phone" placeholder="+91 90423 24286">
        </div>
        <div class="form-group">
          <label for="cf_company">Position Applied For</label>
          <input type="text" id="cf_company" placeholder="e.g. Sales Executive, Production">
        </div>
      </div>
      <div class="form-group">
        <label for="cf_message">Tell Us About Yourself *</label>
        <textarea id="cf_message" required placeholder="Your experience, skills, and why you'd like to join Royal Klense..."></textarea>
      </div>
      <button type="submit" class="btn btn-primary" style="width:100%;justify-content:center">
        <i class="fas fa-paper-plane"></i> Submit Application
      </button>
    </form>
  `;
}

function openJoinTeamModal() {
  openModal(getJoinTeamForm());
}

function scrollToHash() {
  const hash = window.location.hash;
  if (!hash) return;
  const target = document.querySelector(hash);
  if (!target) return;
  setTimeout(() => {
    const navHeight = document.getElementById('navbar')?.offsetHeight || 80;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  }, 100);
}

function setupHeroVideo() {
  const video = document.getElementById('heroVideo');
  if (!video) return;
  const source = video.querySelector('source');
  if (source) {
    const base = source.src.split('?')[0];
    source.src = base + '?v=' + Date.now();
  }
  video.load();
  video.addEventListener('loadedmetadata', function() {
    video.currentTime = 0.9;
  }, { once: true });
  video.addEventListener('seeked', function() {
    video.play();
  }, { once: true });
  video.addEventListener('ended', function() {
    video.currentTime = 0.9;
    video.play();
  });
  const heroScroll = document.getElementById('heroScroll');
  const about = document.querySelector('#about');
  if (!about) return;
  setTimeout(function() {
    const navHeight = document.getElementById('navbar')?.offsetHeight || 80;
    const top = about.getBoundingClientRect().top + window.scrollY - navHeight - 16;
    window.scrollTo({ top, behavior: 'smooth' });
    if (heroScroll) heroScroll.style.display = 'none';
  }, 12000);
}

function setupHeroCarousel() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-carousel-dot');
  if (!slides.length) return;

  let current = 0;
  let interval = setInterval(() => {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }, 5000);

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      clearInterval(interval);
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      current = i;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
      interval = setInterval(() => {
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        current = (current + 1) % slides.length;
        slides[current].classList.add('active');
        dots[current].classList.add('active');
      }, 5000);
    });
  });
}

function loadFeaturedProducts() {
  const grid = document.getElementById('topProductsGrid');
  if (!grid) return;
  grid.innerHTML = siteData.topProducts.map((p, i) => `
    <div class="top-product-card reveal" data-delay="${i * 150}">
      <div class="top-product-image">
        <div class="front-image"><i class="${p.icon}" style="font-size:3rem;color:var(--gold)"></i></div>
        <div class="back-image"><i class="${p.frontIcon}" style="font-size:3rem;color:var(--gold)"></i></div>
      </div>
      <div class="top-product-body">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
      </div>
    </div>
  `).join('');
}

function loadVideoTestimonials() {
  const grid = document.getElementById('videoGrid');
  if (!grid) return;
  grid.innerHTML = siteData.videos.map((v, i) => `
    <div class="video-card reveal" data-delay="${i * 150}">
      <div class="video-thumb">
        <i class="${v.icon}"></i>
      </div>
      <div class="video-info">
        <h4>${v.title}</h4>
        <p>${v.desc}</p>
      </div>
    </div>
  `).join('');
}

async function handleFooterContact(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

  const data = {
    name: document.getElementById('ff_name').value,
    email: document.getElementById('ff_email').value,
    message: document.getElementById('ff_message').value
  };

  try {
    const res = await fetch(`${API_BASE}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (result.success) {
      showToast('Message sent successfully!', 'success');
      e.target.reset();
      if (result.waLink) {
        setTimeout(() => {
          if (confirm('Open WhatsApp to notify the team about your enquiry?')) {
            window.open(result.waLink, '_blank');
          }
        }, 1000);
      }
    } else {
      showToast(result.error || 'Something went wrong.', 'error');
    }
  } catch (err) {
    showToast('Network error. Please try again.', 'error');
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
}

function setupTilt3D() {
  const cards = document.querySelectorAll('.tilt-3d:not(.product-card):not(.industry-card):not(.feature-card):not(.manufacturing-card):not(.cert-card):not(.top-product-card)');
  const autoCards = document.querySelectorAll('.product-card, .industry-card, .feature-card, .manufacturing-card, .cert-card, .top-product-card, .stat-tilt, .hero-stat');

  autoCards.forEach(card => {
    card.classList.add('tilt-3d');
    card.style.transition = 'transform 0.4s cubic-bezier(0.03, 0.98, 0.53, 0.99)';
  });

  const allTilt = document.querySelectorAll('.tilt-3d');

  allTilt.forEach(card => {
    let shine = card.querySelector('.shine-3d');
    if (!shine) {
      shine = document.createElement('div');
      shine.className = 'shine-3d';
      card.appendChild(shine);
    }

    card.addEventListener('mouseenter', function(e) {
      if (window.innerWidth < 768) return;
      this._isTilting = true;
    });

    card.addEventListener('mousemove', function(e) {
      if (!this._isTilting || window.innerWidth < 768) return;
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;
      const translateZ = 8;

      const s = this.querySelector('.shine-3d');
      if (s) {
        s.style.setProperty('--shine-x', `${(x / rect.width) * 100}%`);
        s.style.setProperty('--shine-y', `${(y / rect.height) * 100}%`);
        s.style.transform = 'translateX(0)';
        s.style.opacity = '1';
      }

      this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${translateZ}px)`;
    });

    card.addEventListener('mouseleave', function() {
      this._isTilting = false;
      this.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
      const s = this.querySelector('.shine-3d');
      if (s) {
        s.style.opacity = '0';
        s.style.background = 'none';
      }
    });
  });
}

function setup3DGeometrics() {
  if (window.innerWidth < 768) return;
  const containers = document.querySelectorAll('.hero, .page-hero, .cta, .why-us');

  containers.forEach(container => {
    const existing = container.querySelectorAll('.geo-ring, .geo-cube');
    if (existing.length > 0) return;

    for (let i = 0; i < 3; i++) {
      const ring = document.createElement('div');
      ring.className = 'geo-ring geo-ring-pulse';
      const size = 200 + i * 100;
      ring.style.width = size + 'px';
      ring.style.height = size + 'px';
      ring.style.top = (10 + Math.random() * 70) + '%';
      ring.style.left = (5 + Math.random() * 80) + '%';
      ring.style.animationDelay = (-i * 1.5) + 's';
      ring.style.borderWidth = (1 + i * 0.5) + 'px';
      container.appendChild(ring);
    }
  });
}

// Debug helper: highlight elements wider than the viewport (run in dev only)
window.addEventListener('load', () => {
  // No debug overflow highlight on production pages.
});

function setupHeroParticles() {
  const hero = document.querySelector('.hero');
  if (!hero || window.innerWidth < 768) return;

  const particleField = document.createElement('div');
  particleField.className = 'hero-particle-field';
  particleField.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1;';
  hero.insertBefore(particleField, hero.firstChild);

  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle-3d';
    p.style.left = (5 + Math.random() * 90) + '%';
    p.style.bottom = '0';
    p.style.width = (2 + Math.random() * 4) + 'px';
    p.style.height = p.style.width;
    p.style.animation = `particleRise ${6 + Math.random() * 8}s ease-in-out ${Math.random() * 6}s infinite`;
    p.style.opacity = 0.3 + Math.random() * 0.5;
    particleField.appendChild(p);
  }
}

function setup3DCubes() {
  if (window.innerWidth < 768) return;
  const heroes = document.querySelectorAll('.hero, .page-hero');

  heroes.forEach(hero => {
    for (let i = 0; i < 3; i++) {
      const cube = document.createElement('div');
      cube.className = 'geo-cube-3d';
      const size = 30 + i * 15;
      cube.style.width = size + 'px';
      cube.style.height = size + 'px';
      cube.style.top = (15 + Math.random() * 60) + '%';
      cube.style.left = (80 + Math.random() * 15) + '%';
      cube.style.animationDelay = (-i * 3) + 's';
      cube.style.borderColor = `rgba(201, 162, 39, ${0.05 + i * 0.03})`;
      hero.appendChild(cube);
    }
  });
}

function setupScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress-3d';
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const scrollTop = h.scrollTop || document.body.scrollTop;
    const scrollHeight = h.scrollHeight - h.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    bar.style.width = progress + '%';
  }, { passive: true });
}

function enhance3DScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal-3d, .reveal-3d-left, .reveal-3d-right, .reveal-3d-scale').forEach(el => {
    observer.observe(el);
  });
}

function setupHero3DDepth() {
  const heroContent = document.querySelector('.hero-content');
  const heroStats = document.querySelector('.hero-stats');
  const heroGeometric = document.querySelector('.hero-geometric');
  const heroTitle = document.querySelector('.hero-title');
  const heroSubtitle = document.querySelector('.hero-subtitle');
  const heroBadge = document.querySelector('.hero-badge');

  if (heroContent) heroContent.classList.add('hero-depth-layer');
  if (heroStats) heroStats.classList.add('hero-depth-layer');
  if (heroGeometric) heroGeometric.classList.add('hero-depth-layer');

  const depthGroups = [
    { el: heroGeometric, depth: 0 },
    { el: heroBadge, depth: 1 },
    { el: heroSubtitle, depth: 2 },
    { el: heroTitle, depth: 3 },
    { el: heroStats, depth: 1 }
  ];

  depthGroups.forEach(({ el, depth }) => {
    if (!el) return;
    el.style.transformStyle = 'preserve-3d';
    el.classList.add('hero-depth-layer');
  });
}

function setupScroll3DParallax() {
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const sy = window.scrollY;

        document.querySelectorAll('.hero-geometric, .geo-ring, .geo-cube').forEach(el => {
          const rate = 0.05;
          el.style.transform = `translateY(${sy * rate}px) rotate(${sy * 0.015}deg) scale(${1 + sy * 0.0003})`;
        });

        document.querySelectorAll('.hero-stats .hero-stat').forEach((stat, i) => {
          const rate = 0.03 + (i * 0.01);
          stat.style.transform = `translateY(${sy * rate}px)`;
        });

        ticking = false;
      });
      ticking = true;
    }
  });
}

function loadPageContent() {
  if (document.getElementById('productsGrid')) loadProducts();
  if (document.getElementById('industriesGridTop') || document.getElementById('industriesGridBottom')) loadIndustries();
  if (document.getElementById('featuresGrid')) loadFeatures();
  if (document.getElementById('topProductsGrid')) loadFeaturedProducts();
  if (document.getElementById('videoGrid')) loadVideoTestimonials();
  if (document.getElementById('testimonialsCarousel')) loadTestimonials();
}

function triggerInViewReveals() {
  document.querySelectorAll('.reveal-3d, .reveal-3d-left, .reveal-3d-right, .reveal-3d-scale, .reveal').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      el.classList.add('visible');
    }
  });
}

function runDeferredEffects() {
  const page = document.body.dataset.page || 'home';
  const isHome = page === 'home';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  setupScrollReveal();
  enhance3DScrollReveal();
  triggerInViewReveals();
  animateCounters();
  setupScrollProgress();

  if (document.getElementById('testimonialsCarousel')) {
    setupTestimonialControls();
  }

  if (reduceMotion || window.innerWidth < 768) {
    triggerInViewReveals();
    return;
  }

  setTimeout(() => {
    setupTilt3D();
    if (isHome) {
      setupParallax();
      setupHeroParticles();
      setup3DCubes();
      setupHero3DDepth();
      setupScroll3DParallax();
      setup3DGeometrics();
    }
  }, 80);
}

const LOADER_MIN_MS = 2500;
const LOADER_MAX_MS = 2500;

function bindCtaButtons() {
  document.querySelector('.cta .btn-primary')?.addEventListener('click', (e) => {
    if (e.currentTarget.getAttribute('onclick')) return;
    e.preventDefault();
    openQuoteModal();
  });

  document.querySelector('.cta .btn-outline')?.addEventListener('click', (e) => {
    if (e.currentTarget.getAttribute('onclick')) return;
    e.preventDefault();
    openContactModal();
  });
}

function hideLoader() {
  const loader = document.getElementById('loader');
  if (!loader || loader.classList.contains('hidden')) return;

  loader.classList.add('exiting');
  loader.setAttribute('aria-hidden', 'true');

  animateTextReveal();
  setupScrollTextReveal();
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.classList.add('rk-reveal');
    document.body.classList.remove('is-loading');
    document.body.style.overflow = '';
    setTimeout(function() {
      document.body.classList.remove('rk-reveal');
    }, 550);
    if (!window.location.hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    requestAnimationFrame(() => {
      runDeferredEffects();
      scrollToHash();
    });
  }, 600);
}

let loaderFinished = false;

function finishLoading() {
  if (loaderFinished) return;
  loaderFinished = true;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const minMs = reduceMotion ? 200 : LOADER_MIN_MS;
  const elapsed = performance.now() - (window.__pageLoadStart || 0);
  const remaining = Math.max(0, minMs - elapsed);
  setTimeout(hideLoader, remaining);
}

var rkTextIdx = 0;

function revealText(el, idx) {
  if (el.classList.contains('rk-revealed')) return;
  el.classList.add('rk-revealed');
  var isShort = (el.textContent || '').trim().length < 60;
  el.classList.add(isShort ? 'rk-text-reveal' : 'rk-text-fade');
  el.style.animationDelay = ((idx || rkTextIdx++) * 20) + 'ms';
}

function animateTextReveal() {
  rkTextIdx = 0;
  document.querySelectorAll(
    '.hero-title, .hero-subtitle, .section-title, .section-tag, .section-desc, ' +
    '.nav-link, .nav-logo, .cta-title, .cta-text, ' +
    '.page-hero .section-title, .page-hero .section-tag, .page-hero .section-desc, ' +
    '.about-text'
  ).forEach(function(el) { revealText(el); });
}

function setupScrollTextReveal() {}

function init() {
  var isFast = document.documentElement.classList.contains('rk-fast');

  if (isFast) {
    loadPageContent();
    setupNavbar();
    setupModal();
    setupHeroVideo();
    bindCtaButtons();
    animateTextReveal();
    setupScrollTextReveal();
    requestAnimationFrame(function() {
      runDeferredEffects();
      scrollToHash();
    });
    setTimeout(function() {
      document.body.classList.remove('is-loading');
      document.body.style.overflow = '';
    }, 480);
    return;
  }

  window.__pageLoadStart = performance.now();

  document.body.classList.add('is-loading');
  document.body.style.overflow = 'hidden';

  loadPageContent();
  setupNavbar();
  setupModal();
  setupHeroVideo();
  bindCtaButtons();

  if (document.readyState === 'complete') {
    finishLoading();
  } else {
    window.addEventListener('load', finishLoading, { once: true });
  }

  setTimeout(finishLoading, LOADER_MAX_MS);
}

document.addEventListener('DOMContentLoaded', init);
