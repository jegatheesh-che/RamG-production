/* ================================================
   RAMG PRODUCTION — main.js
   GSAP + Lenis + vanilla scroll reveal + cursor
   ================================================ */

// --- Lenis smooth scroll (Mobile-optimized) ---
let lenis = null;
if (typeof Lenis !== 'undefined') {
  try {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    lenis = new Lenis({
      lerp: isMobile ? 0.12 : 0.1,
      smoothWheel: true,
      touchMultiplier: 1.5,
      touchInertiaMultiplier: 18
    });

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      gsap.ticker.add((time) => { if (lenis) lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
      lenis.on('scroll', ScrollTrigger.update);
    }
  } catch (e) {
    console.warn('Lenis or GSAP init warning:', e);
  }
}

// -----------------------------------------------
// NAV: scroll state
// -----------------------------------------------
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Active link
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav__link, .nav__mobile .nav__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === path || (path === '' && href === 'index.html') || path.includes(href.replace('.html', '')))) {
      link.classList.add('active');
    }
  });
}

// -----------------------------------------------
// PREMIUM HAMBURGER OVERLAY MENU
// -----------------------------------------------
const burger = document.querySelector('.nav__burger');
const closeBtn = document.querySelector('.nav__overlay-close');
const overlayMenu = document.querySelector('.nav__overlay');

function toggleOverlayMenu(open) {
  if (!overlayMenu || !burger) return;
  const isOpening = open !== undefined ? open : !overlayMenu.classList.contains('open');
  if (isOpening) {
    overlayMenu.classList.add('open');
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    overlayMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (window.lenis) lenis.stop();
  } else {
    overlayMenu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    overlayMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (window.lenis) lenis.start();
  }
}

if (burger) {
  burger.addEventListener('click', () => toggleOverlayMenu());
}
if (closeBtn) {
  closeBtn.addEventListener('click', () => toggleOverlayMenu(false));
}
if (overlayMenu) {
  overlayMenu.querySelectorAll('.nav__overlay-link').forEach(link => {
    link.addEventListener('click', () => toggleOverlayMenu(false));
  });
}

// -----------------------------------------------
// CUSTOM DUAL-ELEMENT CURSOR (desktop & fine pointer)
// -----------------------------------------------
(function initCustomCursor() {
  // Only skip on small touch-only mobile devices (<768px with coarse pointer)
  if (window.innerWidth <= 768 && window.matchMedia('(pointer: coarse)').matches) return;

  function setupCursor() {
    let cursorContainer = document.querySelector('.custom-cursor');
    if (!cursorContainer) {
      cursorContainer = document.createElement('div');
      cursorContainer.className = 'custom-cursor is-hidden';
      cursorContainer.setAttribute('aria-hidden', 'true');
      cursorContainer.innerHTML = `
        <div class="custom-cursor__dot"></div>
        <div class="custom-cursor__ring"></div>
      `;
      document.body.appendChild(cursorContainer);
    }

    const dot = cursorContainer.querySelector('.custom-cursor__dot');
    const ring = cursorContainer.querySelector('.custom-cursor__ring');
    if (!dot || !ring) return;

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let isInitialized = false;

    // Mouse movement listener
    window.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isInitialized) {
        ringX = mouseX;
        ringY = mouseY;
        isInitialized = true;
        cursorContainer.classList.remove('is-hidden');
      }

      // Update dot instantly at exact pointer location
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    }, { passive: true });

    // Smooth lerp loop for trailing ring
    const lerp = (start, end, factor) => start + (end - start) * factor;

    function renderCursor() {
      if (isInitialized) {
        ringX = lerp(ringX, mouseX, 0.2);
        ringY = lerp(ringY, mouseY, 0.2);
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Hover effect delegation
    const interactiveTargets = 'a, button, input, select, textarea, [role="button"], .gallery-item, .hero__arrow, .eshoot-item, .story-item, .home-featured__item, .form-submit, .nav__brand-logo, .hero__slide-overlay';

    document.addEventListener('mouseover', e => {
      if (e.target && e.target.closest && e.target.closest(interactiveTargets)) {
        cursorContainer.classList.add('is-hovered');
      }
    });

    document.addEventListener('mouseout', e => {
      if (e.target && e.target.closest) {
        const target = e.target.closest(interactiveTargets);
        if (target) {
          if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest(interactiveTargets)) {
            cursorContainer.classList.remove('is-hovered');
          }
        }
      }
    });

    // Click feedback
    document.addEventListener('mousedown', () => cursorContainer.classList.add('is-clicked'));
    document.addEventListener('mouseup', () => cursorContainer.classList.remove('is-clicked'));

    // Visibility toggling
    document.addEventListener('mouseleave', () => cursorContainer.classList.add('is-hidden'));
    document.addEventListener('mouseenter', () => {
      if (isInitialized) cursorContainer.classList.remove('is-hidden');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCursor);
  } else {
    setupCursor();
  }
})();

// -----------------------------------------------
// SCROLL REVEAL (IntersectionObserver)
// -----------------------------------------------
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '100px 0px 50px 0px' });
  
  revealEls.forEach(el => {
    // Immediately reveal elements near top of page so heros are never hidden
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      el.classList.add('in-view');
    } else {
      io.observe(el);
    }
  });
}

// -----------------------------------------------
// HERO SLIDER
// -----------------------------------------------
const slides = document.querySelectorAll('.hero__slide');
const dots   = document.querySelectorAll('.hero__dot');
const prevBtn = document.querySelector('.hero__arrow--prev');
const nextBtn = document.querySelector('.hero__arrow--next');

window.sliderPaused = !!document.querySelector('.split-hero-pin');
window.startHeroAuto = null;

if (slides.length) {
  let current = 0, timer = null;

  function goTo(idx) {
    const prevSlide = slides[current];
    const prevDot = dots[current];
    
    prevSlide.classList.remove('active');
    prevSlide.classList.add('exit');
    setTimeout(() => prevSlide.classList.remove('exit'), 1200);
    
    if (prevDot) prevDot.classList.remove('active');
    
    // Pause any video in the outgoing slide
    const oldVideo = prevSlide.querySelector('video');
    if (oldVideo) oldVideo.pause();

    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }

  function startAuto() {
    clearInterval(timer);
    if (window.sliderPaused) return;

    const currentSlide = slides[current];
    const video = currentSlide.querySelector('video');
    
    if (video) {
        // Video slide: wait for it to end
        video.onended = () => { 
          goTo(current + 1); 
          startAuto(); 
        };
        if (video.paused) video.play().catch(e => {}); 
    } else {
        // Image slide: wait 3 seconds
        timer = setInterval(() => { 
          goTo(current + 1); 
          startAuto(); 
        }, 3000);
    }
  }

  window.startHeroAuto = startAuto;

  goTo(0);
  startAuto();

  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); startAuto(); }));

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { goTo(current - 1); startAuto(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); startAuto(); }
  });

  // Touch swipe
  let touchStartX = 0;
  const heroEl = document.querySelector('.hero');
  if (heroEl) {
    heroEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    heroEl.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) { dx < 0 ? goTo(current + 1) : goTo(current - 1); startAuto(); }
    }, { passive: true });
  }
}

// -----------------------------------------------
// STORY THUMBNAILS
// -----------------------------------------------
document.querySelectorAll('.story-item').forEach(item => {
  const mainImg = item.querySelector('.story-item__image-main');
  const thumbs  = item.querySelectorAll('.story-item__thumb');
  if (!mainImg || !thumbs.length) return;
  thumbs[0].classList.add('active');
  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const newSrc = thumb.dataset.full || thumb.src;
      gsap.to(mainImg, { opacity: 0, duration: 0.3, onComplete: () => {
        mainImg.src = newSrc;
        gsap.to(mainImg, { opacity: 1, duration: 0.4 });
      }});
    });
  });
});

// -----------------------------------------------
// INITIAL ENTRANCE LOGIC
// -----------------------------------------------
function startWebsiteEntrance() {
  // Fade in body on load
  gsap.from('body', { opacity: 0, duration: 0.5, ease: 'power2.out' });

  const heroVideo = document.getElementById('hero-reveal-video');
  if (heroVideo) {
    // Ensure video plays immediately on load for maximum opening impact
    const playVideo = () => heroVideo.play().catch(() => {});
    playVideo();
    document.addEventListener('touchstart', playVideo, { once: true, passive: true });
    document.addEventListener('scroll', playVideo, { once: true, passive: true });
  }

  // Hero title entrance if present (for other pages)
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    gsap.from(heroTitle, { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out', delay: 0.3 });
  }
}

// Start immediately on load
startWebsiteEntrance();

// Page nav links with GSAP fade
document.querySelectorAll('.nav__link[href]').forEach(link => {
  link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('http')) return;
    e.preventDefault();
    gsap.to('body', {
      opacity: 0, duration: 0.35, ease: 'power2.in',
      onComplete: () => { window.location.href = href; }
    });
  });
});

// --- SHINY HOVER WRAPPER ---
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('img:not(.nav__logo-img, .cursor__img, .home-about__logo, .video-badge img, .round-badge img)').forEach(el => {
    const wrapper = document.createElement('div');
    wrapper.className = 'shiny-wrapper';
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
  });
});

// --- ROUND BADGE IMAGE CROSSFADE ---
document.addEventListener('DOMContentLoaded', () => {
  const badgeImages = document.querySelectorAll('.round-badge .fade-img');
  if(badgeImages.length > 0) {
    let currentIdx = 0;
    setInterval(() => {
      badgeImages[currentIdx].classList.remove('active');
      currentIdx = (currentIdx + 1) % badgeImages.length;
      badgeImages[currentIdx].classList.add('active');
    }, 2500);
  }
});

// --- SECTION 5 (ABOUT) LAZY VIDEO PLAY/PAUSE OBSERVER ---
document.addEventListener('DOMContentLoaded', () => {
  const aboutVideo = document.getElementById('about-section-video');
  const aboutSection = document.querySelector('.home-about');
  if (aboutVideo && aboutSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          aboutVideo.play().catch(() => {});
        } else {
          aboutVideo.pause();
        }
      });
    }, { threshold: 0.15 });
    observer.observe(aboutSection);
  }
});

// --- FOOTER QUOTE ROTATION ---
document.addEventListener('DOMContentLoaded', () => {
  const quoteText = document.getElementById('quote-text');
  const quoteAuthor = document.getElementById('quote-author');
  const quoteBox = document.querySelector('.footer__quote');
  
  if (quoteText && quoteAuthor && quoteBox) {
    const quotes = [
      { text: '"I think... if it is true that there are as many minds as there are heads, then there are as many kinds of love as there are hearts."', author: '— Leo Tolstoy' },
      { text: '"Photography takes an instant out of time, altering life by holding it still."', author: '— Dorothea Lange' },
      { text: '"To me, photography is an art of observation. It’s about finding something interesting in an ordinary place."', author: '— Elliott Erwitt' }
    ];
    
    let currentIdx = 0;
    setInterval(() => {
      quoteBox.classList.add('fade-out');
      
      setTimeout(() => {
        currentIdx = (currentIdx + 1) % quotes.length;
        quoteText.textContent = quotes[currentIdx].text;
        quoteAuthor.textContent = quotes[currentIdx].author;
        quoteBox.classList.remove('fade-out');
      }, 800);
    }, 3500);
  }
});

// -----------------------------------------------
// GALLERY PAGE FILTERING & LIGHTBOX MODAL
// -----------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.gallery-filters .filter-btn');
  const galleryCards = document.querySelectorAll('.gallery-masonry .gallery-card');
  
  if (filterBtns.length > 0 && galleryCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filterValue = btn.getAttribute('data-filter');
        
        galleryCards.forEach(card => {
          const cardCategory = card.getAttribute('data-category');
          if (filterValue === 'all' || cardCategory === filterValue) {
            card.style.display = 'block';
            gsap.to(card, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' });
          } else {
            gsap.to(card, {
              opacity: 0, scale: 0.85, duration: 0.3, ease: 'power2.in',
              onComplete: () => { card.style.display = 'none'; }
            });
          }
        });
      });
    });
  }

  // LIGHTBOX MODAL LOGIC
  const lightbox = document.getElementById('galleryLightbox');
  if (lightbox) {
    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const lightboxTitle = lightbox.querySelector('.lightbox-title');
    const lightboxSub = lightbox.querySelector('.lightbox-sub');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-nav--prev');
    const nextBtn = lightbox.querySelector('.lightbox-nav--next');
    
    let activeCardsArray = [];
    let currentIndex = 0;
    
    function updateLightboxContent(idx) {
      if (idx < 0 || idx >= activeCardsArray.length) return;
      currentIndex = idx;
      const card = activeCardsArray[currentIndex];
      const img = card.querySelector('img');
      const rawCat = card.getAttribute('data-category') || 'Portfolio';
      const cat = rawCat.charAt(0).toUpperCase() + rawCat.slice(1);
      const title = card.getAttribute('data-title') || img?.alt || 'RamG Production Showcase';
      
      if (img && lightboxImg) {
        lightboxImg.src = img.src;
        lightboxImg.alt = title;
      }
      if (lightboxTitle) lightboxTitle.textContent = title;
      if (lightboxSub) lightboxSub.textContent = cat;
    }

    function openLightbox(card) {
      const visibleCards = Array.from(document.querySelectorAll('.gallery-masonry .gallery-card')).filter(
        c => window.getComputedStyle(c).display !== 'none'
      );
      activeCardsArray = visibleCards.length > 0 ? visibleCards : Array.from(document.querySelectorAll('.gallery-masonry .gallery-card'));
      
      currentIndex = activeCardsArray.indexOf(card);
      if (currentIndex === -1) currentIndex = 0;
      
      updateLightboxContent(currentIndex);
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('.gallery-card, .collage-item').forEach(card => {
      card.addEventListener('click', () => openLightbox(card));
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const prevIdx = (currentIndex - 1 + activeCardsArray.length) % activeCardsArray.length;
        updateLightboxContent(prevIdx);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nextIdx = (currentIndex + 1) % activeCardsArray.length;
        updateLightboxContent(nextIdx);
      });
    }

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && prevBtn) prevBtn.click();
      if (e.key === 'ArrowRight' && nextBtn) nextBtn.click();
    });
  }
});

// -----------------------------------------------
// CLICK TO COPY CONTACT INTERACTIVITY
// -----------------------------------------------
document.querySelectorAll('.js-copy-card').forEach(card => {
  card.addEventListener('click', () => {
    const textToCopy = card.getAttribute('data-copy');
    const typeLabel = card.getAttribute('data-type') || 'Contact';
    
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        const toast = document.getElementById('copyToast');
        if (toast) {
          toast.textContent = `Copied ${typeLabel} to Clipboard!`;
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 2500);
        }
      }).catch(() => {
        const toast = document.getElementById('copyToast');
        if (toast) {
          toast.textContent = `${textToCopy}`;
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 2500);
        }
      });
    }
  });
});

// -----------------------------------------------
// REVIEWS CATEGORY FILTER INTERACTIVITY
// -----------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const reviewFilterBtns = document.querySelectorAll('.review-filter-btn');
  const reviewCards = document.querySelectorAll('.review-card');

  if (reviewFilterBtns.length && reviewCards.length) {
    reviewFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        reviewFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        reviewCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            gsap.to(card, {
              opacity: 1,
              scale: 1,
              duration: 0.4,
              display: 'flex',
              ease: 'power2.out'
            });
          } else {
            gsap.to(card, {
              opacity: 0,
              scale: 0.95,
              duration: 0.3,
              display: 'none',
              ease: 'power2.in'
            });
          }
        });

        setTimeout(() => {
          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
          }
        }, 450);
      });
    });
  }
});

// -----------------------------------------------
// THEME SWITCHER (Dark & Bright Mode)
// -----------------------------------------------
(function applySavedThemeImmediately() {
  const savedTheme = localStorage.getItem('ramg_theme');
  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();

function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  if (!toggleBtn) return;

  function updateToggleUI() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const label = isLight ? 'Switch to Dark Theme' : 'Switch to Bright Theme';
    toggleBtn.setAttribute('title', label);
    toggleBtn.setAttribute('aria-label', label);
  }

  updateToggleUI();

  toggleBtn.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('ramg_theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('ramg_theme', 'light');
    }
    updateToggleUI();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThemeToggle);
} else {
  initThemeToggle();
}

