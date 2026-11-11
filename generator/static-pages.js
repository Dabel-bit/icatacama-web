/*
 * Plugin de Vite que genera el sitio estático a partir de src/data/*.json y los componentes .jsx:
 *   /                          catálogo completo
 *   /categoria/<slug>/         catálogo filtrado por categoría
 *   /equipos/<slug>/           ficha de cada equipo
 *   /404.html                  página de error (documento de error en S3 y GitHub Pages)
 *   /sitemap.xml, /robots.txt, /site.webmanifest, /.well-known/security.txt
 *
 * Las páginas son "virtuales": no existen en disco. src/entry-server.jsx las renderiza con React
 * (renderToStaticMarkup). En desarrollo se sirven desde un middleware (con recarga al editar) y en
 * el build entran como inputs HTML, así Vite les inyecta el CSS y el JS con hash.
 */
import fs from 'node:fs';
import path from 'node:path';
import { isRunnableDevEnvironment, runnerImport } from 'vite';
import { CSP_META } from '../src/lib/security-headers.js';

const ENTRY = '/src/entry-server.jsx';
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMG = /^\/img\/[A-Za-z0-9/_.-]+\.(?:webp|jpe?g|png|avif)$/;
const HTTPS = /^https:\/\/[^\s"'<>]+$/;
const EMAIL = /^[^\s@"'<>]+@[^\s@"'<>]+\.[a-z]{2,}$/i;

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function fail(msg) {
  throw new Error(`[datos] ${msg}`);
}

/*
 * Carga y valida los JSON. Las validaciones detectan errores de edición antes de publicar y, además,
 * garantizan que nada de lo que termina en un atributo href/src pueda ser un enlace a otro origen
 * o un esquema peligroso (javascript:, data:), aunque React ya escape el HTML.
 */
export function loadSite(dataDir) {
  const site = readJSON(path.join(dataDir, 'sitio.json'));
  site.url = String(site.url || '').replace(/\/+$/, '');
  if (!/^https:\/\/[a-z0-9.-]+$/i.test(site.url)) fail('sitio.json: "url" debe ser https://dominio (sin ruta ni barra final)');
  const c = site.contacto || fail('sitio.json: falta "contacto"');
  if (!EMAIL.test(c.email || '')) fail('sitio.json: "contacto.email" no es un correo válido');
  if (c.whatsapp && !/^\d{8,15}$/.test(String(c.whatsapp))) fail('sitio.json: "contacto.whatsapp" debe tener solo dígitos (ej. 56912345678)');
  if (c.mapa && !HTTPS.test(c.mapa)) fail('sitio.json: "contacto.mapa" debe ser un enlace https://');
  for (const r of site.redes || []) if (!HTTPS.test(r)) fail(`sitio.json: red social inválida: ${r}`);

  const data = readJSON(path.join(dataDir, 'productos.json'));
  data.catBySlug = Object.fromEntries(data.categorias.map((cat) => [cat.slug, cat]));
  for (const cat of data.categorias) {
    if (!SLUG.test(cat.slug || '')) fail(`Categoría "${cat.nombre}": "slug" inválido (solo a-z, 0-9 y guiones)`);
  }
  const slugs = new Set();
  const ids = new Set();
  for (const p of data.productos) {
    if (!Number.isInteger(p.id) || p.id < 0) fail(`Equipo "${p.nombre}": "id" debe ser un entero`);
    if (ids.has(p.id)) fail(`Id repetido: ${p.id}`);
    ids.add(p.id);
    if (!SLUG.test(p.slug || '')) fail(`Equipo ${p.id}: "slug" inválido (solo a-z, 0-9 y guiones)`);
    if (slugs.has(p.slug)) fail(`Slug repetido: ${p.slug}`);
    slugs.add(p.slug);
    if (!data.catBySlug[p.categoria]) fail(`Equipo ${p.id}: la categoría "${p.categoria}" no existe en "categorias"`);
    if (p.precio != null && (!Number.isInteger(p.precio) || p.precio <= 0)) fail(`Equipo ${p.id}: "precio" debe ser un entero en CLP sin puntos`);
    for (const f of p.fotos || []) if (!IMG.test(f)) fail(`Equipo ${p.id}: foto inválida "${f}" (debe ser /img/... .webp, .jpg, .png o .avif)`);
    for (const s of p.specs || []) if (!Array.isArray(s) || s.length !== 2) fail(`Equipo ${p.id}: cada spec debe ser ["Nombre", "Valor"]`);
  }
  return { site, data };
}

// Mapa ruta pública → descriptor que entiende src/entry-server.jsx
function buildRoutes(dataDir) {
  const { site, data } = loadSite(dataDir);
  const routes = new Map();
  routes.set('/', { type: 'home' });
  for (const c of data.categorias) {
    if (data.productos.some((p) => p.categoria === c.slug)) routes.set(`/categoria/${c.slug}/`, { type: 'category', slug: c.slug });
  }
  for (const p of data.productos) routes.set(`/equipos/${p.slug}/`, { type: 'product', slug: p.slug });
  routes.set('/404.html', { type: '404' });
  return { site, data, routes };
}

const fileFor = (route) => (route.endsWith('/') ? route + 'index.html' : route).slice(1);

/* ---------------- Archivos auxiliares generados ---------------- */
function sitemap(site, routes) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = routes.filter((r) => r !== '/404.html').map((r) => {
    const priority = r === '/' ? '1.0' : r.startsWith('/categoria/') ? '0.8' : '0.7';
    return `  <url><loc>${site.url}${r}</loc><lastmod>${today}</lastmod><priority>${priority}</priority></url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

function robots(site, env) {
  if (env === 'preview') return 'User-agent: *\nDisallow: /\n';
  return `User-agent: *\nAllow: /\nDisallow: /404.html\n\nSitemap: ${site.url}/sitemap.xml\n`;
}

// RFC 9116: a quién avisar si alguien encuentra un problema de seguridad. Caduca al año (se renueva en cada build).
function securityTxt(site) {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  return [
    `Contact: mailto:${site.contacto.email}`,
    `Expires: ${expires.toISOString().replace(/\.\d{3}Z$/, 'Z')}`,
    'Preferred-Languages: es, en',
    `Canonical: ${site.url}/.well-known/security.txt`,
    '',
  ].join('\n');
}

function manifest(site, base) {
  return JSON.stringify({
    name: site.nombre,
    short_name: site.nombre,
    description: site.descripcion,
    start_url: base,
    scope: base,
    display: 'browser',
    background_color: '#F4F4F2',
    theme_color: '#FFFFFF',
    icons: [{ src: base + 'icon-512.png', sizes: '512x512', type: 'image/png' }],
  }, null, 2) + '\n';
}

const EXTRA = {
  '/sitemap.xml': { type: 'application/xml', build: ({ site, routes }) => sitemap(site, routes) },
  '/robots.txt': { type: 'text/plain', build: ({ site, env }) => robots(site, env) },
  '/.well-known/security.txt': { type: 'text/plain', build: ({ site }) => securityTxt(site) },
  '/site.webmanifest': { type: 'application/manifest+json', build: ({ site, base }) => manifest(site, base) },
};

/* ---------------- Plugin ---------------- */
export default function staticPages({ dataDir, env = 'production' }) {
  let root = process.cwd();
  let base = '/';
  let command = 'serve';
  let state;
  let importEntry; // () => Promise<módulo de src/entry-server.jsx>

  const byFile = () => new Map([...state.routes.keys()].map((route) => [path.join(root, fileFor(route)), route]));

  async function render(route) {
    const mod = await importEntry();
    return mod.renderPage(state.routes.get(route), {
      site: state.site,
      data: state.data,
      base,
      env,
      // La CSP en <meta> solo en el build: en desarrollo Vite inyecta scripts en línea (HMR)
      csp: command === 'build' ? CSP_META : null,
    });
  }

  const extraArgs = () => ({ site: state.site, routes: [...state.routes.keys()], env, base });

  return {
    name: 'ic-static-pages',
    enforce: 'pre',

    config(userConfig, { command: cmd }) {
      command = cmd;
      root = path.resolve(userConfig.root || process.cwd());
      state = buildRoutes(dataDir);
      const input = Object.fromEntries([...state.routes.keys()].map((route) => [fileFor(route), path.join(root, fileFor(route))]));
      return { build: { rollupOptions: { input } } };
    },

    configResolved(config) {
      base = config.base;
    },

    async buildStart() {
      if (command !== 'build') return;
      // Carga el entry .jsx en Node con el pipeline de Vite (transforma JSX; react queda externo)
      const { module } = await runnerImport(ENTRY, { root, logLevel: 'warn' });
      importEntry = async () => module;
    },

    resolveId(id) {
      return byFile().has(id) ? id : null;
    },

    async load(id) {
      const route = byFile().get(id);
      return route ? render(route) : null;
    },

    configureServer(server) {
      const ssr = server.environments.ssr;
      if (!isRunnableDevEnvironment(ssr)) throw new Error('ic-static-pages: el entorno ssr de Vite no es ejecutable');
      importEntry = () => ssr.runner.import(ENTRY);

      const srcDir = path.join(root, 'src');
      server.watcher.add(dataDir);
      server.watcher.on('change', (file) => {
        if (file.startsWith(dataDir)) {
          try {
            state = buildRoutes(dataDir);
          } catch (err) {
            server.config.logger.error(err.message);
            return;
          }
        } else if (!file.startsWith(srcDir) || file.endsWith('.css')) {
          return; // el CSS lo actualiza Vite sin recargar
        }
        ssr.runner.clearCache();
        server.ws.send({ type: 'full-reload' });
      });

      server.middlewares.use(async (req, res, next) => {
        const url = decodeURIComponent((req.url || '/').split('?')[0]);
        try {
          if (EXTRA[url]) {
            res.setHeader('Content-Type', EXTRA[url].type + '; charset=utf-8');
            res.end(EXTRA[url].build(extraArgs()));
            return;
          }
          let route = url;
          if (!state.routes.has(route) && route.endsWith('/index.html')) route = route.slice(0, -'index.html'.length);
          if (!state.routes.has(route) && !path.extname(route)) route += '/';
          const known = state.routes.has(route);
          // Rutas que no son páginas ni archivos (p. ej. /equipos/vendido/) → 404, como en producción
          const isAsset = path.extname(url) || url.startsWith('/@') || url.startsWith('/src/') || url.startsWith('/node_modules/');
          if (!known && isAsset) return next();
          const html = await server.transformIndexHtml(url, await render(known ? route : '/404.html'));
          res.statusCode = known ? 200 : 404;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(html);
        } catch (err) {
          next(err);
        }
      });
    },

    generateBundle() {
      for (const [route, extra] of Object.entries(EXTRA)) {
        if (route === '/sitemap.xml' && env === 'preview') continue; // la copia de revisión no se indexa
        this.emitFile({ type: 'asset', fileName: route.slice(1), source: extra.build(extraArgs()) });
      }
    },
  };
}
