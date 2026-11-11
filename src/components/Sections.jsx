/* Secciones de la portada: catálogo, ventajas y preguntas frecuentes */
import { useSite } from '../context.jsx';
import { cardModel } from '../lib/site.js';
import { Icon } from './Icons.jsx';
import { Island } from './Island.jsx';
import { Catalog } from './Catalog.jsx';

export function CatalogSection({ activeSlug, eyebrow, h1, intro, breadcrumb = null }) {
  const { data } = useSite();
  const productos = activeSlug ? data.productos.filter((p) => p.categoria === activeSlug) : data.productos;
  const items = productos.map((p) => cardModel(p, data.catBySlug[p.categoria]));
  const categorias = data.categorias.map((c) => ({ slug: c.slug, nombre: c.nombre }));
  return (
    <section className="container catalog" id="equipos" aria-labelledby="h-catalogo">
      {breadcrumb}
      <div className="catalog-head">
        <p className="eyebrow">{eyebrow}</p>
        <h1 id="h-catalogo">{h1}</h1>
        <p>{intro}</p>
      </div>
      <Island name="catalog" id="island-catalogo" className="catalog-body" component={Catalog}
        props={{ items, categorias, activeSlug: activeSlug || null }} />
    </section>
  );
}

export function FeaturesSection() {
  const { site } = useSite();
  return (
    <section className="band" id="despacho" aria-labelledby="h-ventajas">
      <div className="container">
        <div className="section-head">
          <p className="eyebrow">Por qué IC Atacama</p>
          <h2 id="h-ventajas">Maquinaria importada, con despacho a todo Chile continental</h2>
          <p>Estamos en Cerrillos, Santiago. Desde ahí vendemos y coordinamos la entrega de cada equipo, de norte a sur del país.</p>
        </div>
        <ul className="features">
          {site.ventajas.map((v) => (
            <li key={v.titulo}>
              <span className="ico" aria-hidden="true"><Icon name={v.icono} /></span>
              <h3>{v.titulo}</h3>
              <p>{v.texto}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function FaqSection() {
  const { site } = useSite();
  if (!site.faq || !site.faq.length) return null;
  return (
    <section className="container faq" id="preguntas" aria-labelledby="h-faq">
      <div className="section-head">
        <p className="eyebrow">Preguntas frecuentes</p>
        <h2 id="h-faq">Compra y despacho de maquinaria</h2>
      </div>
      <div className="faq-list">
        {site.faq.map((f) => (
          <details key={f.pregunta}>
            <summary>{f.pregunta}</summary>
            <p>{f.respuesta}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
