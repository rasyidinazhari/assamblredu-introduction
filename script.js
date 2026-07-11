/**
 * Assemblr AR — Slide Deck Presentation
 * Full-screen slides, keyboard/click/touch navigation,
 * Pancasila cards, checklist, rubrik, project modals, particles.
 */
document.addEventListener('DOMContentLoaded', () => {

  /* ===== PARTICLES ===== */
  const pBox = document.getElementById('particles');
  for (let i = 0; i < 35; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDelay = Math.random() * 8 + 's';
    p.style.animationDuration = (6 + Math.random() * 6) + 's';
    p.style.width = p.style.height = (2 + Math.random() * 3) + 'px';
    pBox.appendChild(p);
  }

  /* ===== SLIDE ENGINE ===== */
  const slides = Array.from(document.querySelectorAll('.slide'));
  const total = slides.length;
  let current = 0;
  let animating = false;

  const curEl = document.getElementById('curSlide');
  const totalEl = document.getElementById('totalSlides');
  const fillEl = document.getElementById('progressFill');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const sideDots = document.getElementById('sideDots');

  totalEl.textContent = total;

  // Build side dots
  slides.forEach((s, i) => {
    const dot = document.createElement('div');
    dot.classList.add('side-dot');
    if (i === 0) dot.classList.add('active');
    const tip = document.createElement('span');
    tip.classList.add('tip');
    tip.textContent = s.dataset.title || `Slide ${i + 1}`;
    dot.appendChild(tip);
    dot.addEventListener('click', () => goTo(i));
    sideDots.appendChild(dot);
  });

  function updateUI() {
    curEl.textContent = current + 1;
    fillEl.style.width = ((current / (total - 1)) * 100) + '%';
    btnPrev.disabled = current === 0;
    btnNext.disabled = current === total - 1;

    sideDots.querySelectorAll('.side-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function goTo(idx) {
    if (idx === current || animating || idx < 0 || idx >= total) return;
    animating = true;

    const goingForward = idx > current;
    const prev = slides[current];
    const next = slides[idx];

    // Reset animation classes on new slide elements
    next.querySelectorAll('[class*="anim-"]').forEach(el => {
      el.style.animation = 'none';
      // Force reflow
      void el.offsetHeight;
      el.style.animation = '';
    });

    // Exit current
    prev.classList.remove('active');
    if (goingForward) {
      prev.classList.add('exit-left');
    }
    if (!goingForward) {
      prev.style.transform = 'translateX(60px)';
      prev.style.opacity = '0';
    }

    // Prepare entry direction
    if (!goingForward) {
      next.style.transform = 'translateX(-60px)';
    } else {
      next.style.transform = 'translateX(60px)';
    }
    next.style.opacity = '0';

    // Force reflow
    void next.offsetHeight;

    // Activate
    next.classList.add('active');
    next.style.transform = '';
    next.style.opacity = '';

    current = idx;
    updateUI();

    setTimeout(() => {
      prev.classList.remove('exit-left');
      prev.style.transform = '';
      prev.style.opacity = '';
      animating = false;
    }, 550);
  }

  function nextSlide() { goTo(current + 1); }
  function prevSlide() { goTo(current - 1); }

  btnNext.addEventListener('click', nextSlide);
  btnPrev.addEventListener('click', prevSlide);

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (document.getElementById('modalBg').classList.contains('open')) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault(); nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault(); prevSlide();
    } else if (e.key === 'Home') {
      e.preventDefault(); goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault(); goTo(total - 1);
    }
  });

  // Touch swipe
  let touchStartX = 0, touchStartY = 0;
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].screenX - touchStartX;
    const dy = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) nextSlide(); else prevSlide();
    }
  }, { passive: true });

  updateUI();

  /* ===== COUNTER ANIMATION ===== */
  const counters = document.querySelectorAll('[data-count]');
  let counted = false;

  function animateCounters() {
    if (counted) return;
    counted = true;
    counters.forEach(c => {
      const target = parseInt(c.dataset.count, 10);
      const start = performance.now();
      const dur = 1400;
      function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        c.textContent = Math.round(ease * target);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  // Trigger counter when slide 0 is active (first load)
  animateCounters();

  /* ===== PANCASILA SILA CARDS ===== */
  document.querySelectorAll('.sila-card').forEach(card => {
    card.addEventListener('click', () => {
      const wasActive = card.classList.contains('active');
      document.querySelectorAll('.sila-card').forEach(c => c.classList.remove('active'));
      if (!wasActive) card.classList.add('active');
    });
  });

  /* ===== WORKFLOW STEPS (Removed auto-cycle as steps are split) ===== */

  /* ===== MAP HOTSPOTS ===== */
  document.querySelectorAll('.hotspot').forEach(hs => {
    hs.addEventListener('click', (e) => {
      e.stopPropagation();
      const was = hs.classList.contains('active');
      document.querySelectorAll('.hotspot').forEach(h => h.classList.remove('active'));
      if (!was) hs.classList.add('active');
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.hotspot').forEach(h => h.classList.remove('active'));
  });

  /* ===== CHECKLIST ===== */
  document.querySelectorAll('.chk').forEach(item => {
    item.addEventListener('click', () => item.classList.toggle('checked'));
  });

  /* ===== RUBRIK SCORING ===== */
  const scores = {};
  const scoreEl = document.getElementById('scoreDisplay');

  document.querySelectorAll('.star-row').forEach(row => {
    const key = row.dataset.row;
    const stars = row.querySelectorAll('.star');
    stars.forEach(star => {
      star.addEventListener('click', () => {
        const val = parseInt(star.dataset.val, 10);
        scores[key] = val;
        stars.forEach(s => s.classList.toggle('filled', parseInt(s.dataset.val, 10) <= val));
        const sum = Object.values(scores).reduce((a, b) => a + b, 0);
        scoreEl.textContent = `Total Skor: ${sum} / 16`;
        scoreEl.style.color = sum >= 14 ? '#22c55e' : sum >= 10 ? '#f0d078' : sum >= 6 ? '#f97316' : '#ef4444';
      });
    });
  });

  /* ===== PROJECT MODAL ===== */
  const projData = {
    garuda: { icon: '🦅', title: 'Garuda Pancasila Interaktif', html: '<p><strong>Materi PPKn:</strong> Simbol negara & makna tiap sila</p><ul><li>Model 3D Garuda Pancasila</li><li>Teks makna sila muncul saat perisai disentuh</li><li>Audio "Bhinneka Tunggal Ika" (opsional)</li></ul><p><strong>Alur:</strong> Garuda 3D muncul → sentuh bagian perisai → teks fade-in → audio</p><p><strong>Mode:</strong> Markerless</p>' },
    peta: { icon: '🗺️', title: 'Peta NKRI 3D', html: '<p><strong>Materi:</strong> Wawasan Nusantara & keberagaman</p><ul><li>Peta timbul 3D Indonesia</li><li>Penanda pulau utama</li><li>Ikon budaya tiap daerah</li></ul><p><strong>Alur:</strong> Peta muncul → sentuh pulau → info budaya & rumah adat</p>' },
    pahlawan: { icon: '🎖️', title: 'Galeri Pahlawan Nasional', html: '<p><strong>Materi:</strong> Perjuangan kemerdekaan & kepahlawanan</p><ul><li>Figur pahlawan nasional</li><li>Biografi singkat</li><li>Audio narasi perjuangan</li></ul><p><strong>Contoh:</strong> Soekarno, Hatta, Cut Nyak Dien, Kartini, Diponegoro</p>' },
    upacara: { icon: '🇮🇩', title: 'Upacara Bendera Virtual', html: '<p><strong>Materi:</strong> Disiplin & cinta tanah air</p><ul><li>Animasi tiang bendera & pengibaran Merah Putih</li><li>Simulasi tata urutan upacara</li><li>Audio Indonesia Raya (opsional)</li></ul>' },
    'rumah-adat': { icon: '🏘️', title: 'Rumah Adat & Budaya Nusantara', html: '<p><strong>Materi:</strong> Bhinneka Tunggal Ika</p><ul><li>Model rumah adat dari berbagai pulau</li><li>Keterangan asal daerah & arsitektur</li></ul><p>Gadang, Joglo, Lamin, Tongkonan, Honai</p>' }
  };

  const modalBg = document.getElementById('modalBg');
  const modalBody = document.getElementById('modalBody');
  const modalX = document.getElementById('modalX');

  function openModal(key) {
    const d = projData[key];
    if (!d) return;
    modalBody.innerHTML = `<div style="font-size:2.5rem;text-align:center;margin-bottom:0.75rem;">${d.icon}</div><h2 style="text-align:center;margin-bottom:1rem;font-size:1.2rem;">${d.title}</h2><div style="color:var(--white-70);font-size:0.85rem;line-height:1.8;">${d.html}</div>`;
    modalBody.querySelectorAll('ul').forEach(u => { u.style.paddingLeft = '1.1rem'; u.style.marginBottom = '0.75rem'; });
    modalBody.querySelectorAll('li').forEach(l => l.style.marginBottom = '0.25rem');
    modalBody.querySelectorAll('p').forEach(p => p.style.marginBottom = '0.6rem');
    modalBg.classList.add('open');
  }

  function closeModal() { modalBg.classList.remove('open'); }
  modalX.addEventListener('click', closeModal);
  modalBg.addEventListener('click', (e) => { if (e.target === modalBg) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  document.querySelectorAll('.proj-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.proj));
  });

});

// GIF Fullscreen logic
window.openGifModal = function(btn) {
  const img = btn.parentElement.querySelector("img");
  const modalImg = document.getElementById("gifModalImg");
  modalImg.src = img.src;
  const modal = document.getElementById("gifModal");
  modal.classList.add("active");
};

window.closeGifModal = function() {
  document.getElementById("gifModal").classList.remove("active");
};
