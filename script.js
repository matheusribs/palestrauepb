/* =========================================
   BRASA CAFÉ — script.js
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ----------------------------------------
     1. NAV — scroll effect
  ----------------------------------------- */
  const nav = document.getElementById('nav');

  const handleNavScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // run on load


  /* ----------------------------------------
     2. MOBILE MENU
  ----------------------------------------- */
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');
  const menuClose   = document.getElementById('menuClose');
  const menuLinks   = mobileMenu.querySelectorAll('a');

  const openMenu  = () => {
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', openMenu);
  menuClose.addEventListener('click', closeMenu);
  menuLinks.forEach(link => link.addEventListener('click', closeMenu));


  /* ----------------------------------------
     3. COUNTER ANIMATION — stats section
  ----------------------------------------- */
  const counterEls = document.querySelectorAll('.stats__num[data-target]');

  const animateCounter = (el) => {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start    = performance.now();

    const step = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 4); // ease out quart
      const current  = Math.floor(eased * target);

      el.textContent = target >= 1000
        ? current.toLocaleString('pt-BR')
        : current;

      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target >= 1000
        ? target.toLocaleString('pt-BR')
        : (target === 98 ? target + '%' : target);
    };

    requestAnimationFrame(step);
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counterEls.forEach(el => statsObserver.observe(el));


  /* ----------------------------------------
     4. REVEAL ON SCROLL
  ----------------------------------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings
        const siblings = [...entry.target.parentElement.querySelectorAll('[data-reveal]')];
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, idx * 100);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));


  /* ----------------------------------------
     5. DEPOIMENTOS SLIDER
  ----------------------------------------- */
  const track   = document.getElementById('depoimentosTrack');
  const dotsEl  = document.getElementById('dots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const cards   = track.querySelectorAll('.depoimento');
  let current   = 0;

  // Build dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Depoimento ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });

  const dots = dotsEl.querySelectorAll('.dot');

  const goTo = (index) => {
    current = (index + cards.length) % cards.length;
    const card  = cards[current];
    track.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  };

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Auto-advance every 5s
  let autoPlay = setInterval(() => goTo(current + 1), 5000);

  [prevBtn, nextBtn].forEach(btn => {
    btn.addEventListener('click', () => {
      clearInterval(autoPlay);
      autoPlay = setInterval(() => goTo(current + 1), 5000);
    });
  });

  // Sync dots on manual scroll
  let scrollTimeout;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const scrollLeft = track.scrollLeft;
      cards.forEach((card, i) => {
        if (Math.abs(card.offsetLeft - scrollLeft) < 10) {
          current = i;
          dots.forEach((d, j) => d.classList.toggle('active', j === i));
        }
      });
    }, 100);
  }, { passive: true });


  /* ----------------------------------------
     6. CTA FORM — basic feedback
  ----------------------------------------- */
  const ctaForm  = document.querySelector('.cta-final__form');
  const ctaInput = document.querySelector('.cta-final__input');
  const ctaBtn   = ctaForm?.querySelector('.btn');

  ctaForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    handleCtaSubmit();
  });

  ctaBtn?.addEventListener('click', () => {
    handleCtaSubmit();
  });

  function handleCtaSubmit() {
    const email = ctaInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      ctaInput.style.borderColor = '#e05252';
      ctaInput.style.animation = 'shake 0.35s ease';
      setTimeout(() => {
        ctaInput.style.animation = '';
        ctaInput.style.borderColor = '';
      }, 600);
      return;
    }

    ctaBtn.textContent = '✓ Enviado!';
    ctaBtn.style.background = '#4caf7a';
    ctaInput.value = '';

    setTimeout(() => {
      ctaBtn.textContent = 'Quero meu café';
      ctaBtn.style.background = '';
    }, 3000);
  }

  // Inject shake keyframes
  const shakeStyle = document.createElement('style');
  shakeStyle.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-6px); }
      40%      { transform: translateX(6px); }
      60%      { transform: translateX(-4px); }
      80%      { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(shakeStyle);


  /* ----------------------------------------
     7. SMOOTH ANCHOR SCROLL (nav links)
  ----------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = nav.offsetHeight + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ----------------------------------------
     8. HERO PARALLAX (desktop only)
  ----------------------------------------- */
  const heroBgText = document.querySelector('.hero__bg-text');

  if (window.innerWidth >= 768) {
    window.addEventListener('scroll', () => {
      if (!heroBgText) return;
      const y = window.scrollY * 0.3;
      heroBgText.style.transform = `translateX(-50%) translateY(${y}px)`;
    }, { passive: true });
  }

});
