// script.js - lightweight interactivity for the Firewall Games homepage

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.site-nav');
  const navToggle = document.querySelector('.nav-toggle');
  const scrollLinks = document.querySelectorAll('[data-scroll]');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const closeNav = () => {
    if (!nav || !navToggle) return;
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  const openNav = () => {
    if (!nav || !navToggle) return;
    nav.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
  };

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        closeNav();
      } else {
        openNav();
      }
    });
  }

  const smoothScroll = (target) => {
    if (!target) return;
    const headerHeight = header ? header.offsetHeight + 10 : 0;
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

    window.scrollTo({
      top: targetPosition,
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  };

  scrollLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const destination = document.querySelector(href);
      if (!destination) return;
      event.preventDefault();
      if (navToggle && navToggle.getAttribute('aria-expanded') === 'true') {
        closeNav();
      }
      smoothScroll(destination);
    });
  });

  // Reveal on scroll animations
  const revealItems = document.querySelectorAll('[data-reveal]');
  if (revealItems.length) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.25,
      rootMargin: '0px 0px -80px 0px'
    });

    revealItems.forEach(item => observer.observe(item));
  }

  // Hero parallax orbs (skips when reduced motion is requested)
  if (!prefersReducedMotion) {
    const hero = document.querySelector('.hero');
    const orbs = document.querySelectorAll('.hero-orb');
    let rafId;

    const moveOrbs = (event) => {
      if (!hero || !orbs.length) return;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const bounds = hero.getBoundingClientRect();
        const relX = (event.clientX - bounds.left) / bounds.width - 0.5;
        const relY = (event.clientY - bounds.top) / bounds.height - 0.5;
        orbs.forEach((orb, index) => {
          const depth = (index + 1) * 15;
          const x = relX * depth;
          const y = relY * depth;
          orb.style.transform = `translate(${x}px, ${y}px)`;
        });
      });
    };

    hero?.addEventListener('pointermove', moveOrbs);
    hero?.addEventListener('pointerleave', () => {
      orbs.forEach(orb => {
        orb.style.transform = 'translate(0, 0)';
      });
    });
  }

  // Current year for footer
  const yearTarget = document.getElementById('current-year');
  if (yearTarget) {
    yearTarget.textContent = String(new Date().getFullYear());
  }

  // Newsletter form (Formspree) AJAX handling
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    const statusEl = newsletterForm.querySelector('.form-status');

    const setStatus = (message, type) => {
      if (!statusEl) return;
      statusEl.textContent = message;
      statusEl.classList.remove('success', 'error');
      if (type) {
        statusEl.classList.add(type);
      }
    };

    newsletterForm.addEventListener('submit', (event) => {
      event.preventDefault();

      setStatus('Sending...', null);

      fetch(newsletterForm.action, {
        method: newsletterForm.method || 'POST',
        body: new FormData(newsletterForm),
        headers: {
          'Accept': 'application/json'
        }
      }).then((response) => {
        if (response.ok) {
          setStatus('Thanks for signing up. Watch your inbox for Deadwave intel.', 'success');
          newsletterForm.reset();
        } else {
          setStatus('Signup failed. Please try again or email support@firewallgames.dev.', 'error');
        }
      }).catch(() => {
        setStatus('Network error. Please check your connection and try again.', 'error');
      });
    });
  }
});
