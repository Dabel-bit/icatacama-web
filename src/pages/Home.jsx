import { useSite } from '../context.jsx';
import { truncate } from '../lib/site.js';
import { itemListNode, faqNode } from '../lib/seo.js';
import { Document } from '../components/Document.jsx';
import { CatalogSection, FeaturesSection, FaqSection } from '../components/Sections.jsx';

export function Home() {
  const { site, data } = useSite();
  const names = data.categorias.map((c) => c.nombre.toLowerCase());
  const intro = `Importamos y vendemos ${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}. ` +
    'Bodega en Cerrillos, Santiago, con despacho a todo Chile continental.';
  return (
    <Document page="catalogo" path="/" title={`Maquinaria metalmecánica importada en Chile | ${site.nombre}`}
      description={truncate(site.descripcion)} ld={[itemListNode(site, data.productos), faqNode(site)]}>
      <CatalogSection eyebrow="Importación directa · Despacho a todo Chile" h1="Maquinaria metalmecánica en venta en Chile" intro={intro} />
      <FeaturesSection />
      <FaqSection />
    </Document>
  );
}
