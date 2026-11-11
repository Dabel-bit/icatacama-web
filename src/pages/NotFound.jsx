import { useSite, useHref } from '../context.jsx';
import { Document } from '../components/Document.jsx';

export function NotFound() {
  const { site } = useSite();
  const href = useHref();
  return (
    <Document page="error" path="/404.html" title={`Página no encontrada | ${site.nombre}`}
      description="La página que buscas no existe o el equipo ya fue vendido." noindex>
      <div className="container detail">
        <div className="notice">
          <p className="eyebrow">Error 404</p>
          <h1>No encontramos esta página</h1>
          <p>Puede que el equipo ya se haya vendido o que el enlace haya cambiado.</p>
          <a className="btn-secondary" href={href('/')}>Ver equipos disponibles</a>
        </div>
      </div>
    </Document>
  );
}
