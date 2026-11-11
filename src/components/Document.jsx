/* Documento HTML completo de una página: metadatos SEO, CSP, cabecera, contenido y pie */
import { useSite, useHref } from '../context.jsx';
import { safeJson } from '../lib/site.js';
import { orgNode, websiteNode } from '../lib/seo.js';
import { Header } from './Header.jsx';
import { Footer } from './Footer.jsx';

export function Document({ page, path, title, description, ogType = 'website', image, ld = [], noindex = false, children }) {
  const { site, env, csp } = useSite();
  const href = useHref();
  const canonical = site.url + path;
  const ogImage = site.url + (image || '/img/og-ic-atacama.jpg');
  const graph = { '@context': 'https://schema.org', '@graph': [orgNode(site), websiteNode(site), ...ld].filter(Boolean) };
  // La copia de revisión (GitHub Pages) nunca debe indexarse: evita contenido duplicado frente al dominio real
  const robots = env === 'preview' ? 'noindex, nofollow' : noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large';

  return (
    <html lang="es-CL">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {csp ? <meta httpEquiv="Content-Security-Policy" content={csp} /> : null}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content={robots} />
        {noindex ? null : <link rel="canonical" href={canonical} />}
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="geo.region" content="CL-RM" />
        <meta name="geo.placename" content="Cerrillos, Santiago" />
        <meta property="og:type" content={ogType} />
        <meta property="og:site_name" content={site.nombre} />
        <meta property="og:locale" content="es_CL" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        {image ? null : <meta property="og:image:width" content="1200" />}
        {image ? null : <meta property="og:image:height" content="630" />}
        <meta property="og:image:alt" content={site.nombre} />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" type="image/png" sizes="32x32" href={href('/favicon-32.png')} />
        <link rel="apple-touch-icon" href={href('/apple-touch-icon.png')} />
        <link rel="manifest" href={href('/site.webmanifest')} />
        <script type="module" src="/src/main.jsx"></script>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJson(graph) }} />
      </head>
      <body data-page={page}>
        <a className="skip-link" href="#contenido">Saltar al contenido</a>
        <Header />
        <main id="contenido">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
