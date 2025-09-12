// Formular-Handling mit Spam-Schutz
(function() {
    'use strict';

    function initializeForms() {
        const forms = document.querySelectorAll('form[data-form-type]');
        forms.forEach(form => {
            setupForm(form);
        });
    }

    function setupForm(form) {
        const formType = form.getAttribute('data-form-type');

        // Spam-Schutz initialisieren
        initializeSpamProtection(form);

        // Validierung
        setupValidation(form);

        // Submit-Handler
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmit(form, formType);
        });
    }

    function initializeSpamProtection(form) {
        // Honeypot-Feld hinzufügen
        const honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = 'website';
        honeypot.className = 'honeypot';
        honeypot.tabIndex = -1;
        honeypot.setAttribute('aria-hidden', 'true');
        honeypot.setAttribute('autocomplete', 'off');
        form.appendChild(honeypot);

        // Zeitstempel für Mindest-Füllzeit
        const timestamp = document.createElement('input');
        timestamp.type = 'hidden';
        timestamp.name = 'timestamp';
        timestamp.value = Date.now().toString();
        form.appendChild(timestamp);
    }

    function setupValidation(form) {
        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            // Real-time Validierung
            input.addEventListener('blur', function() {
                validateField(this);
            });

            input.addEventListener('input', function() {
                // Fehler entfernen bei Eingabe
                clearFieldError(this);
            });
        });
    }

    function validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Required-Validierung
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = getErrorMessage('required', fieldName);
        }

        // E-Mail-Validierung
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = getErrorMessage('email', fieldName);
            }
        }

        // Mindestlänge
        if (field.hasAttribute('minlength') && value) {
            const minLength = parseInt(field.getAttribute('minlength'));
            if (value.length < minLength) {
                isValid = false;
                errorMessage = getErrorMessage('minlength', fieldName, minLength);
            }
        }

        // Checkbox-Validierung (z.B. Datenschutz)
        if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
            isValid = false;
            errorMessage = getErrorMessage('checkbox', fieldName);
        }

        if (isValid) {
            clearFieldError(field);
        } else {
            showFieldError(field, errorMessage);
        }

        return isValid;
    }

    function getErrorMessage(type, fieldName, param = null) {
        const currentLang = document.documentElement.lang || 'de';
        const isGerman = currentLang === 'de';

        const messages = {
            required: {
                de: 'Dieses Feld ist erforderlich.',
                en: 'This field is required.'
            },
            email: {
                de: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
                en: 'Please enter a valid email address.'
            },
            minlength: {
                de: `Mindestens ${param} Zeichen erforderlich.`,
                en: `At least ${param} characters required.`
            },
            checkbox: {
                de: 'Sie müssen dieser Bedingung zustimmen.',
                en: 'You must agree to this condition.'
            }
        };

        return messages[type] ? messages[type][isGerman ? 'de' : 'en'] : 'Ungültige Eingabe.';
    }

    function showFieldError(field, message) {
        clearFieldError(field);

        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');

        const errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        errorElement.textContent = message;
        errorElement.id = field.name + '-error';

        field.setAttribute('aria-describedby', errorElement.id);
        field.parentNode.appendChild(errorElement);
    }

    function clearFieldError(field) {
        field.classList.remove('error');
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-describedby');

        const existingError = field.parentNode.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }
    }

    function validateForm(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        let isValid = true;

        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });

        // Spam-Schutz prüfen
        if (!checkSpamProtection(form)) {
            isValid = false;
            showFormMessage(form, 'error', 'Spam-Schutz fehlgeschlagen. Bitte versuchen Sie es erneut.');
        }

        return isValid;
    }

    function checkSpamProtection(form) {
        // Honeypot prüfen
        const honeypot = form.querySelector('input[name="website"]');
        if (honeypot && honeypot.value) {
            console.warn('Honeypot triggered');
            return false;
        }

        // Zeitstempel prüfen (mindestens 3 Sekunden)
        const timestamp = form.querySelector('input[name="timestamp"]');
        if (timestamp) {
            const submitTime = Date.now();
            const formTime = parseInt(timestamp.value);
            const timeDiff = submitTime - formTime;

            if (timeDiff < 3000) { // 3 Sekunden
                console.warn('Form submitted too quickly');
                return false;
            }
        }

        return true;
    }

    async function handleFormSubmit(form, formType) {
        if (!validateForm(form)) {
            // Fokus auf erstes Fehlerfeld setzen
            const firstError = form.querySelector('.error');
            if (firstError) {
                firstError.focus();
            }
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;

        // Loading-Zustand
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner"></span> Wird gesendet...';

        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Honeypot und Timestamp entfernen
            delete data.website;
            delete data.timestamp;

            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    showFormMessage(form, 'success', getSuccessMessage());
                    form.reset();
                } else {
                    throw new Error(result.message || 'Server error');
                }
            } else {
                throw new Error('Network error');
            }

        } catch (error) {
            console.error('Form submission error:', error);

            // Fallback zu mailto
            if (formType === 'contact') {
                showMailtoFallback(form);
            } else {
                showFormMessage(form, 'error', getErrorMessage('submit'));
            }
        } finally {
            // Loading-Zustand zurücksetzen
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }

    function showFormMessage(form, type, message) {
        // Vorherige Nachrichten entfernen
        const existingMessage = form.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageElement = document.createElement('div');
        messageElement.className = `form-message form-${type}`;
        messageElement.textContent = message;
        messageElement.setAttribute('role', type === 'error' ? 'alert' : 'status');

        form.insertBefore(messageElement, form.firstChild);

        // Screen Reader Ankündigung
        if (window.ErinnerungslichtApp && window.ErinnerungslichtApp.announceToScreenReader) {
            window.ErinnerungslichtApp.announceToScreenReader(message);
        }

        // Nach oben scrollen
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function getSuccessMessage() {
        const currentLang = document.documentElement.lang || 'de';
        return currentLang === 'de' 
            ? 'Vielen Dank! Wir melden uns binnen 24 Stunden bei Ihnen.'
            : 'Thank you! We will get back to you within 24 hours.';
    }

    function getErrorMessage(type) {
        const currentLang = document.documentElement.lang || 'de';
        const isGerman = currentLang === 'de';

        const messages = {
            submit: {
                de: 'Entschuldigung, beim Senden ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder nutzen Sie unsere E-Mail-Adresse.',
                en: 'Sorry, an error occurred while sending. Please try again or use our email address.'
            }
        };

        return messages[type] ? messages[type][isGerman ? 'de' : 'en'] : 'Ein Fehler ist aufgetreten.';
    }

    function showMailtoFallback(form) {
        const currentLang = document.documentElement.lang || 'de';
        const isGerman = currentLang === 'de';

        const formData = new FormData(form);
        const name = formData.get('name') || '';
        const email = formData.get('email') || '';
        const message = formData.get('message') || '';

        const subject = isGerman 
            ? `Kontaktanfrage von ${name}`
            : `Contact request from ${name}`;

        const body = isGerman
            ? `Name: ${name}\nE-Mail: ${email}\n\nNachricht:\n${message}`
            : `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

        const mailtoLink = `mailto:info@erinnerungslicht.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        const fallbackMessage = isGerman
            ? 'Das Kontaktformular ist momentan nicht verfügbar. Sie können uns direkt eine E-Mail senden:'
            : 'The contact form is currently unavailable. You can send us an email directly:';

        const messageElement = document.createElement('div');
        messageElement.className = 'form-message form-info';
        messageElement.innerHTML = `
            <p>${fallbackMessage}</p>
            <a href="${mailtoLink}" class="btn btn-primary">E-Mail öffnen</a>
        `;

        form.insertBefore(messageElement, form.firstChild);
    }

    // Rate Limiting (einfache Client-seitige Implementierung)
    function checkRateLimit() {
        const key = 'form_submissions';
        const now = Date.now();
        const submissions = JSON.parse(localStorage.getItem(key) || '[]');

        // Submissions der letzten Stunde
        const recentSubmissions = submissions.filter(time => now - time < 3600000);

        if (recentSubmissions.length >= 5) { // Max 5 pro Stunde
            return false;
        }

        // Neue Submission hinzufügen
        recentSubmissions.push(now);
        localStorage.setItem(key, JSON.stringify(recentSubmissions));

        return true;
    }

    // Globale Funktionen exportieren
    window.initializeForms = initializeForms;
    window.formHandler = {
        validateForm,
        showFormMessage
    };
})();
