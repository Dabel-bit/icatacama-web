import { useSite, useHref } from '../context.jsx';
import { filled } from '../lib/site.js';

export function Footer() {
  const { site } = useSite();
  const href = useHref();
  const c = site.contacto;
  const d = c.direccion;
  const dir = [d.calle, d.comuna, d.ciudad].filter(Boolean).join(', ');
  return (
    <footer className="site-footer" id="contacto">
      <div className="container">
        <div className="brand">
          {/* width/height = tamaño real del archivo: el navegador reserva la proporción correcta */}
          <a href={href('/')} aria-label={`${site.nombre}, inicio`}>
            <img src={href('/img/logo-ic-atacama.webp')} alt={site.nombre} width="384" height="144" loading="lazy" decoding="async" />
          </a>
          <p>Importación y venta de maquinaria metalmecánica.<br />Despacho a todo Chile continental.</p>
        </div>
        <address className="contact">
          <div>
            <span className="label">Teléfono</span>
            <span>{filled(c.telefono)
              ? <a href={'tel:' + c.telefono.replace(/[^\d+]/g, '')}>{c.telefono}</a>
              : c.telefono}</span>
          </div>
          <div>
            <span className="label">Correo</span>
            <span><a href={'mailto:' + c.email}>{c.email}</a></span>
          </div>
          <div>
            <span className="label">Dirección</span>
            <span>{filled(c.mapa)
              ? <a href={c.mapa} target="_blank" rel="noopener noreferrer">{dir}</a>
              : dir}</span>
          </div>
          <div>
            <span className="label">Horario</span>
            <span>{c.horario}</span>
          </div>
        </address>
      </div>
      <div className="container footer-bottom">
        <p>© {new Date().getFullYear()} {site.nombre} · Cerrillos, Santiago, Chile</p>
      </div>
    </footer>
  );
}
