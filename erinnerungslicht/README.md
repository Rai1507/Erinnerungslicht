# Erinnerungslicht - Digitale Gedenkseiten

Ein vollständig responsives, barrierearmes, zweisprachiges (DE/EN) Website-Projekt für digitale Gedenkseiten.

## 🚀 Schnellstart

1. **Projekt herunterladen** und entpacken
2. **Dateien auf Webserver hochladen** oder lokal öffnen
3. **Anpassungen vornehmen** (siehe unten)
4. **Kontaktformular-API einrichten** (optional)

### Lokales Testen
```bash
# Einfach index.de.html im Browser öffnen
open index.de.html
```

## 📁 Projektstruktur

```
erinnerungslicht/
├── index.de.html              # Deutsche Startseite
├── index.en.html              # Englische Startseite
├── beispiel.de.html           # Deutsche Beispiel-Gedenkseite
├── example.en.html            # Englische Beispiel-Gedenkseite
├── christlich.de.html         # Deutsche christliche Seite
├── christian.en.html          # Englische christliche Seite
├── faq.de.html               # Deutsche FAQ
├── faq.en.html               # Englische FAQ
├── impressum.de.html         # Deutsches Impressum
├── imprint.en.html           # Englisches Impressum
├── datenschutz.de.html       # Deutsche Datenschutzerklärung
├── privacy.en.html           # Englische Datenschutzerklärung
├── 404.de.html               # Deutsche 404-Seite
├── 404.en.html               # Englische 404-Seite
├── qr.html                   # QR-Label-Generator
├── assets/
│   ├── css/
│   │   ├── style.css         # Haupt-Stylesheet
│   │   └── print.css         # Print-Styles für QR-Labels
│   ├── js/
│   │   ├── main.js           # Haupt-JavaScript
│   │   ├── i18n.js           # Internationalisierung
│   │   ├── consent.js        # Cookie-Consent
│   │   ├── form.js           # Formular-Handling
│   │   └── qrcode.min.js     # QR-Code-Generator
│   ├── img/
│   │   ├── logo.svg          # Haupt-Logo
│   │   ├── logo-dark.svg     # Logo für dunkle Hintergründe
│   │   ├── favicon.svg       # Favicon
│   │   └── memorial-*.jpg    # Beispielbilder
│   └── i18n/
│       ├── de.json           # Deutsche Übersetzungen
│       └── en.json           # Englische Übersetzungen
├── memorials/
│   ├── sample.de.json        # Deutsche Beispiel-Memorial-Daten
│   └── sample.en.json        # Englische Beispiel-Memorial-Daten
├── api/
│   ├── contact.js            # Node.js API für Kontaktformular
│   ├── package.json          # NPM-Abhängigkeiten
│   └── .env.example          # Umgebungsvariablen-Vorlage
└── README.md                 # Diese Datei
```

## ⚙️ Anpassungen

### 1. Firmendaten & Rechtliches

**Impressum (WICHTIG!):**
- `impressum.de.html` und `imprint.en.html`
- Ersetzen Sie alle Platzhalter:
  - `COMPANY_NAME_LEGAL` → Ihr Firmenname (z.B. "Mustermann GmbH")
  - `ADDRESS_IMPRINT` → Ihre Geschäftsadresse (ladungsfähig!)
  - `CONTACT_EMAIL` → Ihre E-Mail-Adresse
  - `PHONE_OPTIONAL` → Ihre Telefonnummer (optional)

**Datenschutzerklärung:**
- `datenschutz.de.html` und `privacy.en.html`
- Gleiche Platzhalter wie Impressum ersetzen
- Bei Bedarf Abschnitte für Analytics/Tracking ergänzen

### 2. Texte & Sprachen

**i18n-Dateien bearbeiten:**
```bash
# Deutsche Texte
assets/i18n/de.json

# Englische Texte  
assets/i18n/en.json
```

**Wichtige Bereiche:**
- `brand.name` → Ihr Markenname
- `brand.tagline` → Ihr Slogan
- `pricing.packages` → Ihre Preise
- `contact.form` → Kontaktformular-Texte

### 3. Design & Farben

**CSS-Variablen in `assets/css/style.css`:**
```css
:root {
  --primary-color: #2c3e50;     /* Hauptfarbe */
  --accent-color: #e74c3c;      /* Akzentfarbe */
  --text-color: #2c3e50;        /* Textfarbe */
  /* ... weitere Farben */
}
```

**Logo ersetzen:**
- `assets/img/logo.svg` → Ihr Logo (helle Version)
- `assets/img/logo-dark.svg` → Ihr Logo (dunkle Version)
- SVG-Format empfohlen für beste Qualität

### 4. Kontaktformular einrichten

**Backend-API (Node.js):**
```bash
cd api/
npm install
cp .env.example .env
# .env-Datei mit Ihren Daten befüllen
npm start
```

**Umgebungsvariablen (.env):**
```env
# E-Mail-Konfiguration (eine Option wählen)
SMTP_HOST=mail.ihr-provider.com
SMTP_USER=ihre-email@domain.de
SMTP_PASS=ihr-passwort

# Ziel-E-Mail
TO_EMAIL=info@ihre-domain.de
FROM_EMAIL=noreply@ihre-domain.de
```

**Alternative: Externes Formular-Service**
- Formspree.io
- Netlify Forms  
- EmailJS

### 5. Analytics (optional)

**Nach Cookie-Consent aktivieren:**
In `assets/js/consent.js` die Funktion `loadAnalytics()` anpassen:

```javascript
function loadAnalytics() {
    // Google Analytics 4
    (function() {
        const script = document.createElement('script');
        script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'GA_MEASUREMENT_ID');
    })();
}
```

## 🌐 Domain & Hosting

### Domain verbinden

**DNS-Einstellungen:**
```
# A-Record (IPv4)
@ → 123.456.789.123

# CNAME (Subdomain)
www → ihre-domain.de
```

**SSL-Zertifikat:**
- Let's Encrypt (kostenlos)
- Cloudflare (kostenlos)
- Hosting-Provider

### Empfohlene Hosting-Provider
- **Netlify** (statische Sites, kostenlos)
- **Vercel** (statische Sites, kostenlos)  
- **GitHub Pages** (kostenlos)
- **Strato, 1&1, All-Inkl** (Deutschland)

### Server-Konfiguration

**Apache (.htaccess):**
```apache
# HTTPS-Weiterleitung
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Komprimierung
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript
</IfModule>

# Caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"
</IfModule>
```

**Nginx:**
```nginx
# HTTPS-Weiterleitung
server {
    listen 80;
    server_name ihre-domain.de www.ihre-domain.de;
    return 301 https://$server_name$request_uri;
}

# Hauptkonfiguration
server {
    listen 443 ssl http2;
    server_name ihre-domain.de www.ihre-domain.de;

    # SSL-Zertifikat
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Statische Dateien
    location / {
        root /var/www/erinnerungslicht;
        index index.de.html;
        try_files $uri $uri/ =404;
    }

    # API-Weiterleitung
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📊 SEO & Performance

### Sitemap generieren
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://ihre-domain.de/index.de.html</loc>
        <lastmod>2024-01-01</lastmod>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://ihre-domain.de/index.en.html</loc>
        <lastmod>2024-01-01</lastmod>
        <priority>1.0</priority>
    </url>
    <!-- weitere URLs -->
</urlset>
```

### robots.txt
```
User-agent: *
Allow: /

# Beispiel-Seiten nicht indexieren
Disallow: /beispiel.de.html
Disallow: /example.en.html

Sitemap: https://ihre-domain.de/sitemap.xml
```

### Performance-Optimierung
- **Bilder komprimieren** (WebP-Format)
- **CSS/JS minifizieren**
- **Gzip-Komprimierung aktivieren**
- **CDN verwenden** (Cloudflare)

## 🔒 Sicherheit & DSGVO

### Cookie-Consent
- Standardmäßig nur technisch notwendige Cookies
- Opt-in für Analytics/Tracking
- Consent-Reset auf Datenschutzseite

### Datenschutz-Checkliste
- ✅ Impressum mit Geschäftsadresse
- ✅ Datenschutzerklärung vollständig
- ✅ Cookie-Consent implementiert
- ✅ Kontaktformular mit Einverständnis
- ✅ Hosting in Deutschland/EU
- ✅ SSL-Verschlüsselung aktiv

### Spam-Schutz
- Honeypot-Felder
- Zeitstempel-Prüfung
- Rate-Limiting
- Keyword-Filter

## 🛠️ Entwicklung

### Lokale Entwicklung
```bash
# Python-Server (einfach)
python -m http.server 8000

# Node.js-Server
npx serve .

# Live-Reload
npx live-server
```

### Code-Qualität
- **HTML-Validierung:** validator.w3.org
- **Accessibility:** WAVE, axe DevTools
- **Performance:** Lighthouse, PageSpeed Insights
- **SEO:** Google Search Console

### Browser-Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Browser (iOS Safari, Chrome Mobile)

## 📞 Support & Wartung

### Regelmäßige Aufgaben
- SSL-Zertifikat erneuern
- Backup erstellen
- Updates einspielen
- Performance überwachen

### Monitoring
- Uptime-Monitoring (UptimeRobot)
- Error-Tracking (Sentry)
- Analytics (Google Analytics, Matomo)

### Backup-Strategie
- Tägliche Backups
- Versionskontrolle (Git)
- Offsite-Backup

## 🚀 Go-Live-Checkliste

### Vor dem Launch
- [ ] Impressum mit echten Daten befüllt
- [ ] Datenschutzerklärung angepasst
- [ ] Kontakt-E-Mail funktioniert
- [ ] SSL-Zertifikat installiert
- [ ] Alle Links getestet
- [ ] Mobile Ansicht geprüft
- [ ] Lighthouse-Score ≥ 90
- [ ] Cookie-Consent getestet
- [ ] 404-Seite funktioniert
- [ ] Sitemap & robots.txt hochgeladen

### Nach dem Launch
- [ ] Google Search Console einrichten
- [ ] Analytics konfigurieren
- [ ] Social Media verknüpfen
- [ ] Monitoring aktivieren
- [ ] Backup-System testen

## 📄 Lizenz

Dieses Projekt wurde für Erinnerungslicht e.K. erstellt. Alle Rechte vorbehalten.

## 🤝 Kontakt

Bei Fragen oder Problemen:
- E-Mail: info@erinnerungslicht.de
- Web: https://erinnerungslicht.de

---

**Hinweis:** Dies ist ein Beispielprojekt. Passen Sie alle Inhalte, Preise und rechtlichen Angaben an Ihre Bedürfnisse an.
