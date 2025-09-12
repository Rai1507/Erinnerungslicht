// Cookie Consent Management
(function() {
    'use strict';

    const CONSENT_KEY = 'erinnerungslicht_consent';
    const CONSENT_VERSION = '1.0';

    let consentData = {
        version: CONSENT_VERSION,
        timestamp: null,
        necessary: true,
        analytics: false,
        marketing: false
    };

    function initializeCookieConsent() {
        loadConsentData();

        if (!hasValidConsent()) {
            showConsentBanner();
        } else {
            loadOptionalScripts();
        }

        setupConsentHandlers();
    }

    function loadConsentData() {
        try {
            const stored = localStorage.getItem(CONSENT_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.version === CONSENT_VERSION) {
                    consentData = { ...consentData, ...parsed };
                }
            }
        } catch (error) {
            console.warn('Error loading consent data:', error);
        }
    }

    function saveConsentData() {
        try {
            consentData.timestamp = Date.now();
            localStorage.setItem(CONSENT_KEY, JSON.stringify(consentData));
        } catch (error) {
            console.warn('Error saving consent data:', error);
        }
    }

    function hasValidConsent() {
        return consentData.timestamp && 
               consentData.version === CONSENT_VERSION &&
               (Date.now() - consentData.timestamp) < (365 * 24 * 60 * 60 * 1000); // 1 Jahr
    }

    function showConsentBanner() {
        const banner = createConsentBanner();
        document.body.appendChild(banner);

        // Banner anzeigen
        setTimeout(() => {
            banner.classList.add('show');
        }, 100);

        // Fokus auf ersten Button setzen
        const firstButton = banner.querySelector('button');
        if (firstButton) {
            firstButton.focus();
        }
    }

    function createConsentBanner() {
        const banner = document.createElement('div');
        banner.className = 'cookie-consent';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-labelledby', 'consent-title');
        banner.setAttribute('aria-describedby', 'consent-description');

        const currentLang = document.documentElement.lang || 'de';
        const isGerman = currentLang === 'de';

        banner.innerHTML = `
            <div class="cookie-consent-content">
                <div class="cookie-consent-text">
                    <h3 id="consent-title">${isGerman ? 'Cookie-Einstellungen' : 'Cookie Settings'}</h3>
                    <p id="consent-description">
                        ${isGerman 
                            ? 'Wir verwenden nur technisch notwendige Cookies. Optional können Sie Analytics-Cookies aktivieren, um uns bei der Verbesserung der Website zu helfen.'
                            : 'We only use technically necessary cookies. Optionally, you can activate analytics cookies to help us improve the website.'
                        }
                    </p>
                </div>
                <div class="cookie-consent-actions">
                    <button type="button" class="btn btn-secondary" id="consent-necessary">
                        ${isGerman ? 'Nur Notwendige' : 'Necessary Only'}
                    </button>
                    <button type="button" class="btn btn-primary" id="consent-all">
                        ${isGerman ? 'Alle akzeptieren' : 'Accept All'}
                    </button>
                    <a href="${isGerman ? '/datenschutz.de.html' : '/privacy.en.html'}" class="btn btn-secondary">
                        ${isGerman ? 'Details' : 'Details'}
                    </a>
                </div>
            </div>
        `;

        return banner;
    }

    function setupConsentHandlers() {
        document.addEventListener('click', function(e) {
            if (e.target.id === 'consent-necessary') {
                acceptNecessaryOnly();
            } else if (e.target.id === 'consent-all') {
                acceptAll();
            } else if (e.target.id === 'consent-reset') {
                resetConsent();
            }
        });

        // Escape-Taste für Banner
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const banner = document.querySelector('.cookie-consent.show');
                if (banner) {
                    acceptNecessaryOnly(); // Standard-Aktion bei Escape
                }
            }
        });
    }

    function acceptNecessaryOnly() {
        consentData.necessary = true;
        consentData.analytics = false;
        consentData.marketing = false;

        saveConsentData();
        hideConsentBanner();

        // Screen Reader Ankündigung
        if (window.ErinnerungslichtApp && window.ErinnerungslichtApp.announceToScreenReader) {
            const currentLang = document.documentElement.lang || 'de';
            const message = currentLang === 'de' 
                ? 'Nur notwendige Cookies akzeptiert'
                : 'Only necessary cookies accepted';
            window.ErinnerungslichtApp.announceToScreenReader(message);
        }
    }

    function acceptAll() {
        consentData.necessary = true;
        consentData.analytics = true;
        consentData.marketing = false; // Marketing noch nicht implementiert

        saveConsentData();
        hideConsentBanner();
        loadOptionalScripts();

        // Screen Reader Ankündigung
        if (window.ErinnerungslichtApp && window.ErinnerungslichtApp.announceToScreenReader) {
            const currentLang = document.documentElement.lang || 'de';
            const message = currentLang === 'de' 
                ? 'Alle Cookies akzeptiert'
                : 'All cookies accepted';
            window.ErinnerungslichtApp.announceToScreenReader(message);
        }
    }

    function resetConsent() {
        localStorage.removeItem(CONSENT_KEY);
        consentData = {
            version: CONSENT_VERSION,
            timestamp: null,
            necessary: true,
            analytics: false,
            marketing: false
        };

        // Seite neu laden um alle Skripte zu entfernen
        window.location.reload();
    }

    function hideConsentBanner() {
        const banner = document.querySelector('.cookie-consent');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                banner.remove();
            }, 300);
        }
    }

    function loadOptionalScripts() {
        if (consentData.analytics) {
            loadAnalytics();
        }

        // Weitere optionale Skripte hier laden
    }

    function loadAnalytics() {
        // Platzhalter für Analytics-Code
        // Hier würde normalerweise Google Analytics, Matomo etc. geladen

        console.log('Analytics würde hier geladen werden (Platzhalter)');

        // Beispiel für Google Analytics 4:
        /*
        (function() {
            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
            document.head.appendChild(script);

            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID', {
                anonymize_ip: true,
                cookie_flags: 'SameSite=Strict;Secure'
            });
        })();
        */

        // Beispiel für Matomo:
        /*
        (function() {
            window._paq = window._paq || [];
            _paq.push(['trackPageView']);
            _paq.push(['enableLinkTracking']);

            const u = "//your-matomo-domain.com/";
            _paq.push(['setTrackerUrl', u+'matomo.php']);
            _paq.push(['setSiteId', 'YOUR_SITE_ID']);

            const d = document;
            const g = d.createElement('script');
            const s = d.getElementsByTagName('script')[0];
            g.type = 'text/javascript';
            g.async = true;
            g.src = u+'matomo.js';
            s.parentNode.insertBefore(g,s);
        })();
        */
    }

    // Consent-Status prüfen
    function hasConsent(type) {
        return consentData[type] === true;
    }

    // Consent-Informationen für Datenschutzseite
    function getConsentInfo() {
        return {
            ...consentData,
            hasValidConsent: hasValidConsent()
        };
    }

    // Globale Funktionen exportieren
    window.initializeCookieConsent = initializeCookieConsent;
    window.cookieConsent = {
        hasConsent,
        getConsentInfo,
        resetConsent,
        acceptAll,
        acceptNecessaryOnly
    };
})();
