// Mohamed Ali Portfolio - main interactions
// This file controls the mobile menu, theme toggle, typing effect,
// scroll animations, active navigation, scroll progress,
// and project card interaction.

document.addEventListener('DOMContentLoaded', () => {

  const menuBtn = document.querySelector('.menu-btn');
  const navLinks = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');
  const progressBar = document.querySelector('.scroll-progress span');

  /* =========================================
     LIGHT / DARK MODE
     ========================================= */

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = themeToggleBtn?.querySelector('i');

  const updateThemeIcon = () => {
    if (!themeIcon) return;
    const isLight = document.body.classList.contains('light-mode');
    themeIcon.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    themeToggleBtn?.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    themeToggleBtn?.setAttribute('title', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
  };

  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
  }
  updateThemeIcon();

  themeToggleBtn?.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');
    updateThemeIcon();
  });

  /* =========================================
     MOBILE NAVIGATION
     ========================================= */

  const closeMenu = () => {
    navLinks?.classList.remove('open');
    menuBtn?.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded', 'false');
    menuBtn?.setAttribute('aria-label', 'Open navigation menu');
  };

  const toggleMenu = () => {
    if (!navLinks || !menuBtn) return;
    const isOpen = navLinks.classList.toggle('open');
    menuBtn.classList.toggle('open', isOpen);
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    menuBtn.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  };

  menuBtn?.addEventListener('click', toggleMenu);
  navItems.forEach(link => link.addEventListener('click', closeMenu));

  document.addEventListener('click', event => {
    if (!navLinks?.classList.contains('open')) return;
    if (!navLinks.contains(event.target) && !menuBtn?.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });

  /* =========================================
     TYPING EFFECT
     ========================================= */

  const typing = document.getElementById('typing');
  const words = ['Software Engineering Student', 'Web Developer', 'Problem Solver', 'Computer Science Student'];
  let wordIndex = 0, charIndex = 0, deleting = false;

  function typeText() {
    if (!typing) return;
    const word = words[wordIndex];
    typing.textContent = deleting ? word.slice(0, charIndex--) : word.slice(0, charIndex++);
    if (!deleting && charIndex > word.length) {
      deleting = true;
      setTimeout(typeText, 1300);
      return;
    }
    if (deleting && charIndex < 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      charIndex = 0;
    }
    setTimeout(typeText, deleting ? 45 : 80);
  }
  typeText();

  /* =========================================
     REVEAL ANIMATIONS
     ========================================= */

  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('show'));
  }

  /* =========================================
     ACTIVE NAVIGATION
     ========================================= */

  const setActiveSection = () => {
    const scrollPosition = window.scrollY + 220;
    let current = 'home';
    sections.forEach(section => {
      if (scrollPosition >= section.offsetTop) current = section.id;
    });
    navItems.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  };

  /* =========================================
     SCROLL PROGRESS
     ========================================= */

  const updateProgress = () => {
    const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = pageHeight > 0 ? (window.scrollY / pageHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = `${progress}%`;
    setActiveSection();
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 850) closeMenu();
    updateProgress();
  });
  updateProgress();

  /* =========================================
     PROJECT CARD HOVER TILT
     ========================================= */

  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', event => {
      if (window.innerWidth < 900 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `
        perspective(800px)
        rotateY(${x * 3}deg)
        rotateX(${-y * 3}deg)
        translateY(-4px)
      `;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* =========================================
     CONSOLE MESSAGE
     ========================================= */

  console.log('%c Mohamed Ali Portfolio ', 'background:#f29e38;color:#0d0d0d;font-weight:bold;padding:5px 10px;');
  console.log('Portfolio interactions initialized successfully.');
});
