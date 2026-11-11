/* IC Atacama — utilidades compartidas entre el build (Node) y el navegador */

// Un dato está "completo" si existe y no es un texto de ejemplo entre [corchetes]
export function filled(v) {
  return v != null && v !== '' && !/\[[^\]]*\]/.test(String(v));
}

// Quita los textos de ejemplo entre [corchetes] (para metadatos y datos estructurados)
export function clean(s) {
  return String(s || '').replace(/\s*\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();
}

export function normalize(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function codigo(p) {
  return 'EQ-' + String(p.id).padStart(3, '0');
}

export function truncate(s, max = 158) {
  if (s.length <= max) return s;
  return s.slice(0, s.lastIndexOf(' ', max - 1)).replace(/[,;:.]$/, '') + '…';
}

export function formatCLP(n) {
  return '$' + Number(n).toLocaleString('es-CL') + ' + IVA';
}

export const productPath = (p) => `/equipos/${p.slug}/`;
export const categoryPath = (c) => `/categoria/${c.slug}/`;

export function countText(n) {
  return n === 1 ? '1 equipo disponible' : `${n} equipos disponibles`;
}

// Une la base pública (p. ej. "/" o "/repo/") con una ruta absoluta del sitio
export function withBase(base, path) {
  const b = base.endsWith('/') ? base : base + '/';
  return b + String(path).replace(/^\/+/, '');
}

// Modelo reducido de un equipo para las tarjetas del catálogo (también viaja al navegador)
export function cardModel(p, cat) {
  const fotos = p.fotos || [];
  return {
    slug: p.slug,
    path: productPath(p),
    nombre: p.nombre,
    cat: cat.nombre,
    meta: [p.estado, p.specs && p.specs[0] && p.specs[0][1], p.marca].filter(filled),
    precio: p.precio || null,
    foto: fotos[0] || null,
    search: normalize([p.nombre, cat.nombre, p.marca, p.modelo, p.estado].filter(filled).join(' ')),
  };
}

export function buildMailto(site, p) {
  const subject = `Solicitud de cotización: ${p.nombre} (${codigo(p)})`;
  const body =
    'Hola equipo de IC Atacama:\n\n' +
    'Me interesa cotizar el siguiente equipo publicado en su sitio web:\n\n' +
    `- Equipo: ${p.nombre}\n` +
    (filled(p.marca) ? `- Marca: ${p.marca}\n` : '') +
    (filled(p.modelo) ? `- Modelo: ${p.modelo}\n` : '') +
    `- Código de referencia: ${codigo(p)}\n` +
    `- Enlace: ${site.url + productPath(p)}\n` +
    (p.precio ? `- Precio publicado: ${formatCLP(p.precio)}\n` : '') + '\n' +
    'Agradecería confirmar disponibilidad, plazo de entrega, condiciones de pago y costo de despacho.\n\n' +
    'Mis datos de contacto:\n' +
    'Nombre: \n' +
    'Empresa / RUT: \n' +
    'Teléfono: \n' +
    'Ciudad de despacho: \n\n' +
    'Saludos cordiales.';
  return `mailto:${site.contacto.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function whatsappLink(site, p) {
  const n = String(site.contacto.whatsapp || '').replace(/\D/g, '');
  if (!n) return '';
  const text = `Hola, me interesa cotizar: ${p.nombre} (${codigo(p)}) ${site.url + productPath(p)}`;
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}

// JSON seguro para incrustar dentro de <script>: nunca puede cerrar la etiqueta
export function safeJson(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
