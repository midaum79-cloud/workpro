/* ================================================
   WORKSITE — Main JavaScript
   Scroll animations, navigation, interactions
   ================================================ */

// ---- Scroll-based Animations (Intersection Observer) ----
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const animateObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Don't unobserve — allows re-animation if needed
    }
  });
}, observerOptions);

document.querySelectorAll('[data-animate]').forEach((el) => {
  animateObserver.observe(el);
});

// ---- Scroll Progress Bar ----
const scrollProgress = document.getElementById('scrollProgress');

// ---- Navbar scroll effect ----
const navbar = document.getElementById('navbar');
let lastScroll = 0;

function handleNavScroll() {
  const scrollY = window.scrollY;
  
  if (scrollProgress) {
    const documentHeight = Math.max(
      document.documentElement.scrollHeight, 
      document.body.scrollHeight
    );
    const windowHeight = window.innerHeight;
    const scrollMax = documentHeight - windowHeight;
    const scrolled = Math.max(0, Math.min(100, (scrollY / scrollMax) * 100));
    scrollProgress.style.width = scrolled + '%';
  }

  if (scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  
  lastScroll = scrollY;
}

window.addEventListener('scroll', handleNavScroll, { passive: true });

// ---- Mobile navigation toggle ----
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

// Close nav on link click (mobile)
navLinks.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ---- Smooth scroll for anchor links ----
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top,
        behavior: 'smooth'
      });
    }
  });
});

// ---- Active nav link highlighting ----
const sections = document.querySelectorAll('section[id]');

function highlightNavLinks() {
  const scrollY = window.scrollY;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 120;
    const sectionBottom = sectionTop + section.offsetHeight;
    const sectionId = section.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${sectionId}"]`);
    
    if (link) {
      if (scrollY >= sectionTop && scrollY < sectionBottom) {
        link.classList.add('active');
        link.style.color = 'var(--text-primary)';
      } else {
        link.classList.remove('active');
        link.style.color = '';
      }
    }
  });
}

window.addEventListener('scroll', highlightNavLinks, { passive: true });

// ---- Stagger animation for grid children ----
const staggerObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const children = entry.target.children;
      Array.from(children).forEach((child, i) => {
        child.style.opacity = '0';
        child.style.transform = 'translateY(20px)';
        child.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
        
        requestAnimationFrame(() => {
          child.style.opacity = '1';
          child.style.transform = 'translateY(0)';
        });
      });
      staggerObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.features-grid, .common-grid, .pricing-grid, .sns-grid').forEach((grid) => {
  staggerObserver.observe(grid);
});

// ---- Parallax on hero orbs ----
window.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth - 0.5) * 2;
  const y = (e.clientY / window.innerHeight - 0.5) * 2;
  
  const orbs = document.querySelectorAll('.hero-orb');
  orbs.forEach((orb, i) => {
    const speed = (i + 1) * 10;
    orb.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
  });
});

// ---- Generic Tabs Logic ----
document.querySelectorAll('.howto-tabs').forEach(tabGroup => {
  const btns = tabGroup.querySelectorAll('.howto-tab-btn');
  const section = tabGroup.closest('section');
  const contents = section.querySelectorAll('.tab-content');
  
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });
});

// ---- Initialize ----
handleNavScroll();
highlightNavLinks();

console.log('🚀 Worksite loaded successfully');
