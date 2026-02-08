/**
 * BLOG COMMON SCRIPTS - Bit by Bit
 * Shared JavaScript functionality for all blog posts
 */

document.addEventListener('DOMContentLoaded', () => {
    // ===========================
    // THEME TOGGLE
    // ===========================
    const themeBtn = document.getElementById('themeToggle');
    const iconSun = document.getElementById('iconSun');
    const iconMoon = document.getElementById('iconMoon');

    function updateThemeIcons() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            if(iconSun) iconSun.style.display = 'block';
            if(iconMoon) iconMoon.style.display = 'none';
        } else {
            if(iconSun) iconSun.style.display = 'none';
            if(iconMoon) iconMoon.style.display = 'block';
        }
    }

    updateThemeIcons();

    if (themeBtn) {
        themeBtn.onclick = () => {
            if (window.ThemeManager) {
                window.ThemeManager.toggle();
                updateThemeIcons();
            }
        };
    }

    // ===========================
    // SCROLL INDICATOR
    // ===========================
    const scrollIndicator = document.getElementById('scrollIndicator');
    if (scrollIndicator) {
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
    const heroSection = document.getElementById('heroSection');
    const metaSidebar = document.getElementById('metaSidebar');

    if (heroSection && metaSidebar) {
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
    const sections = document.querySelectorAll('.article-content h2[id], #intro');
    
    if (sections.length > 0) {
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
    // FAB AUTO-HIDE
    // ===========================
    let scrollTimeout;
    
    window.addEventListener('scroll', () => {
       const fabToCheck = document.getElementById('mobileTocBtn');
       if (!fabToCheck) return;
       
       // Hide immediately on scroll
       fabToCheck.classList.add('hidden');
       
       clearTimeout(scrollTimeout);
       scrollTimeout = setTimeout(() => {
           fabToCheck.classList.remove('hidden');
       }, 300);
       
    }, { passive: true });

    // ===========================
    // MOBILE TOC LOGIC
    // ===========================
    const mobileTocOverlay = document.getElementById('mobileTocOverlay');
    const mobileTocSheet = document.getElementById('mobileTocSheet');
    const mobileTocContent = document.getElementById('mobileTocContent');
    const desktopTocList = document.getElementById('tocList');
    
    function closeMobileToc() {
        if (!mobileTocOverlay || !mobileTocSheet) return;
        mobileTocOverlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
        mobileTocSheet.style.transform = '';
        mobileTocSheet.classList.remove('expanded');
        mobileTocSheet.style.height = ''; 
        
        const fab = document.getElementById('mobileTocBtn');
        if (fab) fab.classList.remove('hidden-by-sheet');
    }

    function openMobileToc() {
        if (!mobileTocOverlay || !mobileTocSheet) return;
        mobileTocOverlay.classList.add('active');
        document.body.classList.add('no-scroll');
        mobileTocSheet.classList.remove('expanded');
        mobileTocSheet.style.height = '';
        
        const fab = document.getElementById('mobileTocBtn');
        if (fab) fab.classList.add('hidden-by-sheet');
    }

    if (desktopTocList && mobileTocContent) {
      mobileTocContent.innerHTML = '';
      const clonedList = desktopTocList.cloneNode(true);
      clonedList.removeAttribute('id');
      mobileTocContent.appendChild(clonedList);
      
      mobileTocContent.querySelectorAll('.toc-link').forEach(link => {
        link.addEventListener('click', closeMobileToc);
      });
    }
    
    let startY = 0;
    let isDragging = false;
    let startHeight = 0;
    let isExpanded = false;
    
    const touchArea = mobileTocSheet;
    
    if (touchArea) {
        touchArea.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            isExpanded = mobileTocSheet.classList.contains('expanded');
            startHeight = mobileTocSheet.offsetHeight;
            
            isDragging = false;
            mobileTocSheet.style.transition = 'none';
        }, { passive: false });
        
        touchArea.addEventListener('touchmove', (e) => {
            const currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            const isContent = e.target.closest('.mobile-toc-content');
            const content = mobileTocContent;
            
            let shouldDrag = false;

            if (!isContent) {
                shouldDrag = true;
            } else {
                if (!isExpanded) {
                    // 50% State
                    if (deltaY < 0) { // Swipe Up (Expand)
                        const isAtBottom = (content.scrollTop + content.clientHeight >= content.scrollHeight - 5);
                        if (isAtBottom) shouldDrag = true;
                    } else { // Swipe Down (Close)
                        if (content.scrollTop <= 0) shouldDrag = true;
                    }
                } else {
                    // 100% State
                    if (deltaY > 0) { // Swipe Down (Collapse)
                        if (content.scrollTop <= 0) shouldDrag = true;
                    }
                }
            }

            if (shouldDrag) {
                e.preventDefault();
                isDragging = true;
                
                if (!isExpanded) {
                    if (deltaY < 0) {
                         const newHeight = startHeight + Math.abs(deltaY);
                         mobileTocSheet.style.height = `${newHeight}px`;
                         mobileTocSheet.style.transform = `translateY(0)`;
                    } else {
                         mobileTocSheet.style.transform = `translateY(${deltaY}px)`;
                    }
                } else {
                    if (deltaY > 0) {
                         const newHeight = Math.max(window.innerHeight * 0.5, startHeight - deltaY);
                         mobileTocSheet.style.height = `${newHeight}px`;
                    }
                }
            }
        }, { passive: false });
        
        touchArea.addEventListener('touchend', (e) => {
            mobileTocSheet.style.transition = '';
            
            if (!isDragging) return;
            isDragging = false;
            
            const currentY = e.changedTouches[0].clientY;
            const deltaY = currentY - startY;
            
            if (!isExpanded) {
                if (deltaY < -50) {
                    mobileTocSheet.style.height = '';
                    mobileTocSheet.classList.add('expanded');
                } else if (deltaY > 50) {
                    closeMobileToc();
                } else {
                    mobileTocSheet.style.height = '';
                    mobileTocSheet.style.transform = '';
                }
            } else {
                if (deltaY > 50) {
                    mobileTocSheet.style.height = '';
                    mobileTocSheet.classList.remove('expanded');
                } else {
                     mobileTocSheet.style.height = '';
                     mobileTocSheet.classList.add('expanded');
                }
            }
        });
    }
    
    // Open Button Logic
    const openBtn = document.getElementById('mobileTocBtn');
    if (openBtn) {
        openBtn.addEventListener('click', () => {
             openMobileToc();
             setTimeout(() => {
                 const activeLink = mobileTocContent.querySelector('.toc-link.active');
                 if (activeLink) {
                     activeLink.scrollIntoView({ block: 'center', behavior: 'smooth' });
                 }
             }, 100);
        });
    }
    
    // Close Button Logic
    const closeBtn = document.querySelector('.mobile-toc-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMobileToc);
    }

    // Backdrop Logic
    const backdrop = document.querySelector('.mobile-toc-backdrop');
    if (backdrop) {
        backdrop.addEventListener('click', closeMobileToc);
    }
});
