/* ==========================================================
   AJ Silver Service — Main JavaScript
   Nav toggle, FAQ accordion, gallery filter, form validation
   ========================================================== */

(function () {
  'use strict';

  /* ── Helpers ── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ═══════════════════════════════════════════════
     STICKY HEADER — add .scrolled class on scroll
     ═══════════════════════════════════════════════ */
  const header = $('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ═══════════════════════════════════════════════
     MOBILE NAV TOGGLE
     ═══════════════════════════════════════════════ */
  const hamburger  = $('.hamburger');
  const mobileNav  = $('.mobile-nav');

  if (hamburger && mobileNav) {
    const toggle = () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    hamburger.addEventListener('click', toggle);

    // Close on mobile link click
    $$('a', mobileNav).forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target) && mobileNav.classList.contains('open')) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        hamburger.focus();
      }
    });
  }

  /* ═══════════════════════════════════════════════
     ACTIVE NAV LINK
     ═══════════════════════════════════════════════ */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  $$('.main-nav a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ═══════════════════════════════════════════════
     FAQ ACCORDION
     ═══════════════════════════════════════════════ */
  $$('.faq-item').forEach(item => {
    const question = $('.faq-question', item);
    const answer   = $('.faq-answer', item);

    if (!question || !answer) return;

    const answerId = `faq-answer-${Math.random().toString(36).slice(2, 7)}`;
    answer.id = answerId;
    question.setAttribute('aria-controls', answerId);
    question.setAttribute('aria-expanded', 'false');

    question.addEventListener('click', () => {
      const isOpen = item.classList.toggle('open');

      // Smooth height animation
      if (isOpen) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
      } else {
        answer.style.maxHeight = '0';
      }

      question.setAttribute('aria-expanded', isOpen);

      // Close siblings (optional — remove if multi-open preferred)
      $$('.faq-item').forEach(sibling => {
        if (sibling !== item && sibling.classList.contains('open')) {
          sibling.classList.remove('open');
          const sibAnswer = $('.faq-answer', sibling);
          const sibQuestion = $('.faq-question', sibling);
          if (sibAnswer) sibAnswer.style.maxHeight = '0';
          if (sibQuestion) sibQuestion.setAttribute('aria-expanded', 'false');
        }
      });
    });
  });

  /* ═══════════════════════════════════════════════
     GALLERY FILTER
     ═══════════════════════════════════════════════ */
  const filterBtns  = $$('.gallery-filter-btn');
  const galleryItems = $$('.gallery-item[data-category]');

  if (filterBtns.length && galleryItems.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        galleryItems.forEach(item => {
          const show = filter === 'all' || item.dataset.category === filter;
          item.style.opacity = show ? '1' : '0';
          item.style.transform = show ? 'scale(1)' : 'scale(0.9)';
          item.style.transition = 'opacity 300ms ease, transform 300ms ease';
          // Use display for accessibility
          item.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ═══════════════════════════════════════════════
     ENQUIRY FORM VALIDATION
     ═══════════════════════════════════════════════ */
  const enquiryForm = $('#enquiry-form');

  if (enquiryForm) {
    const showError = (field, msg) => {
      let errorEl = field.parentElement.querySelector('.field-error');
      if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'field-error';
        errorEl.style.cssText = 'display:block;font-size:0.75rem;color:#E05252;margin-top:0.25rem;';
        field.parentElement.appendChild(errorEl);
      }
      errorEl.textContent = msg;
      field.style.borderColor = '#E05252';
    };

    const clearError = (field) => {
      const errorEl = field.parentElement.querySelector('.field-error');
      if (errorEl) errorEl.textContent = '';
      field.style.borderColor = '';
    };

    const validateField = (field) => {
      const value = field.value.trim();

      if (field.required && !value) {
        showError(field, 'This field is required.');
        return false;
      }

      if (field.type === 'email' && value) {
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(value)) {
          showError(field, 'Please enter a valid email address.');
          return false;
        }
      }

      if (field.type === 'tel' && value) {
        const telRe = /^[\d\s\+\-\(\)]{7,15}$/;
        if (!telRe.test(value)) {
          showError(field, 'Please enter a valid phone number.');
          return false;
        }
      }

      clearError(field);
      return true;
    };

    // Live validation on blur
    $$('input, textarea, select', enquiryForm).forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.style.borderColor === 'rgb(224, 82, 82)') {
          validateField(field);
        }
      });
    });

    enquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      $$('input[required], textarea[required], select[required]', enquiryForm).forEach(field => {
        if (!validateField(field)) valid = false;
      });

      if (valid) {
        // Show success state
        const submitBtn = $('[type="submit"]', enquiryForm);
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Enquiry Sent!';
        submitBtn.disabled = true;
        submitBtn.style.backgroundColor = 'var(--color-success)';
        submitBtn.style.borderColor = 'var(--color-success)';

        // In production: enquiryForm.submit() would send to Formspree/Netlify
        // Simulating async submission here
        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          submitBtn.style.backgroundColor = '';
          submitBtn.style.borderColor = '';
        }, 3000);
      }
    });
  }

  /* ═══════════════════════════════════════════════
     SMOOTH SCROLL for anchor links
     ═══════════════════════════════════════════════ */
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (target) {
        e.preventDefault();
        const offset = (header ? header.offsetHeight : 0) + 16;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ═══════════════════════════════════════════════
     INTERSECTION OBSERVER — fade-in on scroll
     ═══════════════════════════════════════════════ */
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    $$('.animate-on-scroll').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 500ms ease, transform 500ms ease';
      observer.observe(el);
    });

    // Listen for class addition
    document.addEventListener('transitionend', (e) => {}, { passive: true });

    // Simple class-based approach
    const style = document.createElement('style');
    style.textContent = '.animate-on-scroll.is-visible { opacity: 1 !important; transform: translateY(0) !important; }';
    document.head.appendChild(style);
  }

})();
