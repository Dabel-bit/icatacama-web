/*
 * Entrada del build: convierte una ruta en el HTML completo de la página.
 * Lo ejecuta generator/static-pages.js en Node (nunca llega al navegador).
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { SiteContext } from './context.jsx';
import { Home } from './pages/Home.jsx';
import { Category } from './pages/Category.jsx';
import { Product } from './pages/Product.jsx';
import { NotFound } from './pages/NotFound.jsx';

function pageFor(route, ctx) {
  switch (route.type) {
    case 'home': return <Home />;
    case 'category': return <Category cat={ctx.data.catBySlug[route.slug]} />;
    case 'product': return <Product p={ctx.data.productos.find((p) => p.slug === route.slug)} />;
    default: return <NotFound />;
  }
}

const CSP_TAG = /<meta http-equiv="Content-Security-Policy"[^>]*>/;
const CHARSET_TAG = '<meta charSet="utf-8"/>';

// ctx = { site, data, base, env, csp }
export function renderPage(route, ctx) {
  let html = renderToStaticMarkup(
    <SiteContext.Provider value={ctx}>{pageFor(route, ctx)}</SiteContext.Provider>,
  );
  // React coloca sus <link rel="preload"> antes que el resto del <head>; la CSP debe ir lo antes posible
  const csp = html.match(CSP_TAG);
  if (csp && html.includes(CHARSET_TAG)) {
    html = html.replace(csp[0], '').replace(CHARSET_TAG, CHARSET_TAG + csp[0]);
  }
  return '<!doctype html>\n' + html + '\n';
}
