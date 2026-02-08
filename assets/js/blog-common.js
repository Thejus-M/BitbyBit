/**
 * BLOG COMMON SCRIPTS - Bit by Bit
 * Shared JavaScript functionality for all blog posts
 */

// ===========================
// THEME TOGGLE
// ===========================
function initThemeToggle() {
  const themeBtn = document.getElementById('themeToggle');
  const iconSun = document.getElementById('iconSun');
  const iconMoon = document.getElementById('iconMoon');

  function updateThemeIcons() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      iconSun.style.display = 'block';
      iconMoon.style.display = 'none';
    } else {
      iconSun.style.display = 'none';
      iconMoon.style.display = 'block';
    }
  }

  updateThemeIcons();

  if (themeBtn) {
    themeBtn.onclick = () => {
      window.ThemeManager.toggle();
      updateThemeIcons();
    };
  }
}

// ===========================
// SCROLL INDICATOR
// ===========================
function initScrollIndicator() {
  const scrollIndicator = document.getElementById('scrollIndicator');
  
  if (!scrollIndicator) return;

  window.addEventListener('scroll', () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
    scrollIndicator.style.width = scrollPercent + '%';
  });
}

// ===========================
// STICKY SIDEBAR & MINI HEADER
// ===========================
function initStickySidebar() {
  const heroSection = document.getElementById('heroSection');
  const metaSidebar = document.getElementById('metaSidebar');

  if (!heroSection || !metaSidebar) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        metaSidebar.classList.add('scrolled');
      } else {
        metaSidebar.classList.remove('scrolled');
      }
    });
  }, {
    rootMargin: "-100px 0px 0px 0px",
    threshold: 0
  });

  observer.observe(heroSection);
}

// ===========================
// TOC SCROLL SPY
// ===========================
function initTOCScrollSpy() {
  const sections = document.querySelectorAll('.article-content h2[id], #intro');
  
  if (sections.length === 0) return;

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= (sectionTop - 200)) {
        current = section.getAttribute('id');
      }
    });

    document.querySelectorAll('.toc-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  });
}

// ===========================
// FAB AUTO-HIDE ON SCROLL
// ===========================
function initFABAutoHide() {
  let lastScrollY = window.scrollY;
  let scrollTimeout;
  
  window.addEventListener('scroll', () => {
    const fabToCheck = document.getElementById('mobileTocBtn');
    if (!fabToCheck) return;
    
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY;
    
    if (Math.abs(scrollDelta) > 5) {
      fabToCheck.classList.add('hidden');
    }
    
    lastScrollY = currentScrollY;
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      fabToCheck.classList.remove('hidden');
    }, 300);
  }, { passive: true });
}

// ===========================
// MOBILE TOC LOGIC
// ===========================
function initMobileTOC() {
  const mobileTocOverlay = document.getElementById('mobileTocOverlay');
  const mobileTocSheet = document.getElementById('mobileTocSheet');
  const mobileTocContent = document.getElementById('mobileTocContent');
  const desktopTocList = document.getElementById('tocList');
  
  if (!mobileTocOverlay || !mobileTocSheet || !mobileTocContent || !desktopTocList) return;

  // Clone desktop TOC to mobile
  mobileTocContent.innerHTML = '';
  const clonedList = desktopTocList.cloneNode(true);
  clonedList.removeAttribute('id');
  mobileTocContent.appendChild(clonedList);
  
  // Close overlay on link click
  mobileTocContent.querySelectorAll('.toc-link').forEach(link => {
    link.addEventListener('click', () => mobileTocOverlay.classList.remove('active'));
  });
  
  // Touch/drag functionality for sheet
  let startY = 0;
  let currentY = 0;
  let isDragging = false;
  let startHeight = 0;
  let isExpanded = false;
  
  const touchArea = document.querySelector('.mobile-toc-header');
  
  if (touchArea) {
    touchArea.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      isDragging = true;
      isExpanded = mobileTocSheet.classList.contains('expanded');
      startHeight = mobileTocSheet.offsetHeight;
      
      mobileTocSheet.style.transition = 'none';
    }, { passive: false });
    
    touchArea.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      
      if (deltaY < 0) {
        // Swipe up - expand
        e.preventDefault();
        
        if (!isExpanded) {
          const newHeight = startHeight + Math.abs(deltaY);
          mobileTocSheet.style.height = `${newHeight}px`;
          mobileTocSheet.style.transform = `translateY(0)`;
        }
      } else {
        // Swipe down - collapse or close
        e.preventDefault();
        
        if (isExpanded) {
          const newHeight = Math.max(window.innerHeight * 0.5, startHeight - deltaY);
          mobileTocSheet.style.height = `${newHeight}px`;
        } else {
          mobileTocSheet.style.transform = `translateY(${deltaY}px)`;
        }
      }
    }, { passive: false });
    
    touchArea.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;
      mobileTocSheet.style.transition = '';
      
      const deltaY = currentY - startY;
      
      if (deltaY < -50) {
        // Expand
        mobileTocSheet.style.height = '';
        mobileTocSheet.classList.add('expanded');
        mobileTocSheet.style.transform = '';
      } else if (deltaY > 50) {
        // Collapse or close
        if (isExpanded) {
          mobileTocSheet.style.height = '';
          mobileTocSheet.classList.remove('expanded');
        } else {
          mobileTocOverlay.classList.remove('active');
          mobileTocSheet.style.transform = '';
        }
      } else {
        // Snap back
        mobileTocSheet.style.height = '';
        mobileTocSheet.style.transform = '';
      }
    });
  }
  
  // Open button - scroll to active link
  const openBtn = document.getElementById('mobileTocBtn');
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      setTimeout(() => {
        const activeLink = mobileTocContent.querySelector('.toc-link.active');
        if (activeLink) {
          activeLink.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }, 100);
    });
  }

  // Close button
  const closeBtn = document.querySelector('.mobile-toc-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      mobileTocOverlay.classList.remove('active');
    });
  }

  // Backdrop click to close
  const backdrop = document.querySelector('.mobile-toc-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      mobileTocOverlay.classList.remove('active');
    });
  }
}

// ===========================
// INITIALIZE ALL
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initScrollIndicator();
  initStickySidebar();
  initTOCScrollSpy();
  initFABAutoHide();
  initMobileTOC();
});
