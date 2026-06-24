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
  grid.innerHTML = siteData.products.map((p, i) => `
    <div class="product-card reveal" data-delay="${i * 80}" onclick="openProductModal('${p.name}', '${p.desc}')">
      <div class="product-icon"><i class="${p.icon}"></i></div>
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <span class="product-link">Learn More <i class="fas fa-arrow-right"></i></span>
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

function setupHoverEffects() {
  document.querySelectorAll('.product-card, .industry-card, .feature-card, .manufacturing-card, .cert-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
      const icon = this.querySelector('.product-icon, .industry-icon, .feature-icon, .manufacturing-icon, .cert-icon');
      if (icon) {
        icon.style.transition = 'transform 0.3s ease';
        icon.style.transform = 'scale(1.15) rotate(5deg)';
      }
    });
    card.addEventListener('mouseleave', function() {
      const icon = this.querySelector('.product-icon, .industry-icon, .feature-icon, .manufacturing-icon, .cert-icon');
      if (icon) {
        icon.style.transform = 'scale(1) rotate(0deg)';
      }
    });
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

function setupNavbar() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  let tickingNav = false;
  window.addEventListener('scroll', () => {
    if (!tickingNav) {
      window.requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 80);
        tickingNav = false;
      });
      tickingNav = true;
    }
  });

  navToggle.addEventListener('click', () => {
    const isActive = navMenu.classList.contains('active');
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = isActive ? '' : 'hidden';
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('active') &&
        !navMenu.contains(e.target) &&
        !navToggle.contains(e.target)) {
      navToggle.classList.remove('active');
      navMenu.classList.remove('active');
      document.body.style.overflow = '';
    }
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
          <input type="tel" id="cf_phone" placeholder="+91 98765 43210">
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
          <input type="tel" id="qf_phone" placeholder="+91 98765 43210">
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

function init() {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    document.body.style.overflow = '';
    window.scrollTo({ top: 0, behavior: 'instant' });

    loadProducts();
    loadIndustries();
    loadFeatures();
    loadFeaturedProducts();
    loadVideoTestimonials();
    loadTestimonials();
    setupNavbar();
    setupModal();
    setupScrollReveal();
    setupParallax();
    setupHoverEffects();
    animateCounters();

    const autoTimer = startAutoTestimonial();

    document.getElementById('prevTestimonial').addEventListener('click', () => {
      clearInterval(autoTimer);
      showTestimonial(currentTestimonial - 1);
    });

    document.getElementById('nextTestimonial').addEventListener('click', () => {
      clearInterval(autoTimer);
      showTestimonial(currentTestimonial + 1);
    });

    document.getElementById('testimonialDots').addEventListener('click', (e) => {
      if (e.target.classList.contains('testimonial-dot')) {
        clearInterval(autoTimer);
        showTestimonial(parseInt(e.target.dataset.index));
      }
    });

    document.querySelector('.cta .btn-primary')?.addEventListener('click', (e) => {
      e.preventDefault();
      openQuoteModal();
    });

    document.querySelector('.cta .btn-outline')?.addEventListener('click', (e) => {
      e.preventDefault();
      openContactModal();
    });

  }, 3000);
}

document.addEventListener('DOMContentLoaded', init);
