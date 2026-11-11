import { useHref } from '../context.jsx';
import { formatCLP } from '../lib/site.js';
import { Icons } from './Icons.jsx';
import { Photo } from './Photo.jsx';

// Tarjeta del catálogo. `item` es el modelo reducido de lib/site.js (cardModel)
export function ProductCard({ item, headingTag: H = 'h2' }) {
  const href = useHref();
  return (
    <a className="card" href={href(item.path)}>
      <span className="photo"><Photo src={item.foto} alt={item.nombre} /></span>
      <span className="card-body">
        <span className="card-cat">{item.cat}</span>
        <H className="card-title">{item.nombre}</H>
        <span className="meta">{item.meta.map((m, i) => <span key={i}>{m}</span>)}</span>
        <span className="card-price">{item.precio ? formatCLP(item.precio) : 'Precio a cotizar'}</span>
        <span className="card-cta">Ver detalle <Icons.arrow /></span>
      </span>
    </a>
  );
}
