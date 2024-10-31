import i18n from 'i18n';
import path from 'path';

i18n.configure({
    locales: ['en', 'bn'], // Supported languages
    directory: path.join(__dirname, '/locales'), // Path to translation files
    defaultLocale: 'bn',
    cookie: 'lang', // Use cookie to store language preference
    queryParameter: 'lang', // Use query param to switch language
    autoReload: true, // Reload translations if changed
    syncFiles: true, // Sync locale files across languages
    objectNotation: true, // Use dot notation for nested translations
});

export default i18n;