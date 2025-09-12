// Node.js API Handler für Kontaktformular
// Datei: /api/contact.js

const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// Sicherheits-Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
}));

// Rate Limiting
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Minuten
    max: 5, // Max 5 Anfragen pro IP pro Zeitfenster
    message: {
        success: false,
        message: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// JSON Parser
app.use(express.json({ limit: '10mb' }));

// E-Mail-Transporter konfigurieren
const createTransporter = () => {
    // Beispiel für verschiedene E-Mail-Provider

    // Option 1: SMTP (z.B. für eigenen Mailserver)
    if (process.env.SMTP_HOST) {
        return nodemailer.createTransporter({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    // Option 2: Gmail
    if (process.env.GMAIL_USER) {
        return nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD // App-spezifisches Passwort
            }
        });
    }

    // Option 3: SendGrid
    if (process.env.SENDGRID_API_KEY) {
        return nodemailer.createTransporter({
            service: 'SendGrid',
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY
            }
        });
    }

    // Fallback: Ethereal (nur für Tests)
    return nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'ethereal.user@ethereal.email',
            pass: 'ethereal.pass'
        }
    });
};

// Validierungsfunktionen
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validateInput = (data) => {
    const errors = [];

    if (!data.name || data.name.trim().length < 2) {
        errors.push('Name ist erforderlich (mindestens 2 Zeichen)');
    }

    if (!data.email || !validateEmail(data.email)) {
        errors.push('Gültige E-Mail-Adresse ist erforderlich');
    }

    if (!data.message || data.message.trim().length < 10) {
        errors.push('Nachricht ist erforderlich (mindestens 10 Zeichen)');
    }

    if (!data.privacy) {
        errors.push('Datenschutzerklärung muss akzeptiert werden');
    }

    return errors;
};

// Spam-Schutz
const checkSpamProtection = (data, req) => {
    // Honeypot-Prüfung
    if (data.website) {
        console.log('Spam detected: Honeypot filled');
        return false;
    }

    // Zeitstempel-Prüfung (mindestens 3 Sekunden)
    if (data.timestamp) {
        const submitTime = Date.now();
        const formTime = parseInt(data.timestamp);
        const timeDiff = submitTime - formTime;

        if (timeDiff < 3000) {
            console.log('Spam detected: Form submitted too quickly');
            return false;
        }
    }

    // Einfache Keyword-Prüfung
    const spamKeywords = ['viagra', 'casino', 'lottery', 'winner', 'congratulations'];
    const content = (data.name + ' ' + data.message).toLowerCase();

    for (const keyword of spamKeywords) {
        if (content.includes(keyword)) {
            console.log(`Spam detected: Keyword "${keyword}" found`);
            return false;
        }
    }

    return true;
};

// Hauptroute für Kontaktformular
app.post('/api/contact', contactLimiter, async (req, res) => {
    try {
        const data = req.body;

        // Input-Validierung
        const validationErrors = validateInput(data);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validierungsfehler',
                errors: validationErrors
            });
        }

        // Spam-Schutz
        if (!checkSpamProtection(data, req)) {
            return res.status(429).json({
                success: false,
                message: 'Anfrage wurde als Spam erkannt'
            });
        }

        // E-Mail senden
        const transporter = createTransporter();

        // E-Mail-Optionen
        const mailOptions = {
            from: process.env.FROM_EMAIL || 'noreply@erinnerungslicht.de',
            to: process.env.TO_EMAIL || 'info@erinnerungslicht.de',
            subject: `Kontaktanfrage von ${data.name}`,
            text: `
Name: ${data.name}
E-Mail: ${data.email}
IP-Adresse: ${req.ip}
User-Agent: ${req.get('User-Agent')}
Zeitstempel: ${new Date().toISOString()}

Nachricht:
${data.message}

---
Diese E-Mail wurde über das Kontaktformular auf erinnerungslicht.de gesendet.
            `,
            html: `
                <h2>Neue Kontaktanfrage</h2>
                <p><strong>Name:</strong> ${data.name}</p>
                <p><strong>E-Mail:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
                <p><strong>IP-Adresse:</strong> ${req.ip}</p>
                <p><strong>Zeitstempel:</strong> ${new Date().toLocaleString('de-DE')}</p>

                <h3>Nachricht:</h3>
                <p>${data.message.replace(/\n/g, '<br>')}</p>

                <hr>
                <p><small>Diese E-Mail wurde über das Kontaktformular auf erinnerungslicht.de gesendet.</small></p>
            `
        };

        // Bestätigungs-E-Mail an Absender (optional)
        const confirmationOptions = {
            from: process.env.FROM_EMAIL || 'noreply@erinnerungslicht.de',
            to: data.email,
            subject: 'Ihre Nachricht wurde empfangen - Erinnerungslicht',
            text: `
Liebe/r ${data.name},

vielen Dank für Ihre Nachricht. Wir haben Ihre Anfrage erhalten und werden uns binnen 24 Stunden bei Ihnen melden.

Ihre Nachricht:
"${data.message}"

Mit freundlichen Grüßen
Ihr Erinnerungslicht-Team

---
Erinnerungslicht e.K.
E-Mail: info@erinnerungslicht.de
Web: https://erinnerungslicht.de
            `,
            html: `
                <h2>Vielen Dank für Ihre Nachricht</h2>
                <p>Liebe/r ${data.name},</p>
                <p>vielen Dank für Ihre Nachricht. Wir haben Ihre Anfrage erhalten und werden uns binnen 24 Stunden bei Ihnen melden.</p>

                <h3>Ihre Nachricht:</h3>
                <blockquote style="border-left: 3px solid #2c3e50; padding-left: 1rem; margin: 1rem 0; color: #666;">
                    ${data.message.replace(/\n/g, '<br>')}
                </blockquote>

                <p>Mit freundlichen Grüßen<br>
                Ihr Erinnerungslicht-Team</p>

                <hr>
                <p><small>
                    Erinnerungslicht e.K.<br>
                    E-Mail: <a href="mailto:info@erinnerungslicht.de">info@erinnerungslicht.de</a><br>
                    Web: <a href="https://erinnerungslicht.de">https://erinnerungslicht.de</a>
                </small></p>
            `
        };

        // E-Mails senden
        await transporter.sendMail(mailOptions);

        // Bestätigungs-E-Mail nur senden, wenn aktiviert
        if (process.env.SEND_CONFIRMATION === 'true') {
            await transporter.sendMail(confirmationOptions);
        }

        // Erfolgreiche Antwort
        res.json({
            success: true,
            message: 'Nachricht erfolgreich gesendet'
        });

        // Logging (ohne persönliche Daten)
        console.log(`Contact form submission from ${req.ip} at ${new Date().toISOString()}`);

    } catch (error) {
        console.error('Error processing contact form:', error);

        res.status(500).json({
            success: false,
            message: 'Interner Serverfehler. Bitte versuchen Sie es später erneut.'
        });
    }
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 404 Handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint nicht gefunden'
    });
});

// Error Handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        message: 'Interner Serverfehler'
    });
});

// Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Contact API server running on port ${PORT}`);
});

module.exports = app;

/*
UMGEBUNGSVARIABLEN (.env Datei):

# Server
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://erinnerungslicht.de,https://www.erinnerungslicht.de

# E-Mail-Konfiguration (wählen Sie eine Option)

# Option 1: SMTP
SMTP_HOST=mail.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@erinnerungslicht.de
SMTP_PASS=your-password

# Option 2: Gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-specific-password

# Option 3: SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key

# E-Mail-Adressen
FROM_EMAIL=noreply@erinnerungslicht.de
TO_EMAIL=info@erinnerungslicht.de

# Optionen
SEND_CONFIRMATION=true

INSTALLATION:
npm init -y
npm install express express-rate-limit helmet cors nodemailer dotenv

DEPLOYMENT:
1. Code auf Server hochladen
2. .env Datei mit korrekten Werten erstellen
3. npm install
4. node api/contact.js oder mit PM2: pm2 start api/contact.js

NGINX-Konfiguration (Reverse Proxy):
location /api/ {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
*/
