import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['fr', 'en'],
 
  // Used when no locale matches
  defaultLocale: 'fr',

  // Force le préfixe de locale dans l'URL: /fr/... /en/...
  localePrefix: 'always',

  pathnames: {
    '/': '/',
    '/login': {
      fr: '/connexion',
      en: '/login',
    },
    '/surveillance': {
      fr: '/surveillance',
      en: '/monitoring',
    },
    '/alarmes': {
      fr: '/alarmes',
      en: '/alarms',
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
    '/admin/actionneurs': {
      fr: '/admin/actionneurs',
      en: '/admin/actuators',
    },
    '/admin/alarmes': {
      fr: '/admin/alarmes',
      en: '/admin/alarms',
    },
    '/admin/audit': {
      fr: '/admin/audit',
      en: '/admin/audit',
    },
    '/admin/etalons': {
      fr: '/admin/etalons',
      en: '/admin/standards',
    },
    '/admin/groupes': {
      fr: '/admin/groupes',
      en: '/admin/groups',
    },
    '/admin/lieux': {
      fr: '/admin/lieux',
      en: '/admin/locations',
    },
    '/admin/modules': {
      fr: '/admin/modules',
      en: '/admin/modules',
    },
    '/admin/outils': {
      fr: '/admin/outils',
      en: '/admin/tools',
    },
    '/admin/parametres': {
      fr: '/admin/parametres',
      en: '/admin/settings',
    },
    '/admin/profils': {
      fr: '/admin/profils',
      en: '/admin/profiles',
    },
    '/admin/sites': {
      fr: '/admin/sites',
      en: '/admin/sites',
    },
    '/admin/sondes': {
      fr: '/admin/sondes',
      en: '/admin/sensors',
    },
    '/admin/test': {
      fr: '/admin/test',
      en: '/admin/test',
    },
    '/admin/test/surveillance-perf': {
      fr: '/admin/test/perf-surveillance',
      en: '/admin/test/surveillance-perf',
    },
    '/admin/test/alarms-perf': {
      fr: '/admin/test/perf-alarmes',
      en: '/admin/test/alarms-perf',
    },
    '/admin/test/audit-perf': {
      fr: '/admin/test/perf-audit',
      en: '/admin/test/audit-perf',
    },
    '/admin/test/settings-perf': {
      fr: '/admin/test/perf-parametres',
      en: '/admin/test/settings-perf',
    },
    '/admin/test/users-perf': {
      fr: '/admin/test/perf-utilisateurs',
      en: '/admin/test/users-perf',
    },
    '/admin/utilisateurs': {
      fr: '/admin/utilisateurs',
      en: '/admin/users',
    },
    '/force-password-change': {
      fr: '/changement-mot-de-passe-obligatoire',
      en: '/force-password-change',
    },
    '/reset-password': {
      fr: '/reinitialisation-mot-de-passe',
      en: '/reset-password',
    },
    '/upgrade-licence': {
      fr: '/upgrade-licence',
      en: '/upgrade-licence',
    },
    '/services': {
      fr: '/services',
      en: '/services',
    },
    '/services/upgrade-licence': {
      fr: '/services/upgrade-licence',
      en: '/services/upgrade-licence',
    },
    '/services/achat-materiel': {
      fr: '/services/achat-materiel',
      en: '/services/hardware',
    },
    '/services/actualites-mc2': {
      fr: '/services/actualites-mc2',
      en: '/services/mc2-news',
    },
  }
});
