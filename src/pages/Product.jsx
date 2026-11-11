import { useSite, useHref } from '../context.jsx';
import { filled, clean, codigo, truncate, formatCLP, productPath, categoryPath, cardModel, buildMailto, whatsappLink } from '../lib/site.js';
import { breadcrumbNode, productNode } from '../lib/seo.js';
import { Document } from '../components/Document.jsx';
import { Icons } from '../components/Icons.jsx';
import { Island } from '../components/Island.jsx';
import { Gallery } from '../components/Gallery.jsx';
import { ProductCard } from '../components/ProductCard.jsx';

function Item({ icon: I, title, text }) {
  return (
    <li>
      <span className="ico" aria-hidden="true"><I /></span>
      <span><strong>{title}</strong><small>{text}</small></span>
    </li>
  );
}

export function Product({ p }) {
  const { site, data } = useSite();
  const href = useHref();
  const cat = data.catBySlug[p.categoria];
  const fotos = p.fotos || [];
  const total = fotos.length || 5; // miniaturas de ejemplo mientras el equipo no tenga fotos
  const precio = p.precio ? formatCLP(p.precio) : 'A cotizar';

  const specs = [['Marca', p.marca], ['Modelo', p.modelo]]
    .concat(p.specs || [])
    .concat([['Origen', p.origen], ['Estado', p.estado], ['Código', codigo(p)]])
    .filter((s) => s[1]);

  const related = data.productos.filter((x) => x.categoria === p.categoria && x.id !== p.id)
    .concat(data.productos.filter((x) => x.categoria !== p.categoria))
    .slice(0, 3)
    .map((x) => cardModel(x, data.catBySlug[x.categoria]));

  const wa = whatsappLink(site, p);
  const brandModel = [p.marca, p.modelo].filter(filled).join(' ');
  const descMeta = truncate(`${p.nombre}${brandModel ? ' ' + brandModel : ''}${p.precio ? ` a ${precio}` : ''}. ` +
    'Equipo nuevo importado, con despacho a todo Chile continental desde Cerrillos, Santiago. ' + clean(p.descripcion));

  return (
    <Document page="detalle" path={productPath(p)} ogType="product" image={fotos[0]}
      title={`${p.nombre}${filled(p.marca) ? ' ' + p.marca : ''} | ${site.nombre}`} description={descMeta}
      ld={[
        breadcrumbNode(site, [['Inicio', '/'], [cat.nombre, categoryPath(cat)], [p.nombre, productPath(p)]]),
        // Google exige precio (offers) para fichas de producto enriquecidas; sin precio se omite el nodo
        p.precio ? productNode(site, p, cat) : null,
      ]}>
      <article className="container detail">
        <nav className="breadcrumb" aria-label="Ruta">
          <a href={href('/')}><Icons.back /> Volver a equipos</a>
          <span aria-hidden="true">/</span>
          <a href={href(categoryPath(cat))}>{cat.nombre}</a>
        </nav>

        <div className="detail-top">
          <Island name="gallery" id="island-galeria" className="gallery" component={Gallery}
            props={{ fotos, total, nombre: p.nombre }} />

          <aside className="summary">
            <div className="summary-head">
              <p className="eyebrow small">{cat.nombre}</p>
              <h1>{p.nombre}</h1>
              <span className="location"><Icons.pin /><span>Bodega en Cerrillos, Santiago</span></span>
              <span className="location"><Icons.truckSm /><span>Despacho a todo Chile continental</span></span>
            </div>
            <dl className="facts">
              <div className="fact-price"><dt>Precio</dt><dd>{precio}</dd></div>
              <div><dt>Marca</dt><dd>{p.marca}</dd></div>
              <div><dt>Modelo</dt><dd>{p.modelo}</dd></div>
              <div><dt>Estado</dt><dd>{p.estado}</dd></div>
              <div><dt>Código</dt><dd>{codigo(p)}</dd></div>
            </dl>
            <div className="summary-links">
              <a href="#pagos">Ver formas de pago</a>
              <a href="#entrega">Entrega y despacho</a>
              <a href="#cotizar">Ir a cotizar</a>
            </div>
          </aside>
        </div>

        <section className="panel" aria-labelledby="h-desc">
          <h2 id="h-desc">Descripción</h2>
          <p>{p.descripcion}</p>
        </section>

        <div className="two-col">
          <section className="panel" aria-labelledby="h-specs">
            <h2 id="h-specs">Especificaciones técnicas</h2>
            <dl className="specs">
              {specs.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
            </dl>
          </section>

          <section className="panel" id="pagos" aria-labelledby="h-pagos">
            <h2 id="h-pagos">Formas de pago</h2>
            <ul className="payments">
              <Item icon={Icons.bank} title="Transferencia o depósito bancario" text="Pago total o con abono para reservar el equipo." />
              <Item icon={Icons.card} title="Tarjeta de crédito o débito" text="[Indicar medio de pago y cuotas disponibles]" />
              <Item icon={Icons.chart} title="Financiamiento o leasing" text="Sujeto a evaluación. [Indicar condiciones]" />
              <Item icon={Icons.doc} title="Orden de compra" text="Para empresas, con factura." />
            </ul>
          </section>
        </div>

        <section className="panel" id="entrega" aria-labelledby="h-entrega">
          <h2 id="h-entrega">Entrega y despacho</h2>
          <ul className="payments delivery">
            <Item icon={Icons.truck} title="Despacho a todo Chile continental" text="Coordinamos el transporte hasta tu taller o planta. El costo y el plazo se informan en la cotización." />
            <Item icon={Icons.store} title="Retiro en Cerrillos, Santiago" text="Puedes retirar el equipo en nuestra bodega, coordinando previamente." />
            <Item icon={Icons.tools} title="Puesta en marcha" text="[Indicar si incluye instalación, capacitación o soporte técnico]" />
          </ul>
        </section>

        <section className="quote" id="cotizar" aria-labelledby="h-cot">
          <div>
            <h2 id="h-cot">¿Te interesa este equipo?</h2>
            <p>{p.precio ? <>Precio: <strong>{precio}</strong>. </> : null}
              Te confirmamos disponibilidad, plazo de entrega y costo de despacho a tu ciudad para {p.nombre}.</p>
          </div>
          <div className="quote-actions">
            <a className="btn-quote" href={buildMailto(site, p)} aria-label={`Cotizar ${p.nombre} por correo`}>
              Cotizar <Icons.mail />
            </a>
            {wa ? (
              <a className="btn-quote btn-alt" href={wa} target="_blank" rel="noopener noreferrer" aria-label={`Cotizar ${p.nombre} por WhatsApp`}>
                WhatsApp <Icons.chat />
              </a>
            ) : null}
          </div>
        </section>

        {related.length ? (
          <section className="related" aria-labelledby="h-rel">
            <h2 id="h-rel">Otros equipos que te pueden interesar</h2>
            <ul className="grid">
              {related.map((x) => <li key={x.slug}><ProductCard item={x} headingTag="h3" /></li>)}
            </ul>
          </section>
        ) : null}
      </article>
    </Document>
  );
}
