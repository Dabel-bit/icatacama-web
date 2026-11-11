/*
 * Cabeceras de seguridad del sitio. Es la única fuente de verdad:
 *  - CSP_META se incrusta en cada HTML generado (respaldo para GitHub Pages, que no permite cabeceras).
 *  - SECURITY_HEADERS las envía `vite preview` para probar en local lo mismo que CloudFront.
 *  - deploy/cloudformation.yaml debe contener exactamente CSP_HEADER (lo comprueba `npm run verify`).
 *
 * Si algún día se agrega un servicio externo (analítica, mapa embebido, chat), hay que
 * autorizar su origen aquí y en la plantilla de CloudFormation; de lo contrario el navegador lo bloquea.
 */
const DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
];

// Cabecera HTTP completa (CloudFront)
export const CSP_HEADER = DIRECTIVES.join('; ');

// Versión para <meta http-equiv>: frame-ancestors no se admite en meta (el navegador lo ignora con aviso)
export const CSP_META = DIRECTIVES.filter((d) => !d.startsWith('frame-ancestors')).join('; ');

export const SECURITY_HEADERS = {
  'Content-Security-Policy': CSP_HEADER,
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'X-XSS-Protection': '0',
};
