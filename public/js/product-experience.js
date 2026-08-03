(function () {
  'use strict';

  var expEl = document.getElementById('productExperience');
  if (!expEl) return;

  expEl.style.opacity = '1';
  expEl.style.animation = 'none';

  var hasThree = typeof THREE !== 'undefined';
  var hasGsap = typeof gsap !== 'undefined';

  if (!hasThree || !hasGsap) {
    document.getElementById('productStage').style.background =
      'radial-gradient(ellipse at center, #0d1124 0%, #0a0e1a 100%)';
  }

  var C = {
    transitionDuration: 0.9,
    ease: 'power3.inOut',
    particleCount: 120,
    floatAmplitude: 0.04,
    floatSpeed: 1.2,
    mouseInfluence: 0.12,
    lightSweepInterval: 4000,
    cameraZ: 4.5,
  };

  var S = {
    products: [],
    currentIndex: 0,
    category: 'freshners',
    isDetailView: false,
    isTransitioning: false,
    totalProducts: 0,
  };

  var $ = function (s, p) { return (p || document).querySelector(s); };
  var $$ = function (s, p) { return [].slice.call((p || document).querySelectorAll(s)); };

  var D = {
    canvas: $('#productCanvas'),
    stage: $('#productStage'),
    badge: $('#productBadgeText'),
    name: $('#productName'),
    flavor: $('#productFlavor'),
    desc: $('#productDesc'),
    explore: $('#exploreBtn'),
    prevBtn: $('#productPrevBtn'),
    nextBtn: $('#productNextBtn'),
    counter: $('#productCounter'),
    total: $('#productTotal'),
    progressFill: $('#progressFill'),
    detailView: $('#productDetailView'),
    detailBackdrop: $('#detailBackdrop'),
    detailClose: $('#detailCloseBtn'),
    detailBadge: $('#detailBadge'),
    detailTitle: $('#detailTitle'),
    detailFlavor: $('#detailFlavor'),
    detailTagline: $('#detailTagline'),
    detailDesc: $('#detailDesc'),
    detailHeroImage: $('#detailHeroImage'),
    detailApplications: $('#detailApplications'),
    detailFeatures: $('#detailFeatures'),
    detailIndustries: $('#detailIndustries'),
    detailUsage: $('#detailUsage'),
    detailSizes: $('#detailSizes'),
    detailBrochureBtn: $('#detailBrochureBtn'),
    detailEnquiryBtn: $('#detailEnquiryBtn'),
    detailSections: $$('.detail-section'),
    detailPrevBtn: $('#detailPrevBtn'),
    detailNextBtn: $('#detailNextBtn'),
    navItems: $$('.left-nav-item'),
  };

  function loadProducts() {
    if (typeof siteData === 'undefined' || !siteData.catalog) return false;
    S.products = siteData.catalog.filter(function (p) {
      return p.category === S.category;
    });
    if (!S.products.length) {
      S.products = siteData.catalog.slice();
      S.category = 'freshners';
    }
    S.totalProducts = S.products.length;
    D.total.textContent = String(S.totalProducts).padStart(2, '0');
    updateUI();
    return true;
  }

  function getFiltered(cat) {
    return siteData.catalog.filter(function (p) { return p.category === cat; });
  }

  function switchCategory(cat) {
    if (cat === S.category || S.isDetailView) return;
    var filtered = getFiltered(cat);
    if (!filtered.length) return;
    S.category = cat;
    S.products = filtered;
    S.totalProducts = S.products.length;
    S.currentIndex = 0;
    D.total.textContent = String(S.totalProducts).padStart(2, '0');
    D.navItems.forEach(function (item) {
      item.classList.toggle('active', item.dataset.category === cat);
    });
    if (currentMesh) {
      transitionToProduct(S.currentIndex);
    } else {
      updateUI();
      initThreeScene();
    }
  }

  /* ─── Three.js ─────────────────────────────────────────── */
  var scene, camera, renderer;
  var particles, particlePositions, particleVelocities;
  var currentMesh, currentShadow, currentGlow;
  var productGroup;
  var clock = new THREE.Clock();
  var mouseX = 0, mouseY = 0;
  var targetRotX = 0, targetRotY = 0;
  var autoRotateY = 0;
  var sweepLight;
  var textureLoader = new THREE.TextureLoader();
  var ambientParticles;
  var isSceneReady = false;
  var bgColor = new THREE.Color(0x0a0e1a);
  var bgTarget = new THREE.Color(0x0a0e1a);
  var animFrameId = null;
  var envMap;

  function initThreeScene() {
    if (!D.canvas || !D.canvas.parentElement) return;

    var w = D.canvas.clientWidth || window.innerWidth;
    var h = D.canvas.clientHeight || window.innerHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);

    camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    camera.position.set(0, 0.2, 4.5);
    camera.lookAt(0, 0, 0);

    try {
      renderer = new THREE.WebGLRenderer({
        canvas: D.canvas,
        antialias: true,
        alpha: false,
      });
    } catch (e) {
      D.stage.style.background = 'linear-gradient(135deg, #0a0e1a, #0d1124)';
      return;
    }

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;

    if (renderer.capabilities && renderer.capabilities.isWebGL2 === false) {
      renderer.toneMapping = THREE.LinearToneMapping;
    }

    try {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.shadowMap.bias = 0.001;
    } catch (e) {}

    try { renderer.outputEncoding = THREE.sRGBEncoding; } catch (e) {}

    /* Lights — studio 3-point + rim */
    var ambient = new THREE.AmbientLight(0x222244, 0.6);
    scene.add(ambient);

    var keyLight = new THREE.DirectionalLight(0xffeedd, 2.2);
    keyLight.position.set(4, 5, 4);
    scene.add(keyLight);

    var fillLight = new THREE.DirectionalLight(0x8899ff, 0.8);
    fillLight.position.set(-3, 0.5, -3);
    scene.add(fillLight);

    var rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
    rimLight.position.set(0, -3, 5);
    scene.add(rimLight);

    var topLight = new THREE.DirectionalLight(0xddddff, 0.4);
    topLight.position.set(0, 6, 0);
    scene.add(topLight);

    sweepLight = new THREE.PointLight(0xffd700, 1.5, 8);
    sweepLight.position.set(-4, 1, 2);
    scene.add(sweepLight);

    /* Environment map */
    var pmrem = new THREE.PMREMGenerator(renderer);
    var envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x111122);
    var envTexture = pmrem.fromScene(envScene, 0, 0.1, 100).texture;
    envMap = envTexture;
    pmrem.dispose();

    productGroup = new THREE.Group();
    scene.add(productGroup);

    createParticles();
    createAmbientParticles();
    loadProductTexture(S.currentIndex);
    startLightSweep();

    isSceneReady = true;
    animate();
  }

  function createParticles() {
    var count = C.particleCount;
    var positions = new Float32Array(count * 3);
    particleVelocities = [];

    for (var i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
      particleVelocities.push({
        y: Math.random() * 0.004 + 0.001,
      });
    }
    particlePositions = positions;

    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    var material = new THREE.PointsMaterial({
      color: 0xc9a227,
      size: 0.03,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
  }

  function createAmbientParticles() {
    var count = 30;
    var pos = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var mat = new THREE.PointsMaterial({
      color: 0xffd700,
      size: 0.015,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    ambientParticles = new THREE.Points(geo, mat);
    scene.add(ambientParticles);
  }

  function disposeMesh(mesh) {
    if (!mesh) return;
    if (mesh.geometry) mesh.geometry.dispose();
    var mats = mesh.material;
    if (!mats) return;
    if (Array.isArray(mats)) {
      mats.forEach(function (m) {
        if (m.map) m.map.dispose();
        m.dispose();
      });
    } else {
      if (mats.map) mats.map.dispose();
      mats.dispose();
    }
  }

  function loadProductTexture(index) {
    if (!productGroup) return;
    var product = S.products[index];
    if (!product) return;

    while (productGroup.children.length) {
      var child = productGroup.children[0];
      if (child === currentMesh) {
        disposeMesh(child);
      } else if (child === currentGlow) {
        disposeMesh(child);
      } else if (child === currentShadow) {
        disposeMesh(child);
      }
      productGroup.remove(child);
    }

    /* ---- 3D product card with physical depth ---- */
    var w = 2;
    var h = 2.6;
    var d = 0.2;
    var geo = new THREE.BoxGeometry(w, h, d);

    var frontMat = new THREE.MeshPhysicalMaterial({
      transparent: true,
      roughness: 0.08,
      metalness: 0.1,
      clearcoat: 0.4,
      clearcoatRoughness: 0.2,
      side: THREE.FrontSide,
      envMap: envMap,
      envMapIntensity: 0.6,
    });

    var sideMat = new THREE.MeshPhysicalMaterial({
      color: 0x222240,
      roughness: 0.4,
      metalness: 0.15,
      envMap: envMap,
      envMapIntensity: 0.3,
    });

    var backMat = new THREE.MeshPhysicalMaterial({
      color: 0x111122,
      roughness: 0.5,
      metalness: 0.1,
    });

    var mats = [sideMat, sideMat, sideMat, sideMat, frontMat, backMat];
    currentMesh = new THREE.Mesh(geo, mats);
    currentMesh.position.y = 0.1;

    if (product.image) {
      textureLoader.load(product.image, function (tex) {
        frontMat.map = tex;
        frontMat.needsUpdate = true;
      });
    }

    productGroup.add(currentMesh);

    /* ---- Glow ring behind ---- */
    var glowGeo = new THREE.PlaneGeometry(w + 0.6, h + 0.6);
    var glowMat = new THREE.MeshBasicMaterial({
      color: 0xc9a227,
      transparent: true,
      opacity: 0.04,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    currentGlow = new THREE.Mesh(glowGeo, glowMat);
    currentGlow.position.z = -d / 2 - 0.05;
    productGroup.add(currentGlow);

    /* ---- Shadow on ground ---- */
    var shadowGeo = new THREE.CircleGeometry(0.9, 32);
    var shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
    });
    currentShadow = new THREE.Mesh(shadowGeo, shadowMat);
    currentShadow.rotation.x = -Math.PI / 2;
    currentShadow.position.y = -h / 2 - 0.02;
    productGroup.add(currentShadow);

    /* Enter animation */
    productGroup.scale.set(0.3, 0.3, 0.3);
    productGroup.position.y = -0.3;
    gsap.to(productGroup.scale, { x: 1, y: 1, z: 1, duration: C.transitionDuration, ease: C.ease });
    gsap.to(productGroup.position, { y: 0, duration: C.transitionDuration, ease: C.ease });
    gsap.to(glowMat, { opacity: 0.04, duration: C.transitionDuration, ease: C.ease });
    gsap.to(shadowMat, { opacity: 0.3, duration: C.transitionDuration, ease: C.ease });
  }

  function transitionToProduct(index) {
    if (S.isTransitioning || !S.products[index] || index === S.currentIndex) return;
    S.isTransitioning = true;
    S.currentIndex = index;

    bgTarget.setHSL(Math.random() * 0.05 + 0.6, 0.3, 0.06);

    if (productGroup) {
      gsap.to(productGroup.scale, { x: 0.3, y: 0.3, z: 0.3, duration: 0.4, ease: 'power2.in' });
      gsap.to(productGroup.position, { y: -0.6, duration: 0.4, ease: 'power2.in' });
      if (currentGlow) gsap.to(currentGlow.material, { opacity: 0, duration: 0.4, ease: 'power2.in' });
      if (currentShadow) gsap.to(currentShadow.material, { opacity: 0, duration: 0.4, ease: 'power2.in' });
    }

    setTimeout(function () {
      autoRotateY = 0;
      loadProductTexture(index);
      updateUI();
      S.isTransitioning = false;
    }, 450);
  }

  function navigateProduct(dir) {
    if (S.isDetailView || S.isTransitioning) return;
    var n;
    if (dir === 'next') n = (S.currentIndex + 1) % S.totalProducts;
    else n = (S.currentIndex - 1 + S.totalProducts) % S.totalProducts;
    transitionToProduct(n);
  }

  /* ─── UI ──────────────────────────────────────────────── */
  function updateUI() {
    var p = S.products[S.currentIndex];
    if (!p) return;
    var label = p.category === 'freshners' ? 'Freshner' : 'Cleaner';
    D.badge.textContent = label;
    D.name.textContent = p.name;
    D.flavor.textContent = p.flavor;
    D.desc.textContent = p.desc;
    D.counter.textContent = String(S.currentIndex + 1).padStart(2, '0');
    if (D.progressFill) D.progressFill.style.width = ((S.currentIndex + 1) / S.totalProducts * 100) + '%';
  }

  /* ─── Light Sweep ──────────────────────────────────────── */
  function startLightSweep() {
    function doSweep() {
      if (!sweepLight || S.isDetailView) return;
      gsap.to(sweepLight.position, { x: 4, z: -1, duration: 3, ease: 'power2.inOut' });
      gsap.to(sweepLight.position, { x: -4, z: 2, duration: 3, ease: 'power2.inOut', delay: 3 });
    }
    doSweep();
    setInterval(function () {
      if (!S.isDetailView) doSweep();
    }, C.lightSweepInterval);
  }

  /* ─── Animation Loop ───────────────────────────────────── */
  function animate() {
    animFrameId = requestAnimationFrame(animate);
    if (!isSceneReady || !renderer || !scene || !camera) return;

    var time = clock.getElapsedTime();

    scene.background.lerp(bgTarget, 0.015);

    if (productGroup && !S.isDetailView) {
      var floatY = Math.sin(time * C.floatSpeed) * C.floatAmplitude;
      var rotZ = Math.sin(time * C.floatSpeed * 0.7) * 0.006;
      var breathScale = 1 + Math.sin(time * 0.25) * 0.003;

      targetRotX += (mouseY * C.mouseInfluence - targetRotX) * 0.035;
      targetRotY += (mouseX * C.mouseInfluence - targetRotY) * 0.035;

      autoRotateY += 0.006;

      var targetScale = breathScale;
      if (currentMesh) {
        productGroup.scale.x += (targetScale - productGroup.scale.x) * 0.03;
        productGroup.scale.y += (targetScale - productGroup.scale.y) * 0.03;
        productGroup.scale.z += (targetScale - productGroup.scale.z) * 0.03;
      }

      productGroup.position.y += (floatY - productGroup.position.y) * 0.04;
      productGroup.rotation.x += (targetRotX * 1.2 - productGroup.rotation.x) * 0.04;
      productGroup.rotation.y += (targetRotY * 1.5 + autoRotateY - productGroup.rotation.y) * 0.04;
      productGroup.rotation.z += (rotZ - productGroup.rotation.z) * 0.04;
    }

    if (currentGlow) {
      var glowPulse = 0.03 + Math.sin(time * 0.5) * 0.015;
      currentGlow.material.opacity = glowPulse;
    }

    if (particles && particlePositions) {
      var pos = particles.geometry.attributes.position.array;
      for (var i = 0; i < C.particleCount; i++) {
        pos[i * 3 + 1] += particleVelocities[i].y;
        if (pos[i * 3 + 1] > 4) {
          pos[i * 3 + 1] = -4;
          pos[i * 3] = (Math.random() - 0.5) * 14;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y = time * 0.003;
    }

    if (ambientParticles) {
      ambientParticles.rotation.y = time * 0.015;
    }

    if (!S.isDetailView) {
      camera.position.x = Math.sin(time * 0.08) * 0.08;
      camera.position.y = 0.25 + Math.sin(time * 0.06) * 0.05;
      camera.position.z = Math.cos(time * 0.04) * 0.03 + C.cameraZ;
      camera.lookAt(0, 0.05, 0);
    }

    renderer.render(scene, camera);
  }

  /* ─── Interaction ──────────────────────────────────────── */
  function onMouseMove(e) {
    var r = D.canvas.getBoundingClientRect();
    mouseX = (e.clientX - r.left) / r.width - 0.5;
    mouseY = (e.clientY - r.top) / r.height - 0.5;
  }

  function onTouchMove(e) {
    var t = e.touches[0];
    if (!t) return;
    var r = D.canvas.getBoundingClientRect();
    mouseX = (t.clientX - r.left) / r.width - 0.5;
    mouseY = (t.clientY - r.top) / r.height - 0.5;
  }

  function onMouseLeave() {
    mouseX = 0; mouseY = 0;
  }

  /* ─── Scroll / Keyboard Navigation ─────────────────────── */
  function setupNavigation() {
    var blocked = false;
    D.stage.addEventListener('wheel', function (e) {
      if (S.isDetailView) return;
      e.preventDefault();
      if (blocked) return;
      blocked = true;
      navigateProduct(e.deltaY > 0 ? 'next' : 'prev');
      setTimeout(function () { blocked = false; }, 1100);
    }, { passive: false });

    document.addEventListener('keydown', function (e) {
      if (S.isDetailView) {
        if (e.key === 'Escape') closeDetailView();
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); navigateProduct('next'); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); navigateProduct('prev'); }
    });
  }

  function setupSwipe() {
    var sx = 0, sy = 0, swiping = false;
    D.stage.addEventListener('touchstart', function (e) {
      if (S.isDetailView) return;
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      swiping = true;
    }, { passive: true });

    D.stage.addEventListener('touchmove', function (e) {
      if (!swiping || S.isDetailView) return;
      var dy = e.touches[0].clientY - sy;
      if (Math.abs(dy) > 30) {
        swiping = false;
        navigateProduct(dy > 0 ? 'prev' : 'next');
      }
    }, { passive: true });
  }

  /* ─── Detail View ──────────────────────────────────────── */
  function openDetailView() {
    if (S.isDetailView || !S.products[S.currentIndex]) return;
    S.isDetailView = true;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    gsap.to(D.stage, { opacity: 0, duration: 0.4, ease: 'power2.out' });
    D.detailView.classList.add('active');
    populateDetail(S.currentIndex);
    observeDetailSections();
  }

  function closeDetailView() {
    if (!S.isDetailView) return;
    S.isDetailView = false;
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    D.detailView.classList.remove('active');
    D.detailContainer.scrollTop = 0;
    gsap.to(D.stage, { opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.2 });
  }

  function populateDetail(index) {
    var p = S.products[index];
    if (!p) return;

    var label = p.category === 'freshners' ? 'Freshner' : 'Cleaner';
    D.detailBadge.textContent = label;
    D.detailTitle.textContent = p.name;
    D.detailFlavor.textContent = p.flavor;
    D.detailTagline.textContent = label === 'Freshner'
      ? 'Professional Freshness. Designed for Premium Spaces.'
      : 'Professional Cleaning. Engineered for Excellence.';
    D.detailDesc.textContent = p.desc;

    D.detailHeroImage.innerHTML = '';
    if (p.image) {
      var img = document.createElement('img');
      img.src = p.image;
      img.alt = p.name;
      D.detailHeroImage.appendChild(img);
    }

    D.detailApplications.textContent = p.category === 'freshners'
      ? 'Ideal for use in hotels, offices, restrooms, lobbies, hospitals, and commercial spaces to maintain a pleasant and inviting atmosphere.'
      : 'Suitable for daily use in kitchens, bathrooms, floors, glass surfaces, industrial areas, and institutional facilities.';

    var items = p.desc.replace(/\./g, '|').split('|').filter(function (s) { return s.trim().length > 8; }).map(function (s) { return s.trim(); });
    if (items.length < 3) {
      items = p.category === 'freshners'
        ? ['Long-lasting fragrance', 'Premium quality ingredients', 'Safe for daily use', 'Professional grade']
        : ['Powerful cleaning action', 'Safe on all surfaces', 'Professional formula', 'Concentrated value'];
    }
    D.detailFeatures.innerHTML = items.map(function (h) { return '<li>' + h + '</li>'; }).join('');

    var industries = ['Hotels & Resorts', 'Hospitals', 'Corporate Offices', 'Restaurants', 'Educational Institutions', 'Facility Management', 'Retail Spaces', 'Industrial Facilities'];
    D.detailIndustries.innerHTML = industries.map(function (ind) { return '<span class="detail-industry-tag">' + ind + '</span>'; }).join('');

    D.detailUsage.textContent = p.category === 'freshners'
      ? 'Place in a well-ventilated area. For continuous fragrance, use with an automatic dispenser.'
      : 'Dilute as directed on the label. Apply to surface and wipe clean. For tough stains, allow to sit before wiping.';

    var sizes = p.category === 'freshners' ? ['500 ml', '5 Litres'] : ['5 Litres', '10 Litres', '20 Litres'];
    D.detailSizes.innerHTML = sizes.map(function (s) { return '<span class="detail-size-badge">' + s + '</span>'; }).join('');

    D.detailBrochureBtn.onclick = function () {
      if (window.showToast) window.showToast('Brochure download coming soon.', 'info');
    };

    D.detailEnquiryBtn.onclick = function () {
      if (window.openDirectQuoteModal) window.openDirectQuoteModal(p.name, p.flavor);
      else if (window.showToast) window.showToast('Opening enquiry form...', 'info');
    };

    D.detailSections.forEach(function (s) { s.classList.remove('visible'); });
    D.detailContainer.scrollTop = 0;
  }

  function observeDetailSections() {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    D.detailSections.forEach(function (s) { obs.observe(s); });
  }

  /* ─── Event Setup ──────────────────────────────────────── */
  function setupEvents() {
    D.prevBtn.addEventListener('click', function (e) { e.stopPropagation(); navigateProduct('prev'); });
    D.nextBtn.addEventListener('click', function (e) { e.stopPropagation(); navigateProduct('next'); });
    D.explore.addEventListener('click', openDetailView);
    D.detailClose.addEventListener('click', closeDetailView);
    D.detailBackdrop.addEventListener('click', function (e) { if (e.target === D.detailBackdrop) closeDetailView(); });

    D.detailPrevBtn.addEventListener('click', function () { closeDetailView(); setTimeout(function () { navigateProduct('prev'); }, 500); });
    D.detailNextBtn.addEventListener('click', function () { closeDetailView(); setTimeout(function () { navigateProduct('next'); }, 500); });

    D.navItems.forEach(function (item) {
      item.addEventListener('click', function () { switchCategory(item.dataset.category); });
    });

    D.canvas.addEventListener('mousemove', onMouseMove);
    D.canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    D.canvas.addEventListener('mouseleave', onMouseLeave);

    window.addEventListener('resize', function () {
      if (!renderer || !camera || !D.canvas) return;
      var w = D.canvas.clientWidth;
      var h = D.canvas.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
  }

  /* ─── Preload Textures ──────────────────────────────────── */
  function preloadTextures(catalog, cb) {
    var urls = [];
    catalog.forEach(function (p) { if (p.image) urls.push(p.image); });
    if (!urls.length) { if (cb) cb(); return; }

    var loaded = 0;
    urls.forEach(function (url) {
      var img = new Image();
      img.onload = function () {
        loaded++;
        if (loaded >= urls.length && cb) cb();
      };
      img.onerror = function () {
        loaded++;
        if (loaded >= urls.length && cb) cb();
      };
      img.src = url;
    });
  }

  /* ─── Init ─────────────────────────────────────────────── */
  function init() {
    function start() {
      if (!loadProducts()) {
        var check = setInterval(function () {
          if (siteData && siteData.catalog) {
            clearInterval(check);
            if (loadProducts()) {
              preloadTextures(siteData.catalog, function () {
                initThreeScene();
                setupNavigation();
                setupSwipe();
                setupEvents();
              });
            }
          }
        }, 50);
        setTimeout(function () { clearInterval(check); }, 5000);
        return;
      }
      preloadTextures(siteData.catalog, function () {
        initThreeScene();
        setupNavigation();
        setupSwipe();
        setupEvents();
      });
    }
    start();
  }

  function ensureVisible() {
    document.body.classList.remove('is-loading');
    document.body.style.overflow = '';
    var loader = document.getElementById('loader');
    if (loader) { loader.classList.add('hidden'); loader.setAttribute('aria-hidden', 'true'); }
  }

  setTimeout(ensureVisible, 100);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();