/* Isla: galería de fotos de la ficha de un equipo */
import { useState } from 'react';
import { useHref } from '../context.jsx';
import { Icons } from './Icons.jsx';

export function Gallery({ fotos, total, nombre }) {
  const href = useHref();
  const [i, setI] = useState(0);
  const label = `Foto ${i + 1} de ${total}: ${nombre}`;
  const src = fotos[i];
  return (
    <>
      <div className="photo">
        {src
          ? <img src={href(src)} alt={label} width="800" height="600" {...(i === 0 ? { fetchPriority: 'high' } : {})} />
          : <><Icons.photo /><span>{label}</span></>}
      </div>
      <div className="thumbs">
        {Array.from({ length: total }, (_, j) => (
          <button key={j} type="button" className="thumb" aria-label={`Ver foto ${j + 1} de ${total}`}
            aria-pressed={j === i} onClick={() => setI(j)}>
            {fotos[j] ? <img src={href(fotos[j])} alt="" width="160" height="120" loading="lazy" decoding="async" /> : null}
          </button>
        ))}
      </div>
    </>
  );
}
