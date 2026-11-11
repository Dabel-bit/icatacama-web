/* Datos estructurados schema.org (JSON-LD). Se ejecuta solo en Node durante el build. */
import { filled, clean, codigo, productPath } from './site.js';

export function orgNode(site) {
  const c = site.contacto;
  const d = c.direccion;
  const node = {
    '@type': 'Store',
    '@id': site.url + '/#empresa',
    name: site.nombre,
    url: site.url + '/',
    logo: site.url + '/img/logo-ic-atacama.jpg',
    image: site.url + '/img/og-ic-atacama.jpg',
    description: site.descripcion,
    email: c.email,
    address: {
      '@type': 'PostalAddress',
      ...(filled(d.calle) && { streetAddress: d.calle }),
      addressLocality: d.comuna,
      addressRegion: d.region,
      ...(filled(d.codigoPostal) && { postalCode: d.codigoPostal }),
      addressCountry: d.pais,
    },
    areaServed: { '@type': 'Country', name: 'Chile' },
    knowsAbout: ['Maquinaria metalmecánica', 'Máquinas herramienta', 'Tornos', 'Fresadoras', 'Mecanizado CNC', 'Plegadoras', 'Corte láser'],
  };
  if (filled(c.telefono)) node.telephone = c.telefono;
  if (c.geo && c.geo.lat) node.geo = { '@type': 'GeoCoordinates', latitude: c.geo.lat, longitude: c.geo.lng };
  if (filled(c.mapa)) node.hasMap = c.mapa;
  if (c.horarioSchema && c.horarioSchema.length) {
    node.openingHoursSpecification = c.horarioSchema.map((h) => ({
      '@type': 'OpeningHoursSpecification', dayOfWeek: h.dias, opens: h.abre, closes: h.cierra,
    }));
  }
  if (site.redes && site.redes.length) node.sameAs = site.redes;
  return node;
}

export function websiteNode(site) {
  return {
    '@type': 'WebSite', '@id': site.url + '/#sitio', url: site.url + '/', name: site.nombre,
    inLanguage: 'es-CL', publisher: { '@id': site.url + '/#empresa' },
  };
}

export function breadcrumbNode(site, items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({
      '@type': 'ListItem', position: i + 1, name, item: site.url + path,
    })),
  };
}

export function itemListNode(site, productos) {
  return {
    '@type': 'ItemList',
    itemListElement: productos.map((p, i) => ({
      '@type': 'ListItem', position: i + 1, url: site.url + productPath(p), name: p.nombre,
    })),
  };
}

export function productNode(site, p, cat) {
  const images = (p.fotos || []).map((f) => site.url + f);
  const node = {
    '@type': 'Product',
    '@id': site.url + productPath(p) + '#producto',
    name: p.nombre,
    description: clean(p.descripcion),
    sku: codigo(p),
    category: cat.nombre,
    url: site.url + productPath(p),
    image: images.length ? images : [site.url + '/img/og-ic-atacama.jpg'],
    additionalProperty: (p.specs || []).filter((s) => filled(s[1])).map(([name, value]) => ({
      '@type': 'PropertyValue', name, value,
    })),
  };
  if (filled(p.marca)) node.brand = { '@type': 'Brand', name: p.marca };
  if (filled(p.modelo)) node.model = p.modelo;
  if (filled(p.origen)) node.countryOfOrigin = p.origen;
  node.offers = {
    '@type': 'Offer',
    url: site.url + productPath(p),
    price: p.precio,
    priceCurrency: 'CLP',
    priceSpecification: { '@type': 'UnitPriceSpecification', price: p.precio, priceCurrency: 'CLP', valueAddedTaxIncluded: false },
    availability: 'https://schema.org/InStock',
    itemCondition: p.estado === 'Nuevo' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
    seller: { '@id': site.url + '/#empresa' },
    areaServed: { '@type': 'Country', name: 'Chile' },
  };
  return node;
}

export function faqNode(site) {
  const items = (site.faq || []).filter((f) => filled(f.respuesta));
  if (!items.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question', name: f.pregunta, acceptedAnswer: { '@type': 'Answer', text: f.respuesta },
    })),
  };
}
