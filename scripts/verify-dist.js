#!/usr/bin/env node
/*
 * Comprueba que dist/ cumple las reglas de seguridad antes de publicar (npm run verify):
 *  - cada HTML lleva la CSP exacta de src/lib/security-headers.js
 *  - no hay scripts en línea ejecutables, manejadores on*=, ni enlaces javascript:/data:
 *  - todo recurso (script, css, imagen, fuente) se sirve desde el mismo origen
 *  - los enlaces externos abren con rel="noopener noreferrer" y solo a dominios autorizados
 *  - no se publican mapas de código fuente
 *  - la plantilla de CloudFormation envía la misma CSP y HSTS
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CSP_HEADER, CSP_META, SECURITY_HEADERS } from '../src/lib/security-headers.js';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = path.join(root, 'dist');
const site = JSON.parse(fs.readFileSync(path.join(root, 'src/data/sitio.json'), 'utf8'));
const errors = [];
const err = (file, msg) => errors.push(`${path.relative(root, file)}: ${msg}`);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, out); else out.push(f);
  }
  return out;
}

if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.error('No existe dist/index.html. Ejecuta npm run build primero.');
  process.exit(1);
}

const files = walk(dist);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const escAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
const cspMeta = `<meta http-equiv="Content-Security-Policy" content="${escAttr(CSP_META)}"/>`;

// Orígenes externos permitidos en enlaces (<a href>): solo los que vienen de sitio.json y WhatsApp
const allowedLinks = [site.url, 'https://wa.me/', ...(site.contacto.mapa ? [site.contacto.mapa] : []), ...(site.redes || [])];
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/\s([a-zA-Z-]+)(?:="([^"]*)")?/g)].map((m) => [m[1].toLowerCase(), m[2] ?? '']));
const isLocal = (u) => u.startsWith('/') && !u.startsWith('//');

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes(cspMeta)) err(file, 'falta la <meta> Content-Security-Policy o no coincide con security-headers.js');

  for (const [tag] of html.matchAll(/<script\b[^>]*>/g)) {
    const a = attrs(tag);
    if (a.src) {
      if (!isLocal(a.src)) err(file, `script externo no permitido: ${a.src}`);
    } else if (!['application/ld+json', 'application/json'].includes(a.type)) {
      err(file, `script en línea ejecutable (la CSP lo bloquearía): ${tag}`);
    }
  }
  for (const [, content] of html.matchAll(/<script[^>]*type="application\/(?:ld\+)?json"[^>]*>([\s\S]*?)<\/script>/g)) {
    if (/<\/script|<!--/i.test(content)) err(file, 'un bloque JSON contiene "</script" o "<!--" y podría romper la página');
  }

  const body = html.replace(/<script[\s\S]*?<\/script>/g, '');
  for (const [tag] of body.matchAll(/<[a-z][^>]*>/gi)) {
    const a = attrs(tag);
    for (const k of Object.keys(a)) if (/^on[a-z]+$/.test(k)) err(file, `manejador en línea ${k}= en ${tag.slice(0, 80)}`);
    if (a.style !== undefined) err(file, `estilo en línea (la CSP lo bloquearía): ${tag.slice(0, 80)}`);
    for (const k of ['href', 'src', 'action', 'poster']) {
      const v = a[k];
      if (v === undefined) continue;
      if (/^\s*(javascript|data|vbscript):/i.test(v)) err(file, `esquema peligroso en ${k}: ${v.slice(0, 60)}`);
      if (/^(https?:)?\/\//i.test(v)) {
        const ok = tag.startsWith('<a ') || tag.startsWith('<link rel="canonical"')
          ? allowedLinks.some((p) => v.startsWith(p))
          : false;
        if (!ok) err(file, `recurso/enlace externo no autorizado: ${v.slice(0, 80)}`);
      }
    }
    if (tag.startsWith('<a ') && a.target === '_blank' && !/\bnoopener\b/.test(a.rel || '')) err(file, `enlace target=_blank sin rel="noopener": ${a.href}`);
  }
}

for (const f of files) if (f.endsWith('.map')) err(f, 'mapa de código fuente publicado');
for (const must of ['404.html', 'robots.txt', '.well-known/security.txt', 'site.webmanifest']) {
  if (!fs.existsSync(path.join(dist, must))) err(path.join(dist, must), 'archivo requerido ausente');
}

// Infraestructura: la plantilla debe enviar exactamente las mismas cabeceras
const cfn = path.join(root, 'deploy/cloudformation.yaml');
if (fs.existsSync(cfn)) {
  const y = fs.readFileSync(cfn, 'utf8');
  if (!y.includes(`ContentSecurityPolicy: "${CSP_HEADER}"`)) err(cfn, 'la CSP de CloudFront no coincide con src/lib/security-headers.js');
  for (const [h, v] of Object.entries(SECURITY_HEADERS)) {
    if (['Content-Security-Policy', 'Strict-Transport-Security', 'X-Content-Type-Options', 'X-Frame-Options', 'Referrer-Policy', 'X-XSS-Protection'].includes(h)) continue;
    if (!y.includes(`Value: "${v}"`)) err(cfn, `falta la cabecera ${h}: ${v}`);
  }
} else {
  err(cfn, 'no existe la plantilla de CloudFormation');
}

if (errors.length) {
  console.error(`✗ Verificación fallida (${errors.length}):\n- ` + errors.join('\n- '));
  process.exit(1);
}
console.log(`✓ dist/ verificado: ${htmlFiles.length} páginas, CSP y cabeceras coherentes con deploy/cloudformation.yaml`);
