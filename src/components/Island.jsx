/*
 * "Isla" interactiva: el componente se renderiza a HTML en el build y, en el navegador,
 * src/main.jsx lo hidrata con React usando las mismas props (incrustadas como JSON inerte).
 * Así la página sigue siendo HTML estático indexable y solo lo interactivo ejecuta JavaScript.
 */
import { useSite } from '../context.jsx';
import { safeJson } from '../lib/site.js';

export function Island({ name, id, className, component: Component, props }) {
  const { base } = useSite();
  const all = { ...props, base };
  return (
    <>
      <div className={className} id={id} data-island={name}>
        <Component {...all} />
      </div>
      <script type="application/json" data-island-props={id} dangerouslySetInnerHTML={{ __html: safeJson(all) }} />
    </>
  );
}
