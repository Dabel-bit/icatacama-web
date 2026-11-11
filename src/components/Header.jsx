import { useSite, useHref } from '../context.jsx';

export function Header() {
  const { site } = useSite();
  const href = useHref();
  return (
    <header className="site-header">
      <div className="container">
        <a className="logo" href={href('/')} aria-label={`${site.nombre}, inicio`}>
          <img src={href('/img/logo-ic-atacama.webp')} alt={site.nombre} width="384" height="144" />
        </a>
        <nav className="site-nav" aria-label="Principal">
          <a href={href('/#equipos')}>Equipos</a>
          <a href={href('/#despacho')} className="hide-xs">Despacho</a>
          <a href="#contacto">Contacto</a>
        </nav>
      </div>
    </header>
  );
}
