// i18n - Internationalisierung
(function() {
    'use strict';

    let currentLang = 'de';
    let translations = {};

    function initializeI18n() {
        // Sprache aus URL-Parameter oder HTML-Attribut ermitteln
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        const htmlLang = document.documentElement.lang;

        currentLang = urlLang || htmlLang || 'de';

        // Übersetzungen laden
        loadTranslations(currentLang);

        // Sprachlinks aktualisieren
        updateLanguageLinks();

        // HTML-Sprache setzen
        document.documentElement.lang = currentLang;
    }

    async function loadTranslations(lang) {
        try {
            const response = await fetch(`/assets/i18n/${lang}.json`);
            if (response.ok) {
                translations = await response.json();
                applyTranslations();
            } else {
                console.warn(`Translations for ${lang} not found`);
            }
        } catch (error) {
            console.error('Error loading translations:', error);
        }
    }

    function applyTranslations() {
        // Alle Elemente mit data-i18n Attribut übersetzen
        const elements = document.querySelectorAll('[data-i18n]');

        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = getTranslation(key);

            if (translation) {
                if (element.tagName === 'INPUT' && element.type === 'submit') {
                    element.value = translation;
                } else if (element.hasAttribute('placeholder')) {
                    element.placeholder = translation;
                } else if (element.hasAttribute('title')) {
                    element.title = translation;
                } else if (element.hasAttribute('alt')) {
                    element.alt = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Meta-Tags aktualisieren
        updateMetaTags();

        // Canonical und hreflang Links aktualisieren
        updateCanonicalAndHreflang();
    }

    function getTranslation(key) {
        const keys = key.split('.');
        let value = translations;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return null;
            }
        }

        return typeof value === 'string' ? value : null;
    }

    function updateLanguageLinks() {
        const langLinks = document.querySelectorAll('.lang-link');

        langLinks.forEach(link => {
            const lang = link.getAttribute('data-lang');
            if (lang === currentLang) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'true');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    }

    function updateMetaTags() {
        // Title aktualisieren
        const titleKey = document.querySelector('meta[name="title-key"]');
        if (titleKey) {
            const translation = getTranslation(titleKey.content);
            if (translation) {
                document.title = translation;
            }
        }

        // Description aktualisieren
        const descKey = document.querySelector('meta[name="description-key"]');
        const descMeta = document.querySelector('meta[name="description"]');
        if (descKey && descMeta) {
            const translation = getTranslation(descKey.content);
            if (translation) {
                descMeta.content = translation;
            }
        }

        // Open Graph Tags aktualisieren
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogDesc = document.querySelector('meta[property="og:description"]');

        if (ogTitle && titleKey) {
            const translation = getTranslation(titleKey.content);
            if (translation) {
                ogTitle.content = translation;
            }
        }

        if (ogDesc && descKey) {
            const translation = getTranslation(descKey.content);
            if (translation) {
                ogDesc.content = translation;
            }
        }
    }

    function updateCanonicalAndHreflang() {
        const currentPath = window.location.pathname;
        const baseUrl = window.location.origin;

        // Canonical Link
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = baseUrl + currentPath;

        // Hreflang Links
        const existingHreflang = document.querySelectorAll('link[rel="alternate"][hreflang]');
        existingHreflang.forEach(link => link.remove());

        // Deutsche Version
        const dePath = currentPath.replace(/\.en\.html$/, '.de.html');
        const deLink = document.createElement('link');
        deLink.rel = 'alternate';
        deLink.hreflang = 'de';
        deLink.href = baseUrl + dePath;
        document.head.appendChild(deLink);

        // Englische Version
        const enPath = currentPath.replace(/\.de\.html$/, '.en.html');
        const enLink = document.createElement('link');
        enLink.rel = 'alternate';
        enLink.hreflang = 'en';
        enLink.href = baseUrl + enPath;
        document.head.appendChild(enLink);

        // x-default (Deutsch als Standard)
        const defaultLink = document.createElement('link');
        defaultLink.rel = 'alternate';
        defaultLink.hreflang = 'x-default';
        defaultLink.href = baseUrl + dePath;
        document.head.appendChild(defaultLink);
    }

    // Formatierungsfunktionen
    function formatDate(date, lang = currentLang) {
        if (typeof date === 'string') {
            date = new Date(date);
        }

        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        return date.toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', options);
    }

    function formatCurrency(amount, currency = 'EUR', lang = currentLang) {
        const options = {
            style: 'currency',
            currency: currency
        };

        return new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-US', options).format(amount);
    }

    // Pluralisierung
    function pluralize(count, singular, plural, lang = currentLang) {
        if (lang === 'de') {
            return count === 1 ? singular : plural;
        } else {
            return count === 1 ? singular : plural;
        }
    }

    // Globale Funktionen exportieren
    window.initializeI18n = initializeI18n;
    window.i18n = {
        t: getTranslation,
        formatDate,
        formatCurrency,
        pluralize,
        currentLang: () => currentLang
    };
})();
