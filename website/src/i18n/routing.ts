import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['fr', 'en'],
 
  // Used when no locale matches
  defaultLocale: 'fr',

  // Force le prÃ©fixe de locale dans l'URL: /fr/... /en/...
  localePrefix: 'always',

  pathnames: {
    '/': '/',
    '/surveillance': {
      fr: '/surveillance',
      en: '/monitoring',
    },
    '/alarmes': {
      fr: '/alarmes',
      en: '/alarms',
    },
    '/audit': {
      fr: '/audit',
      en: '/audit',
    },
    '/parametres': {
      fr: '/parametres',
      en: '/settings',
    },
    '/profil': {
      fr: '/profil',
      en: '/profile',
    },
    '/admin': {
      fr: '/admin',
      en: '/admin',
    },
    '/login': {
      fr: '/login',
      en: '/login',
    },
  }
});
