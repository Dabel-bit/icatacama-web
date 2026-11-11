/* Isla: buscador del catálogo. Filtra las tarjetas que ya vienen en el HTML. */
import { useEffect, useRef, useState } from 'react';
import { useHref } from '../context.jsx';
import { categoryPath, countText, normalize } from '../lib/site.js';
import { Icons } from './Icons.jsx';
import { ProductCard } from './ProductCard.jsx';

const MAX_QUERY = 80;

function Chip({ href, active, children }) {
  return <a className="chip" href={href} aria-current={active ? 'page' : undefined}>{children}</a>;
}

export function Catalog({ items, categorias, activeSlug }) {
  const href = useHref();
  const [q, setQ] = useState('');
  const input = useRef(null);
  const mounted = useRef(false);

  // Al cargar, toma la búsqueda desde ?q= (el HTML estático siempre se renderiza sin filtro)
  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get('q') || '';
    if (initial) setQ(initial.slice(0, MAX_QUERY));
  }, []);

  // Mantiene ?q= en la URL para poder compartir la búsqueda
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    const t = setTimeout(() => {
      const url = new URL(window.location.href);
      const v = q.trim();
      if (v) url.searchParams.set('q', v); else url.searchParams.delete('q');
      window.history.replaceState(null, '', url);
    }, 150);
    return () => clearTimeout(t);
  }, [q]);

  const needle = normalize(q.trim());
  const visible = items.filter((p) => !needle || p.search.includes(needle));

  function reset() {
    setQ('');
    input.current?.focus();
  }

  return (
    <>
      <div className="filters">
        <div className="search">
          <label htmlFor="q" className="sr-only">Buscar equipos</label>
          <Icons.search />
          <input id="q" ref={input} type="search" placeholder="Buscar por máquina, marca o modelo"
            autoComplete="off" maxLength={MAX_QUERY} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <nav className="chips" aria-label="Categorías">
          <Chip href={href('/')} active={!activeSlug}>Todos</Chip>
          {categorias.map((c) => (
            <Chip key={c.slug} href={href(categoryPath(c))} active={c.slug === activeSlug}>{c.nombre}</Chip>
          ))}
        </nav>
      </div>

      <p className="count" aria-live="polite">{countText(visible.length)}</p>

      <ul className="grid">
        {items.map((p) => (
          <li key={p.slug} hidden={needle ? !p.search.includes(needle) : false}>
            <ProductCard item={p} />
          </li>
        ))}
      </ul>

      <div className="empty" hidden={visible.length !== 0}>
        <p>No encontramos equipos con ese criterio.</p>
        <button type="button" className="btn-secondary" onClick={reset}>Limpiar búsqueda</button>
      </div>
    </>
  );
}
