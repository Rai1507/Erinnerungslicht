// Erinnerungslicht - Haupt-JavaScript
(function() {
    'use strict';

    // DOM Ready
    document.addEventListener('DOMContentLoaded', function() {
        initializeApp();
    });

    function initializeApp() {
        initializeNavigation();
        initializeLanguageSwitcher();
        initializeSmoothScrolling();
        initializeAccessibility();
        initializeLazyLoading();

        // Cookie Consent initialisieren
        if (typeof initializeCookieConsent === 'function') {
            initializeCookieConsent();
        }

        // i18n initialisieren
        if (typeof initializeI18n === 'function') {
            initializeI18n();
        }

        // Formulare initialisieren
        if (typeof initializeForms === 'function') {
            initializeForms();
        }
    }

    // Navigation
    function initializeNavigation() {
        const navToggle = document.querySelector('.nav-toggle');
        const nav = document.querySelector('.nav');

        if (navToggle && nav) {
            navToggle.addEventListener('click', function() {
                nav.classList.toggle('active');

                // ARIA-Attribute aktualisieren
                const isExpanded = nav.classList.contains('active');
                navToggle.setAttribute('aria-expanded', isExpanded);
            });

            // Navigation schließen bei Klick außerhalb
            document.addEventListener('click', function(e) {
                if (!nav.contains(e.target) && !navToggle.contains(e.target)) {
                    nav.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });

            // Navigation schließen bei Escape
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                    navToggle.focus();
                }
            });
        }
    }

    // Sprachumschalter
    function initializeLanguageSwitcher() {
        const langLinks = document.querySelectorAll('.lang-link');

        langLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const lang = this.getAttribute('data-lang');
                switchLanguage(lang);
            });
        });
    }

    function switchLanguage(lang) {
        const currentPath = window.location.pathname;
        let newPath;

        // URL-Mapping für Sprachenwechsel
        const pathMappings = {
            'de': {
                '/index.en.html': '/index.de.html',
                '/example.en.html': '/beispiel.de.html',
                '/christian.en.html': '/christlich.de.html',
                '/faq.en.html': '/faq.de.html',
                '/imprint.en.html': '/impressum.de.html',
                '/privacy.en.html': '/datenschutz.de.html',
                '/404.en.html': '/404.de.html'
            },
            'en': {
                '/index.de.html': '/index.en.html',
                '/beispiel.de.html': '/example.en.html',
                '/christlich.de.html': '/christian.en.html',
                '/faq.de.html': '/faq.en.html',
                '/impressum.de.html': '/imprint.en.html',
                '/datenschutz.de.html': '/privacy.en.html',
                '/404.de.html': '/404.en.html'
            }
        };

        if (pathMappings[lang] && pathMappings[lang][currentPath]) {
            newPath = pathMappings[lang][currentPath];
        } else {
            // Fallback zur Startseite
            newPath = lang === 'de' ? '/index.de.html' : '/index.en.html';
        }

        // URL-Parameter für Sprache setzen
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        url.pathname = newPath;

        window.location.href = url.toString();
    }

    // Smooth Scrolling
    function initializeSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');

        links.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();

                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    // Fokus setzen für Accessibility
                    targetElement.focus();
                }
            });
        });
    }

    // Accessibility Verbesserungen
    function initializeAccessibility() {
        // Skip Link
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector('#main-content');
                if (target) {
                    target.focus();
                    target.scrollIntoView();
                }
            });
        }

        // Fokus-Management für Modals/Overlays
        document.addEventListener('keydown', function(e) {
            // Escape-Taste für Modals
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    closeModal(activeModal);
                }
            }
        });

        // ARIA-Live-Regionen für dynamische Inhalte
        createLiveRegion();
    }

    function createLiveRegion() {
        if (!document.getElementById('live-region')) {
            const liveRegion = document.createElement('div');
            liveRegion.id = 'live-region';
            liveRegion.className = 'live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            document.body.appendChild(liveRegion);
        }
    }

    function announceToScreenReader(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    // Lazy Loading für Bilder
    function initializeLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    // Utility-Funktionen
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Performance Monitoring
    function logPerformance() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
                }, 0);
            });
        }
    }

    // Globale Funktionen exportieren
    window.ErinnerungslichtApp = {
        announceToScreenReader,
        debounce,
        throttle,
        switchLanguage
    };

    // Performance-Logging in Development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        logPerformance();
    }
})();
