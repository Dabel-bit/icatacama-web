import { useHref } from '../context.jsx';
import { Icons } from './Icons.jsx';

// Foto de un equipo o, si no tiene, el marcador de posición
export function Photo({ src, alt, eager = false, placeholder = 'Foto del equipo' }) {
  const href = useHref();
  if (src) {
    return <img src={href(src)} alt={alt} width="800" height="600"
      {...(eager ? { fetchPriority: 'high' } : { loading: 'lazy', decoding: 'async' })} />;
  }
  return <><Icons.photo /><span>{placeholder}</span></>;
}
