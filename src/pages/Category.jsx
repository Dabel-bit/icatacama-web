import { useSite, useHref } from '../context.jsx';
import { truncate, categoryPath } from '../lib/site.js';
import { breadcrumbNode, itemListNode } from '../lib/seo.js';
import { Document } from '../components/Document.jsx';
import { Icons } from '../components/Icons.jsx';
import { CatalogSection, FeaturesSection } from '../components/Sections.jsx';

export function Category({ cat }) {
  const { site, data } = useSite();
  const href = useHref();
  const items = data.productos.filter((p) => p.categoria === cat.slug);
  const breadcrumb = (
    <nav className="breadcrumb" aria-label="Ruta">
      <a href={href('/')}><Icons.back /> Todos los equipos</a>
      <span aria-hidden="true">/</span>
      <span aria-current="page">{cat.nombre}</span>
    </nav>
  );
  return (
    <Document page="catalogo" path={categoryPath(cat)} title={`${cat.nombre} en venta en Chile | ${site.nombre}`}
      description={truncate(`${cat.descripcion} Equipos nuevos importados, con despacho a todo Chile continental desde Cerrillos, Santiago.`)}
      ld={[
        breadcrumbNode(site, [['Inicio', '/'], [cat.nombre, categoryPath(cat)]]),
        { '@type': 'CollectionPage', name: `${cat.nombre} en venta en Chile`, url: site.url + categoryPath(cat), isPartOf: { '@id': site.url + '/#sitio' } },
        itemListNode(site, items),
      ]}>
      <CatalogSection activeSlug={cat.slug} eyebrow="Categoría" h1={`${cat.nombre} en venta en Chile`}
        intro={`${cat.descripcion} Despacho a todo Chile continental.`} breadcrumb={breadcrumb} />
      <FeaturesSection />
    </Document>
  );
}
